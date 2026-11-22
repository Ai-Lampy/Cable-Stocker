import {clone, object, safeKey, same, uid, parseJSON} from './model.js';
export const RIGGING_SOURCE='reference/rigging/christie_lites_uk_rigging.source.json';
export const RIGGING_KEY='lampy-rigging:draft:1';
export const MEASURES={length:['Length (m)','m'],nominalSectionSize:['Section size (m)','m'],diameter:['Diameter (m)','m'],angle:['Angle (°)','deg'],lift:['Lift (m)','m'],listedCapacity:['Listed capacity (kg)','kg'],weight:['Weight (kg)','kg'],width:['Width (m)','m'],height:['Height (m)','m'],depth:['Depth (m)','m'],overallLength:['Overall length (m)','m'],travelHeight:['Travel height (m)','m']};
export function checkCatalogue(value){
  if(!object(value)||value.format!=='lampy-rigging-source-catalogue'||value.formatVersion!==1||!object(value.vendor)||typeof value.vendor.name!=='string'||!object(value.categories))throw Error('Expected a V2 rigging source catalogue. Cable JSON must be opened in Cable stock.');
  for(const [category,rows] of Object.entries(value.categories)){
    if(!safeKey(category)||!category.trim()||!Array.isArray(rows)||rows.some(row=>!object(row)))throw Error('Every rigging category must contain an array of items.');
    for(const row of rows)if(row.properties!==undefined&&!object(row.properties))throw Error('Item properties must be an object.');
  }
  return value;
}
export function createRigging(catalogue,filename=''){
  checkCatalogue(catalogue);return {format:'lampy-rigging-generator-project',formatVersion:1,catalogue:clone(catalogue),baseline:clone(catalogue),filename:filename||riggingFilename(catalogue.vendor.name)};
}
export function blankRigging(name=''){
  return createRigging({format:'lampy-rigging-source-catalogue',formatVersion:1,catalogueVersion:'v1',status:'proposed-source-dataset',vendor:{name},compatibility:{lampyPaperworkSchemaVerified:false},categories:{}});
}
export function importRigging(value,filename=''){
  if(value?.format==='lampy-rigging-generator-project'){
    if(value.formatVersion!==1||typeof value.filename!=='string')throw Error('Unsupported rigging project backup.');
    checkCatalogue(value.catalogue);checkCatalogue(value.baseline);return clone(value);
  }
  return createRigging(value,filename);
}
export function riggingFilename(name,backup=false){return `${String(name||'vendor').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||'vendor'}${backup?'.rigging-project':'_rigging'}.json`;}
export function newRiggingItem(){return {id:uid(),name:'',kind:'',reviewRequired:true};}
export function getRiggingCell(row,key){return Object.hasOwn(MEASURES,key)?row.properties?.[key]?.value??'':row[key]??'';}
export function imperialMeasure(value,unit){return {value:Number((unit==='kg'?value/0.45359237:unit==='m'?value/0.3048:value).toFixed(9)),unit:unit==='kg'?'lb':unit==='m'?'ft':unit};}
export function riggingDisplayCell(row,key,units='metric'){const value=getRiggingCell(row,key);return units==='imperial'&&Object.hasOwn(MEASURES,key)&&value!==''?imperialMeasure(value,MEASURES[key][1]).value:value;}
export function riggingDisplayLabel(key,units='metric'){const [label,unit]=MEASURES[key];return units==='imperial'?label.replace(`(${unit})`,`(${imperialMeasure(1,unit).unit})`):label;}
export function setRiggingDisplayCell(row,key,value,units='metric'){if(units==='imperial'&&Object.hasOwn(MEASURES,key)&&value!==''){const unit=MEASURES[key][1];value=Number((value*(unit==='kg'?0.45359237:unit==='m'?0.3048:1)).toFixed(9));}setRiggingCell(row,key,value);}
export function setRiggingCell(row,key,value){
  if(Object.hasOwn(MEASURES,key)){
    if(value===''){if(row.properties)delete row.properties[key];}
    else {if(typeof value!=='number'||!Number.isFinite(value)||value<=0)throw Error('Enter a positive number or leave blank.');row.properties||={};const old=row.properties[key];row.properties[key]={...(object(old)?old:{}),value,unit:MEASURES[key][1],imperial:imperialMeasure(value,MEASURES[key][1])};if(old&&!same(old,row.properties[key]))row.properties[key].edited=true;}
  }else row[key]=value;
  if(key!=='reviewRequired')row.reviewRequired=true;
}
export function validateRigging(catalogue){
  checkCatalogue(catalogue);const issues=[],ids=new Set();const add=(level,category,index,field,message)=>issues.push({level,category,index,field,message});
  if(!catalogue.vendor.name.trim())add('error','Vendor',null,'name','Enter a vendor name.');
  for(const [category,rows] of Object.entries(catalogue.categories)){
    const names=new Set();for(const [index,row] of rows.entries()){
      if(typeof row.id!=='string'||!row.id.trim()||ids.has(row.id))add('error',category,index,'id','Item IDs must be non-empty and unique across the catalogue.');ids.add(row.id);
      const name=typeof row.name==='string'?row.name.trim().toLocaleLowerCase():'';
      if(!name||names.has(name))add('error',category,index,'name','Enter a unique item name within this category.');names.add(name);
      if(row.aliases!==undefined&&(!Array.isArray(row.aliases)||row.aliases.some(a=>typeof a!=='string')))add('error',category,index,'aliases','Aliases must be a list of names.');
      if(row.connection!==undefined&&typeof row.connection!=='string')add('error',category,index,'connection','Connection must be a name.');
      if(typeof row.kind!=='string'||!row.kind.trim())add('error',category,index,'kind','Enter the item type.');
      if(typeof row.reviewRequired!=='boolean')add('error',category,index,'reviewRequired','Review required must be Yes or No.');
      else if(row.reviewRequired)add('warning',category,index,'reviewRequired','Product details need review against your source documentation.');
      if(row.sourceUrl&&!/^https?:\/\/[^\s]+$/i.test(row.sourceUrl))add('error',category,index,'sourceUrl','Source must be an HTTP or HTTPS URL.');
      for(const [key,measurement] of Object.entries(row.properties||{})){
        if(!Object.hasOwn(MEASURES,key))continue;
        if(!object(measurement)||typeof measurement.value!=='number'||!Number.isFinite(measurement.value)||measurement.value<=0||measurement.unit!==MEASURES[key][1])add('error',category,index,key,`Use a positive ${MEASURES[key][1]} value for ${MEASURES[key][0]}.`);
      }
    }
  }
  return issues;
}
export function riggingChanges(project){
  const before=project.baseline,after=project.catalogue,result=[];
  if(!same(before.vendor,after.vendor)||before.catalogueVersion!==after.catalogueVersion)result.push('Vendor or catalogue version changed');
  for(const category of new Set([...Object.keys(before.categories),...Object.keys(after.categories)])){
    if(!Object.hasOwn(before.categories,category))result.push(`${category}: category added`);
    if(!Object.hasOwn(after.categories,category))result.push(`${category}: category removed`);
    const old=before.categories[category]||[],rows=after.categories[category]||[];
    for(const row of rows){const prior=old.find(x=>x.id===row.id);if(!prior||!same(prior,row))result.push(`${category}: ${prior?'modified':'added'} ${row.name||'Unnamed item'}`);}
    for(const row of old)if(!rows.some(x=>x.id===row.id))result.push(`${category}: removed ${row.name||'Unnamed item'}`);
  }
  return clone(result);
}
// One independent key; never read or write cable projects or reference preferences.
export class RiggingStore{
  constructor(storage){this.storage=storage;this.raw=storage.getItem(RIGGING_KEY);this.blocked=false;}
  load(){if(this.raw===null)return null;try{const saved=parseJSON(this.raw);return {project:importRigging(saved.project),dirty:!!saved.dirty};}catch(e){this.blocked=true;throw Error('Saved rigging draft needs recovery. It has not been overwritten. '+e.message);}}
  save(project,dirty){
    if(this.blocked)throw Error('Rigging autosave is paused. Download a project backup before reloading.');
    if(this.storage.getItem(RIGGING_KEY)!==this.raw){this.blocked=true;throw Error('Another tab changed Rigging. Download this project backup before reloading.');}
    const next=JSON.stringify({project,dirty});this.storage.setItem(RIGGING_KEY,next);if(this.storage.getItem(RIGGING_KEY)!==next)throw Error('Could not verify the saved rigging draft.');this.raw=next;
  }
}
export const RIGGING_COLUMNS=['id','name','aliases','connection','kind','series','reviewRequired','sourceUrl',...Object.keys(MEASURES)];
export function riggingWorkbook(project,X){
  const book=X.utils.book_new(),mapping=[];
  for(const [index,[category,rows]] of Object.entries(project.catalogue.categories).entries()){
    const sheet=`Category ${index+1}`;mapping.push({sheet,category});
    X.utils.book_append_sheet(book,X.utils.aoa_to_sheet([RIGGING_COLUMNS,...rows.map(row=>RIGGING_COLUMNS.map(key=>key==='aliases'?(row.aliases||[]).join(', '):getRiggingCell(row,key)))]),sheet);
  }
  const encoded=JSON.stringify({project,mapping}),chunks=encoded.match(/[\s\S]{1,16000}/g)||[''];
  X.utils.book_append_sheet(book,X.utils.aoa_to_sheet([['lampy-rigging-workbook',1],...chunks.map(chunk=>[chunk])]),'_Rigging');return book;
}
export function riggingFromWorkbook(book,X){
  if(!book.Sheets._Rigging)throw Error('This is not a Rigging workbook. Cable workbooks belong in Cable stock.');
  const meta=X.utils.sheet_to_json(book.Sheets._Rigging,{header:1,defval:''});if(meta[0]?.[0]!=='lampy-rigging-workbook'||meta[0]?.[1]!==1)throw Error('Unsupported Rigging workbook version.');
  const {project,mapping}=parseJSON(meta.slice(1).map(r=>r[0]).join('')),result=importRigging(project);
  if(!Array.isArray(mapping)||new Set(mapping.map(m=>m.category)).size!==mapping.length)throw Error('Invalid workbook category map.');
  for(const {sheet,category} of mapping){
    if(!safeKey(category)||!Object.hasOwn(result.catalogue.categories,category)||!book.Sheets[sheet])throw Error('A mapped category sheet is missing. Delete rows to remove stock; keep the sheet.');
    const values=X.utils.sheet_to_json(book.Sheets[sheet],{header:1,defval:''});const headers=values[0];if(!Array.isArray(headers)||![RIGGING_COLUMNS,RIGGING_COLUMNS.filter(k=>!['width','height','depth','overallLength','travelHeight'].includes(k)),RIGGING_COLUMNS.filter(k=>!['aliases','connection','width','height','depth','overallLength','travelHeight'].includes(k))].some(allowed=>same(headers,allowed)))throw Error(`Keep the original column headings in ${sheet}.`);
    const originals=result.catalogue.categories[category],seen=new Set();
    result.catalogue.categories[category]=values.slice(1).filter(r=>r.some(v=>v!==''&&v!=null)).map(cells=>{
      const id=String(cells[0]||uid());if(seen.has(id))throw Error('Duplicate item ID in Excel.');seen.add(id);
      const prior=originals.find(r=>r.id===id),row=prior?clone(prior):{...newRiggingItem(),id};
      for(const [i,key] of headers.entries()){
        if(key==='id')continue;let value=cells[i]??'';
        if(key==='reviewRequired'){if(![true,false,'true','false','Yes','No','yes','no',''].includes(value))throw Error('Use Yes or No for review required.');value=[true,'true','Yes','yes',''].includes(value);}
        else if(Object.hasOwn(MEASURES,key)&&value!==''){value=Number(value);if(!Number.isFinite(value)||value<=0)throw Error('Measurements must be positive numbers.');}
        else if(key==='aliases'){value=String(value).split(',').map(s=>s.trim()).filter(Boolean);if(!row.aliases&&!value.length)continue;}
        else {value=String(value);if(key==='connection'&&row.connection===undefined&&!value)continue;}
        if(!same(getRiggingCell(row,key),value))setRiggingCell(row,key,value);
      }
      return row;
    });
  }
  return clone(result);
}
