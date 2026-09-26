// V2.1: permanent answered-question IDs, independent of reservation and mastery.
export const SEEN_KEY='chineseDailyMissionSeen.v1';
export const stableQuestionId=q=>q.variantId||q.questionId||q.id;
export function loadSeen(storage){
 const raw=storage?.getItem(SEEN_KEY);
 const data=raw?JSON.parse(raw):{version:1,questionIds:[]};
 if(data.version!==1||!Array.isArray(data.questionIds)||data.questionIds.some(id=>typeof id!=='string'))throw Error('Seen data invalid; preserved without reset');
 const seen=new Set(data.questionIds);
 // Recover only explicit completed answers, never questionRefs or reserved IDs.
 for(let i=0;i<(storage?.length||0);i++){
  const key=storage.key(i);
  if(!key?.startsWith('116.dailyMission.session.v2.'))continue;
  let session;try{session=JSON.parse(storage.getItem(key))}catch{continue}
  for(const answer of session?.answers||[])if(typeof answer?.correct==='boolean'&&typeof answer.id==='string')seen.add(answer.id);
 }
 // Existing per-question results prove an answer; exposure counts alone do not.
 for(const key of ['chineseExtendedQuestionState.v1','116.dailyMission.legacyExposure.v1']){
  let history;try{history=JSON.parse(storage?.getItem(key)||'null')}catch{continue}
  for(const [id,row] of Object.entries(history?.questions||{}))if(row?.lastResult==='correct'||row?.lastResult==='wrong')seen.add(id);
 }
 return seen;
}
export const excludeSeen=(questions,seen)=>questions.filter(q=>!seen.has(stableQuestionId(q)));
export function markSeen(storage,question){
 const id=stableQuestionId(question);if(typeof id!=='string'||!id)throw Error('Missing stable question ID');
 const seen=loadSeen(storage);seen.add(id);
 storage.setItem(SEEN_KEY,JSON.stringify({version:1,questionIds:[...seen].sort()}));
 return seen;
}
