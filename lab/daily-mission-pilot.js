// Private originals are fetched over Tailnet HTTPS; never bundled in this repository.
export const PILOT_URL='/questions/draw';
export const PRIVATE_BANK_BASE='https://sdl2.tail7e0ac0.ts.net';
export const PRIVATE_BANK_TIMEOUT_MS=2500;
export const privateBankBase=()=>PRIVATE_BANK_BASE;
const emptyBank=()=>({questions:[],privateAvailable:false});
const validId=id=>/^CHI-(FYY-(13|46)|PUNC|CALLI|LIUSHU)-\d{3}$/.test(id);
export function createPilotBank(data,baseUrl){
 const ids=new Set();
 const questions=(data.questions||[]).map(q=>{
  const keys=Object.keys(q.choices||{});
  if(!/^CHI-(FYY-(13|46)|PUNC|CALLI|LIUSHU)-\d{3}$/.test(q.id)||ids.has(q.id)||keys.join('')!=='ABCD'||!keys.includes(q.answer)||!q.question||!q.explanation||keys.some(k=>!q.choices[k])||!q.source||!Number.isInteger(q.sourceQuestionNumber)||!Array.isArray(q.tags))throw Error('Invalid private original');
  if(q.image&&!/^\.\/question-assets\/CHI-[A-Z0-9-]+\.png$/.test(q.image))throw Error('Invalid private image');
  ids.add(q.id);
  return {...q,privateSource:q,questionId:q.id,sourceMode:'extended',originalMaterial:true,
   knowledgePointId:q.id,approvedSourceFile:'private:chinese-private-pilot',originalSource:q.source,
   source:q.question,stem:q.question,prompt:'',question:'',choices:keys.map(k=>q.choices[k]),choiceKeys:keys,
   answer:keys.indexOf(q.answer),originalAnswer:q.answer,
   materialImage:q.image?new URL('/assets/'+q.image.split('/').pop(),baseUrl).href:null,image:null,
   type:q.tags.includes('字音')?'pronunciation':q.tags.includes('字形')?'shape':'meaning',missionRole:'📘 今日挑戰'};
 });
 if(questions.length>30)throw Error('Private Pilot limit exceeded');
 return {questions,privateAvailable:true,resolve(id){const q=questions.find(q=>q.id===id);if(!q)throw Error('Private question unavailable');return q;}};
}
// Only the current mission's originals are saved in the user's browser for offline resume.
export const privateMissionSnapshot=mission=>mission.filter(q=>q.originalMaterial).map(q=>q.privateSource);
export function mixPrivateCandidates(ordered){
 const privateQuestions=ordered.filter(q=>q.originalMaterial),publicQuestions=ordered.filter(q=>!q.originalMaterial),mixed=[];
 while(privateQuestions.length||publicQuestions.length){
  if(privateQuestions.length)mixed.push(privateQuestions.shift());
  if(publicQuestions.length)mixed.push(publicQuestions.shift());
 }
 return mixed;
}
export async function loadPilotBank(fetcher=fetch,{baseUrl=privateBankBase(),seenQuestionIds=[],restoreIds=[],restoreOnly=false,snapshots=[],timeoutMs=PRIVATE_BANK_TIMEOUT_MS}={}){
 if(!baseUrl)return emptyBank();
 const ids=[...new Set(restoreIds)].filter(validId);
 let cached=emptyBank();
 try{cached=createPilotBank({questions:snapshots.filter(q=>ids.includes(q.id))},baseUrl)}catch{/* Invalid local snapshot is never used. */}
 if(restoreOnly&&ids.every(id=>cached.questions.some(q=>q.id===id)))return cached;
 const controller=new AbortController();let timer;
 const request=async(route,body)=>{const r=await fetcher(new URL(route,baseUrl).href,{signal:controller.signal,cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('Private bank unavailable');return r.json();};
 try{
  return await Promise.race([(async()=>{
   const manifest=await request('/manifest');
   if(manifest.totalQuestions!==30||!Array.isArray(manifest.questionIds)||new Set(manifest.questionIds).size!==30||manifest.questionIds.some(id=>!validId(id)))throw Error('Private manifest invalid');
   if(ids.some(id=>!manifest.questionIds.includes(id)))throw Error('Unknown saved private ID');
   const drawn=restoreOnly?{questions:[]}:await request('/questions/draw',{count:30,seenQuestionIds});
   const restored=ids.length?(await request('/questions/resolve',{questionIds:ids})).questions:[];
   const seen=new Set(seenQuestionIds);
   if(!Array.isArray(drawn.questions)||drawn.questions.some(q=>seen.has(q.id)||!manifest.questionIds.includes(q.id)))throw Error('Invalid private draw');
   if(!Array.isArray(restored)||restored.some(q=>!ids.includes(q.id))||ids.some(id=>!restored.some(q=>q.id===id)))throw Error('Invalid private restoration');
   return createPilotBank({questions:[...new Map([...drawn.questions,...restored].map(q=>[q.id,q])).values()]},baseUrl);
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Private bank timeout'));},timeoutMs);})]);
 }catch{return cached.questions.length?cached:emptyBank()}
 finally{clearTimeout(timer);}
}

// Browser-only image cache: assets stay private, outside the public repository.
const IMAGE_CACHE='chinesePrivateMissionImages.v1';
export async function privateImageUrl(url){
 if(!url?.startsWith(PRIVATE_BANK_BASE+'/assets/'))return url;
 let cache;
 try{
  cache=await globalThis.caches?.open(IMAGE_CACHE);
  const saved=await cache?.match(url);
  if(saved)return URL.createObjectURL(await saved.blob());
 }catch{/* Cache storage may be disabled; keep HTTPS loading available. */}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),PRIVATE_BANK_TIMEOUT_MS);
 try{
  const response=await fetch(url,{signal:controller.signal});
  if(!response.ok)throw Error('Private image unavailable');
  try{await cache?.put(url,response.clone())}catch{/* Storage quota must not block the image. */}
  return URL.createObjectURL(await response.blob());
 }catch{return url}finally{clearTimeout(timer)}
}
export function cachePrivateMissionImages(mission){
 for(const q of mission)if(q.materialImage)void privateImageUrl(q.materialImage).then(url=>{if(url?.startsWith('blob:'))URL.revokeObjectURL(url);});
}
