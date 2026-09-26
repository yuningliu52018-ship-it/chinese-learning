import './template.js';
import * as set001 from './fixture.js';
import {learningNotes as notes001} from './learning-notes.js';
import * as set002 from './set-002.js';
import {illustrations as art002} from '../../themes/spy-family-set-002.js';
import * as set003 from './set-003.js';
import {illustrations as art003} from '../../themes/spy-family-set-003.js';
import * as set004 from './set-004.js';
import {illustrations as art004} from '../../themes/spy-family-set-004.js';
import * as set005 from './set-005.js';
import {illustrations as art005} from '../../themes/spy-family-set-005.js';
import {verifyItems,verifyRendered} from './validate.js';
import {spyFamily} from '../../themes/spy-family.js';
const params=new URLSearchParams(location.search);
const requestedSet=params.get('set');
const requestedQuestion=Number(params.get('q'));
const fromDailyMission=params.get('from')==='daily-mission';
const returnMode=params.get('mode')==='practice'?'practice':'daily';
const selected=requestedSet==='005'
 ? {data:set005,illustrations:art005}
 : requestedSet==='004'
  ? {data:set004,illustrations:art004}
 : requestedSet==='003'
   ? {data:set003,illustrations:art003}
  : requestedSet==='002'
    ? {data:set002,illustrations:art002}
    : {data:set001,illustrations:spyFamily.illustrations};
const {items,lockedSourceText}=selected.data;
const learningNotes=requestedSet==='001'||!requestedSet?notes001:selected.data.learningNotes;
const illustrations=selected.illustrations;
const isColorSet=requestedSet==='005';
const wall=document.querySelector('#wall'),status=document.querySelector('#validation');
function element(tag,className,text){const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el}
const bopomofoPattern=/[\u3105-\u312f\u31a0-\u31bf]+[ˊˇˋ˙]?(?:\s+[\u3105-\u312f\u31a0-\u31bf]+[ˊˇˋ˙]?)*|[ˊˇˋ˙]/giu;
function appendWithZhuyin(parent,text){
 let lastIndex=0;
 for(const match of String(text).matchAll(bopomofoPattern)){
  parent.append(document.createTextNode(String(text).slice(lastIndex,match.index)));
  parent.append(element('span','zhuyin',match[0]));
  lastIndex=match.index+match[0].length;
 }
 parent.append(document.createTextNode(String(text).slice(lastIndex)));
 return parent;
}
function fail(reason){wall.replaceChildren();wall.hidden=true;status.textContent='FAIL：'+reason;status.dataset.result='FAIL'}
function colorSummary(){
 const section=element('section','family-summary');
 section.append(element('p','summary-kicker','顏色字記憶牆'),element('h2','summary-title','黑色家族'),element('p','summary-lead','先分清黑色本義，再看「黑」如何延伸成比喻義。'));
 const literal=element('section','summary-group');literal.append(element('h3','summary-heading','實際表示黑色'));
 const literalList=element('div','summary-list');selected.data.summaryLiteral.forEach(([word,meaning])=>{const row=element('p','summary-row');row.append(element('strong','summary-word',word),document.createTextNode(' → '+meaning));literalList.append(row)});literal.append(literalList);
 const figurative=element('section','summary-group figurative');figurative.append(element('h3','summary-heading','黑的引申義'));
 const figurativeList=element('div','summary-list');selected.data.summaryFigurative.forEach(([word,meaning])=>{const row=element('p','summary-row');row.append(element('strong','summary-word',word),document.createTextNode(' → '+meaning));figurativeList.append(row)});figurative.append(figurativeList);
 const swatch=element('p','black-swatch');swatch.append(element('span','swatch-chip'),document.createTextNode('#111111'));section.append(literal,figurative,swatch);return section;
}
function render(){
 try{
  const result=isColorSet?selected.data.verifyColorItems(items,lockedSourceText):verifyItems(items,lockedSourceText);if(!result.ok)return fail(result.errors.join('；'));
  if(learningNotes.length!==items.length||illustrations.length!==items.length||new Set(illustrations).size!==items.length)return fail('教材與漫畫必須逐題對應');
  const fragment=document.createDocumentFragment();
  if(isColorSet)fragment.append(colorSummary());
  items.forEach((row,i)=>{
   const note=learningNotes[i];
   if(!isColorSet){
    if(!row.prompt.includes(note.word)&&row.answer!==note.word)throw Error('核心國字不符');
    if(row.answer!==note.word&&note.sound!==row.answer)throw Error('核心讀音不符');
    if(row.answer===note.word&&!row.prompt.includes(note.sound))throw Error('核心讀音不符');
   }
   const card=element('article',isColorSet?'card color-card':'card');card.dataset.questionId=row.id;
   const core=element('h2','core');core.append(element('span','word',note.word),element('span',isColorSet?'sound':'sound zhuyin',note.sound));
   const meaning=element('p','meaning');meaning.append(element('span','label','意思'));appendWithZhuyin(meaning,note.meaning);
   const explanation=element('p','explanation');explanation.append(element('span','label',note.label));appendWithZhuyin(explanation,note.explanation);
   const original=element('div','original');const source=element('p','source');appendWithZhuyin(source,isColorSet?row.prompt:row.prompt+'：'+row.answer);original.append(element('span','label',isColorSet?'原詞／原句':'原題'),source);
   const figure=element('figure','comic');const image=element('img','illustration');image.src=`../..${illustrations[i]}`;image.alt=note.caption;image.width=128;image.height=128;image.loading=i===0?'eager':'lazy';figure.append(image,element('figcaption','caption',note.caption));
   card.append(original,core,meaning,explanation,figure);fragment.append(card);
  });
  if(!verifyRendered([...fragment.querySelectorAll('.source')].map(x=>x.textContent),lockedSourceText))return fail('HTML 文字與鎖定原文不一致');
  wall.replaceChildren(fragment);wall.hidden=false;status.textContent=`✓ ${result.passed}/7 PASS · 原題逐字驗證`;status.dataset.result='PASS';
  if(Number.isInteger(requestedQuestion)&&requestedQuestion>=1&&requestedQuestion<=items.length){const target=wall.querySelector(`[data-question-id="${requestedQuestion}"]`);if(target){target.classList.add('target-card');requestAnimationFrame(()=>target.scrollIntoView({block:'start'}))}}
 }catch(e){fail(e.message)}
}
document.documentElement.style.setProperty('--bg',spyFamily.background);document.documentElement.style.setProperty('--accent',isColorSet?'#111111':spyFamily.accent);
if(isColorSet){document.body.classList.add('color-wall');document.title='顏色字記憶牆｜黑色';document.querySelector('h1').textContent='顏色字記憶牆｜黑色';document.querySelector('header p').textContent='字 → 黑色 → 原詞意思 → 實際用法與引申義。'}
if(fromDailyMission){const back=element('a','mission-return','← 回到今日任務');back.href=`../daily-mission.html?resume=${returnMode}`;document.body.prepend(back)}
render();


