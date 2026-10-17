import {sameGenderDirection,getCell,setCell,cableDirection,LOOM_CATEGORY,projectLoomCategories,projectLoomRows,selectLoomCategory,replaceProjectLooms,checkLengthDisplay,clone, parseJSON, parseLengths, projectFromStock, snapshot, uid, object, safeKey, isCableAdaptor, setCableAdaptor} from './model.js';

export const CABLE_COLUMNS = ['key','name','direction','start_connector','end_connector','lengths','connectors_json','custom_json','adaptor'];
const LOOM_COLUMNS = ['key','name','lengths','description','custom_json'];
const COMPONENT_COLUMNS = ['loom_key','component_key','type','count','connectors_json','lengths','custom_json'];
const RESERVED = ['_Metadata','_Categories','_Components'];
const json = value => JSON.stringify(value);
const omit = (obj,keys) => Object.fromEntries(Object.entries(obj).filter(([key])=>!keys.includes(key)));
function assertSize(value) { if(typeof value==='string' && value.length>32767)throw new Error('An Excel cell exceeds 32,767 characters. Use a project JSON backup; no data was discarded.');return value; }
function addSheet(X,book,name,rows,widths) {
  const sheet=X.utils.aoa_to_sheet(rows.map(row=>row.map(assertSize)));
  sheet['!cols']=widths.map(wch=>({wch}));sheet['!autofilter']={ref:X.utils.encode_range({s:{r:0,c:0},e:{r:Math.max(0,rows.length-1),c:rows[0].length-1}})};
  X.utils.book_append_sheet(book,sheet,name);
}
export function sheetName(category,used) {
  let base=category.replace(/[\\/?*\[\]:]/g,' ').replace(/^'+|'+$/g,'').trim() || 'Category';
  base=base.slice(0,31);let result=base,n=2;
  while(used.has(result.toLowerCase())){const suffix=` (${n++})`;result=base.slice(0,31-suffix.length)+suffix;}
  used.add(result.toLowerCase());return result;
}
export function toWorkbook(project,X,{category=null,blank=false}={}) {
  const book=X.utils.book_new(),used=new Set(RESERVED.map(n=>n.toLowerCase()));
  const sourceRows={};
  const mapping=[['sheet','category','kind']];
  const selectedLoom=category&&(category===LOOM_CATEGORY||projectLoomCategories(project).includes(category));
  const cats=category&&!selectedLoom?[category]:category?[]:Object.keys(project.stock.cables);
  if(!cats.length&&!category&&!projectLoomCategories(project).length)cats.push('Data');
  for(const cat of cats) {
    const name=sheetName(cat,used);mapping.push([name,cat,'cables']);
    const rows=[CABLE_COLUMNS];
    sourceRows[cat]={};
    if(!blank)(project.stock.cables[cat]||[]).forEach((r,i)=>{sourceRows[cat][project.rowIds[cat][i]]=clone(r);rows.push([
      project.rowIds[cat][i],r.name??'',r.direction??'',getCell(r,'start'),getCell(r,'end'),
      Array.isArray(r.lengths)?r.lengths.join(', '):json(r.lengths),json(r.connectors ?? {}),json(omit(r,['name','direction','connectors','lengths'])),isCableAdaptor(project,cat,i)?'yes':'no'
    ]);});
    addSheet(X,book,name,rows,[39,25,19,23,23,45,48,48,12]);
  }
  const loomCategories=category?(selectedLoom?[category]:[]):projectLoomCategories(project);
  if(blank&&!category&&!loomCategories.includes(LOOM_CATEGORY))loomCategories.push(LOOM_CATEGORY);
  const includeLooms=loomCategories.length>0,components=[COMPONENT_COLUMNS];
  for(const loomCategory of loomCategories){
    const name=sheetName(loomCategory===LOOM_CATEGORY?'Stock - Pre-Made Looms':loomCategory,used);mapping.push([name,loomCategory,'looms']);
    const rows=[LOOM_COLUMNS];
    if(!blank)projectLoomRows(project,loomCategory).forEach(loom=>{
      rows.push([loom.id,loom.name,loom.lengths.join(', '),loom.description||'',json(omit(loom,['id','name','lengths','description','components']))]);
      loom.components.forEach(c=>components.push([loom.id,c.id,c.type,c.count,json(c.connectors||{}),(c.lengths||[]).join(', '),json(omit(c,['id','type','count','connectors','lengths']))]));
    });
    addSheet(X,book,name,rows,[39,30,45,50,50]);
  }
  if(includeLooms)addSheet(X,book,'_Components',components,[39,39,28,12,48,32,48]);
  addSheet(X,book,'_Categories',mapping,[31,50,12]);
  const metadata={format:'lampy-cable-workbook',formatVersion:1,scope:category?'category':'vendor',category,stock:omit(project.stock,['cables']),stockLooms:!!project.stockLooms,filename:project.filename,vendorVersion:project.vendorVersion,loomCategory:includeLooms,sourceRows};
  if(project.lengthDisplay!==undefined)metadata.lengthDisplay=clone(checkLengthDisplay(project.lengthDisplay));
  const text=json(metadata),meta=[['key','value'],['format','lampy-cable-workbook'],['scope',metadata.scope],['vendor_name',project.stock.vendor.name],['length_unit',project.stock.vendor.lengthUnit],['vendor_version',project.vendorVersion],['filename',project.filename]];
  for(let i=0;i<text.length;i+=30000)meta.push([`json_${String(i/30000).padStart(5,'0')}`,text.slice(i,i+30000)]);
  addSheet(X,book,'_Metadata',meta,[22,65]);return book;
}
function rowsOf(book,name,X) {return X.utils.sheet_to_json(book.Sheets[name],{header:1,defval:'',raw:true,blankrows:false});}
function records(book,name,X,required,optional=[]) {
  const [headers,...rows]=rowsOf(book,name,X);if(!headers)return [];
  if(new Set(headers).size!==headers.length)throw new Error(`Duplicate column headers in ${name}.`);
  for(const h of required)if(!headers.includes(h))throw new Error(`${name} is missing the documented ${h} column. Use the app template.`);
  const unexpected=headers.filter(h=>h&&!required.includes(h)&&!optional.includes(h));
  if(unexpected.length)throw new Error(`${name} has unknown columns: ${unexpected.join(', ')}. Move custom data into custom_json to preserve it.`);
  return rows.filter(row=>row.some(v=>v!=='')).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??''])));
}
function jsonObject(text,label) {const value=parseJSON(String(text||'{}'));if(!object(value))throw new Error(`${label} must be a JSON object.`);return value;}
function custom(text,reserved,label){const value=jsonObject(text,label);if(Object.keys(value).some(k=>reserved.includes(k)))throw new Error(`${label} contains a standard field. Edit its own column instead.`);return value;}
function importedLengths(value) {parseLengths(value);return String(value).trim().split(/[\s,;]+/).filter(Boolean).map(Number);}
export function fromWorkbook(book,X,current) {
  const notices=[];
  for(const name of book.SheetNames)for(const [key,cell] of Object.entries(book.Sheets[name]))if(!key.startsWith('!')&&cell?.f)throw new Error(`Formula found at ${name}!${key}. Paste values in Excel before importing. Formulas are not evaluated.`);
  let metadata=null,editable={};
  if(book.Sheets._Metadata){
    const rows=rowsOf(book,'_Metadata',X).slice(1);editable=Object.fromEntries(rows);
    const text=rows.filter(([key])=>String(key).startsWith('json_')).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).map(r=>r[1]).join('');
    metadata=parseJSON(text);
    if(metadata.format!=='lampy-cable-workbook'||metadata.formatVersion!==1)throw new Error('Unsupported workbook metadata.');
    if(!['category','vendor'].includes(metadata.scope)||!object(metadata.stock)||!object(metadata.stock.vendor))throw new Error('Invalid workbook metadata.');
  }
  const stock=clone(metadata?.stock||{vendor:current.stock.vendor});stock.cables={};
  if(metadata){if(String(editable.vendor_name??'')!==String(stock.vendor.name??''))stock.vendor.name=String(editable.vendor_name??'');if(String(editable.length_unit??'')!==String(stock.vendor.lengthUnit??''))stock.vendor.lengthUnit=String(editable.length_unit??'');}
  const p=projectFromStock(stock, String(editable.filename??metadata?.filename??current.filename));p.vendorVersion=String(editable.vendor_version??metadata?.vendorVersion??current.vendorVersion);p.looms=[];
  const lengthDisplay=metadata?metadata.lengthDisplay:current.lengthDisplay;
  if(lengthDisplay!==undefined)p.lengthDisplay=clone(checkLengthDisplay(lengthDisplay));
  if(metadata?.stockLooms)p.stockLooms=true;
  let mappings=[];
  if(book.Sheets._Categories)mappings=records(book,'_Categories',X,['sheet','category','kind']);
  else mappings=book.SheetNames.filter(n=>!RESERVED.includes(n)).map(n=>({sheet:n,category:n,kind:'cables'}));
  if(!mappings.length)throw new Error('No category worksheets found.');
  const mapped=new Set(),categories=new Set();
  for(const map of mappings){
    if(!book.Sheets[map.sheet])throw new Error(`Mapped worksheet ${map.sheet} is missing. Remove its mapping row if you intend to remove the category.`);
    if(mapped.has(map.sheet)||categories.has(`${map.kind}:${map.category}`))throw new Error('Duplicate worksheet or category mapping.');
    if(!map.category || !safeKey(map.category))throw new Error('Invalid category name in mapping sheet.');
    mapped.add(map.sheet);categories.add(`${map.kind}:${map.category}`);
    if(map.kind==='looms'){
      selectLoomCategory(p,map.category);
      for(const row of records(book,map.sheet,X,LOOM_COLUMNS))p.looms.push({...custom(row.custom_json,['id','name','lengths','description','components'],'Loom custom fields'),...(map.category!==LOOM_CATEGORY?{category:map.category}:{}),id:String(row.key||uid()),name:String(row.name),lengths:importedLengths(row.lengths),description:String(row.description),components:[]});
    }else if(map.kind==='cables'){
      p.stock.cables[map.category]=[];p.rowIds[map.category]=[];
      for(const row of records(book,map.sheet,X,CABLE_COLUMNS.filter(c=>c!=='adaptor'),['adaptor'])){
        const base=metadata?.sourceRows?.[map.category]?.[row.key];
        const result=base?clone(base):{};
        const jsonChanged=!base||String(row.connectors_json)!==json(base.connectors??{});
        const connectors=jsonChanged?jsonObject(row.connectors_json,'Connectors'):clone(base.connectors);
        const start=String(row.start_connector),end=String(row.end_connector);
        const original=base||{direction:row.direction,connectors};
        const originalStart=getCell(original,'start'),originalEnd=getCell(original,'end');
        const remapDirection=base&&!jsonChanged&&cableDirection(row.direction)&&cableDirection(row.direction)!==cableDirection(base.direction)&&(sameGenderDirection(row.direction)||sameGenderDirection(base.direction));
        if(remapDirection){if(!object(connectors))throw new Error('Repair connectors_json before changing direction.');setCell({direction:base.direction,connectors},'direction',String(row.direction));}
        // Preserve unknown connector fields and exact shape unless the endpoint cells changed.
        if(start!==originalStart||end!==originalEnd){
          if(!object(connectors))throw new Error('Repair connectors_json before editing connector endpoints.');
          if(base&&jsonChanged&&(start!==getCell({direction:row.direction,connectors},'start')||end!==getCell({direction:row.direction,connectors},'end')))throw new Error(`${row.name}: endpoint cells conflict with edited connectors_json. Make the two representations agree.`);
          if(cableDirection(row.direction)==='bidirectional'){
            if(start!==end)throw new Error(`${row.name}: bidirectional end connectors must match. Change direction or use connectors_json explicitly.`);
            connectors.end=start;
          }else{const edited={direction:row.direction,connectors};setCell(edited,'start',start);setCell(edited,'end',end);}
        }
        if(!base||String(row.name)!==String(base.name??''))result.name=String(row.name);
        if(!base||String(row.direction)!==String(base.direction??''))result.direction=String(row.direction);
        if(!base||jsonChanged||remapDirection||start!==originalStart||end!==originalEnd)result.connectors=connectors;
        const baseLengths=base?(Array.isArray(base.lengths)?base.lengths.join(', '):json(base.lengths)??''):null;
        if(!base||String(row.lengths)!==baseLengths)result.lengths=importedLengths(row.lengths);
        for(const key of Object.keys(omit(result,['name','direction','connectors','lengths'])))delete result[key];
        Object.assign(result,custom(row.custom_json,['name','direction','lengths','connectors'],'Cable custom fields'));
        p.stock.cables[map.category].push(result);
        p.rowIds[map.category].push(String(row.key||uid()));
        if(row.adaptor!==undefined&&!['','yes','no','true','false'].includes(String(row.adaptor).toLowerCase()))throw new Error('Adaptor must be yes or no.');
        setCableAdaptor(p,map.category,p.rowIds[map.category].length-1,['yes','true'].includes(String(row.adaptor).toLowerCase()));
      }
      if(new Set(p.rowIds[map.category]).size!==p.rowIds[map.category].length)throw new Error(`Duplicate row keys in ${map.category}.`);
    }else throw new Error(`Unknown category kind: ${map.kind}.`);
  }
  for(const name of book.SheetNames)if(!RESERVED.includes(name)&&!mapped.has(name))throw new Error(`Worksheet ${name} is not mapped. Add it to _Categories before importing.`);
  if(new Set(p.looms.map(l=>l.id)).size!==p.looms.length)throw new Error('Duplicate loom keys.');
  if(book.Sheets._Components){
    for(const row of records(book,'_Components',X,COMPONENT_COLUMNS)){
      const loom=p.looms.find(l=>l.id===String(row.loom_key));if(!loom)throw new Error(`Component refers to missing loom ${row.loom_key}.`);
      const count=Number(row.count);if(!Number.isInteger(count)||count<=0)throw new Error('Component count must be a positive integer.');
      const c={...custom(row.custom_json,['id','type','count','connectors','lengths'],'Component custom fields'),id:String(row.component_key||uid()),type:String(row.type),count,connectors:jsonObject(row.connectors_json,'Component connectors'),lengths:importedLengths(row.lengths)};
      if(loom.components.some(x=>x.id===c.id))throw new Error('Duplicate component key.');loom.components.push(c);
    }
  }
  if(!metadata)notices.push('No metadata sheet: current vendor metadata will be retained.');
  p.baseline=snapshot(p);
  return {project:p,partial:metadata?.scope==='category'||!metadata,categories:mappings,notices};
}
export function replaceWorkbook(current,incoming,partial,mappings) {
  if(!partial){const result=clone(incoming);result.baseline=clone(current.baseline);return result;}
  const result=clone(current);
  if(mappings.some(map=>map.kind==='looms')&&incoming.stockLooms)result.stockLooms=true;
  for(const map of mappings){if(map.kind==='looms'){replaceProjectLooms(result,map.category,clone(projectLoomRows(incoming,map.category)));selectLoomCategory(result,map.category);}else{result.stock.cables[map.category]=clone(incoming.stock.cables[map.category]);result.rowIds[map.category]=clone(incoming.rowIds[map.category]);result.stock.cables[map.category].forEach((_,i)=>setCableAdaptor(result,map.category,i,isCableAdaptor(incoming,map.category,i)));}}
  return result;
}
