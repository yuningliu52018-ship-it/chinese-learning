import {coreId} from './daily-mission-exposure.js';
export const LEGACY_HISTORY_KEY='116.dailyMission.legacyExposure.v1';
export const LEGACY_COOLDOWN=Object.freeze({strongDays:3,normalDays:7});
export function recordLegacyExposure(history={},mission,day){
 const next={...history,questions:{...history.questions}};
 for(const q of mission.filter(q=>q.sourceMode!=='wrongCore')){
  const old=next.questions[q.id]||{};
  if(old.lastSeenAt===day)continue;
  next.questions[q.id]={...old,knowledgePointId:q.knowledgePointId,lastSeenAt:day,lastResult:old.lastResult??null,seenCount:(old.seenCount||0)+1};
 }
 return next;
}
export function recordLegacyResult(history,question,isCorrect){
 const old=history.questions?.[question.id];
 if(!old)return history;
 return {...history,questions:{...history.questions,[question.id]:{...old,lastResult:isCorrect?'correct':'wrong'}}};
}
const tieOrder=(id,date)=>[...`${id}:${date}`].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
export function fairLegacyQuestions({questions,learningState={},history={},date,previousQuestionIds=[]}){
 const age=day=>Math.floor((Date.parse(date+'T12:00:00')-Date.parse(day+'T12:00:00'))/86400000);
 const points=questions.filter(q=>!q.isFixture);
 const rank=q=>{
  const own=history.questions?.[q.id];
  const peers=points.filter(p=>coreId(p)===coreId(q));
  const records=peers.flatMap(p=>{const r=history.questions?.[p.id],s=learningState[p.knowledgePointId];return [r,s?.lastSeen?{lastSeenAt:s.lastSeen,lastResult:s.streak>0?'correct':'wrong',seenCount:s.seen}:null].filter(Boolean)});
  const latest=records.sort((a,b)=>String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)))[0];
  const days=latest?age(latest.lastSeenAt):Infinity;
  let tier=!latest?0:days>LEGACY_COOLDOWN.normalDays?1:latest.lastResult==='wrong'?2:latest.lastResult==='correct'?(days<=LEGACY_COOLDOWN.strongDays?4:3):5;
  // A new variant gets priority within its group's cooldown, not a bypass of it.
  return {tier,days,ownCount:own?.seenCount||0,previous:previousQuestionIds.includes(q.id)?1:0};
 };
 return points.filter(q=>rank(q).days>0).sort((a,b)=>{const x=rank(a),y=rank(b);return x.tier-y.tier||(Number.isFinite(y.days)&&Number.isFinite(x.days)?y.days-x.days:0)||x.ownCount-y.ownCount||x.previous-y.previous||tieOrder(a.id,date)-tieOrder(b.id,date)||a.id.localeCompare(b.id)});
}
