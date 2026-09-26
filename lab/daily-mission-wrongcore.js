import {unseenQuestions,uniqueCores} from './daily-mission-exposure.js';
// Compatibility boundary for the existing renderer. The scheduler and bank stay read-only.
const defaultLoader = async () => (await import('./chinese-wrong-core-scheduler.v1.js')).loadChineseWrongCoreScheduler();
const legacy = mission => mission.map(q => ({...q,sourceMode:'legacy',missionRole:q.missionRole||'📘 今日挑戰'}));
const reference = q => q.sourceMode === 'wrongCore'
  ? {sourceMode:'wrongCore',coreId:q.coreId,level:q.level,variantId:q.variantId}
  : {sourceMode:q.sourceMode==='extended'?'extended':'legacy',id:q.id,knowledgePointId:q.knowledgePointId,missionRole:q.missionRole,role:q.role};
export const missionReferences = mission => mission.map(reference);

export function adaptWrongCoreQuestion(q) {
  const choiceKeys=Object.keys(q.choices);
  if (!choiceKeys.length || !choiceKeys.includes(q.correctAnswer)) throw Error('Invalid approved choices');
  return {sourceMode:'wrongCore',id:q.variantId,coreId:q.coreId,variantId:q.variantId,level:q.level,
    knowledgePointId:q.coreId,type:q.subtype,kind:q.subtype,
    source:'錯題核心複習',stem:q.question,prompt:'',question:'',
    choices:choiceKeys.map(key=>q.choices[key]),choiceKeys,answer:choiceKeys.indexOf(q.correctAnswer),
    explanation:q.explanation,missionRole:'📘 錯題核心複習',
    visualType:({pronunciation:'pronunciation',shape:'shape',meaning:'meaning',polyphone:'pronunciation',confusable:'confusable'})[q.subtype]||'default',
    rescue:{title:'本題關鍵',lines:[q.explanation],tip:'先理解判斷依據，再繼續下一關。'}};
}

export function wrongCoreQuota(candidates,state,date){
 const n=candidates.length;if(!n)return 0;
 const base=n>=9?3:n>=4?2:1;
 const dayStart=new Date(date);dayStart.setHours(0,0,0,0);
 const urgent=candidates.some(q=>{const s=state.cores[q.coreId];const due=s.status==='temporarilyMastered'?s.reviewDueAt:s.nextReviewAt;return s.wrongCount>=2||(due!==null&&due!==undefined&&due<dayStart.getTime());});
 return Math.min(n,base+(urgent?1:0));
}

export async function prepareChineseDailyMission({legacyMission, savedSession=null, restoreLegacy,
  storage, date=new Date(), loader=defaultLoader, timeoutMs=5000,exposure={},extendedMission=[],extendedBank=null}) {
  const fallback=uniqueCores(unseenQuestions([...extendedMission,...(extendedBank===null?legacy(legacyMission).filter(q=>!q.isFixture):[])],exposure));
  let timer;
  let scheduler;
  let loadError=null;
  const savedRefs=savedSession?.questionRefs;
  const oldLegacy = !savedRefs && savedSession?.questionIds?.length===5
    ? savedSession.questionIds.map(id=>({sourceMode:'legacy',id})) : null;
  const refs = savedRefs ?? oldLegacy;
  // Continue valid saved legacy missions without depending on any new module/network request.
  if(refs?.length===5 && refs.every(r=>r.sourceMode==='legacy'||r.sourceMode==='extended')) {
    try {
      const restored=refs.map(r=>{
        if(r.sourceMode==='extended')return extendedBank.resolve(r.id);
        const q=restoreLegacy([r.id])[0];if(!q)throw Error('Saved legacy question unavailable');
        return {...q,sourceMode:'legacy',missionRole:r.missionRole||q.missionRole,role:r.role||q.role};
      });
      if(restored.length===5)return {mission:restored,missionMode:'legacy',scheduler:null,resumed:true};
    } catch { /* Retry restoration below; never replace an unavailable saved task. */ }
  }
  try {
    scheduler=await Promise.race([loader(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('WrongCore load timeout')),timeoutMs);})]);
    if(refs?.length===5){
      const restored=refs.map(r=>{
        if(r.sourceMode==='extended') return extendedBank.resolve(r.id);
        if(r.sourceMode==='wrongCore') return adaptWrongCoreQuestion(scheduler.resolveApprovedVariant(r));
        if(r.sourceMode==='legacy') {
          const question=restoreLegacy([r.id])[0];
          return {...question,sourceMode:'legacy',missionRole:r.missionRole||question.missionRole,role:r.role||question.role};
        }
        throw Error('Unknown saved source mode');
      });
      const wrong=restored.filter(q=>q.sourceMode==='wrongCore');
      if(new Set(wrong.map(q=>q.coreId)).size!==wrong.length)throw Error('Duplicate saved core');
      return {mission:restored,missionMode:wrong.length?'wrongCore':'legacy',scheduler,resumed:true};
    }
    const state=scheduler.loadChineseWrongCoreState(storage);
    const scheduled=scheduler.buildChineseWrongCoreMission({date,learningState:state,missionSize:12});
    if(!scheduled.questions.length)return {mission:fallback.slice(0,5),missionMode:'legacy',scheduler,resumed:false};
    const candidates=uniqueCores(unseenQuestions(scheduled.questions.map(r=>adaptWrongCoreQuestion(scheduler.resolveApprovedVariant(r))),exposure));
    // On load failure use available WrongCore before emergency Legacy. Healthy pools use the normal quota.
    const quota=extendedBank===null?5:wrongCoreQuota(candidates,state,date);
    const wrong=candidates.slice(0,quota);
    if(wrong.length>5 || new Set(wrong.map(q=>q.coreId)).size!==wrong.length)throw Error('Invalid WrongCore mission');
    return {mission:[...wrong,...unseenQuestions(fallback,{todaySeenCoreIds:wrong.map(q=>q.coreId)}).slice(0,5-wrong.length)],missionMode:'wrongCore',scheduler,resumed:false};
  } catch(error) {
    loadError=error;
    if(refs?.length===5)return {mission:[],missionMode:savedSession.missionMode,scheduler:null,resumed:true,unavailable:true,fallbackReason:String(error.message||error)};
    return {mission:fallback.slice(0,5),missionMode:'legacy',scheduler:null,resumed:false,fallbackReason:String(loadError.message||loadError)};
  } finally {clearTimeout(timer);}
}

export function recordWrongCoreAnswer({scheduler,question,isCorrect,storage,answeredAt=new Date()}) {
  if(question.sourceMode!=='wrongCore')return false;
  if(!scheduler)throw Error('WrongCore scheduler unavailable');
  const state=scheduler.loadChineseWrongCoreState(storage);
  const current=state.cores[question.coreId];
  const wallTime=new Date(answeredAt).getTime();
  // An eligible saved mission may outlive a clock rollback (or a test clock).
  // Preserve existing timestamps; use a monotonic event time only for an active,
  // currently eligible core. Never bring a future review forward or relax levels.
  if(current?.status==='activeWrongPool' && current.nextReviewAt===null &&
    Number.isFinite(wallTime) && current.lastSeenAt!==null && wallTime<=current.lastSeenAt){
    answeredAt=new Date(current.lastSeenAt+1);
  }
  const updated=scheduler.applyChineseWrongCoreResult({state,coreId:question.coreId,level:question.level,
    variantId:question.variantId,isCorrect,answeredAt});
  if(!scheduler.saveChineseWrongCoreState(updated,storage))throw Error('Learning state could not be saved');
  return true;
}

