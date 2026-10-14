import test from 'node:test';
import assert from 'node:assert/strict';
import {vendorProjectFilename,loadVendorProject} from '../js/vendor-projects.js';
import {projectFromStock} from '../js/model.js';
const vendor='Test Vendor';
const project=()=>projectFromStock({vendor:{name:vendor,lengthUnit:'m'},cables:{Data:[]}},'test_cable.json');
const response=(value,status=200)=>({status,ok:status===200,text:async()=>JSON.stringify(value)});
test('project filenames are deterministic and confined to one directory',()=>{
 assert.equal(vendorProjectFilename('Christie Lites UK'),'christie_lites_uk.lampy-project.json');
 assert.equal(vendorProjectFilename(' ../Test / Vendor '),'test_vendor.lampy-project.json');
 assert.throws(()=>vendorProjectFilename('!!!'),/vendor name/);
 assert.throws(()=>vendorProjectFilename('Test-Vendor',[{name:'Test Vendor'}]),/same project filename/);
});
test('saved project loads relative to app path without stale cache and preserves generator data',async()=>{
 const p=project();p.vendorVersion='v3';p.looms=[{id:'loom',name:'Test',components:[],lengths:[3]}];
 const loaded=await loadVendorProject(vendor,[],async(path,options)=>{assert.equal(path,'projects/test_vendor.lampy-project.json');assert.equal(options.cache,'no-store');assert(options.signal);return response(p);});
 assert.deepEqual(loaded,p);
});
test('missing projects differ from failures and wrong or invalid project documents',async()=>{
 assert.equal(await loadVendorProject(vendor,[],async()=>response(null,404)),null);
 await assert.rejects(loadVendorProject(vendor,[],async()=>response(null,500)),/Could not load/);
 await assert.rejects(loadVendorProject('Other',[],async()=>response(project())),/does not match/);
 await assert.rejects(loadVendorProject(vendor,[],async()=>response({vendor:{},cables:{}})),/Unsupported/);
 await assert.rejects(loadVendorProject(vendor,[],async()=>({ok:true,status:200,text:async()=>'<html>'})),SyntaxError);
 await assert.rejects(loadVendorProject(vendor,[],async()=>{throw Error('Offline');}),/Offline/);
});

test('vendor selection ignores stale responses and never overwrites edits made during loading',async()=>{
 const fs=await import('node:fs'),vm=await import('node:vm'),M=await import('../js/model.js');
 const pending=[],notices=[];
 const c=vm.createContext({...M,APP_VERSION:'test',document:{querySelector:()=>({open:false})},loadVendorProject:()=>new Promise(resolve=>pending.push(resolve))});
 vm.runInContext(fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,''),c);
 c.report=message=>notices.push(message);
 vm.runInContext("refs={lighting_vendors:{vendors:[{name:'A'},{name:'B'}]}};notice=report;change=fn=>fn();navigate=()=>{};",c);
 const a=vm.runInContext("selectVendorProject('A')",c),b=vm.runInContext("selectVendorProject('B')",c);
 const make=name=>M.projectFromStock({vendor:{name,lengthUnit:'m'},cables:{}},'stock.json');
 pending[1](make('B'));await b;pending[0](make('A'));await a;
 assert.equal(vm.runInContext('project.stock.vendor.name',c),'B');
 const next=vm.runInContext("selectVendorProject('A')",c);vm.runInContext("project.vendorVersion='v9'",c);pending[2](make('A'));await next;
 assert.equal(vm.runInContext('project.stock.vendor.name',c),'B');assert.equal(vm.runInContext('project.vendorVersion',c),'v9');assert(notices.some(x=>x.includes('workspace changed')));
});
