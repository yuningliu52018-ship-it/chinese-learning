import {fairLegacyQuestions,recordLegacyExposure,recordLegacyResult} from './daily-legacy-fairness.js';
import {unseenQuestions,uniqueCores} from './daily-mission-exposure.js';
export const EXTENDED_STATE_KEY='chineseExtendedQuestionState.v1';
export const EXTENDED_BATCHES=Object.freeze([
 {id:'batch1',manifest:'./data/chinese-extended/chinese-daily-mission-extended-approved.v1.json',sourceFile:'public/lab/data/chinese-extended/chinese-daily-mission-extended-bank.v1.json'},
 {id:'batch2',manifest:'./data/chinese-extended/chinese-daily-mission-extended-approved-batch2.v1.json',sourceFile:'public/lab/data/chinese-extended/chinese-daily-mission-extended-bank-batch2.v1.json'}
]);
const EXCLUDED_SOURCES=new Set(['dry-4-6-008','dry-4-6-034','dry-1-3-100','dry-4-6-099','dry-1-3-072','dry-4-6-052','dry-4-6-055']);
export function createExtendedBank(manifest,bank){
 const admitted=[];
 const seen=new Set();
 for(const ref of manifest.approvedQuestions||[]){
  if(ref.approved!==true||ref.approvalType!=='data-audit'||seen.has(ref.questionId))continue;
  const q=bank.questions?.find(q=>q.questionId===ref.questionId);
  if(!q||q.knowledgePointId!==ref.knowledgePointId||q.isFixture||q.testOnly||q.previewOnly||EXCLUDED_SOURCES.has(q.sourceId))continue;
  const keys=Object.keys(q.choices||{});
  if(!q.question||!q.knowledgePointId||keys.length!==4||!keys.includes(q.correctAnswer)||keys.some(k=>typeof q.choices[k]!=='string'||!q.choices[k]))continue;
  seen.add(q.questionId);
  admitted.push({...q,approvedSourceFile:ref.sourceFile,id:q.questionId,sourceMode:'extended',source:q.question,stem:q.question,prompt:'',choices:keys.map(k=>q.choices[k]),choiceKeys:keys,answer:keys.indexOf(q.correctAnswer),missionRole:'📘 今日挑戰',visualType:({polyphone:'pronunciation',polysemy:'meaning'})[q.type]||q.type,explanation:q.explanation||`正確答案：${q.correctAnswer}　${q.choices[q.correctAnswer]}`});
 }
 return {questions:admitted,resolve(id){const q=admitted.find(q=>q.id===id);if(!q)throw Error('Extended approved question unavailable');return q;}};
}
export function combineExtendedBanks(banks){
 const byId=new Map(),ambiguous=new Set();
 for(const bank of banks)for(const q of bank.questions){
  if(byId.has(q.id)||ambiguous.has(q.id)){byId.delete(q.id);ambiguous.add(q.id);continue;}
  byId.set(q.id,q);
 }
 const approvedIndex=new Map([...byId].map(([id,q])=>[id,{questionId:id,knowledgePointId:q.knowledgePointId,sourceFile:q.approvedSourceFile}]));
 return {questions:[...byId.values()],approvedIndex,resolve(id){const ref=approvedIndex.get(id),q=byId.get(id);if(!ref||!q||ref.sourceFile!==q.approvedSourceFile)throw Error('Extended approved question unavailable');return q;}};
}
export async function loadExtendedBank(fetcher=fetch){
 const results=await Promise.allSettled(EXTENDED_BATCHES.map(async batch=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{
   const load=async url=>{const r=await fetcher(url,{signal:controller.signal});if(!r.ok)throw Error('Extended unavailable');return r.json()};
   const manifest=await load(batch.manifest);
   // Only this batch's approved source is eligible; never scan the dry-run files.
   const refs=manifest.approvedQuestions.filter(r=>r.sourceFile===batch.sourceFile);
   if(!refs.length)throw Error('Extended approved index unavailable');
   const data=await load('./'+batch.sourceFile.replace('public/lab/',''));
   const bank=createExtendedBank({...manifest,approvedQuestions:refs},data);
   if(!bank.questions.length)throw Error('Extended approved resolver unavailable');
   return bank;
  }finally{clearTimeout(timer)}
 }));
 const bank=combineExtendedBanks(results.filter(r=>r.status==='fulfilled').map(r=>r.value));
 if(!bank.questions.length)throw Error('All Extended batches unavailable');
 return bank;
}
export function loadExtendedState(storage){
 try{const data=JSON.parse(storage?.getItem(EXTENDED_STATE_KEY)||'{}');const questions={};for(const [id,r] of Object.entries(data?.questions||{}))if(r&&typeof r==='object'&&typeof r.lastSeenAt==='string'&&Number.isFinite(r.seenCount)&&r.seenCount>=0)questions[id]={...r};return {questions};}catch{return {questions:{}}}
}
export function reserveExtended(storage,mission,date){
 const selected=mission.filter(q=>q.sourceMode==='extended');if(!selected.length)return loadExtendedState(storage);
 const state=recordLegacyExposure(loadExtendedState(storage),selected,date);storage?.setItem(EXTENDED_STATE_KEY,JSON.stringify(state));return state;
}
export function recordExtendedAnswer({storage,question,isCorrect}){
 if(question.sourceMode!=='extended')return false;
 const state=loadExtendedState(storage);if(!state.questions[question.id])throw Error('Extended exposure missing');
 storage.setItem(EXTENDED_STATE_KEY,JSON.stringify(recordLegacyResult(state,question,isCorrect)));return true;
}
export function selectExtended({bank,state,date,exposure={}}){return uniqueCores(unseenQuestions(fairLegacyQuestions({questions:bank?.questions||[],history:state,date}),exposure));}

// Practice uses the same exposure ledger, but never applies formal learning results.
export function buildExtendedPractice({bank,state,legacyQuestions,legacyHistory={},learningState={},date,exposure={}}){
 const extended=selectExtended({bank,state,date,exposure});
 // A successfully loaded but exhausted bank is not an emergency.
 const legacy=bank==null?fairLegacyQuestions({questions:legacyQuestions,history:legacyHistory,learningState,date}).map(q=>({...q,sourceMode:'legacy'})):[];
 return uniqueCores(unseenQuestions([...extended,...legacy],exposure)).slice(0,5).map(q=>({...q,missionRole:'🎮 自由練習'}));
}
