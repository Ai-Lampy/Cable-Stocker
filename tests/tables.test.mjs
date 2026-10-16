import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Grid,parseCell,sortedLengths} from '../js/grid.js';
import * as M from '../js/model.js';
function grid(rows=[]){const g=Object.create(Grid.prototype);Object.assign(g,{o:{rows:()=>rows,columns:[{key:'name',width:500}],get:(r,k)=>r[k]},prefs:{widths:{}},filter:'',sort:null});return g;}
test('empty tables expose five entry slots without changing exported rows',()=>{const rows=[],g=grid(rows);assert.deepEqual(g.indices(),[0,1,2,3,4]);assert.equal(g.value(4,'name'),'');assert.deepEqual(rows,[]);});
test('small tables retain five entry slots and search does not create fake matches',()=>{const g=grid([{name:'Cable'}]);assert.equal(g.indices().length,5);g.filter='cable';assert.deepEqual(g.indices(),[0]);g.filter='absent';assert.deepEqual(g.indices(),[]);});
test('150 px defaults ignore old per-column suggestions but honour chosen widths',()=>{const g=grid();assert.equal(g.columnWidth(g.o.columns[0]),150);g.prefs.widths.name=25;assert.equal(g.columnWidth(g.o.columns[0]),25);});
test('existing layout preferences migrate once to centre/default widths without discarding highlights',()=>{
 const saved=globalThis.localStorage,render=Grid.prototype.render;
 try{globalThis.localStorage={getItem:()=>JSON.stringify({align:'left',widths:{name:250},highlights:{context:'keep'},zoom:1.2})};Grid.prototype.render=function(){};
 const g=new Grid({dataset:{}},{key:'test',columns:[{key:'name'}]});assert.equal(g.prefs.align,'center');assert.deepEqual(g.prefs.widths,{});assert.equal(g.prefs.highlights.context,'keep');assert.equal(g.prefs.zoom,1.2);
 globalThis.localStorage={getItem:()=>JSON.stringify({layoutVersion:2,align:'right',widths:{name:25}})};
 const next=new Grid({dataset:{}},{key:'test',columns:[{key:'name'}]});assert.equal(next.prefs.align,'right');assert.equal(next.prefs.widths.name,25);
 }finally{Grid.prototype.render=render;globalThis.localStorage=saved;}
});
function editable(rows=[]){const g=grid(rows);Object.assign(g,{renderBody(){},focusCell(){},o:{...g.o,notice(){},apply(patches,allowNew){for(const p of patches){if(p.id>=rows.length)assert.equal(allowNew,true);while(rows.length<=p.id)rows.push({});rows[p.id][p.col.key]=p.value;}}}});return g;}
test('entering a blank slot creates only the required data rows',()=>{const rows=[],g=editable(rows);assert.equal(g.apply([{id:0,col:{key:'name'},text:'New cable'}]),true);assert.deepEqual(rows,[{name:'New cable'}]);});
test('clearing untouched entry slots does not add records',()=>{const rows=[],g=editable(rows);assert.equal(g.apply([{id:4,col:{key:'name'},text:''}]),true);assert.deepEqual(rows,[]);});
test('invalid rectangular input leaves entry slots and existing data intact',()=>{const rows=[{name:'Existing'}],g=editable(rows);assert.equal(g.apply([{id:0,col:{key:'name'},text:'Changed'},{id:1,col:{key:'length',type:'positive'},text:'bad'}]),false);assert.deepEqual(rows,[{name:'Existing'}]);});
test('invalid in-cell commit preserves text and editing focus',()=>{const g=editable([]);Object.assign(g,{ids:[0],selection:{r:0,c:0},editorOriginal:'',editing:true,editor:{value:'bad',focus(){this.focused=true;}}});g.o.columns=[{key:'length',type:'positive'}];assert.equal(g.commitEditor(),false);assert.equal(g.editor.value,'bad');assert.equal(g.editing,true);assert.equal(g.editor.focused,true);});
function controller(){const values=new Map();const element=()=>({children:[],append(...nodes){this.children.push(...nodes);},remove(){this.removed=true;}});const context=vm.createContext({...M,APP_VERSION:'test',document:{createElement:element},localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)}});const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,'');vm.runInContext(app,context);return context;}
test('Settings acknowledgements persist by note content; changed notes appear again',()=>{const ctx=controller();const first=vm.runInContext("settingsNote('New hint')",ctx);first.children[1].onclick();assert.equal(first.removed,true);vm.runInContext('readSettingsNotes.clear()',ctx);assert.equal(vm.runInContext("settingsNote('New hint').hidden",ctx),true);assert.notEqual(vm.runInContext("settingsNote('Changed hint').hidden",ctx),true);});
test('length colour suffix follows vendor units but editing/export stays numeric',()=>{const ctx=controller();for(const unit of ['m','ft']){vm.runInContext(`project.stock.vendor.lengthUnit='${unit}'`,ctx);const col=vm.runInContext("refColumns('length_colours')[0]",ctx);assert.equal(col.format(12.5),`12.5 ${unit}`);assert.equal(col.format(''),'');assert.equal(parseCell('12.5',col),12.5);}});

test('sorting keeps unused entry rows after populated rows in either direction',()=>{const g=grid([{name:'B'},{name:'A'}]);g.sort={key:'name',dir:1};assert.deepEqual(g.indices(),[1,0,2,3,4]);g.sort.dir=-1;assert.deepEqual(g.indices(),[0,1,2,3,4]);});

function enterGrid(rows=[]){const g=grid(rows);g.ids=g.indices();g.selection={r:g.ids.length-1,c:0};g.currentGrid=()=>g;g.renderBody=()=>{g.ids=g.indices();};g.select=(r,c)=>{g.selection={r:Math.max(0,Math.min(g.ids.length-1,r)),c};};return g;}
test('Enter appends repeatable blank entry rows without adding exported records',()=>{const rows=[],g=enterGrid(rows);g.moveEnter();assert.equal(g.ids.length,6);assert.equal(g.selection.r,5);g.moveEnter();assert.equal(g.ids.length,7);assert.equal(g.selection.r,6);assert.deepEqual(rows,[]);});
test('Enter within a table and Shift+Enter do not append rows',()=>{const g=enterGrid();g.moveEnter(true);assert.equal(g.selection.r,3);g.moveEnter();assert.equal(g.selection.r,4);assert.equal(g.ids.length,5);});
test('invalid Enter commit neither moves nor appends',()=>{const g=enterGrid();g.commitEditor=()=>false;assert.equal(g.moveEnter(false,true),false);assert.equal(g.selection.r,4);assert.equal(g.ids.length,5);});
test('Enter follows a rebuilt grid after committing the last cell',()=>{const g=enterGrid(),next=enterGrid(Array.from({length:5},()=>({name:'Cable'})));g.commitEditor=()=>true;g.currentGrid=()=>next;g.moveEnter(false,true);assert.equal(next.ids.length,6);assert.equal(next.selection.r,5);});
test('new entry stays visible under filtering and descending sort',()=>{const g=enterGrid([{name:'Match'},{name:'Other'}]);g.filter='match';g.sort={key:'name',dir:-1};g.renderBody();g.selection.r=0;g.moveEnter();assert.deepEqual(g.ids,[0,5]);assert.equal(g.selection.r,1);});

test('colour suggestions filter palette names and aliases without accepting outside values',()=>{
 const palette=JSON.parse(fs.readFileSync(new URL('../reference/colour_options.json',import.meta.url),'utf8'));
 assert.deepEqual(M.colourSuggestions('blu',palette).map(x=>x.label),['Blue']);
 assert.deepEqual(M.colourSuggestions('  RED ',palette).map(x=>x.label),['Red']);
 assert.deepEqual(M.colourSuggestions('outside-colour',palette),[]);
 assert.throws(()=>M.resolveColour('outside-colour',palette));
 for(const choice of M.colourSuggestions('',palette))assert.equal(M.resolveColour(choice.value,palette),choice.value);
});
test('invalid pasted palette colours reject the whole edit without changing cells',()=>{
 const palette=JSON.parse(fs.readFileSync(new URL('../reference/colour_options.json',import.meta.url),'utf8'));
 const rows=[{name:'original'}],g=editable(rows),col={key:'name',parse:v=>M.resolveColour(v,palette)};
 assert.equal(g.apply([{id:0,col,text:'Red'},{id:1,col,text:'#123456'}]),false);assert.deepEqual(rows,[{name:'original'}]);
});

test('tables initialise with ascending name, vendor, cable type or length sorting',()=>{
 const saved=globalThis.localStorage,render=Grid.prototype.render;
 try{globalThis.localStorage={getItem:()=>null};Grid.prototype.render=function(){};
 for(const key of ['name','vendor','type','length']){const g=new Grid({dataset:{}},{columns:[{key}],key:'test'});assert.deepEqual(g.sort,{key,dir:1});}
 const other=new Grid({dataset:{}},{columns:[{key:'notes'}],key:'test'});assert.equal(other.sort,null);
 }finally{Grid.prototype.render=render;globalThis.localStorage=saved;}
});
test('alphabetical sorting ignores case, compares numbers naturally and leaves blanks last without reordering data',()=>{
 const rows=[{name:'Zulu'},{name:'cable 10'},{name:''},{name:'Alpha'},{name:'Cable 2'}],before=structuredClone(rows),g=grid(rows);g.sort={key:'name',dir:1};assert.deepEqual(g.indices(),[3,4,1,0,2]);assert.deepEqual(rows,before);
});
test('length defaults compare decimal values numerically',()=>{const g=grid([{length:1.2},{length:1.11},{length:10}]);g.o.columns=[{key:'length'}];g.sort={key:'length',dir:1};assert.deepEqual(g.indices(),[1,0,2,3,4]);});

test('Clear sort restores Name ascending and preserves the search filter',()=>{const g=enterGrid([{name:'Zulu'},{name:'Alpha'}]);g.sort={key:'name',dir:-1};g.filter='a';assert.equal(g.resetSort(),true);assert.deepEqual(g.sort,{key:'name',dir:1});assert.equal(g.filter,'a');assert.deepEqual(g.ids,[1]);});
test('Clear sort honours invalid edits and follows rebuilt tables',()=>{const g=enterGrid(),next=enterGrid();g.editing=true;g.commitEditor=()=>false;g.sort={key:'name',dir:-1};assert.equal(g.resetSort(),false);assert.equal(g.sort.dir,-1);g.commitEditor=()=>true;g.currentGrid=()=>next;next.sort={key:'name',dir:-1};assert.equal(g.resetSort(),true);assert.deepEqual(next.sort,{key:'name',dir:1});});
test('sorted paste can extend the table without overwriting rows hidden by display order',()=>{const rows=Array.from({length:5},(_,i)=>({name:String(5-i)})),g=editable(rows);g.ids=[4,3,2,1,0];g.sort={key:'name',dir:1};g.selection={r:4,c:0};g.paste('Last\nNew');assert.equal(rows[0].name,'Last');assert.equal(rows[5].name,'New');assert.equal(rows[4].name,'1');});

test('Reset widths changes only the active grid widths, retaining its other preferences',()=>{const g=enterGrid(),other=enterGrid();g.prefs={widths:{name:600},align:'right',zoom:1.2};other.prefs={widths:{name:300}};g.pref=()=>{g.saved=structuredClone(g.prefs);};assert.equal(g.resetWidths(),true);assert.deepEqual(g.prefs,{widths:{},align:'right',zoom:1.2});assert.deepEqual(g.saved,g.prefs);assert.equal(g.columnWidth(g.o.columns[0]),150);assert.equal(other.prefs.widths.name,300);});
test('Reset widths refuses invalid edits and follows a rebuilt active table',()=>{const g=enterGrid(),next=enterGrid();g.editing=true;g.prefs.widths={name:400};g.commitEditor=()=>false;assert.equal(g.resetWidths(),false);assert.equal(g.prefs.widths.name,400);g.commitEditor=()=>true;g.currentGrid=()=>next;next.prefs.widths={name:500};next.pref=()=>{};g.resetWidths();assert.deepEqual(next.prefs.widths,{});});
test('length chips sort numerically without mutating source values or hiding invalid entries',()=>{const values=[20,1.5,10,2,2,'invalid',null];assert.deepEqual(sortedLengths(values),[1.5,2,2,10,20,'invalid',null]);assert.deepEqual(values,[20,1.5,10,2,2,'invalid',null]);});

function loomController(){
 const ctx=controller();
 vm.runInContext(`
 const captured=[];
 const fakeNode=()=>({dataset:{},append(){},setAttribute(){}});
 document.createElement=fakeNode;document.querySelector=()=>fakeNode();document.querySelectorAll=()=>[];
 Grid=class{constructor(host,o){this.o=o;captured.push(o);}};
 heading=()=>{};change=fn=>fn();
 refs={cable_types:{items:[{name:'DMX',aliases:[],connectors:{male:'XLR-5',female:'XLR-5'}}]}};
 project=newProject('Test');renderLooms();
 `,ctx);return ctx;
}
test('loom parent edits preserve components, IDs and custom data',()=>{
 const ctx=loomController();
 vm.runInContext(`project.looms.push({...newLoom(),name:'Original',custom:{keep:true},components:[{id:'part',type:'DMX',count:2,connectors:{male:'custom',female:'custom'},lengths:[]}]});
 captured[0].apply([{id:0,col:{key:'name'},value:'Renamed'},{id:0,col:{key:'lengths'},value:[20,10]}],false);`,ctx);
 const p=JSON.parse(vm.runInContext('JSON.stringify(project)',ctx));
 assert.equal(p.looms[0].name,'Renamed');assert.deepEqual(p.looms[0].lengths,[20,10]);assert.equal(p.looms[0].components[0].count,2);assert.equal(p.looms[0].components[0].connectors.male,'custom');assert.deepEqual(p.looms[0].custom,{keep:true});assert.deepEqual(M.restoreProject(p).looms,p.looms);
});
test('loom display keeps children with their parent through sorting, collapse and search',()=>{
 const looms=[{id:'z',name:'Zulu',lengths:[],components:[{id:'z1',type:'DMX',count:2}]},{id:'a',name:'Alpha',lengths:[20],components:[{id:'a1',type:'Power',count:4}]}],before=structuredClone(looms),rows=M.loomRows(looms);
 assert.deepEqual(M.loomOrder(rows,new Set()),[2,0]);
 assert.deepEqual(M.loomOrder(rows,new Set(['a'])),[2,3,0]);
 assert.deepEqual(M.loomOrder(rows,new Set(),'DMX'),[0,1]);
 assert.deepEqual(M.loomOrder(rows,new Set(['z']),'',{key:'name',dir:-1}),[0,1,2]);assert.deepEqual(looms,before);
});
test('loom pane validates a separate draft and preserves IDs, lengths, custom data and overrides',()=>{
 const draft={id:'loom',name:'  Test loom  ',lengths:[20,10],description:'Keep',custom:{yes:true},components:[{id:'a',type:'DMX',count:'4',connectors:{male:'Override',female:'Override'},lengths:[10],custom:7},{id:'b',type:'Custom',count:'2',connectors:{},lengths:[]}]},before=structuredClone(draft);
 const saved=M.prepareLoomDraft(draft,[]);assert.deepEqual(draft,before);assert.equal(saved.name,'Test loom');assert.equal(saved.components[0].count,4);assert.equal(saved.components[0].connectors.male,'Override');assert.deepEqual(saved.lengths,[20,10]);assert.deepEqual(saved.custom,{yes:true});assert.equal(saved.components[0].custom,7);assert.deepEqual(saved.components[1].connectors,{male:'Custom',female:'Custom'});
 const refs=[{name:'DMX',aliases:['DMX5'],connectors:{male:'XLR5',female:'XLR5'}}];draft.components[1].type='DMX5';assert.equal(M.prepareLoomDraft(draft,refs).components[1].connectors.male,'XLR5');
 for(const count of ['',0,-1,1.5,'bad']){draft.components[0].count=count;assert.throws(()=>M.prepareLoomDraft(draft,refs),/Quantity/);}
 draft.components=[];assert.throws(()=>M.prepareLoomDraft(draft,refs),/at least one/);draft.name=' ';assert.throws(()=>M.prepareLoomDraft(draft,refs),/loom name/);
});
test('loom child edits target their own component and cannot create unsaved parent rows',()=>{
 const ctx=loomController();vm.runInContext(`project.looms.push({...newLoom(),name:'Original',components:[{id:'part',type:'DMX',count:2,connectors:{male:'custom'},lengths:[]}]});captured[0].apply([{id:1,col:{key:'count'},value:6}],false);`,ctx);
 assert.equal(vm.runInContext('project.looms[0].components[0].count',ctx),6);assert.equal(vm.runInContext('project.looms[0].name',ctx),'Original');assert.equal(vm.runInContext('captured[0].newEntries',ctx),false);
 const g=editable([{name:'Existing'}]);g.o.newEntries=false;assert.equal(g.apply([{id:1,col:{key:'name'},text:'Uncreated'}]),false);assert.deepEqual(g.o.rows(),[{name:'Existing'}]);
});

test('loom child display sorts by cable type and quantity without moving components between parents',()=>{
 const looms=[{id:'a',name:'Alpha',lengths:[],components:[{type:'Zulu',count:1},{type:'Beta',count:4}]}],rows=M.loomRows(looms),expanded=new Set(['a']);
 assert.deepEqual(M.loomOrder(rows,expanded),[0,2,1]);assert.deepEqual(M.loomOrder(rows,expanded,'',{key:'count',dir:1}),[0,1,2]);assert.equal(looms[0].components[0].type,'Zulu');
});


test('Settings looms edit, add and delete references without touching stock or other categories',()=>{
 const ctx=loomController();
 vm.runInContext(`
 const category='Stock / Pre-Made Looms';
 refs.cable_types.items.push({id:'reference',category,name:'Reference loom',aliases:['Alias'],lengthUnit:'ft',custom:{keep:true},lengths:[20,10],components:[{id:'part',type:'DMX',count:2,connectors:{male:'Override'},lengths:[]}]});
 referenceBaseline=clone(refs);
 const stockBefore=JSON.stringify(project),otherBefore=JSON.stringify(refs.cable_types.items[0]);
 const context=loomContext(true,category);renderLooms(context);
 captured[1].apply([{id:0,col:{key:'name'},value:'Renamed'},{id:1,col:{key:'count'},value:4},{id:0,col:{key:'lengths'},value:[30,15]}]);
 `,ctx);
 const saved=JSON.parse(vm.runInContext('JSON.stringify(refs.cable_types.items[1])',ctx));
 assert.equal(saved.name,'Renamed');assert.equal(saved.components[0].count,4);assert.deepEqual(saved.lengths,[30,15]);assert.equal(saved.lengthUnit,'ft');assert.deepEqual(saved.aliases,['Alias']);assert.deepEqual(saved.custom,{keep:true});
 assert.equal(vm.runInContext('JSON.stringify(project)===stockBefore&&JSON.stringify(refs.cable_types.items[0])===otherBefore',ctx),true);
 vm.runInContext(`context.mutate(looms=>looms.push({...newLoom(),category,name:'Added'}));confirmAction=(title,text,fn)=>fn();captured[1].remove([1]);`,ctx);
 assert.equal(vm.runInContext('refs.cable_types.items[1].components.length',ctx),0);
 vm.runInContext('captured[1].remove([0]);',ctx);
 assert.equal(vm.runInContext('refs.cable_types.items.length',ctx),2);
 assert.equal(vm.runInContext('refs.cable_types.items[1].name',ctx),'Added');
 assert.equal(vm.runInContext('JSON.stringify(project)===stockBefore',ctx),true);
});

test('legacy loom references retain aliases and unknown fields without mutation on read',()=>{
 const row={id:'legacy',name:'Existing',category:'Stock / Pre-Made Looms',aliases:['Alias'],connectors:{male:'Preserve'},custom:7},before=structuredClone(row),loom=M.referenceLoom(row);
 assert.deepEqual(row,before);assert.deepEqual(loom.components,[]);assert.deepEqual(loom.lengths,[]);assert.equal(loom.lengthUnit,'m');assert.deepEqual(loom.connectors,row.connectors);
 const refs={categories:{items:[{id:'cat-looms',name:'Stock / Pre-Made Looms',aliases:['Looms']}]}},normal={id:'normal',name:'Cable',category:'Data'};
 assert.equal(M.isLoomCategory('Looms',refs),true);assert.equal(M.isLoomCategory('Data',refs),false);
 assert.deepEqual(M.replaceLoomReferences([normal,row],row.category,[{...loom,name:'Changed'}])[0],normal);
 assert.deepEqual(M.parseJSON(JSON.stringify(loom)),loom);
});

test('reference validation checks loom quantities and lengths without requiring cable endpoints',()=>{
 const row={id:'ref',category:'Stock / Pre-Made Looms',name:'Loom',aliases:[],lengthUnit:'m',lengths:[10],components:[{id:'c',type:'DMX',count:2,connectors:{},lengths:[]}]},refs={cable_types:{items:[row]}};
 assert.deepEqual(M.validateReferences(refs),[]);
 row.components[0].count=0;assert.match(M.validateReferences(refs)[0].message,/Quantity/);
 row.components[0].count=2;row.lengths=[-1];assert.match(M.validateReferences(refs)[0].message,/positive/);
 row.lengths=[];row.lengthUnit='bad';assert.match(M.validateReferences(refs)[0].message,/metres or feet/);
});
