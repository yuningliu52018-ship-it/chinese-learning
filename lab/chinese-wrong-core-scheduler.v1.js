// Standalone data layer. No UI imports, automatic storage writes or scheduling side effects.
export const TEMP_MASTER_REVIEW_DAYS = 10;
export const WRONG_REVIEW_DAYS = 1;
export const MASTER_CHECK_INTERVAL_DAYS = 14;
export const STORAGE_KEY = 'chineseWrongCoreLearningState.v1';
export const oneCorePerMission = true;
export const LEVELS = Object.freeze(['L1', 'L2', 'L3', 'Boss']);
export const CORE_NUMBERS = Object.freeze([1,10,14,15,17,18,19,26,27,28,32,35]);
const BASE = 'public/lab/data/chinese-wrong/';
const SOURCE_FILES = Object.freeze([
  BASE + 'chinese-review-variants-pilot.v1.json',
  BASE + 'chinese-review-variants-pilot-batch2.v1.json',
]);
const REJECTED = new Set(['zh-Q15-Boss-v1','zh-Q14-Boss-v1','zh-Q32-L3-v1','zh-Q32-Boss-v1']);
const fail = message => { throw new Error(message); };
const requireThat = (condition, message) => { if (!condition) fail(message); };
const clone = value => structuredClone(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const timestamp = value => {
  if (value === null || value === undefined || value === '') return null;
  if (!(value instanceof Date) && !['number','string'].includes(typeof value)) return null;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : null;
};
const time = value => {
  const result = timestamp(value);
  requireThat(result !== null, 'A valid explicit date/timestamp is required');
  return result;
};
// Calendar days in the local timezone, preserving local time across DST changes.
export function addLocalDays(value, days) {
  const date = new Date(time(value));
  date.setDate(date.getDate() + days);
  return date.getTime();
}
function freeze(value) {
  Object.values(value).forEach(child => { if (child && typeof child === 'object') freeze(child); });
  return Object.freeze(value);
}

export function createChineseWrongCoreScheduler({corePool, approvedManifest, sources}) {
  const cores = clone(corePool.chineseWrongCorePool);
  const manifest = clone(approvedManifest);
  requireThat(Array.isArray(cores) && cores.length === 12, 'Expected 12 cores');
  requireThat(new Set(cores.map(c => c.id)).size === 12, 'Duplicate core IDs');
  requireThat(new Set(cores.map(c => c.sourceQuestionNo)).size === 12, 'Duplicate core numbers');
  cores.forEach(c => requireThat(CORE_NUMBERS.includes(c.sourceQuestionNo) && c.status === 'activeWrongPool', 'Unknown or inactive base core'));
  requireThat(manifest.version === 'v1' && manifest.subject === 'chinese' && manifest.status === 'approved', 'Invalid manifest');
  requireThat(manifest.totalApproved === 48 && manifest.approvedVariants?.length === 48, 'Expected 48 approvals');
  const byId = new Map();
  const byCoreLevel = new Map();
  for (const entry of manifest.approvedVariants) {
    const core = cores.find(c => c.id === entry.coreId);
    requireThat(core && LEVELS.includes(entry.level), 'Unknown approved core/level');
    requireThat(entry.approved === true && entry.approvalType === 'human-reviewed', 'Missing human approval');
    requireThat(!REJECTED.has(entry.variantId), 'Rejected variant is forbidden');
    requireThat(SOURCE_FILES.includes(entry.sourceFile), 'Source file is not allowed');
    requireThat(!byId.has(entry.variantId), 'Duplicate approved ID');
    const key = `${entry.coreId}:${entry.level}`;
    requireThat(!byCoreLevel.has(key), 'Duplicate core/level approval');
    for (const field of ['sourceQuestionNo','pool','subtype']) requireThat(entry[field] === core[field], `Core metadata mismatch: ${field}`);
    // The only source search is exact ID resolution AFTER selecting an approved entry.
    const source = sources instanceof Map ? sources.get(entry.sourceFile) : sources[entry.sourceFile];
    const matches = source?.variants?.filter(v => v.variantId === entry.variantId) ?? [];
    requireThat(matches.length === 1, 'Approved ID must resolve uniquely');
    const question = matches[0];
    requireThat(['pilot','approved'].includes(question.status), 'Source variant is not usable');
    for (const field of ['coreId','sourceQuestionNo','level','pool','subtype']) requireThat(question[field] === entry[field], `Source metadata mismatch: ${field}`);
    requireThat(typeof question.question === 'string' && question.question.trim() && Object.hasOwn(question.choices ?? {}, question.correctAnswer), 'Incomplete actual question');
    const resolved = freeze({entry: clone(entry), question: clone(question)});
    byId.set(entry.variantId, resolved);
    byCoreLevel.set(key, resolved);
  }
  for (const core of cores) for (const level of LEVELS) requireThat(byCoreLevel.has(`${core.id}:${level}`), 'Missing approved level');
  freeze(cores);
  freeze(manifest);
  function resolveApprovedVariant({coreId, level, variantId}) {
    const resolved = variantId === undefined ? byCoreLevel.get(`${coreId}:${level}`) : byId.get(variantId);
    requireThat(resolved && resolved.entry.coreId === coreId && resolved.entry.level === level, 'Unknown, rejected or mismatched approved variant');
    return clone(resolved.question);
  }
  function initial(core) {
    return {coreId:core.id, sourceQuestionNo:core.sourceQuestionNo, status:'activeWrongPool', currentLevel:'L1',
      correctAtLevel:0, wrongCount:0, totalAttempts:0, lastResult:null, lastSeenAt:null,
      nextReviewAt:null, masteredAt:null, reviewDueAt:null};
  }
  function normalizeChineseWrongCoreState(raw = {}) {
    const input = object(raw);
    const records = object(input.cores ?? input);
    const state = {version:1, cores:{}};
    for (const core of cores) {
      const old = object(records[core.id]);
      const current = initial(core);
      for (const key of ['correctAtLevel','wrongCount','totalAttempts']) {
        if (Number.isSafeInteger(old[key]) && old[key] >= 0) current[key] = old[key];
      }
      for (const key of ['lastSeenAt','nextReviewAt','masteredAt','reviewDueAt']) current[key] = timestamp(old[key]);
      if (LEVELS.includes(old.currentLevel)) current.currentLevel = old.currentLevel;
      if (['correct','wrong'].includes(old.lastResult)) current.lastResult = old.lastResult;
      current.totalAttempts = Math.max(current.totalAttempts, current.wrongCount, current.correctAtLevel, current.lastSeenAt === null ? 0 : 1);
      if (old.status === 'temporarilyMastered') {
        current.reviewDueAt ??= current.masteredAt === null ? null : addLocalDays(current.masteredAt, TEMP_MASTER_REVIEW_DAYS);
        if (current.reviewDueAt !== null) {
          current.status = 'temporarilyMastered';
          current.currentLevel = 'Boss';
          current.nextReviewAt = null;
        }
      }
      state.cores[core.id] = current;
    }
    return state;
  }
  function applyChineseWrongCoreResult({state, coreId, level, variantId, isCorrect, answeredAt}) {
    requireThat(cores.some(c => c.id === coreId), 'Unknown core');
    requireThat(typeof variantId === 'string', 'An approved variantId is required');
    resolveApprovedVariant({coreId, level, variantId});
    requireThat(typeof isCorrect === 'boolean', 'isCorrect must be boolean');
    const now = time(answeredAt);
    const updated = normalizeChineseWrongCoreState(state);
    const current = updated.cores[coreId];
    requireThat(level === current.currentLevel, 'Stale or unexpected level');
    requireThat(current.lastSeenAt === null || now > current.lastSeenAt, 'Duplicate or out-of-order result');
    const check = current.status === 'temporarilyMastered';
    requireThat(check ? current.reviewDueAt <= now : current.nextReviewAt === null || current.nextReviewAt <= now, 'Review is not due');
    current.totalAttempts += 1;
    current.lastSeenAt = now;
    current.lastResult = isCorrect ? 'correct' : 'wrong';
    if (isCorrect) {
      current.nextReviewAt = null;
      if (level === 'Boss') {
        current.correctAtLevel += 1;
        current.status = 'temporarilyMastered';
        if (!check) current.masteredAt = now;
        current.reviewDueAt = addLocalDays(now, check ? MASTER_CHECK_INTERVAL_DAYS : TEMP_MASTER_REVIEW_DAYS);
      } else {
        current.currentLevel = LEVELS[LEVELS.indexOf(level) + 1];
        // This counter belongs to the newly current level, not lifetime correct answers.
        current.correctAtLevel = 0;
      }
    } else {
      current.wrongCount += 1;
      current.correctAtLevel = 0;
      current.status = 'activeWrongPool';
      current.currentLevel = {L1:'L1', L2:'L1', L3:'L2', Boss:'L2'}[level];
      current.nextReviewAt = addLocalDays(now, WRONG_REVIEW_DAYS);
      current.masteredAt = null;
      current.reviewDueAt = null;
    }
    return updated;
  }
  function buildChineseWrongCoreMission({date, missionSize = 5, learningState, approvedManifest: suppliedManifest} = {}) {
    const now = time(date);
    requireThat(Number.isSafeInteger(missionSize) && missionSize > 0 && missionSize <= 12, 'missionSize must be 1..12');
    if (suppliedManifest !== undefined) requireThat(JSON.stringify(suppliedManifest) === JSON.stringify(manifest), 'Manifest differs from validated catalog');
    const state = normalizeChineseWrongCoreState(learningState);
    const candidates = cores.flatMap(core => {
      const s = state.cores[core.id];
      if (s.status === 'temporarilyMastered') return s.reviewDueAt <= now ? [{core,s,rank:2,due:s.reviewDueAt}] : [];
      if (s.nextReviewAt !== null && s.nextReviewAt > now) return [];
      const rank = s.nextReviewAt !== null ? 0 : s.totalAttempts === 0 ? 1 : 3;
      return [{core,s,rank,due:s.nextReviewAt ?? 0}];
    });
    const questions = [];
    const poolCounts = {};
    while (candidates.length && questions.length < missionSize) {
      candidates.sort((a,b) => a.rank - b.rank || a.due - b.due || b.s.wrongCount - a.s.wrongCount
        || (poolCounts[a.core.pool] ?? 0) - (poolCounts[b.core.pool] ?? 0)
        || Number(b.core.pool === 'reading') - Number(a.core.pool === 'reading')
        || (a.core.id < b.core.id ? -1 : a.core.id > b.core.id ? 1 : 0));
      const {core,s} = candidates.shift();
      const {entry} = byCoreLevel.get(`${core.id}:${s.currentLevel}`);
      questions.push({coreId:core.id, sourceQuestionNo:core.sourceQuestionNo, level:entry.level, variantId:entry.variantId, sourceFile:entry.sourceFile});
      poolCounts[core.pool] = (poolCounts[core.pool] ?? 0) + 1;
    }
    const d = new Date(now);
    const localDate = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
    const identity = questions.map(q => q.variantId).join('|');
    let hash = 2166136261;
    for (const char of identity) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    return {missionId:`chinese-wrong-${localDate}-${hash.toString(16)}`, generatedAt:now, questions,
      status:questions.length ? 'ready' : 'noWrongCoreDue', unfilledSlots:missionSize - questions.length};
  }
  function browserStorage() { try { return globalThis.localStorage; } catch { return undefined; } }
  function loadChineseWrongCoreState(storage = browserStorage()) {
    try { return normalizeChineseWrongCoreState(JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}')); }
    catch { return normalizeChineseWrongCoreState(); }
  }
  function saveChineseWrongCoreState(state, storage = browserStorage()) {
    if (!storage) return false;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(normalizeChineseWrongCoreState(state))); return true; }
    catch { return false; }
  }
  function resetChineseWrongCoreState(storage = browserStorage()) {
    if (!storage) return false;
    try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
  }
  return Object.freeze({resolveApprovedVariant, normalizeChineseWrongCoreState,
    createInitialState:() => normalizeChineseWrongCoreState(), applyChineseWrongCoreResult, buildChineseWrongCoreMission,
    loadChineseWrongCoreState, saveChineseWrongCoreState, resetChineseWrongCoreState});
}

// Explicit opt-in loader for a later runtime integration; merely importing this module does no I/O.
export async function loadChineseWrongCoreScheduler({fetchImpl = globalThis.fetch} = {}) {
  const get = async name => {
    const response = await fetchImpl(new URL(`./data/chinese-wrong/${name}`, import.meta.url));
    requireThat(response.ok, `Failed to load ${name}: ${response.status}`);
    return response.json();
  };
  const [corePool, approvedManifest] = await Promise.all([
    get('chinese-wrong-core-pool.v1.json'), get('chinese-review-variants-approved.v1.json'),
  ]);
  const sources = {};
  for (const file of new Set((approvedManifest.approvedVariants ?? []).map(v => v.sourceFile))) {
    requireThat(SOURCE_FILES.includes(file), 'Unapproved source path');
    sources[file] = await get(file.slice(BASE.length));
  }
  return createChineseWrongCoreScheduler({corePool, approvedManifest, sources});
}
