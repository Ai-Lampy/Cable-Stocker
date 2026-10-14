import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Grid,parseCell} from '../js/grid.js';
import * as M from '../js/model.js';
function grid(rows=[]){const g=Object.create(Grid.prototype);Object.assign(g,{o:{rows:()=>rows,columns:[{key:'name',width:500}],get:(r,k)=>r[k]},prefs:{widths:{}},filter:'',sort:null});return g;}
test('empty tables expose five entry slots without changing exported rows',()=>{const rows=[],g=grid(rows);assert.deepEqual(g.indices(),[0,1,2,3,4]);assert.equal(g.value(4,'name'),'');assert.deepEqual(rows,[]);});
test('small tables retain five entry slots and search does not create fake matches',()=>{const g=grid([{name:'Cable'}]);assert.equal(g.indices().length,5);g.filter='cable';assert.deepEqual(g.indices(),[0]);g.filter='absent';assert.deepEqual(g.indices(),[]);});
test('90 px defaults ignore old per-column suggestions but honour chosen widths',()=>{const g=grid();assert.equal(g.columnWidth(g.o.columns[0]),90);g.prefs.widths.name=25;assert.equal(g.columnWidth(g.o.columns[0]),25);});
test('existing layout preferences migrate once to centre/90 without discarding highlights',()=>{
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
