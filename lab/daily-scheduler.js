import {fairLegacyQuestions} from './daily-legacy-fairness.js';
import {uniqueCores} from './daily-mission-exposure.js';
const roleLabels={warmup:'🌱 暖身',new:'📘 新知識',review:'🔁 到期複習',weak:'🎯 弱點／易混'};
const hash=value=>[...value].reduce((total,char)=>(total*31+char.charCodeAt(0))>>>0,2166136261);
const dayBefore=iso=>{const date=new Date(`${iso}T12:00:00`);date.setDate(date.getDate()-1);return date.toLocaleDateString('en-CA')};
const statusOf=state=>state?.status||(state?.streak>=4?'mastered':state?.seen?'learning':'new');

function order(items,seed){return items.slice().sort((a,b)=>hash(`${seed}:${a.id}`)-hash(`${seed}:${b.id}`))}
function questionFor(kp,questions,previousQuestionIds,seed){const related=kp.relatedQuestions.map(id=>questions.find(question=>question.id===id)).filter(Boolean);const fresh=related.filter(question=>!previousQuestionIds.includes(question.id));return order(fresh.length?fresh:related,seed)[0]}

export function materializeMission(questionIds,questions,knowledgePoints){return questionIds.map((id,index)=>{const question=questions.find(item=>item.id===id);const kp=knowledgePoints.find(item=>item.id===question.knowledgePointId);const role=index===0?'warmup':index<3?'new':index===3?'review':'weak';return {...question,missionRole:roleLabels[role],role,specificImage:kp.specificImage||null,memoryWall:question.memoryWall||(kp.memoryWallSet?{set:kp.memoryWallSet}:null)}})}

export function scheduleDailyMission({questions,knowledgePoints,learningState={},date,previousQuestionIds=[],legacyHistory}){
 if(legacyHistory!==undefined){const eligible=questions.filter(q=>knowledgePoints.some(k=>k.id===q.knowledgePointId));return materializeMission(uniqueCores(fairLegacyQuestions({questions:eligible,learningState,history:legacyHistory,date,previousQuestionIds})).slice(0,5).map(q=>q.id),questions,knowledgePoints);}
 const yesterday=dayBefore(date);const selected=[];const used=new Set();
 const stateFor=kp=>learningState[kp.id]||{seen:0,correct:0,wrong:0,streak:0,status:'new'};
 const take=(role,candidates)=>{const kp=candidates.find(item=>!used.has(item.id));if(!kp)return false;const question=questionFor(kp,questions,previousQuestionIds,`${date}:${role}`);if(!question)return false;used.add(kp.id);selected.push({...question,missionRole:roleLabels[role],role,specificImage:kp.specificImage||null,memoryWall:question.memoryWall||(kp.memoryWallSet?{set:kp.memoryWallSet}:null)});return true};
 const all=order(knowledgePoints,date);
 const wrongYesterday=all.filter(kp=>{const state=stateFor(kp);return state.lastSeen===yesterday&&state.wrong>0});
 const due=all.filter(kp=>{const state=stateFor(kp);return state.nextReview&&state.nextReview<=date});
 const weak=all.filter(kp=>{const state=stateFor(kp);return state.wrong>0&&state.wrong>=state.correct});
 const fresh=all.filter(kp=>statusOf(stateFor(kp))==='new'||!stateFor(kp).seen);
 const urgentIds=new Set([...wrongYesterday,...due,...weak].map(kp=>kp.id));
 const familiar=all.filter(kp=>stateFor(kp).correct>0&&statusOf(stateFor(kp))!=='mastered'&&!urgentIds.has(kp.id)).sort((a,b)=>stateFor(b).streak-stateFor(a).streak);
 const nonMastered=all.filter(kp=>statusOf(stateFor(kp))!=='mastered');
 take('warmup',[...familiar,...nonMastered,...all]);
 take('new',[...fresh,...nonMastered,...all]);take('new',[...fresh,...nonMastered,...all]);
 take('review',[...wrongYesterday,...due,...weak,...nonMastered,...all]);
 take('weak',[...wrongYesterday,...weak,...due,...nonMastered,...all]);
 while(selected.length<5){if(!take(selected.length===4?'weak':'new',all))break;}
 return selected;
}
