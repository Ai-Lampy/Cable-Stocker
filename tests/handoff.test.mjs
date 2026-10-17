// Generated fixtures only. Never write user catalogues or backups.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as M from '../js/model.js';
import {toWorkbook,fromWorkbook} from '../js/excel.js';
const cable=(name,more={})=>({name,direction:'male-female',connectors:{male:'Plug',female:'Socket'},lengths:[24,96],...more});
const fixture=()=>({vendor:{name:'Generated',lengthUnit:'ft'},cables:{Data:[cable('Whirlwind 12-Pair',{aliases:['W-1'],loomOnlyLengths:[504]})],Mains:[cable('32A 3ø',{aliases:['32A 3Ph'],lengths:[24,96,504]})],'Stock / Pre-Made Looms':[{id:'stock',name:'Stock loom',lengths:[24,96],cables:[{cableType:'Whirlwind 12-Pair',quantity:2}]}],'FOH Snake':[{id:'foh',name:'FOH loom',lengths:[504],cables:[{cableType:' W-1 ',quantity:1},{cableType:'32a 3ph',quantity:1}]}]}});
const project=()=>M.projectFromStock(fixture(),'generated_cable.json');
const errors=p=>M.validate(p).filter(i=>i.level==='error');
const ctx=vm.createContext({console,ArrayBuffer,Uint8Array,Date,TextEncoder,TextDecoder});vm.runInContext(fs.readFileSync(new URL('../vendor/xlsx.full.min.js',import.meta.url),'utf8'),ctx);const X=ctx.XLSX;
function excel(p){return fromWorkbook(X.read(X.write(toWorkbook(p,X),{type:'array',bookType:'xlsx'}),{type:'array'}),X,p).project;}

test('handoff catalogue validates; exported aliases resolve canonically without changing the project',()=>{
 const p=project(),before=M.clone(p);assert.deepEqual(errors(p),[]);const output=M.runtimeJSON(p);
 assert.deepEqual(output.cables['FOH Snake'][0].cables.map(c=>c.cableType),['Whirlwind 12-Pair','32A 3ø']);assert.deepEqual(output.cables.Data[0].aliases,['W-1']);assert.deepEqual(output.cables.Data[0].loomOnlyLengths,[504]);assert(!output.cables.Data[0].lengths.includes(504));assert.equal(output.looms,undefined);assert.deepEqual(p,before);
 assert(M.validate(p).some(i=>i.level==='warning'&&i.field==='aliases'));assert(!M.validate(p).some(i=>i.message.includes('planned update')));
 const reopened=M.projectFromStock(output,p.filename);assert.deepEqual(M.runtimeJSON(reopened),output);assert.deepEqual(M.stockImportChanges(reopened,p),[]);
});
test('every member must support every loom length; missing references never manufacture cables',()=>{
 const p=project();p.looms[1].lengths.push(100);let issues=errors(p);assert.equal(issues.filter(i=>i.message.includes('does not support')).length,2);
 p.looms[1].components[0].type='Stock loom';const before=M.clone(p);assert(errors(p).some(i=>i.message.includes('missing individual cable reference')));M.runtimeJSON(p);assert.deepEqual(p,before);
});
test('aliases and canonical names must be unique across categories, with exact trimmed case-insensitive matching',()=>{
 const p=project();p.stock.cables.Mains.push(cable('Other',{aliases:[' w-1 ']}));assert(errors(p).some(i=>i.message.includes('Ambiguous cable name or alias')));assert(errors(p).some(i=>i.message.includes('ambiguous cable reference')));
 assert.equal(M.runtimeJSON(p).cables['FOH Snake'][0].cables[0].cableType,' W-1 ');
 p.stock.cables.Mains.at(-1).aliases=['Whirlwind 12-Pair'];assert(errors(p).some(i=>i.message.includes('Ambiguous')));
 assert.deepEqual(M.resolveStockCable([cable('XLR-5')],'XLR5'),[]);
});
test('invalid aliases, overlap, individual Whirlwind 504 feet and exclusively loom-only cables are reported without mutation',()=>{
 const p=project(),r=p.stock.cables.Data[0];r.aliases='W-1';r.lengths.push(504);const before=M.clone(p),issues=errors(p);assert(issues.some(i=>i.message.includes('Aliases must')));assert(issues.some(i=>i.message.includes('both individual and loom-only')));assert(issues.some(i=>i.message.includes('must remain loom-only')));assert.deepEqual(p,before);
 r.aliases=['W-1'];r.lengths=[];assert(errors(p).some(i=>i.message.includes('non-empty lengths array')));assert.deepEqual(M.runtimeJSON(p).cables.Data[0].lengths,[]);
});
test('loom names and IDs are unique, quantities are positive integers and members cannot be empty',()=>{
 const p=project();p.looms[1].name=' STOCK LOOM ';p.looms[1].id=p.looms[0].id;p.looms[0].components[0].count=1.5;p.looms[1].components=[];
 const messages=errors(p).map(i=>i.message).join('\n');for(const text of ['names must be unique','IDs must','positive integer','needs components'])assert(messages.includes(text));
});
test('export sorts and deduplicates length arrays on copies while preserving invalid values for review',()=>{
 const p=project();p.stock.cables.Data[0].lengths=[96,24,96];p.stock.cables.Data[0].loomOnlyLengths=[600,504,504];p.looms[0].lengths=[96,24,96];const before=M.clone(p),out=M.runtimeJSON(p);
 assert.deepEqual(out.cables.Data[0].lengths,[24,96]);assert.deepEqual(out.cables.Data[0].loomOnlyLengths,[504,600]);assert.deepEqual(out.cables[M.LOOM_CATEGORY][0].lengths,[24,96]);assert.deepEqual(p,before);
 p.stock.cables.Data[0].loomOnlyLengths=[0,'bad'];assert.deepEqual(M.runtimeJSON(p).cables.Data[0].loomOnlyLengths,[0,'bad']);assert(errors(p).some(i=>i.field==='loomOnlyLengths'));
});
test('explicit start and end override gender lookup for every direction; conflicts remain visible',()=>{
 for(const {value:direction} of M.DIRECTION_OPTIONS){const row=cable('Cable',{direction,connectors:{start:'A',end:'B'}}),p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[row]}},'test.json');assert.equal(M.getCell(row,'start'),'A');assert.equal(M.getCell(row,'end'),'B');assert.deepEqual(errors(p),[]);assert.equal(M.cableNeedsConnectorInputs(row,[row]),false);}
 const p=project(),row=p.stock.cables.Data[0];row.connectors.start='Explicit';assert.equal(M.getCell(row,'start'),'Explicit');assert(errors(p).some(i=>i.message.includes('conflicts with male')));M.setCell(row,'start','Confirmed');assert.equal(row.connectors.male,'Confirmed');assert(!errors(p).some(i=>i.message.includes('conflicts with male')));
});
test('missing endpoints and unsupported directions are errors without guessed connector data',()=>{
 const p=project();p.stock.cables.Data[0].connectors={};p.stock.cables.Data[0].direction='unknown';const before=M.clone(p);const issues=errors(p);assert(issues.some(i=>i.field==='direction'));assert(issues.some(i=>i.field==='start'));M.runtimeJSON(p);assert.deepEqual(p,before);
});
test('JSON rejects duplicate and escaped duplicate keys at every nesting level',()=>{
 for(const text of ['{"vendor":1,"vendor":2}','{"cables":{"Data":[],"Data":[]}}','{"a":[{"quantity":1,"quantity":2}]}','{"a":1,"\\u0061":2}'])assert.throws(()=>M.parseJSON(text),/Duplicate JSON key/);
 const valid={a:[{x:'quoted " key: },'}, {x:2}],b:{x:3},empty:{}};assert.deepEqual(M.parseJSON(JSON.stringify(valid)),valid);assert.throws(()=>M.parseJSON('{"a":1,}'));
});
test('project and binary Excel backups preserve aliases, loom-only availability, custom fields and original order',()=>{
 const p=project();p.stock.cables.Data[0].extra={keep:true};p.stock.cables.Data[0].lengths=[96,24,96];p.looms[0].components[0].lengths=[25];p.looms[0].components[0].connectors={start:'Backup override'};
 assert.deepEqual(M.restoreProject(M.clone(p)),p);const r=excel(p);assert.deepEqual(r.stock,p.stock);assert.deepEqual(r.looms,p.looms);assert.deepEqual(M.runtimeJSON(r),M.runtimeJSON(p));assert(M.validate(r).some(i=>i.message.includes('Component-specific lengths')));
});
test('Excel editing preserves independent explicit bidirectional endpoints and unknown connector metadata',()=>{
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[cable('Explicit',{direction:'bidirectional',connectors:{start:'A',end:'B',custom:7}})]}}),book=toWorkbook(p,X);book.Sheets.Data.D2.v='New A';book.Sheets.Data.E2.v='New B';const row=fromWorkbook(book,X,p).project.stock.cables.Data[0];assert.deepEqual(row.connectors,{start:'New A',end:'New B',custom:7});
});
test('new loom drafts canonicalise only unique declared names, preserve IDs and do not guess connectors',()=>{
 const p=project(),draft=M.clone(p.looms[1]);draft.components[0].connectors={};const saved=M.prepareLoomDraft(draft,Object.values(p.stock.cables).flat());assert.equal(saved.id,draft.id);assert.equal(saved.components[0].type,'Whirlwind 12-Pair');assert.equal(draft.components[0].type,' W-1 ');
 draft.components[0].type='Unknown';assert.deepEqual(M.prepareLoomDraft(draft,[]).components[0].connectors,{});
 assert.throws(()=>M.prepareLoomDraft(p.looms[1],[...p.stock.cables.Data,cable('Other',{aliases:['W-1']})]),/Ambiguous/);
});
test('display follows handoff without altering vendor units or stored backup preferences',()=>{
 const p=project();p.lengthDisplay={ft:'Feet',m:'Meter'};const before=M.clone(p);assert.equal(M.formatLength(504,p),"504'");assert.deepEqual(p,before);p.stock.vendor.lengthUnit='m';assert.equal(M.formatLength(24,p),'24m');assert.equal(M.runtimeJSON(p).vendor.lengthUnit,'m');
});
test('supported typed direction labels export canonical tokens without rewriting saved stock',()=>{
 const p=project(),r=p.stock.cables.Data[0];r.direction='Male > Female';assert.equal(M.runtimeJSON(p).cables.Data[0].direction,'male-female');assert.equal(r.direction,'Male > Female');
});
test('all supplied project backups restore without mutation under the new handoff rules',()=>{
 const dir=new URL('../projects/',import.meta.url);for(const file of fs.readdirSync(dir).filter(n=>n.endsWith('.lampy-project.json'))){const data=M.parseJSON(fs.readFileSync(new URL(file,dir),'utf8')),p=M.restoreProject(data);assert.deepEqual(p,data);const before=M.clone(p);M.validate(p);M.runtimeJSON(p);assert.deepEqual(p,before);}
});
