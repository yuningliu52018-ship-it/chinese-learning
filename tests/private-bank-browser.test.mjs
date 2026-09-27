import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PRIVATE_BANK_BASE as api} from '../lab/daily-mission-pilot.js';
const root=fileURLToPath(new URL('../',import.meta.url));
test('C.3 browser integration at Pages origin with live Tailnet API', {skip:!process.env.PLAYWRIGHT_MODULE,timeout:180000},async()=>{
 const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const origin='https://yuningliu52018-ship-it.github.io',prefix=origin+'/chinese-learning/',url=prefix+'lab/daily-mission.html';
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
 const manifest=await fetch(api+'/manifest').then(r=>r.json());
 const raw=(await fetch(api+'/questions/draw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count:30,seenQuestionIds:[]})}).then(r=>r.json())).questions;
 assert.equal(raw.length,30);
 const wrong=JSON.parse(await readFile(path.join(root,'lab/data/chinese-wrong/chinese-review-variants-approved.v1.json'),'utf8')).approvedVariants.map(q=>q.variantId);
 const {loadExtendedBank}=await import('../lab/daily-mission-extended.js');
 const publicBank=await loadExtendedBank(async u=>({ok:true,json:async()=>JSON.parse(await readFile(path.join(root,'lab',u),'utf8'))}),{baseUrl:null});
 const publicIds=[...wrong,...publicBank.questions.map(q=>q.id)];
 const day=new Date().toLocaleDateString('en-CA'),key='116.dailyMission.session.v2.'+day,seenKey='chineseDailyMissionSeen.v1';
 const results={},errors=[],warnings=[],notFound=[],transport=[];
 const contexts=[];
 async function setup({seen=[],saved=null,offline=false,timeout=false}={}){
  const ctx=await browser.newContext({viewport:{width:390,height:844}});contexts.push(ctx);await ctx.grantPermissions(['local-network-access'],{origin});
  const control={offline,timeout,calls:[]};
  await ctx.route(origin+'/**',async route=>{
   const requestUrl=route.request().url();
   if(!requestUrl.startsWith(prefix)){await route.fulfill({status:204});return}
   const relative=decodeURIComponent(new URL(requestUrl).pathname.slice('/chinese-learning/'.length))||'index.html';
   const file=path.resolve(root,relative);
   assert.ok(file.startsWith(path.resolve(root)+path.sep));
   try{await route.fulfill({status:200,body:await readFile(file),contentType:mime[path.extname(file)]||'application/octet-stream'})}
   catch{await route.fulfill({status:404,body:'Not found'})}
  });
  await ctx.route(api+'/**',async route=>{
   control.calls.push(route.request().url());
   if(control.offline){await route.abort('connectionrefused');return}
   if(control.timeout){await new Promise(r=>setTimeout(r,3500));await route.abort('timedout').catch(()=>{});return}
   await route.continue();
  });
  const page=await ctx.newPage();
  page.on('requestfailed',r=>transport.push(r.url()+' '+r.failure()?.errorText));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'){if(m.text().includes('net::ERR_'))transport.push(m.text());else errors.push(m.text())}if(m.type()==='warning')warnings.push(m.text())});
  page.on('response',r=>{if(r.status()===404)notFound.push(r.url())});
  await page.goto(prefix+'index.html');
  await page.evaluate(({seen,saved,key,seenKey})=>{localStorage.clear();sessionStorage.clear();localStorage.setItem(seenKey,JSON.stringify({version:1,questionIds:seen}));if(saved)localStorage.setItem(key,JSON.stringify(saved))},{seen,saved,key,seenKey});
  const start=Date.now();await page.goto(url);
  return {ctx,page,control,start};
 }
 const savedMission=qs=>({started:true,index:0,answers:[],completed:false,questionIds:qs.map(q=>q.id),questionRefs:qs.map(q=>({sourceMode:'extended',id:q.id}))});
 const session=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const snapshot=page=>page.evaluate(({key,seenKey})=>[localStorage.getItem(key),localStorage.getItem(seenKey),localStorage.getItem('chineseExtendedQuestionState.v1')],{key,seenKey});
 const overflow=async page=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
 async function answer(page,q,correct=true){await page.locator('.option').first().waitFor();const a='ABCD'.indexOf(q.answer);await page.locator('.option').nth(correct?a:(a+1)%4).click();await page.locator('.original-explanation').waitFor();assert.equal(await page.locator('.original-explanation').textContent(),q.explanation);assert.ok((await page.locator('.feedback').textContent()).includes('正確答案：'+q.answer));assert.ok(await page.evaluate(({id,seenKey})=>JSON.parse(localStorage.getItem(seenKey)).questionIds.includes(id),{id:q.id,seenKey}));await overflow(page)}
 try{
  const mixed=await setup({seen:wrong});await mixed.page.locator('.start').click();await mixed.page.locator('.options').waitFor();
  const mix=await session(mixed.page);assert.equal(mix.questionIds.length,5);assert.ok(mix.questionIds.some(id=>id.startsWith('CHI-')));assert.ok(mix.questionIds.some(id=>id.startsWith('ext-')));results[1]=results[2]='PASS';await overflow(mixed.page);
  const p=await setup({seen:publicIds});await p.page.locator('.start').click();await p.page.locator('.options').waitFor();const first=await session(p.page);assert.equal(first.privateQuestions.length,5);
  const q1=raw.find(q=>q.id===first.questionIds[0]),q2=raw.find(q=>q.id===first.questionIds[1]);
  await answer(p.page,q1,true);results[3]='PASS';
  const feedbackSnapshot=await snapshot(p.page);const drawBefore=p.control.calls.filter(u=>u.endsWith('/draw')).length;
  await p.page.reload();await p.page.locator('.original-explanation').waitFor();assert.deepEqual(await snapshot(p.page),feedbackSnapshot);
  await p.page.locator('.feedback .primary').click();await p.page.locator('.options').waitFor();assert.equal((await session(p.page)).index,1);
  const step2=await snapshot(p.page);await p.page.reload();await p.page.locator('.options').waitFor();assert.deepEqual(await snapshot(p.page),step2);assert.equal(await p.page.locator('.source').textContent(),q2.question);assert.equal(p.control.calls.filter(u=>u.endsWith('/draw')).length,drawBefore);results[8]='PASS';
  p.control.offline=true;await p.page.reload();await p.page.locator('.options').waitFor();assert.deepEqual(await snapshot(p.page),step2);assert.equal(await p.page.locator('.source').textContent(),q2.question);results[9]='PASS';
  await answer(p.page,q2,false);results[4]=results[6]='PASS';p.control.offline=false;
  // Finish all five via original feedback and verify practice stays public-only.
  await p.page.locator('.feedback .primary').click();
  for(let i=2;i<5;i++){await answer(p.page,raw.find(q=>q.id===first.questionIds[i]),true);await p.page.locator('.feedback .primary').click()}
  await p.page.locator('.complete').waitFor();await p.page.locator('.replay-button').click();await p.page.locator('.options').waitFor();
  const practice=await p.page.evaluate(()=>JSON.parse(sessionStorage.getItem('116.dailyMission.practice.v1')));assert.ok(practice.questionIds.every(id=>id.startsWith('ext-')));assert.equal(p.control.calls.filter(u=>u.endsWith('/draw')).length,drawBefore);results[16]='PASS';
  // Isolated QA profile: remove only the saved task so the real scheduler makes the next task.
  await p.page.evaluate(k=>localStorage.removeItem(k),key);await p.page.goto(url);await p.page.locator('.start').click();const next=await session(p.page);assert.ok(next.questionIds.every(id=>!first.questionIds.includes(id)));results[5]='PASS';
  const imageQs=['CHI-CALLI-002','CHI-CALLI-004','CHI-LIUSHU-003'].map(id=>raw.find(q=>q.id===id));
  const imgs=await setup({saved:savedMission(imageQs)});
  for(let i=0;i<3;i++){
   const img=imgs.page.locator('.material-image');await img.waitFor();await imgs.page.waitForFunction(()=>{const i=document.querySelector('.material-image');return i?.complete&&i.naturalWidth>0});
   assert.equal((await imgs.page.request.get(api+'/assets/'+imageQs[i].id+'.png')).status(),200);assert.equal(await imgs.page.locator('.source').textContent(),imageQs[i].question);await overflow(imgs.page);
   const old=await snapshot(imgs.page);imgs.control.offline=true;await imgs.page.reload();await imgs.page.waitForFunction(()=>{const i=document.querySelector('.material-image');return i?.complete&&i.naturalWidth>0});assert.deepEqual(await snapshot(imgs.page),old);imgs.control.offline=false;
   await answer(imgs.page,imageQs[i],false);await imgs.page.locator('.feedback .primary').click();
  }
  results[7]='PASS';
  for(const mode of ['offline','timeout']){
   const f=await setup({[mode]:true,seen:[raw[0].id]});await f.page.locator('.start').waitFor();assert.ok(Date.now()-f.start<6500);await f.page.locator('.start').click();await f.page.locator('.options').waitFor();assert.ok((await session(f.page)).questionIds.every(id=>!id.startsWith('CHI-')));assert.ok(await f.page.evaluate(({seenKey,id})=>JSON.parse(localStorage.getItem(seenKey)).questionIds.includes(id),{seenKey,id:raw[0].id}));await overflow(f.page);
   results[mode==='offline'?10:11]='PASS';
  }
  results[12]=results[13]='PASS';
  for(const n of [0,1,4,5]){
   const r=await setup({seen:[...publicIds,...raw.slice(n).map(q=>q.id)]});await r.page.locator('.start').waitFor();assert.ok((await r.page.locator('.mission-time').textContent()).includes(`共 ${n} 關`));if(n){await r.page.locator('.start').click();const ids=(await session(r.page)).questionIds;assert.equal(ids.length,n);assert.ok(ids.every(id=>raw.slice(0,n).some(q=>q.id===id)))}await overflow(r.page);
  }
  results[14]=results[15]='PASS';
  // Existing memory-wall deep link / same-tab return and answered resume.
  const wall=await setup({saved:{started:true,index:0,answers:[],completed:false,questionIds:['q-zi'],questionRefs:[{sourceMode:'legacy',id:'q-zi'}]}});
  const bank=await wall.page.evaluate(async()=>{const m=await import('./daily-mission-bank.js');return m.questions.find(q=>q.id==='q-zi')});
  await wall.page.locator('.option').nth(((bank.answer??bank.correct)+1)%4).click();await wall.page.locator('.memory-link').waitFor();const wallBefore=await snapshot(wall.page);await wall.page.locator('.memory-link').click();await wall.page.locator('.mission-return').waitFor();assert.equal(wall.ctx.pages().length,1);await wall.page.locator('.mission-return').click();await wall.page.locator('.feedback').waitFor();assert.deepEqual(await snapshot(wall.page),wallBefore);results[17]='PASS';await overflow(wall.page);
  results[18]='PASS';assert.deepEqual(errors,[]);assert.deepEqual(notFound,[]);results[19]=results[20]='PASS';
  console.log(JSON.stringify({results,functionalErrors:errors,warnings,new404:notFound,expectedOfflineTransportErrors:transport.length,viewport:'390x844',liveApi:api,userStorageTouched:false},null,2));
  if(process.env.C3_TEST_OUTPUT){await mkdir(process.env.C3_TEST_OUTPUT,{recursive:true});await writeFile(path.join(process.env.C3_TEST_OUTPUT,'browser-results.json'),JSON.stringify({results,functionalErrors:errors,warnings,new404:notFound,expectedOfflineTransportErrors:transport.length},null,2));await mixed.page.screenshot({path:path.join(process.env.C3_TEST_OUTPUT,'390x844.png')})}
 }catch(error){console.log(JSON.stringify({errors,warnings,notFound,transport}));throw error}finally{await browser.close()}
});
