import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const git=(...args)=>execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/').replace(/\/$/,'')}`,'--no-optional-locks',...args],{cwd:root,encoding:'utf8'});
const hash=b=>createHash('sha256').update(b).digest('hex');
test('public repository private material / image / base64 / LAN path isolation', {skip:!process.env.PRIVATE_BANK_ROOT}, async()=>{
 const privateRoot=process.env.PRIVATE_BANK_ROOT;
 const rawBytes=await readFile(path.join(privateRoot,'questions/pilot.json'));
 const raw=JSON.parse(rawBytes).questions;
 const manifest=JSON.parse(await readFile(path.join(privateRoot,'manifest.json'),'utf8'));
 assert.equal(hash(rawBytes),manifest.questionSha256);
 const assetHashes=[];
 for(const asset of manifest.assets){const bytes=await readFile(path.join(privateRoot,'assets',asset.id));assert.equal(hash(bytes),asset.sha256);assetHashes.push(hash(bytes))}
 const names=[...new Set(git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean))];
 const findings=[];
 for(const name of names){
  const p=path.join(root,name);let bytes;try{bytes=await readFile(p)}catch{continue}
  if(hash(bytes)===hash(rawBytes)||assetHashes.includes(hash(bytes)))findings.push({name,reason:'private file hash'});
  if(!/\.(js|mjs|json|html|css|md|txt|svg)$/i.test(name))continue;
  const text=bytes.toString('utf8'),normalized=text.replaceAll('\\\\','/').replaceAll('\\','/');
  if(normalized.toLowerCase().includes(privateRoot.replaceAll('\\','/').toLowerCase()))findings.push({name,reason:'private directory'});
  if(/\b192\.168\.\d{1,3}\.\d{1,3}\b/.test(text))findings.push({name,reason:'LAN address'});
  for(const q of raw){
   for(const [field,value] of Object.entries({question:q.question,explanation:q.explanation,choices:JSON.stringify(q.choices)})){
    if(value.length>20&&(text.includes(value)||text.includes(JSON.stringify(value).slice(1,-1))||text.includes(Buffer.from(value).toString('base64'))))findings.push({name,id:q.id,reason:field});
   }
  }
 }
 assert.deepEqual(findings,[]);
 console.log(JSON.stringify({repositoryFiles:names.length,privateMaterialHits:0,privateImages:0,base64Hits:0,privatePaths:0,lanIPs:0,privateBankHash:'unchanged; manifest verified',assetsVerified:assetHashes.length}));
});
test('diff whitespace check',()=>{git('diff','--check')});
