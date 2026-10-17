// Generated fixtures only. User projects and supplied examples are read-only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as M from '../js/model.js';
import {toWorkbook,fromWorkbook,replaceWorkbook} from '../js/excel.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const fixture=()=>({vendor:{name:'Generated test vendor',lengthUnit:'m'},cables:{Data:[]},looms:[{id:'stock-loom-1',name:'2-Way Socapex',lengths:[30,10,20.5],cables:[{cableType:'Socapex 19-Pin',quantity:2},{cableType:'XLR-5',quantity:4}]}]});
const grouped=stock=>{const result=M.clone(stock);result.cables[M.LOOM_CATEGORY]=result.looms;delete result.looms;return result;};
const project=()=>M.projectFromStock(fixture(),'test_cable.json');
const excelContext=vm.createContext({console,ArrayBuffer,Uint8Array,Date,TextEncoder,TextDecoder});
vm.runInContext(fs.readFileSync(new URL('../vendor/xlsx.full.min.js',import.meta.url),'utf8'),excelContext);
const X=excelContext.XLSX;
function roundtrip(p,options){const bytes=X.write(toWorkbook(p,X,options),{type:'array',bookType:'xlsx'});return fromWorkbook(X.read(bytes,{type:'array'}),X,p);}

test('stock loom import/export preserves approved names, quantities, IDs, length order and unit',()=>{
 const input=fixture(),before=M.clone(input),p=M.projectFromStock(input,'test_cable.json');
 assert.deepEqual(input,before);assert.deepEqual(M.runtimeJSON(p),grouped(input));assert.deepEqual(M.changes(p),[]);
 assert.equal(p.looms[0].components[1].count,4);assert.equal(p.looms[0].components[0].type,'Socapex 19-Pin');
 p.stock.vendor.lengthUnit='ft';assert.deepEqual(M.runtimeJSON(p).cables[M.LOOM_CATEGORY][0].lengths,[30,10,20.5]);
 assert.deepEqual(M.validate(p).filter(i=>i.level==='error'),[]);
});
test('stock JSON excludes editor component IDs and backup fields but includes edited quantities and loom lengths',()=>{
 const p=project(),l=p.looms[0];l.description='Keep in backup';l.components[0].connectors={male:'Override'};l.components[0].lengths=[31];l.components[0].count=3;l.lengths=[12,24];
 const output=M.runtimeJSON(p).cables[M.LOOM_CATEGORY][0];assert.deepEqual(Object.keys(output).sort(),['cables','id','lengths','name']);
 assert.deepEqual(output.cables[0],{cableType:'Socapex 19-Pin',quantity:3});assert.deepEqual(output.lengths,[12,24]);
 assert.deepEqual(M.restoreProject(M.parseJSON(JSON.stringify(p))),p);
});
test('existing Siyan backup remains unchanged and exports its existing looms in the approved shape',()=>{
 const original=read('../projects/siyan_ltd.lampy-project.json'),p=M.restoreProject(original);
 assert.deepEqual(p,original);assert.deepEqual(M.runtimeJSON(p).cables[M.LOOM_CATEGORY],p.looms.map(l=>({id:l.id,name:l.name,lengths:l.lengths,cables:l.components.map(c=>({cableType:c.type,quantity:c.count}))})));
 assert.deepEqual(M.runtimeJSON(M.projectFromStock(M.runtimeJSON(p))),M.runtimeJSON(p));
});
test('source cable-only documents gain no loom field; explicit empty looms survive project and Excel round trips',()=>{
 const source=read('../reference/examples/christie_lites_cable.json');assert.deepEqual(M.runtimeJSON(M.projectFromStock(source)),source);
 const empty=fixture();empty.looms=[];const p=M.projectFromStock(empty);
 assert.deepEqual(M.runtimeJSON(M.restoreProject(M.clone(p))),grouped(empty));
 assert.deepEqual(M.runtimeJSON(roundtrip(p).project),grouped(empty));
});
test('imported loom custom fields survive JSON, project and Excel without collisions with editor fields',()=>{
 const stock=fixture();Object.assign(stock.looms[0],{description:'Vendor description',components:{custom:true},extra:{a:[false,3]}});
 Object.assign(stock.looms[0].cables[0],{id:'external-id',type:'external-type',connectors:{custom:'preserve'}});
 const p=M.projectFromStock(stock);for(const value of [p,M.restoreProject(M.clone(p)),roundtrip(p).project])assert.deepEqual(M.runtimeJSON(value),grouped(stock));
});
test('Excel retains rich loom backup data and produces the same approved stock export',()=>{
 const p=project();p.looms[0].description='Backup text';p.looms[0].components[0].connectors={male:'custom',female:'custom'};p.looms[0].components[0].lengths=[31];
 const r=roundtrip(p).project;assert.deepEqual(r.looms,p.looms);assert.deepEqual(M.runtimeJSON(r),M.runtimeJSON(p));
});
test('loom-only Excel replacement and merge update quantities while preserving unrelated cable stock',()=>{
 const current=project();current.stock.cables.Data=[{name:'Other',direction:'male-female',connectors:{male:'A',female:'B'},lengths:[5]}];current.rowIds.Data=['row'];
 const incoming=roundtrip(current,{category:'Stock / Pre-Made Looms'});incoming.project.looms[0].components[0].count=7;
 for(const result of [replaceWorkbook(current,incoming.project,incoming.partial,incoming.categories),M.mergeProjects(current,incoming.project,true)]){
  assert.deepEqual(result.stock.cables,current.stock.cables);assert.equal(M.runtimeJSON(result).cables[M.LOOM_CATEGORY][0].cables[0].quantity,7);assert.deepEqual(result.baseline,current.baseline);
 }
});
test('deleting all imported looms exports an empty list and never restores stale source looms',()=>{
 const p=project();p.looms=[];assert.deepEqual(M.runtimeJSON(p).cables[M.LOOM_CATEGORY],[]);
 assert.deepEqual(M.runtimeJSON(M.restoreProject(M.clone(p))).cables[M.LOOM_CATEGORY],[]);
 assert.deepEqual(M.runtimeJSON(roundtrip(p).project).cables[M.LOOM_CATEGORY],[]);
});
test('JSON import review ignores regenerated component IDs and backup-only details',()=>{
 const p=project();p.looms[0].description='Backup only';p.looms[0].components[0].connectors={male:'Saved override'};
 const incoming=M.projectFromStock(M.runtimeJSON(p),p.filename),before=M.clone({p,incoming});
 assert.deepEqual(M.stockImportChanges(incoming,p),[]);assert.deepEqual({p,incoming},before);
});
test('JSON import review reports changed loom quantity, lengths, additions and removals by stable loom ID',()=>{
 const p=project(),stock=M.runtimeJSON(p);stock.cables[M.LOOM_CATEGORY][0].cables[0].quantity=6;stock.cables[M.LOOM_CATEGORY][0].lengths=[10];
 assert.deepEqual(M.stockImportChanges(M.projectFromStock(stock,p.filename),p),[{category:'Stock / Pre-Made Looms',kind:'modified',name:'2-Way Socapex'}]);
 stock.cables[M.LOOM_CATEGORY][0].id='replacement';assert.deepEqual(M.stockImportChanges(M.projectFromStock(stock,p.filename),p).map(c=>c.kind),['added','removed']);
});
test('malformed stock loom structure and duplicate IDs are rejected without changing the input',()=>{
 for(const change of [s=>s.looms={},s=>s.looms=[null],s=>s.looms[0].id='',s=>s.looms.push(M.clone(s.looms[0])),s=>s.looms[0].lengths='10',s=>s.looms[0].cables={},s=>s.looms[0].cables=[null],s=>s.looms[0].cables[0].cableType=2]){
  const stock=fixture();change(stock);const before=M.clone(stock);assert.throws(()=>M.projectFromStock(stock));assert.deepEqual(stock,before);
 }
});
test('invalid loom values remain visible and exportable with validation errors, without requiring connectors',()=>{
 for(const value of [0,-1,1.5,'2',Number.MAX_SAFE_INTEGER+1]){const stock=fixture();stock.looms[0].cables[0].quantity=value;const p=M.projectFromStock(stock);assert(M.validate(p).some(i=>i.level==='error'&&i.field==='components'));assert.deepEqual(M.runtimeJSON(p),grouped(stock));}
 const stock=fixture();stock.looms[0].lengths=[0,'bad'];stock.looms[0].cables[0].cableType='';const p=M.projectFromStock(stock);assert(M.validate(p).filter(i=>i.level==='error').length>=2);assert.deepEqual(M.runtimeJSON(p),grouped(stock));
});
test('old project root loom fields migrate safely; conflicting duplicate definitions refuse replacement',()=>{
 const p=project();p.stock.looms=fixture().looms;p.looms=[];p.baseline.stock.looms=fixture().looms;p.baseline.looms=[];
 const migrated=M.restoreProject(p);assert.deepEqual(M.runtimeJSON(migrated),grouped(fixture()));assert.deepEqual(M.changes(migrated),[]);
 const conflict=project();conflict.stock.looms=fixture().looms;conflict.looms[0].components[0].count=99;assert.throws(()=>M.restoreProject(conflict),/conflicting/);
});

function appContext(){
 const make=tag=>({tag,children:[],append(...n){this.children.push(...n);},setAttribute(){}});
 const ctx=vm.createContext({...M,document:{createElement:make},navigator:{clipboard:{writeText:async text=>{ctx.copied=text;}}}});
 const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,'');vm.runInContext(source,ctx);
 ctx.input=project();ctx.downloads=[];
 vm.runInContext("project=input;notice=()=>{};save=()=>{};allIssues=()=>validate(project);reviewBody=()=>{};download=(filename,text)=>downloads.push({filename,text});openDialog=(title,build,actions)=>{const body=node('div');build(body);globalThis.dialog={title,body,actions};};",ctx);
 return ctx;
}
test('loom preview, clipboard and fragment download all use the approved stock structure',async()=>{
 const ctx=appContext();vm.runInContext('previewLooms()',ctx);
 const preview=ctx.dialog.body.children.find(n=>n.tag==='pre').textContent;assert.deepEqual(JSON.parse(preview),{cables:{[M.LOOM_CATEGORY]:fixture().looms}});
 await ctx.dialog.actions.find(a=>a.label==='Copy JSON').run();assert.equal(ctx.copied,preview);
 ctx.dialog.actions.find(a=>a.label==='Download fragment').run();assert.equal(ctx.downloads[0].filename,'looms.fragment.json');assert.equal(ctx.downloads[0].text,preview);
});
test('complete stock preview and download include looms and retain the chosen vendor filename',()=>{
 const ctx=appContext();vm.runInContext('preview()',ctx);assert.deepEqual(JSON.parse(ctx.dialog.body.children.find(n=>n.tag==='pre').textContent),grouped(fixture()));
 vm.runInContext('reviewExport()',ctx);ctx.dialog.actions.find(a=>a.label==='Download').run({close(){}});
 assert.equal(ctx.downloads[0].filename,'test_cable.json');assert.deepEqual(JSON.parse(ctx.downloads[0].text),grouped(fixture()));
});

test('JSON import controller offers review, cancellation preserves draft and acceptance loads stock looms',async()=>{
 const ctx=appContext(),incoming=fixture();incoming.looms[0].cables[0].quantity=8;
 vm.runInContext('change=fn=>fn();navigate=()=>{};',ctx);
 const file={name:'incoming.json',size:100,text:async()=>JSON.stringify(incoming)};
 await ctx.importFile(file);ctx.dialog.actions.find(a=>a.label==='Cancel').run({close(){}});
 assert.equal(vm.runInContext('project.looms[0].components[0].count',ctx),2);
 await ctx.importFile(file);ctx.dialog.actions.find(a=>a.label==='Import & replace draft').run({close(){}});
 assert.equal(vm.runInContext('project.looms[0].components[0].count',ctx),8);
 assert.equal(vm.runInContext('changes(project).length',ctx),0);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(runtimeJSON(project))',ctx)),grouped(incoming));
});
test('malformed JSON loom import never replaces the current project or opens an apply dialog',async()=>{
 const ctx=appContext();ctx.notices=[];vm.runInContext('notice=text=>notices.push(text)',ctx);
 const incoming=fixture();incoming.looms[0].cables={};
 await ctx.importFile({name:'bad.json',size:100,text:async()=>JSON.stringify(incoming)});
 assert.equal(ctx.dialog,undefined);assert(ctx.notices[0].startsWith('Import not applied:'));
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(runtimeJSON(project))',ctx)),grouped(fixture()));
});

test('separate stock loom categories round trip with ordinary cables, lengths, quantities and custom fields',()=>{
 const input=grouped(fixture());input.vendor.custom={keep:true};input.cables.Data=[{name:'Data cable',direction:'bidirectional',connectors:{end:'XLR-5'},lengths:[5]}];
 input.cables['FOH Snake']=[{...M.clone(input.cables[M.LOOM_CATEGORY][0]),id:'foh-1',name:'FOH assembly',lengths:[10,40],extra:{keep:true},cables:[{cableType:'XLR-3',quantity:12,custom:'keep'}]}];
 const before=M.clone(input),p=M.projectFromStock(input,'category_cable.json');
 assert.deepEqual(input,before);assert.equal(p.looms.length,2);assert.deepEqual(Object.keys(p.stock.cables),['Data']);assert.deepEqual(Object.keys(p.rowIds),['Data']);
 assert.equal(M.projectLoomRows(p,'FOH Snake')[0].components[0].count,12);assert.deepEqual(M.changes(p),[]);assert.deepEqual(M.validate(p).filter(i=>i.level==='error'),[]);
 for(const restored of [p,M.restoreProject(M.clone(p)),roundtrip(p).project])assert.deepEqual(M.runtimeJSON(restored),input);
 assert.equal(Object.hasOwn(M.runtimeJSON(p),'looms'),false);
});
test('empty built-in loom categories survive JSON and Excel, and deleted categories stay absent',()=>{
 const input={vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[],[M.LOOM_CATEGORY]:[],'FOH Snake':[]}},p=M.projectFromStock(input);
 assert.deepEqual(M.projectLoomCategories(p),[M.LOOM_CATEGORY,'FOH Snake']);assert.deepEqual(M.runtimeJSON(roundtrip(p).project),input);
 M.removeProjectCategory(p,'FOH Snake',{looms:true});assert(!Object.hasOwn(M.runtimeJSON(p).cables,'FOH Snake'));
 M.removeProjectCategory(p,M.LOOM_CATEGORY,{looms:true});assert.deepEqual(M.runtimeJSON(p).cables,{Data:[]});
});
test('category moves are reported in import review and scoped fragments keep FOH separate',()=>{
 const p=project(),stock=M.runtimeJSON(p);stock.cables['FOH Snake']=stock.cables[M.LOOM_CATEGORY];delete stock.cables[M.LOOM_CATEGORY];
 const next=M.projectFromStock(stock,p.filename);assert.deepEqual(M.stockImportChanges(next,p),[{category:'FOH Snake',kind:'modified',name:'2-Way Socapex'}]);
 const ctx=appContext();ctx.next=next;vm.runInContext("project=next;previewLooms('FOH Snake')",ctx);
 assert.deepEqual(JSON.parse(ctx.dialog.body.children.find(n=>n.tag==='pre').textContent),{cables:{'FOH Snake':stock.cables['FOH Snake']}});
});
test('malformed categorized looms and duplicate IDs across categories or legacy input are rejected',()=>{
 for(const change of [s=>s.cables['FOH Snake']=M.clone(s.cables[M.LOOM_CATEGORY]),s=>s.looms=M.clone(s.cables[M.LOOM_CATEGORY]),s=>s.cables[M.LOOM_CATEGORY][0].lengths='bad',s=>s.cables['FOH Snake']=[{name:'Bad',direction:'male-female'}]]){
  const input=grouped(fixture());change(input);const before=M.clone(input);assert.throws(()=>M.projectFromStock(input));assert.deepEqual(input,before);
 }
 const p=project();p.stock.cables[M.LOOM_CATEGORY]=[{name:'Collision'}];assert.throws(()=>M.runtimeJSON(p),/duplicate/);
});
test('categorized JSON import controller preserves FOH membership through acceptance and re-export',async()=>{
 const ctx=appContext(),incoming=grouped(fixture());incoming.cables['FOH Snake']=incoming.cables[M.LOOM_CATEGORY];delete incoming.cables[M.LOOM_CATEGORY];
 vm.runInContext('change=fn=>fn();navigate=()=>{};',ctx);await ctx.importFile({name:'foh_cable.json',size:100,text:async()=>JSON.stringify(incoming)});
 ctx.dialog.actions.find(a=>a.label==='Import & replace draft').run({close(){}});
 assert.equal(vm.runInContext("project.looms[0].category",ctx),'FOH Snake');assert.equal(vm.runInContext('changes(project).length',ctx),0);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(runtimeJSON(project))',ctx)),incoming);
});
test('legacy root looms can coexist with a distinct FOH category without losing custom cable fields',()=>{
 const input=fixture();input.cables['FOH Snake']=[{...M.clone(input.looms[0]),id:'foh'}];input.cables.Data=[{name:'Ordinary',direction:'bidirectional',connectors:{end:'XLR-5'},lengths:[5],id:'custom-id',cables:{custom:true}}];
 const p=M.projectFromStock(input),output=M.runtimeJSON(p);assert.equal(p.looms.length,2);assert.deepEqual(output.cables.Data,input.cables.Data);assert.deepEqual(output.cables[M.LOOM_CATEGORY],input.looms);assert.deepEqual(output.cables['FOH Snake'],input.cables['FOH Snake']);
});
