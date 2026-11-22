import {clone,object,parseJSON,mergePublishedReference,safeKey,relativePath} from './model.js';
import {validateRigging,newRiggingItem} from './rigging.js';
export const RIGGING_REF_KEY='lampy-rigging:references:1';
export const RIGGING_REFS={rigging_categories:'Categories',rigging_types:'Equipment Types',rigging_connections:'Connections',rigging_manifest:'Vendor Manifest'};
export function checkRiggingReference(key,value){
  const rows=key==='rigging_manifest'?value?.catalogues:value?.items;
  if(!object(value)||!Array.isArray(rows)||rows.some(r=>!object(r)))throw Error('Expected the matching rigging reference JSON.');
  if(rows.some(r=>r.aliases!==undefined&&(!Array.isArray(r.aliases)||r.aliases.some(a=>typeof a!=='string'))))throw Error('Aliases must be a list of names.');
  return value;
}
export function riggingReferenceIssues(refs){
  const issues=[];
  for(const key of Object.keys(RIGGING_REFS)){
    const value=checkRiggingReference(key,refs[key]),rows=value.items||value.catalogues,names=new Set(),ids=new Set(),paths=new Set();
    rows.forEach((row,index)=>{
      const add=message=>issues.push({key,index,message}),name=String(row.name??row.vendor??'').trim().toLowerCase();
      if(!name||names.has(name))add('Enter a unique name.');names.add(name);
      if(key==='rigging_manifest'){if(!relativePath(row.file)||paths.has(row.file))add('Enter a unique relative JSON path.');paths.add(row.file);if(Object.keys(row).some(k=>!['vendor','file'].includes(k)))add('Manifest rows use vendor and file only.');}
      else {if(!row.id||ids.has(row.id))add('Reference IDs must be unique.');ids.add(row.id);}
      if(key==='rigging_categories'&&!safeKey(row.name))add('Enter a safe category name.');
      if(key==='rigging_types')for(const issue of validateRigging({format:'lampy-rigging-source-catalogue',formatVersion:1,vendor:{name:'Reference'},categories:{Equipment:[row]}}).filter(i=>i.level==='error'))add(issue.message);
    });
  }
  return issues;
}
export function referenceEquipment(refs,category,vendor){return refs.rigging_types.items.filter(r=>r.category===category&&(!r.vendor||r.vendor.toLocaleLowerCase()===vendor.toLocaleLowerCase()));}
export function equipmentCopy(reference,name=reference.name){const row=clone(reference);delete row.category;delete row.vendor;row.name=name;return row;}
export function newRiggingReference(key,category=''){
  if(key==='rigging_manifest')return {vendor:'',file:''};
  return key==='rigging_types'?{...newRiggingItem(),aliases:[],category,vendor:''}:{id:newRiggingItem().id,name:'',aliases:[],...(key==='rigging_connections'?{category}: {})};
}
export class RiggingReferences{
  constructor(storage){this.storage=storage;this.raw=storage.getItem(RIGGING_REF_KEY);this.blocked=false;}
  load(published){
    for(const key of Object.keys(RIGGING_REFS))checkRiggingReference(key,published[key]);
    this.published=clone(published);this.refs=clone(published);
    if(this.raw!==null){try{const saved=parseJSON(this.raw);for(const key of Object.keys(RIGGING_REFS)){checkRiggingReference(key,saved.refs[key]);this.refs[key]=key==='rigging_manifest'?saved.refs[key]:mergePublishedReference(saved.refs[key],published[key],saved.published?.[key]||saved.refs[key]);}}catch(e){this.blocked=true;throw Error('Rigging Settings need recovery; saved references have not been overwritten. '+e.message);}}
    return this.refs;
  }
  save(refs){if(this.blocked||this.storage.getItem(RIGGING_REF_KEY)!==this.raw)throw Error('Rigging Settings changed in another tab or need recovery. Download references before reloading.');const next=JSON.stringify({refs,published:this.published});this.storage.setItem(RIGGING_REF_KEY,next);if(this.storage.getItem(RIGGING_REF_KEY)!==next)throw Error('Could not verify saved Rigging Settings.');this.raw=next;}
}
