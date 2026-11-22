import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {riggingDisplayCell,riggingMeasureUnit,setRiggingDisplayCell} from '../js/rigging.js';
import {cableWeightRows} from '../js/cable-weights.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const weights=read('data/cable_weights.json'),stock=read('projects/christie_lites_uk.lampy-project.json').stock;
test('source-unit display and editing respect inches, feet, pounds and mixed metric capacity',()=>{
 const row={properties:{width:{value:0.3048,unit:'m',sourceUnit:'in',sourceValue:12},length:{value:2.4384,unit:'m',sourceUnit:'ft'},weight:{value:4.5359237,unit:'kg',sourceUnit:'lb'},listedCapacity:{value:1000,unit:'kg',sourceUnit:'kg'}}};
 for(const [key,value,unit] of [['width',12,'in'],['length',8,'ft'],['weight',10,'lb'],['listedCapacity',1000,'kg']]){assert.equal(riggingDisplayCell(row,key,'source'),value);assert.equal(riggingMeasureUnit(row,key),unit);}
 setRiggingDisplayCell(row,'width',24,'source');assert.equal(row.properties.width.value,0.6096);assert.equal(riggingDisplayCell(row,'width','source'),24);assert.equal(row.properties.width.sourceValue,12);assert.equal(riggingDisplayCell(row,'width','metric'),0.6096);assert.equal(riggingDisplayCell(row,'width','imperial'),2);
 assert.equal(riggingMeasureUnit({properties:{width:{sourceUnit:'lb'}}},'width'),'m');
});
test('vendor weight lookup matches exact lengths without changing stock or assigning another vendor weights',()=>{
 const before=JSON.stringify(stock),rows=cableWeightRows(stock,'Data',weights);
 assert.equal(rows.find(r=>r.name==='XLR-3'&&r.length===4).weight,0.3);
 assert.equal(rows.find(r=>r.name==='XLR-5'&&r.length===56).weight,'');
 assert.equal(rows.find(r=>r.name==='Ethernet'&&r.length===8).weight,'');
 assert(rows.filter(r=>r.name==='XLR-5 Black').every(r=>r.weight===''));
 assert(cableWeightRows({...stock,vendor:{name:'Siyan LTD',lengthUnit:'ft'}},'Data',weights).every(r=>r.weight===''));
 assert.equal(JSON.stringify(stock),before);
});
test('weights support metric equivalents and retain unresolved configuration gaps',()=>{
 const converted={vendor:{name:'Christie Lites UK',lengthUnit:'m'},cables:{Data:[{name:'XLR-3',lengths:[1.2192]}]}};
 assert.equal(cableWeightRows(converted,'Data',weights)[0].weight,0.3);
 assert(cableWeightRows(stock,'Mains',weights).filter(r=>r.name==='Powerlock - 140mm').every(r=>r.weight===''&&r.review.includes('120')));
 assert.equal(weights.items.flatMap(i=>i.weights).length,105);
 for(const item of weights.items)for(const w of item.weights){assert(w.weight>0&&w.length>0);assert.equal(w.weightUnit,'lb');assert.match(item.sourceUrl,/^https:\/\/www.christielites.com\//);}
});
