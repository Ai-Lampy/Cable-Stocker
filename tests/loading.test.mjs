import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {freshDocumentURL} from '../js/updates.js';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const bootstrap=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replaceAll('await import(', 'await loadModule(');
async function run({base='https://ailampy.com/cable/',source="export const APP_VERSION = 'v1.1.7';",moduleVersion='v1.1.7',offline=false,supports=true}={}) {
  const nodes=Object.fromEntries(['#app-style','#save-status','#main'].map(k=>[k,{replaceChildren(...children){this.children=children;}}]));
  const scripts=[],loads=[],requests=[],addresses=[];
  const doc={baseURI:base,querySelector:k=>nodes[k],createElement:tag=>({tag}),head:{append(script){scripts.push(script);if(script.onload)script.onload();}}};
  await vm.runInNewContext(bootstrap,{document:doc,HTMLScriptElement:{supports:()=>supports},URL,Date,Math,AbortSignal,location:{href:base+'?_lampy_update=123&keep=yes#vendor'},history:{replaceState:(_s,_t,url)=>addresses.push(url)},fetch:async(url,options)=>{requests.push({url:String(url),options});if(offline)throw Error('Offline');return {ok:true,text:async()=>source};},loadModule:async url=>{loads.push(url);return {APP_VERSION:moduleVersion};}});
  return {nodes,scripts,loads,requests,addresses};
}
test('fresh navigation bypasses the document URL cache without changing origin/path',()=>{
  assert.equal(freshDocumentURL('https://ailampy.com/cable/?keep=yes#vendor',123),'https://ailampy.com/cable/?keep=yes&_lampy_update=123#vendor');
});
for(const base of ['https://ailampy.com/cable/','https://ai-lampy.github.io/Cable-Stocker/','http://localhost:8080/'])test('bootstrap versions every module and asset under '+base,async()=>{
  const r=await run({base});assert.equal(r.requests[0].options.cache,'no-store');
  const map=JSON.parse(r.scripts.find(s=>s.type==='importmap').textContent).imports;
  for(const name of ['app','grid','model','excel','updates','version'])assert.equal(map[base+'js/'+name+'.js'],base+'js/'+name+'.js?release=v1.1.7');
  assert.equal(r.nodes['#app-style'].href,base+'css/app.css?release=v1.1.7');
  assert.ok(r.scripts.some(s=>s.src===base+'vendor/xlsx.full.min.js?release=v1.1.7'));
  assert.deepEqual(r.loads,[base+'js/version.js?release=v1.1.7',base+'js/app.js?release=v1.1.7']);
  assert.deepEqual(r.addresses,[base+'?keep=yes#vendor']);
  // Catch future dependencies accidentally omitted from the import map.
  for(const name of ['app','grid','model','excel','updates','version']){
    const source=fs.readFileSync(new URL('../js/'+name+'.js',import.meta.url),'utf8');
    for(const dep of source.matchAll(/from\s+['"](.+?)['"]/g))assert.ok(map[new URL(dep[1],base+'js/'+name+'.js').href],dep[1]);
  }
});
test('incomplete release cannot silently start with a stale version module',async()=>{
  const r=await run({moduleVersion:'v1.1.6'});assert.equal(r.loads.length,1);assert.match(r.nodes['#main'].children[0].textContent,/still publishing/);
});
test('offline or malformed metadata offers retry without loading app or clearing drafts',async()=>{
  for(const options of [{offline:true},{source:'<html>Not found</html>'}]){const r=await run(options);assert.equal(r.loads.length,0);assert.match(r.nodes['#main'].children[0].textContent,/saved draft has not been cleared/);assert.equal(r.nodes['#main'].children[1].textContent,'Retry loading');}
});

test('unsupported browsers stop clearly instead of importing unversioned dependencies',async()=>{
 const r=await run({supports:false});assert.equal(r.loads.length,0);assert.equal(r.requests.length,0);assert.match(r.nodes['#main'].children[0].textContent,/import map support/);
});
