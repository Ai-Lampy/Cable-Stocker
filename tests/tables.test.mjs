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
test('new loom rows and expanded components retain independent identities and quantities',()=>{
 const ctx=loomController();
 vm.runInContext(`captured[0].add();captured[0].add();captured[0].details(project.looms[1]);captured.at(-1).apply([{id:0,col:{key:'type'},value:'DMX'},{id:0,col:{key:'count'},value:4}],true);`,ctx);
 const looms=JSON.parse(vm.runInContext('JSON.stringify(project.looms)',ctx));assert.notEqual(looms[0].id,looms[1].id);assert.deepEqual(looms[0].components,[]);assert.equal(looms[1].components[0].count,4);assert.deepEqual(looms[1].components[0].connectors,{male:'XLR-5',female:'XLR-5'});
 assert.equal(vm.runInContext('expandedLooms.size',ctx),2);
});
test('loom collapse and table save guard commits pending editors and stops on invalid input',()=>{
 const ctx=loomController();
 vm.runInContext(`let commits=0;document.querySelectorAll=()=>[{lampyGrid:{editing:true,commitEditor:()=>{commits++;return false;}}}];`,ctx);
 assert.equal(vm.runInContext('commitLoomEditors()',ctx),false);assert.equal(vm.runInContext('captured[0].add()',ctx),false);assert.equal(vm.runInContext('project.looms.length',ctx),0);
 vm.runInContext(`document.querySelectorAll=()=>[{lampyGrid:{editing:true,commitEditor:()=>{commits++;return true;}}}];`,ctx);assert.equal(vm.runInContext('commitLoomEditors()',ctx),true);
});
