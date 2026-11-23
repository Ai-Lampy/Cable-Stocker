import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRigging} from '../js/vendor-home.js';
import {VendorWorkspace} from '../js/vendor-workspace.js';
import {blankRigging,RiggingStore} from '../js/rigging.js';
const memory=()=>{const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
test('Home reads a retained rigging project without writing either draft or shared selection',async()=>{
 const s=memory(),ws=new VendorWorkspace(s),p=blankRigging('Vendor A');p.extra={keep:true};ws.save('rigging',p,true);s.setItem('lampy-cable:draft:1','untouched cable');const before=JSON.stringify([...s.values]);
 const state=await homeRigging(ws,s,'Vendor A',()=>{throw Error('Must use retained project');});assert.deepEqual(state.project,p);assert.equal(JSON.stringify([...s.values]),before);
});
test('Home edits the chosen vendor while preserving another vendor draft and cable storage',async()=>{
 const s=memory(),ws=new VendorWorkspace(s),a=blankRigging('Vendor A');new RiggingStore(s).save(a,true);ws.value.selected='Vendor B';ws.write(ws.value);s.setItem('lampy-cable:draft:1','untouched cable');
 const state=await homeRigging(ws,s,'Vendor B',async()=>({catalogues:[]}));state.project.catalogue.catalogueVersion='v5';state.save(state.project);
 assert.deepEqual(ws.get('rigging','Vendor A').project,a);assert.equal(ws.get('rigging','Vendor B').project.catalogue.catalogueVersion,'v5');assert.equal(ws.value.selected,'Vendor B');assert.equal(s.getItem('lampy-cable:draft:1'),'untouched cable');
});
test('Home source loading validates vendor and never writes on read or failure',async()=>{
 const s=memory(),ws=new VendorWorkspace(s),p=blankRigging('Christie');const read=async path=>path==='data/rigging_manifest.json'?{catalogues:[{vendor:'Christie',file:'reference/source.json'}]}:p;
 const state=await homeRigging(ws,s,'Christie',read);assert.deepEqual(state.project,p);assert.equal(s.values.size,0);
 await assert.rejects(homeRigging(ws,s,'Wrong',async path=>path==='data/rigging_manifest.json'?{catalogues:[{vendor:'Wrong',file:'reference/source.json'}]}:p),/does not match/);assert.equal(s.values.size,0);
});
test('Home refuses to overwrite a draft modified by another tab or a damaged draft',async()=>{
 const s=memory(),ws=new VendorWorkspace(s),state=await homeRigging(ws,s,'Vendor',async()=>({catalogues:[]}));s.setItem('lampy-rigging:draft:1','other tab');assert.throws(()=>state.save(state.project),/Another tab/);assert.equal(s.getItem('lampy-rigging:draft:1'),'other tab');await assert.rejects(homeRigging(ws,s,'Vendor',async()=>({catalogues:[]})),/needs recovery/);
});
test('Home honours saved Rigging manifest paths',async()=>{
 const s=memory(),ws=new VendorWorkspace(s);s.setItem('lampy-rigging:references:1',JSON.stringify({refs:{rigging_manifest:{catalogues:[{vendor:'Vendor',file:'custom.json'}]}}}));const paths=[];
 await homeRigging(ws,s,'Vendor',async path=>{paths.push(path);return path==='custom.json'?blankRigging('Vendor'):{catalogues:[]};});assert.deepEqual(paths,['data/rigging_manifest.json','custom.json']);
});
