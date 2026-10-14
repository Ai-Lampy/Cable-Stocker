import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as M from '../js/model.js';
function setup(){
 const make=tag=>({tag,children:[],dataset:{},value:'',append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},setAttribute(){},querySelector(){return this.children.find(n=>['input','textarea','select'].includes(n.tag));},setCustomValidity(message){this.error=message;},reportValidity(){}});
 const ctx=vm.createContext({...M,document:{createElement:make}});
 const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,'');
 vm.runInContext(source,ctx);
 vm.runInContext("change=fn=>fn();notice=()=>{};project.stock.vendor.contact='0123';project.stock.vendor.rate=2.5;project.stock.vendor.active=false;project.stock.vendor.details={address:'London',codes:['001',null]};",ctx);
 return ctx;
}
const descendants=e=>[e,...e.children.flatMap(descendants)];
function label(form,text){return descendants(form).find(e=>e.tag==='label'&&e.textContent===text);}
test('metadata form uses normal controls and preserves unrelated nested values',()=>{
 const ctx=setup(),form=vm.runInContext("metadataForm('vendor','Vendor fields')",ctx);
 const contact=label(form,'contact').querySelector();assert.equal(contact.tag,'textarea');assert.equal(contact.value,'0123');contact.value='00456';contact.onchange();
 const rate=label(form,'rate').querySelector();assert.equal(rate.type,'number');rate.value='7.25';rate.onchange();
 const active=label(form,'active').querySelector();active.value='true';active.onchange();
 const address=label(form,'address').querySelector();address.value='Leeds';address.onchange();
 const vendor=JSON.parse(vm.runInContext('JSON.stringify(project.stock.vendor)',ctx));
 assert.equal(vendor.contact,'00456');assert.equal(vendor.rate,7.25);assert.equal(vendor.active,true);assert.deepEqual(vendor.details,{address:'Leeds',codes:['001',null]});
 assert.equal(label(form,'name'),undefined);assert.equal(label(form,'lengthUnit'),undefined);
});
test('invalid numeric metadata retains the original value',()=>{
 const ctx=setup(),form=vm.runInContext("metadataForm('vendor','Vendor fields')",ctx),input=label(form,'rate').querySelector();
 for(const value of ['', 'Infinity','invalid']){input.value=value;input.onchange();assert.equal(vm.runInContext('project.stock.vendor.rate',ctx),2.5);assert.ok(input.error);}
 input.value='0';input.onchange();assert.equal(vm.runInContext('project.stock.vendor.rate',ctx),0);assert.equal(input.error,'');
});
test('document metadata excludes reserved stock fields and preserves types through export',()=>{
 const ctx=setup();vm.runInContext("project.stock.revision=3;project.stock.notes=['one',false,null,{value:4}];",ctx);
 const form=vm.runInContext("metadataForm('root','Document fields')",ctx);assert.equal(label(form,'vendor'),undefined);assert.equal(label(form,'cables'),undefined);
 const input=label(form,'value').querySelector();input.value='5';input.onchange();
 const stock=JSON.parse(vm.runInContext('JSON.stringify(runtimeJSON(project))',ctx));assert.deepEqual(stock.notes,['one',false,null,{value:5}]);assert.equal(stock.revision,3);
});
