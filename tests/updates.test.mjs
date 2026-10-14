import test from 'node:test';
import assert from 'node:assert/strict';
import {newerVersion,safeRefresh,watchUpdates} from '../js/updates.js';

test('compares numeric releases and ignores equal, older and invalid responses',()=>{
  for(const v of ['v1.1.6','v1.10.0','v2.0.0'])assert.equal(newerVersion('v1.1.5',`export const APP_VERSION = '${v}';`),v);
  for(const source of ["export const APP_VERSION = 'v1.1.5';","export const APP_VERSION = 'v1.0.9';",'<html>login</html>',"export const APP_VERSION = 'v1.2.0'; alert(1)"])assert.equal(newerVersion('v1.1.5',source),null);
});
const pending=(commit=()=>true)=>({editor:{value:'new',disabled:false},editorOriginal:'old',commitEditor:commit});
test('commits pending cell before verified save and reload',()=>{
  const calls=[];safeRefresh({blocked:()=>'',editors:()=>[pending(()=>{calls.push('commit');return true;})],persist:()=>calls.push('save'),reload:()=>calls.push('reload')});
  assert.deepEqual(calls,['commit','save','reload']);
});
test('invalid cell remains untouched and prevents saving or reload',()=>{
  const editor=pending(()=>false);assert.throws(()=>safeRefresh({blocked:()=>'',editors:()=>[editor],persist:()=>assert.fail(),reload:()=>assert.fail()}),/Correct/);assert.equal(editor.editor.value,'new');
});
test('open dialogs, unfinished fields and conflicts prevent committing',()=>{
  for(const reason of ['Open dialog','Unfinished field','Other tab changed'])assert.throws(()=>safeRefresh({blocked:()=>reason,editors:()=>assert.fail(),persist:()=>assert.fail(),reload:()=>assert.fail()}),new RegExp(reason));
});
test('rechecks guards after committing a cell',()=>{
  let reason='';assert.throws(()=>safeRefresh({blocked:()=>reason,editors:()=>[pending(()=>{reason='Conflict';return true;})],persist:()=>assert.fail(),reload:()=>assert.fail()}),/Conflict/);
});
test('storage write/readback failures prevent reload',()=>{
  for(const message of ['Quota exceeded','Readback mismatch'])assert.throws(()=>safeRefresh({blocked:()=>'',editors:()=>[],persist:()=>{throw new Error(message);},reload:()=>assert.fail()}),new RegExp(message));
});
test('multiple pending loom editors are kept intact',()=>{
  assert.throws(()=>safeRefresh({blocked:()=>'',editors:()=>[pending(()=>assert.fail()),pending(()=>assert.fail())],persist:()=>assert.fail(),reload:()=>assert.fail()}),/Apply your pending/);
});
test('unchanged and disabled editors are not committed',()=>{
  const a=pending(()=>assert.fail()),b=pending(()=>assert.fail());a.editor.value=a.editorOriginal;b.editor.disabled=true;
  let reload=false;safeRefresh({blocked:()=>'',editors:()=>[a,b],persist:()=>{},reload:()=>reload=true});assert.equal(reload,true);
});
test('watcher uses same-base uncached metadata, detects updates and cleans up',async()=>{
  const events=new Map(),win={setInterval:(f,n)=>{assert.equal(n,300000);return 7;},clearInterval:id=>assert.equal(id,7),addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)};
  const doc={baseURI:'https://ailampy.com/cable/',hidden:false,addEventListener:win.addEventListener,removeEventListener:win.removeEventListener};
  let found;const stop=watchUpdates('v1.1.5',v=>found=v,{doc,win,fetcher:async(url,options)=>{assert.equal(url.pathname,'/cable/js/version.js');assert.equal(options.cache,'no-store');return {ok:true,text:async()=>"export const APP_VERSION = 'v1.1.6';"};}});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(found,'v1.1.6');stop();assert.equal(events.size,0);
});
test('network failures do not notify or interrupt work',async()=>{
  const win={setInterval:()=>1,clearInterval:()=>{},addEventListener:()=>{},removeEventListener:()=>{}},doc={...win,baseURI:'http://localhost:8080/',hidden:false};
  const stop=watchUpdates('v1.1.5',()=>assert.fail(),{doc,win,fetcher:async()=>{throw new Error('offline');}});
  await new Promise(resolve=>setImmediate(resolve));stop();
});
