import {buildExtendedPractice,loadExtendedBank,loadExtendedState,selectExtended,reserveExtended,recordExtendedAnswer} from './daily-mission-extended.js';
import {LEGACY_HISTORY_KEY,fairLegacyQuestions,recordLegacyExposure,recordLegacyResult} from './daily-legacy-fairness.js';
import {exposureKey,mergeExposure,unseenQuestions,uniqueCores} from './daily-mission-exposure.js';
import {questions,knowledgePoints} from './daily-mission-bank.js';
import {materializeMission,scheduleDailyMission} from './daily-scheduler.js';
import {buildDailyMission,buildPracticeMission,categorySummary,localDateKey,updateKnowledge} from './daily-mission-core.js';
import {GENERIC_MISSION_IMAGES,resolveMissionImage,SAFE_MISSION_IMAGE} from './daily-mission-images.js';
import {prepareChineseDailyMission,missionReferences,recordWrongCoreAnswer} from './daily-mission-wrongcore.js';

const app=document.querySelector('#app');
const today=localDateKey(new Date());
const knowledgeKey='116.dailyMission.learningState.v1';
const sessionKey=`116.dailyMission.session.v2.${today}`;
const previousQuestionKey='116.dailyMission.previousQuestionIds.v1';
const practiceKey='116.dailyMission.practice.v1';

const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
const readPractice=()=>{try{return JSON.parse(sessionStorage.getItem(practiceKey))}catch{return null}};
const writePractice=value=>{try{sessionStorage.setItem(practiceKey,JSON.stringify(value))}catch{}}
let knowledge=read(knowledgeKey,{});
let legacyHistory=read(LEGACY_HISTORY_KEY,{});
const missionPlan=Object.freeze([{label:'🌱 暖身',count:1},{label:'📘 新知識',count:2},{label:'🔁 到期複習',count:1},{label:'🎯 弱點／易混',count:1}]);
let session=read(sessionKey,null);
let exposure=mergeExposure(read(exposureKey(today),{}));
// Recover current saved missions on upgrade, without resetting any learning data.
const oldRefs=session?.questionRefs||session?.questionIds?.map(id=>questions.find(q=>q.id===id)||{id})||[];
exposure=mergeExposure(exposure,oldRefs.map(r=>r.sourceMode==='legacy'?(questions.find(q=>q.id===r.id)||r):r));
const priorPractice=readPractice();
if(priorPractice?.date===today)exposure=mergeExposure(exposure,(priorPractice.questionIds||[]).map(id=>questions.find(q=>q.id===id)).filter(Boolean));
for(const [id,state] of Object.entries(knowledge))if(state.lastSeen===today)exposure=mergeExposure(exposure,[{knowledgePointId:id}]);
const wrongState=read('chineseWrongCoreLearningState.v1',{});
for(const [id,state] of Object.entries(wrongState.cores||wrongState))if(state?.lastSeenAt&&localDateKey(new Date(state.lastSeenAt))===today)exposure=mergeExposure(exposure,[{coreId:id}]);
const reserve=mission=>{exposure=mergeExposure(mergeExposure(read(exposureKey(today),{}),mission),[...exposure.todaySeenQuestionIds.map(id=>({id})),...exposure.todaySeenCoreIds.map(coreId=>({coreId}))]);localStorage.setItem(exposureKey(today),JSON.stringify(exposure));legacyHistory=recordLegacyExposure(read(LEGACY_HISTORY_KEY,legacyHistory),mission.filter(q=>q.sourceMode!=='extended'),today);write(LEGACY_HISTORY_KEY,legacyHistory);reserveExtended(localStorage,mission,today);};
app.innerHTML='<section class="screen"><p>正在準備今天的 5 關…</p></section>';
const availableLegacy=unseenQuestions(questions.filter(q=>!q.isFixture),exposure);
const scheduledLegacy=scheduleDailyMission({questions:availableLegacy,knowledgePoints:knowledgePoints.filter(k=>availableLegacy.some(q=>q.knowledgePointId===k.id)),learningState:knowledge,legacyHistory,date:today,previousQuestionIds:read(previousQuestionKey,[])});
let storage;
try{storage=localStorage}catch{storage=undefined}
let extendedBank=null;
try{extendedBank=await loadExtendedBank()}catch{/* Existing pools remain available. */}
const extendedMission=selectExtended({bank:extendedBank,state:loadExtendedState(storage),date:today,exposure});
const integration=await prepareChineseDailyMission({legacyMission:[...scheduledLegacy,...fairLegacyQuestions({questions:availableLegacy,learningState:knowledge,history:legacyHistory,date:today}).filter(q=>!scheduledLegacy.some(s=>s.id===q.id))],savedSession:session,
 restoreLegacy:ids=>materializeMission(ids,questions,knowledgePoints),storage,date:new Date(),exposure,extendedBank,extendedMission});
const dailyMission=integration.mission;
const missionMode=integration.missionMode;
if(!integration.resumed){
 // Preserve already-recorded answers if an old WrongCore session must fall back after a load failure.
 const recorded=Array.isArray(session?.answers)?session.answers:[];
 const keep=Boolean(integration.fallbackReason&&session?.started&&recorded.length);
 session={started:keep,index:keep?Math.min(recorded.length,4):0,answers:keep?recorded:[],completed:keep&&recorded.length>=5};
}
if(!integration.unavailable)session={...session,missionMode,questionIds:dailyMission.map(q=>q.id),questionRefs:missionReferences(dailyMission)};
let mode='daily';
let practiceSession=null;
let practiceMission=[];
let previousPracticeIds=[];
const resumeMode=new URLSearchParams(location.search).get('resume');
const savedPractice=resumeMode==='practice'?readPractice():null;
let practiceUnavailable=false;
if(savedPractice?.date===today&&savedPractice?.session&&savedPractice.questionIds?.length===5){
 try{
  const refs=savedPractice.questionRefs||savedPractice.questionIds.map(id=>({sourceMode:'legacy',id}));
  practiceMission=refs.map(r=>r.sourceMode==='extended'?extendedBank.resolve(r.id):materializeMission([r.id],questions,knowledgePoints)[0]);
  if(practiceMission.some(q=>!q))throw Error('Practice question unavailable');
  mode='practice';practiceSession=savedPractice.session;
  previousPracticeIds=savedPractice.previousPracticeIds||savedPractice.questionIds;
 }catch{practiceUnavailable=true}
}


const activeSession=()=>mode==='practice'?practiceSession:session;
const activeMission=()=>mode==='practice'?practiceMission:dailyMission;
const persist=()=>{if(mode==='daily')write(sessionKey,session);else writePractice({date:today,session:practiceSession,questionIds:practiceMission.map(question=>question.id),questionRefs:missionReferences(practiceMission),previousPracticeIds})};

const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const bopomofoPattern=/[\u3105-\u312f\u31a0-\u31bf]+[ˊˇˋ˙]?(?:\s+[\u3105-\u312f\u31a0-\u31bf]+[ˊˇˋ˙]?)*|[ˊˇˋ˙]/giu;
const formatText=value=>escapeHtml(value).replace(bopomofoPattern,match=>`<span class="zhuyin">${match}</span>`);
const assetPath=path=>`..${path}`;
const button=(label,className='primary')=>`<button type="button" class="${className}">${label}</button>`;

document.addEventListener('error',event=>{
 if(event.target instanceof HTMLImageElement&&!event.target.dataset.safeFallback){
  event.target.dataset.safeFallback='true';
  event.target.src=assetPath(SAFE_MISSION_IMAGE);
 }
},true);

function renderHome(){
 app.innerHTML=`<section class="screen home">
  <p class="eyebrow">每天一小段，完成就休息</p>
  <h1>🎮 今日形音義任務</h1>
  <p class="subtitle">安妮亞今天的情報任務</p>
  <img class="hero" src="${assetPath(GENERIC_MISSION_IMAGES.warmup)}" alt="安妮亞任務插圖">
  <div class="mission-time"><span class="pill">共 5 關</span><span class="pill">約 5～8 分鐘</span></div>
  <div class="plan">${missionPlan.map(row=>`<div class="plan-row"><span>${row.label}</span><strong>${row.count} 關</strong></div>`).join('')}</div>
  ${button(session.completed?'查看今日完成':'開始任務','primary start')}
 </section>`;
 app.querySelector('.start').addEventListener('click',()=>{
  if(session.completed){renderComplete();return}
  if(dailyMission.length<5){app.querySelector('.start').textContent='今天可用的新題不足 5 題，明天再來';return}
  reserve(dailyMission);session={...session,started:true};write(sessionKey,session);renderQuestion();
 });
}

function renderQuestion(){
 const current=activeSession();
 const question=activeMission()[current.index];
 const answered=current.answers.find(answer=>answer.index===current.index);
 app.innerHTML=`<section class="screen question-screen">
  <div class="topline"><span>第 ${current.index+1} 關 / 5</span><span>${formatText(question.missionRole)}</span></div>
  <div class="progress" aria-label="任務進度"><span style="width:${(current.index+1)*20}%"></span></div>
  <img class="scene" src="${assetPath(resolveMissionImage(question,question.missionRole))}" alt="本題漫畫情境">
  <p class="role">【情報辨識】</p><h1 class="source${question.sourceMode==='wrongCore'?' wrongcore-text':''}">${formatText(question.stem||question.source)}</h1>
  <p class="question">${formatText(question.prompt||question.question)}</p>
  <div class="options">${(question.choices||question.options).map((option,index)=>`<button type="button" class="option" data-index="${index}">${String.fromCharCode(65+index)}　${formatText(option)}</button>`).join('')}</div>
  <div id="feedback-slot"></div>
 </section>`;
 if(answered){showFeedback(question,answered);return}
 app.querySelectorAll('.option').forEach(option=>option.addEventListener('click',()=>answerQuestion(Number(option.dataset.index))));
}

function answerQuestion(selected){
 const current=activeSession();
 if(current.answers.some(answer=>answer.index===current.index))return;
 const question=activeMission()[current.index];
 const isCorrect=selected===(question.answer??question.correct);
 if(mode==='daily'){
  if(question.sourceMode==='wrongCore'){
   try{recordWrongCoreAnswer({scheduler:integration.scheduler,question,isCorrect,storage})}
   catch{app.querySelector('#feedback-slot').textContent='這題暫時無法儲存，請重新整理後繼續。';return}
  }else if(question.sourceMode==='extended'){
   try{recordExtendedAnswer({storage,question,isCorrect})}catch{app.querySelector('#feedback-slot').textContent='這題暫時無法儲存，請重新整理後繼續。';return}
  }else{
   knowledge[question.knowledgePointId]=updateKnowledge(knowledge[question.knowledgePointId],isCorrect,new Date());
   write(knowledgeKey,knowledge);
   legacyHistory=recordLegacyResult(read(LEGACY_HISTORY_KEY,legacyHistory),question,isCorrect);write(LEGACY_HISTORY_KEY,legacyHistory);
  }
 }
 if(mode==='practice'&&question.sourceMode==='extended'){
  try{recordExtendedAnswer({storage,question,isCorrect})}catch{app.querySelector('#feedback-slot').textContent='這題暫時無法儲存，請重新整理後繼續。';return}
 }
 const answer={index:current.index,id:question.id,sourceMode:question.sourceMode||'legacy',knowledgePointId:question.knowledgePointId,kind:question.type||question.kind,source:question.source,correct:isCorrect,selected};
 current.answers.push(answer);persist();
 showFeedback(question,answer);
}

function showFeedback(question,answer){
 app.querySelectorAll('.option').forEach(option=>{option.disabled=true});
 const slot=app.querySelector('#feedback-slot');
 const correctOption=question.sourceMode==='wrongCore'?`正確答案：${question.choiceKeys[question.answer]}　${question.choices[question.answer]}\n`:'';
 if(answer.correct){
  slot.innerHTML=`<section class="feedback correct success-burst"><img class="feedback-scene" src="${assetPath(GENERIC_MISSION_IMAGES.correct)}" alt="安妮亞答對回饋"><div><h2>✅ 情報正確！</h2><p>${formatText(question.explanation)}</p><div class="feedback-actions">${button('下一關 →')}</div></div></section>`;
 }else{
  const support=question.memoryWall
   ? `<a class="secondary memory-link" href="./zhuyin/index.html?set=${question.memoryWall.set}${question.memoryWall.q?`&q=${question.memoryWall.q}`:''}&from=daily-mission&mode=${mode}">看 10 秒記憶牆</a>`
   : button('看 10 秒補救卡','secondary rescue-button');
  slot.innerHTML=`<section class="feedback wrong"><img class="feedback-scene" src="${assetPath(GENERIC_MISSION_IMAGES.hint)}" alt="安妮亞情報補充"><div><h2>⚠️ 情報補充</h2><p>${formatText(correctOption+question.explanation)}</p><div class="feedback-actions">${support}${button('直接下一關')}</div><div class="rescue hidden"></div></div></section>`;
  const rescueButton=slot.querySelector('.rescue-button');
  if(rescueButton) rescueButton.addEventListener('click',()=>showRescue(question));
 }
 slot.querySelector('.primary').addEventListener('click',nextQuestion);
 slot.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function showRescue(question){
 const rescue=question.rescue||{title:question.stem||question.source,lines:[question.explanation],tip:'先記住本題關鍵，再繼續下一關。'};
 const panel=app.querySelector('.rescue');
 panel.innerHTML=`<h3>情報補充｜${formatText(rescue.title)}</h3>${rescue.lines.map(line=>`<p>${formatText(line)}</p>`).join('')}<p><strong>小提醒：</strong>${formatText(rescue.tip)}</p>`;
 panel.classList.remove('hidden');
}

function nextQuestion(){
 const current=activeSession();
 if(current.index<activeMission().length-1){current.index+=1;persist();renderQuestion();return}
 current.completed=true;
 if(mode==='daily')write(previousQuestionKey,current.questionIds);
 persist();renderComplete();
}

function renderComplete(){
 const current=activeSession();
 if(mode==='practice'){renderPracticeComplete();return}
 const correct=current.answers.filter(answer=>answer.correct).length;
 const wrong=current.answers.filter(answer=>!answer.correct);
 const categories=categorySummary(current.answers);
 const categoryText=Object.entries(categories).filter(([,count])=>count).map(([kind,count])=>`${kind} ${count} 題`).join('、');
 app.innerHTML=`<section class="screen complete">
  <p class="eyebrow">今日情報已整理</p><h1>🎉 今日任務完成！</h1>
  <img class="hero" src="${assetPath('/themes/spy-family/set-004/q7.png')}" alt="安妮亞完成任務插圖">
  <p class="score">今天完成 5 關</p><p>✅ 答對 ${correct} 題</p><p>💡 今天補強 ${wrong.length} 個知識點</p>
  <p class="encourage">安妮亞：「今天也很努力了！」</p>
  <div class="complete-actions">${button('🎮 再玩一局','primary replay-button')}${button('看今天錯題','secondary mistakes-button')}${button('回首頁','secondary home-button')}</div>
  <section class="mistakes hidden"><h2>今天錯題</h2>${wrong.length?wrong.map(item=>`<p><strong>${escapeHtml(item.source)}</strong>（${escapeHtml(item.kind)}）</p>`).join(''):'<p>今天全部答對！</p>'}</section>
  <button type="button" class="quiet parent-button">家長查看</button>
  <section class="parent-panel hidden"><h2>家長資訊</h2><p>今日 5 題，答對 ${correct} 題。</p><p>錯誤知識點：${wrong.length?wrong.map(item=>escapeHtml(item.source)).join('、'):'無'}</p><p>題型概況：${categoryText||'無錯題'}</p></section>
 </section>`;
 app.querySelector('.replay-button').addEventListener('click',startPractice);
 app.querySelector('.mistakes-button').addEventListener('click',()=>app.querySelector('.mistakes').classList.toggle('hidden'));
 app.querySelector('.parent-button').addEventListener('click',()=>app.querySelector('.parent-panel').classList.toggle('hidden'));
 app.querySelector('.home-button').addEventListener('click',renderHome);
}

function startPractice(){
 exposure=mergeExposure(read(exposureKey(today),exposure));
 const candidates=buildExtendedPractice({bank:extendedBank,state:loadExtendedState(storage),legacyQuestions:questions,legacyHistory:read(LEGACY_HISTORY_KEY,legacyHistory),learningState:knowledge,date:today,exposure});
 if(candidates.length<5){const replay=app.querySelector('.replay-button');if(replay)replay.textContent='今天可用的新題不足 5 題，明天再來';return}
 practiceMission=candidates;
 reserve(practiceMission);
 previousPracticeIds=practiceMission.map(question=>question.id);
 practiceSession={started:true,index:0,answers:[],completed:false};
 mode='practice';
 const url=new URL(location.href);url.searchParams.set('resume','practice');history.replaceState(null,'',url);
 persist();
 renderQuestion();
}

function renderPracticeComplete(){
 const correct=practiceSession.answers.filter(answer=>answer.correct).length;
 app.innerHTML=`<section class="screen complete">
  <p class="eyebrow">自由練習</p><h1>🎮 練習完成！</h1>
  <img class="hero" src="${assetPath('/themes/spy-family/set-004/q7.png')}" alt="安妮亞完成練習插圖">
  <p class="score">完成 5 關</p><p>✅ 答對 ${correct} 題</p>
  <p class="encourage">安妮亞：「練習結束，今天辛苦了！」</p>
  <div class="complete-actions">${button('再玩一局','primary replay-button')}${button('回首頁','secondary home-button')}</div>
 </section>`;
 app.querySelector('.replay-button').addEventListener('click',startPractice);
 app.querySelector('.home-button').addEventListener('click',()=>{mode='daily';const url=new URL(location.href);url.searchParams.delete('resume');history.replaceState(null,'',url);renderHome()});
}

if(session.started&&!integration.unavailable)reserve(dailyMission);
if(integration.unavailable||practiceUnavailable){app.innerHTML='<section class="screen"><p>原任務暫時無法載入，紀錄已保留。請重新整理後繼續。</p></section>'}
else if(mode==='practice'){if(practiceSession.completed)renderComplete();else renderQuestion()}
else if(session.completed) renderComplete();
else if(session.started) renderQuestion();
else renderHome();
