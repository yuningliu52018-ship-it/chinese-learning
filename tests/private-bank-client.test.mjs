import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PRIVATE_BANK_BASE,PRIVATE_BANK_TIMEOUT_MS,privateBankBase,loadPilotBank,createPilotBank,mixPrivateCandidates,privateMissionSnapshot} from '../lab/daily-mission-pilot.js';
import {loadExtendedBank,buildExtendedPractice} from '../lab/daily-mission-extended.js';
import {loadSeen,markSeen,excludeSeen} from '../lab/daily-mission-seen.js';
import {prepareChineseDailyMission} from '../lab/daily-mission-wrongcore.js';
const lab=new URL('../lab/',import.meta.url);
// Synthetic transport fixtures only; no textbook questions, answers or explanations.
const fixture=n=>({id:`CHI-PUNC-${String(n).padStart(3,'0')}`,question:'Transport fixture '+n,choices:{A:'one',B:'two',C:'three',D:'four'},answer:'B',explanation:'Synthetic fixture explanation',source:'test fixture',sourceQuestionNumber:n,tags:['test-only'],image:null});
const raw=Array.from({length:30},(_,i)=>fixture(i+1));
const manifest={version:'v1',bankId:'chinese-private-pilot',totalQuestions:30,questionIds:raw.map(q=>q.id)};
const response=data=>({ok:true,json:async()=>data});
const memory=()=>{const m=new Map();return {get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
const online=(calls=[])=>async(url,options)=>{calls.push({url,body:options.body?JSON.parse(options.body):null});if(url.endsWith('/manifest'))return response(manifest);const b=JSON.parse(options.body);return response({questions:url.endsWith('/questions/resolve')?raw.filter(q=>b.questionIds.includes(q.id)):raw.filter(q=>!b.seenQuestionIds.includes(q.id))});};
const publicFetch=async url=>response(JSON.parse(await readFile(new URL(url,lab),'utf8')));
test('fixed HTTPS endpoint and bounded 2500ms timeout',()=>{assert.equal(privateBankBase(),PRIVATE_BANK_BASE);assert.equal(new URL(PRIVATE_BANK_BASE).protocol,'https:');assert.equal(PRIVATE_BANK_TIMEOUT_MS,2500)});
test('online draw carries shared Seen, unchanged A/B/C/D and originals',async()=>{const calls=[];const b=await loadPilotBank(online(calls),{seenQuestionIds:[raw[0].id]});assert.equal(b.questions.length,29);assert.deepEqual(calls[1].body,{count:30,seenQuestionIds:[raw[0].id]});const q=b.resolve(raw[1].id);assert.deepEqual(q.privateSource,raw[1]);assert.deepEqual(q.choices,Object.values(raw[1].choices));assert.equal(q.answer,1);assert.equal(q.explanation,raw[1].explanation)});
test('restore never draws a replacement mission',async()=>{const calls=[];const b=await loadPilotBank(online(calls),{restoreOnly:true,restoreIds:[raw[0].id]});assert.equal(b.questions.length,1);assert.ok(calls.every(c=>!c.url.endsWith('/draw')));assert.deepEqual(calls[1].body.questionIds,[raw[0].id])});
test('offline saved snapshots resume without any request even for Seen IDs',async()=>{let calls=0;const b=await loadPilotBank(()=>{calls++;throw Error('offline')},{restoreOnly:true,restoreIds:[raw[0].id],snapshots:[raw[0]],seenQuestionIds:[raw[0].id]});assert.equal(calls,0);assert.equal(b.resolve(raw[0].id).id,raw[0].id)});
test('saved public-only task makes no private request',async()=>{let calls=0;await loadPilotBank(()=>calls++,{restoreOnly:true});assert.equal(calls,0)});
test('offline private returns empty, not a functional rejection',async()=>{assert.equal((await loadPilotBank(()=>{throw Error('offline')})).questions.length,0)});
test('timeout terminates even a transport that ignores AbortSignal',async()=>{const t=Date.now();const b=await loadPilotBank(()=>new Promise(()=>{}),{timeoutMs:25});assert.equal(b.questions.length,0);assert.ok(Date.now()-t<500)});
test('malformed or Seen private response is rejected',async()=>{const b=await loadPilotBank(online(),{seenQuestionIds:[]});assert.equal(b.questions.length,30);const bad=await loadPilotBank(async url=>response(url.endsWith('/manifest')?manifest:{questions:[raw[0]]}),{seenQuestionIds:[raw[0].id]});assert.equal(bad.questions.length,0)});
test('three private image IDs resolve exclusively to HTTPS',()=>{for(const id of ['CHI-CALLI-002','CHI-CALLI-004','CHI-LIUSHU-003']){const q=createPilotBank({questions:[{...raw[0],id,image:`./question-assets/${id}.png`}]},PRIVATE_BANK_BASE).questions[0];assert.equal(q.materialImage,`${PRIVATE_BANK_BASE}/assets/${id}.png`)}});
test('mix alternates public/private while retaining each pool order',()=>{const b=createPilotBank({questions:raw.slice(0,2)},PRIVATE_BANK_BASE);assert.deepEqual(mixPrivateCandidates([{id:'public-1'},...b.questions,{id:'public-2'}]).map(q=>q.id),[raw[0].id,'public-1',raw[1].id,'public-2']);assert.deepEqual(privateMissionSnapshot(b.questions),raw.slice(0,2))});
test('offline keeps all 193 public questions',async()=>{const b=await loadExtendedBank(url=>url.startsWith('https:')?Promise.reject(Error('offline')):publicFetch(url));assert.equal(b.questions.length,193);assert.ok(b.questions.every(q=>!q.originalMaterial))});
test('online combines 193 public + 30 private, unique IDs',async()=>{const privateFetch=online();const b=await loadExtendedBank((url,options)=>url.startsWith('https:')?privateFetch(url,options):publicFetch(url));assert.equal(b.questions.length,223);assert.equal(new Set(b.questions.map(q=>q.id)).size,223)});
test('correct and wrong answer IDs share V2.1 Seen; unanswered not Seen',()=>{const storage=memory();markSeen(storage,raw[0]);markSeen(storage,raw[1]);assert.equal(loadSeen(storage).size,2);assert.equal(excludeSeen(raw,loadSeen(storage)).length,28);assert.ok(!loadSeen(storage).has(raw[2].id))});
for(const remaining of [0,1,4,5])test(`formal remaining ${remaining} never fills with Seen originals`,async()=>{const storage=memory(),questions=raw.slice(0,5).map(q=>({...q,knowledgePointId:q.id,sourceMode:'extended'}));questions.slice(remaining).forEach(q=>markSeen(storage,q));const result=await prepareChineseDailyMission({legacyMission:[],extendedMission:questions,extendedBank:{questions},storage,loader:async()=>{throw Error('offline')}});assert.equal(result.mission.length,remaining)});
test('saved mission resumes unchanged even when its question is Seen',async()=>{const storage=memory(),bank=createPilotBank({questions:raw.slice(0,2)},PRIVATE_BANK_BASE);markSeen(storage,raw[0]);const result=await prepareChineseDailyMission({legacyMission:[],extendedBank:bank,storage,savedSession:{questionRefs:bank.questions.map(q=>({sourceMode:'extended',id:q.id}))},restoreLegacy:()=>[]});assert.ok(result.resumed);assert.deepEqual(result.mission.map(q=>q.id),raw.slice(0,2).map(q=>q.id))});
test('V2.1 public practice can use permanent Seen questions',()=>{const storage=memory(),q={id:'ext-fixture',knowledgePointId:'test',sourceMode:'extended'};markSeen(storage,q);assert.equal(buildExtendedPractice({bank:{questions:[q]},state:{},legacyQuestions:[],date:'2026-09-27'}).length,1)});
test('public repository does not contain Pilot data/crops',async()=>{for(const p of ['./data/chinese-pilot/chinese-import-pilot.v1.json','./question-assets/CHI-CALLI-002.png','./question-assets/CHI-CALLI-004.png','./question-assets/CHI-LIUSHU-003.png'])await assert.rejects(readFile(new URL(p,lab)),{code:'ENOENT'})});

for(const total of [30,130,520])test(`variable manifest ${total} accepts synthetic IDs and retains bounded draw`,async()=>{
 const questions=Array.from({length:total},(_,i)=>fixture(i+1)),calls=[];
 const result=await loadPilotBank(async(url,options)=>{calls.push(url);if(url.endsWith('/manifest'))return response({...manifest,totalQuestions:total,questionIds:questions.map(q=>q.id)});assert.equal(JSON.parse(options.body).count,30);return response({questions:questions.slice(-30)});});
 assert.equal(result.privateAvailable,true);assert.equal(result.questions.length,30);assert.equal(result.questions.at(-1).id,questions.at(-1).id);assert.equal(calls.length,2);
});
const invalidManifests={
 'count mismatch':{...manifest,totalQuestions:31},
 'duplicate IDs':{...manifest,questionIds:[raw[0].id,...manifest.questionIds.slice(0,29)]},
 'malformed ID':{...manifest,questionIds:['INVALID',...manifest.questionIds.slice(1)]},
 'non-string ID':{...manifest,questionIds:[null,...manifest.questionIds.slice(1)]},
 'wrong version':{...manifest,version:'v2'},
 'wrong bankId':{...manifest,bankId:'other-bank'},
 'zero count':{...manifest,totalQuestions:0},
 'negative count':{...manifest,totalQuestions:-1},
 'fractional count':{...manifest,totalQuestions:30.5},
 'string count':{...manifest,totalQuestions:'30'},
 'excessive count':{...manifest,totalQuestions:10001},
 'null manifest':null
};
for(const [name,value] of Object.entries(invalidManifests))test(`manifest rejects ${name} before draw`,async()=>{
 let calls=0;const result=await loadPilotBank(async url=>{calls++;assert.ok(url.endsWith('/manifest'));return response(value)});
 assert.equal(result.privateAvailable,false);assert.deepEqual(result.questions,[]);assert.equal(calls,1);
});
for(const restoreOnly of [false,true])test(`${restoreOnly?'resolve':'draw'} retains per-question schema validation`,async()=>{
 const result=await loadPilotBank(async url=>response(url.endsWith('/manifest')?manifest:{questions:[{...raw[0],answer:'X'}]}),restoreOnly?{restoreOnly:true,restoreIds:[raw[0].id]}:{});
 assert.equal(result.privateAvailable,false);assert.deepEqual(result.questions,[]);
});