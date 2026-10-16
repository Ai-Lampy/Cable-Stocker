// Generator state is deliberately separate from Lampy runtime stock JSON.
export const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value) ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
export const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
export const uid = () => globalThis.crypto?.randomUUID?.() || `row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export const safeKey = key => !['__proto__', 'prototype', 'constructor'].includes(key);
export function parseJSON(text) {
  return JSON.parse(text, (key, value) => {
    if (!safeKey(key)) throw new Error(`Unsafe property name: ${key}`);
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('JSON contains a number outside the supported finite range.');
    return value;
  });
}
export function checkStock(stock) {
  if (!object(stock) || !object(stock.vendor) || !object(stock.cables)) throw new Error('Expected a Lampy document containing vendor and cables objects. Your current draft has not changed.');
  for (const [category, rows] of Object.entries(stock.cables)) {
    if (!safeKey(category) || !Array.isArray(rows) || rows.some(row => !object(row))) throw new Error(`Category ${category} must contain an array of cable objects.`);
  }
  return stock;
}
export function projectFromStock(stock, filename = '') {
  checkStock(stock);
  const project = {format: 'lampy-cable-generator-project', formatVersion: 1, stock: clone(stock), filename, vendorVersion: '', looms: [], rowIds: {}, baseline: null};
  importStockLooms(project);
  for (const [category, rows] of Object.entries(stock.cables)) project.rowIds[category] = rows.map(uid);
  project.baseline = snapshot(project);
  return project;
}
export function snapshot(project) {
  const {baseline, ...rest} = project;
  return clone(rest);
}
// Stock looms use the approved catalogue shape; editor-only details stay in backups.
const extraFields = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
export function stockLoomJSON(loom) {
  return {...clone(loom.stockFields || {}),id:loom.id,name:loom.name,lengths:clone(loom.lengths),cables:loom.components.map(c => ({...clone(c.stockFields || {}),cableType:c.type,quantity:c.count}))};
}
function importStockLooms(project) {
  if (!Object.hasOwn(project.stock,'looms')) return;
  const source=project.stock.looms;
  if (!Array.isArray(source)) throw new Error('Stock looms must be an array.');
  const ids=new Set();
  for (const loom of source) {
    if (!object(loom) || typeof loom.id!=='string' || !loom.id.trim() || ids.has(loom.id)) throw new Error('Stock looms need unique, non-empty string IDs.');
    if (typeof loom.name!=='string' || !Array.isArray(loom.lengths) || !Array.isArray(loom.cables) || loom.cables.some(c=>!object(c)||typeof c.cableType!=='string')) throw new Error('Each stock loom needs a name, lengths array and cables array with cableType text.');
    ids.add(loom.id);
    const imported={id:loom.id,name:loom.name,lengths:clone(loom.lengths),description:'',components:loom.cables.map((c,index)=>{
      const component={id:`${loom.id}:component:${index+1}`,type:c.cableType,count:c.quantity,connectors:{},lengths:[]},fields=extraFields(c,['cableType','quantity']);
      if (Object.keys(fields).length) component.stockFields=clone(fields);
      return component;
    })};
    const fields=extraFields(loom,['id','name','lengths','cables']);
    if (Object.keys(fields).length) imported.stockFields=clone(fields);
    const existing=project.looms.find(l=>l.id===loom.id);
    if (existing && !same(stockLoomJSON(existing),stockLoomJSON(imported))) throw new Error('Project contains conflicting stock and editor looms. Keep the original backup for recovery.');
    if (!existing) project.looms.push(imported);
  }
  project.stockLooms=true;
  delete project.stock.looms;
}
export function restoreProject(value) {
  if (value.format !== 'lampy-cable-generator-project' || value.formatVersion !== 1) throw new Error('Unsupported generator project format.');
  checkStock(value.stock);
  const p = clone(value);
  checkLengthDisplay(p.lengthDisplay);checkLengthDisplay(p.baseline?.lengthDisplay);
  if (p.adaptors !== undefined && (!object(p.adaptors) || Object.values(p.adaptors).some(v=>v!==true))) throw new Error('Invalid adaptor markers.');
  if (!Array.isArray(p.looms) || !object(p.rowIds)) throw new Error('Incomplete generator project.');
  importStockLooms(p);
  for (const [cat, rows] of Object.entries(p.stock.cables)) {
    if (!Array.isArray(p.rowIds[cat]) || p.rowIds[cat].length !== rows.length || new Set(p.rowIds[cat]).size !== rows.length) throw new Error(`Invalid row keys in ${cat}.`);
  }
  if (!p.baseline) p.baseline = snapshot(p);
  checkStock(p.baseline.stock);
  if (!object(p.baseline.rowIds) || !Array.isArray(p.baseline.looms)) throw new Error('Invalid project baseline.');
  importStockLooms(p.baseline);
  if (typeof p.filename !== 'string' || typeof p.vendorVersion !== 'string') throw new Error('Invalid project filename or version.');
  for (const loom of [...p.looms, ...p.baseline.looms]) {
    if (!object(loom) || typeof loom.id !== 'string' || typeof loom.name !== 'string' || !Array.isArray(loom.lengths) || !Array.isArray(loom.components)) throw new Error('Invalid generator loom structure.');
    for (const c of loom.components) if (!object(c) || typeof c.id !== 'string' || typeof c.type !== 'string' || !object(c.connectors) || !Array.isArray(c.lengths)) throw new Error('Invalid generator component structure.');
  }
  return p;
}
export const LENGTH_DISPLAYS = {m:['m','Meter'],ft:['ft',"'",'Feet']};
export function checkLengthDisplay(value){
  if(value!==undefined&&(!object(value)||Object.entries(value).some(([unit,label])=>!LENGTH_DISPLAYS[unit]?.includes(label))))throw new Error('Invalid length display preference.');
  return value;
}
export function lengthUnitLabel(project,unit=project.stock.vendor.lengthUnit){
  const label=project.lengthDisplay?.[unit];return LENGTH_DISPLAYS[unit]?.includes(label)?label:unit;
}
export function formatLength(value,project){
  if(value==='')return '';
  const unit=lengthUnitLabel(project);return `${value}${unit==="'"?'':' '}${unit||''}`.trim();
}
export function newProject(name = '') {
  const project=projectFromStock({vendor: {name, lengthUnit: 'm'}, cables: {}});
  project.vendorVersion='v1';project.baseline=snapshot(project);return project;
}
// Delete only the current project data; preserve the imported baseline for review/undo.
export function removeProjectCategory(project,category,{looms=false}={}) {
  if(looms){project.looms=[];project.loomTab=false;return;}
  if(!Object.hasOwn(project.stock.cables,category))return;
  for(const id of project.rowIds[category]||[])if(project.adaptors)delete project.adaptors[id];
  delete project.stock.cables[category];delete project.rowIds[category];
}
export function runtimeJSON(project) {
  const stock=clone(project.stock);
  if (project.looms.length || project.stockLooms) stock.looms=project.looms.map(stockLoomJSON);
  return stock;
}
export function parseLengths(text) {
  const tokens = String(text).trim().split(/[\s,;]+/).filter(Boolean);
  const values = [], duplicates = [];
  for (const token of tokens) {
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token) || !Number.isFinite(Number(token)) || Number(token) <= 0) throw new Error(`“${token}” is not a positive numeric length. Use decimals with a dot.`);
    const n = Number(token);
    if (values.includes(n)) duplicates.push(n); else values.push(n);
  }
  return {values, duplicates};
}
export function combineLengths(existing, incoming, mode) {
  if (mode === 'cancel') return clone(existing);
  return mode === 'replace' ? clone(incoming) : [...new Set([...existing, ...incoming])];
}
export function referenceMatch(entries, text) {
  const needle = String(text).toLocaleLowerCase();
  return entries.find(r => [r.name, ...(r.aliases || [])].some(n => String(n).toLocaleLowerCase() === needle));
}
export function defaultCable(ref, wording) {
  return {name: wording || ref?.name || '', direction: ref?.direction || 'male-female', connectors: clone(ref?.connectors || {male: '', female: ''}), lengths: []};
}
export function inheritCableConnectors(row,entries){
  const ref=referenceMatch(entries,String(row.name||'').trim());if(!ref||!object(ref.connectors))return false;
  const before=clone(row);if(row.connectors==null)row.connectors={};if(!object(row.connectors))return false;
  const populated=Object.values(row.connectors).some(v=>typeof v==='string'&&v.trim());
  if(!populated&&['male-female','bidirectional'].includes(ref.direction))row.direction=ref.direction;
  if(row.direction===ref.direction){
    const keys=row.direction==='male-female'?['male','female']:['end'];
    for(const key of keys)if((row.connectors[key]==null||(typeof row.connectors[key]==='string'&&!row.connectors[key].trim()))&&typeof ref.connectors[key]==='string'&&ref.connectors[key].trim())row.connectors[key]=ref.connectors[key];
  }
  return !same(before,row);
}
// Review is derived from connector references, so it survives JSON and Excel round trips
// without adding generator fields to Lampy's cable-stock schema.
export function fillCableConnectors(project,refs){
  let changed=false;
  for(const rows of Object.values(project.stock.cables))for(const row of rows){
    changed=inheritCableConnectors(row,refs.cable_types.items)||changed;
    const name=String(row.name||'').trim();if(!name)continue;
    const keys=row.direction==='male-female'?['male','female']:row.direction==='bidirectional'?['end']:[];
    if(!keys.length)continue;
    if(row.connectors==null){row.connectors={};changed=true;}
    if(!object(row.connectors))continue;
    for(const key of keys)if(row.connectors[key]==null||(typeof row.connectors[key]==='string'&&!row.connectors[key].trim())){row.connectors[key]=name;changed=true;}
  }
  return changed;
}
export function connectorReviews(project,refs){
  const reviews=new Map();
  for(const [category,rows]of Object.entries(project.stock.cables))rows.forEach((row,index)=>{
    if(!object(row.connectors))return;
    const keys=row.direction==='male-female'?['male','female']:row.direction==='bidirectional'?['end']:[];
    for(const key of keys){const value=row.connectors[key];if(typeof value!=='string'||!value.trim()||referenceMatch(refs.connector_types.items,value.trim()))continue;
      const name=value.trim(),id=name.toLocaleLowerCase();
      if(!reviews.has(id))reviews.set(id,{name,usages:[]});
      reviews.get(id).usages.push({category,row:index,key});
    }
  });return [...reviews.values()];
}
export function approveConnector(project,refs,pendingName,approvedName){
  const name=String(approvedName||'').trim();if(!name)throw new Error('Enter a connector name before approval.');
  const review=connectorReviews(project,refs).find(r=>r.name.toLocaleLowerCase()===pendingName.toLocaleLowerCase());
  if(!review)throw new Error('This connector no longer needs review.');
  for(const use of review.usages)project.stock.cables[use.category][use.row].connectors[use.key]=name;
  if(!referenceMatch(refs.connector_types.items,name))refs.connector_types.items.push({id:uid(),name,aliases:[],category:[...new Set(review.usages.map(use=>use.category))].length===1?review.usages[0].category:''});
}
export function cableNeedsConnectorInputs(row,entries){
  if(!referenceMatch(entries,String(row.name||'').trim())||!object(row.connectors))return true;
  const keys=row.direction==='male-female'?['male','female']:row.direction==='bidirectional'?['end']:[];
  return !keys.length||keys.some(key=>typeof row.connectors[key]!=='string'||!row.connectors[key].trim());
}
export function syncVendorManifest(refs) {
  const entries=refs.manifest.catalogues, names=new Set(entries.map(x=>String(x.vendor).trim().toLowerCase()));
  const paths=new Set(entries.map(x=>String(x.file).toLowerCase()));
  for(const vendor of refs.lighting_vendors.vendors){
    const name=String(vendor.name||'').trim();if(!name||names.has(name.toLowerCase()))continue;
    const stem=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'vendor';
    let file=`json/cable/${stem}_cable.json`,n=2;
    while(paths.has(file.toLowerCase()))file=`json/cable/${stem}_${n++}_cable.json`;
    entries.push({vendor:name,file});names.add(name.toLowerCase());paths.add(file.toLowerCase());
  }
  return entries;
}
export function categoryCables(name, refs) {
  const category=referenceMatch(refs.categories.items,name);
  if(!category)return [];
  return refs.cable_types.items.filter(c=>referenceMatch(refs.categories.items,c.category)?.id===category.id).map(c=>({row:defaultCable(c),adaptor:c.adaptor===true}));
}
export function isCableAdaptor(project, category, index) {
  return project.adaptors?.[project.rowIds[category]?.[index]]===true;
}
export function setCableAdaptor(project, category, index, value) {
  project.adaptors ||= {};const id=project.rowIds[category][index];
  if(value)project.adaptors[id]=true;else delete project.adaptors[id];
}
export function colourSuggestions(value,palette){
  const query=String(value??'').trim().toLowerCase();
  return [['',{names:[palette.noColour.name,...palette.noColour.aliases]}],...Object.entries(palette.colours)]
    .filter(([code,item])=>!query||[code,...item.names].some(name=>name.toLowerCase().includes(query)))
    .map(([value,item])=>({value,label:item.names[0],background:value||'#fff',color:item.fontColour||'#233128'}));
}
export function resolveColour(value, palette) {
  const text=String(value??'').trim(),key=text.toLowerCase();
  if(!text||[palette.noColour.name,...palette.noColour.aliases].some(x=>x.toLowerCase()===key))return '';
  const matches=Object.entries(palette.colours).filter(([hex,c])=>hex.toLowerCase()===key||c.names.some(n=>n.toLowerCase()===key));
  if(matches.length!==1)throw new Error(matches.length?'Ambiguous colour alias. Use a full colour name.':'Choose a colour from colour_options.json.');
  return matches[0][0];
}
export function validateLengthColours(data,palette) {
  const issues=[],seen=new Set();
  const add=(row,field,message)=>issues.push({level:'error',category:'Settings: length_colours',row,field,message,fix:'Choose a vendor, unit, positive length and colours from the supplied palette.'});
  data.items.forEach((r,i)=>{
    if(typeof r.vendor!=='string'||!r.vendor.trim())add(i,'vendor','Vendor is required.');
    if(!['m','ft'].includes(r.unit))add(i,'unit','Choose m or ft.');
    if(typeof r.length!=='number'||!Number.isFinite(r.length)||r.length<=0)add(i,'length','Length must be a positive number.');
    const key=JSON.stringify([String(r.vendor).trim().toLowerCase(),r.unit,r.length]);if(seen.has(key))add(i,'length','Duplicate vendor, unit and length.');seen.add(key);
    for(const field of ['colour1','colour2','colour3'])try{resolveColour(r[field],palette);}catch(e){add(i,field,e.message);}
  });return issues;
}
export function getCell(row, key) {
  if(['start','end'].includes(key)&&row.direction==='bidirectional')return row.connectors?.end??'';
  if (key === 'start') return row.connectors?.male ?? row.connectors?.end ?? '';
  if (key === 'end') return row.connectors?.female ?? row.connectors?.end ?? '';
  if (key === 'custom') return Object.fromEntries(Object.entries(row).filter(([k]) => !['name','direction','connectors','lengths'].includes(k)));
  return row[key];
}
export function setCell(row, key, value) {
  if (key === 'start' || key === 'end') {
    if (!object(row.connectors)) row.connectors = {};
    if (row.direction === 'bidirectional') row.connectors.end = value;
    else row.connectors[key === 'start' ? 'male' : 'female'] = value;
  } else if (key === 'custom') {
    if (!object(value)) throw new Error('Custom fields must be a JSON object.');
    for (const k of ['name','direction','connectors','lengths']) if (Object.hasOwn(value, k)) throw new Error(`Edit ${k} in its own column.`);
    for (const k of Object.keys(getCell(row, 'custom'))) delete row[k];
    Object.assign(row, value);
  } else {
    if (key === 'connectors' && !object(value)) throw new Error('Connectors must be a JSON object.');
    row[key] = value;
  }
}
export function baselineRow(project, category, index) {
  const id = project.rowIds[category]?.[index];
  const oldIndex = project.baseline?.rowIds?.[category]?.indexOf(id) ?? -1;
  return oldIndex < 0 ? undefined : project.baseline.stock.cables[category]?.[oldIndex];
}
// Plain stock JSON has no row IDs. Reconcile a preview copy only; importing
// still establishes a fresh baseline. Stock looms have their own stable IDs.
export function stockImportChanges(incoming, current) {
  const preview = clone(incoming);
  for (const [category, rows] of Object.entries(preview.stock.cables)) {
    const oldRows = current.stock.cables[category] || [];
    const available = new Set(oldRows.map((_, i) => i));
    const matched = new Map();
    rows.forEach((row, i) => {
      const old = [...available].find(j => same(row, oldRows[j]));
      if (old !== undefined) { matched.set(i, old); available.delete(old); }
    });
    const unmatched = rows.map((_, i) => i).filter(i => !matched.has(i));
    for (const i of unmatched) {
      const name = rows[i].name;
      if (typeof name !== 'string' || !name.trim()) continue;
      const candidates = [...available].filter(j => oldRows[j].name === name);
      if (candidates.length === 1 && unmatched.filter(j => rows[j].name === name).length === 1) {
        matched.set(i, candidates[0]); available.delete(candidates[0]);
      }
    }
    preview.rowIds[category] = rows.map((_, i) => matched.has(i) ? current.rowIds[category][matched.get(i)] : uid());
  }
  const baseline=snapshot(current);
  // Compare exported loom data, not regenerated editor component IDs or backup-only fields.
  preview.looms=preview.looms.map(stockLoomJSON);
  baseline.looms=baseline.looms.map(stockLoomJSON);
  return changes(preview, baseline);
}
export function changes(project, baseline = project.baseline) {
  if (!baseline) return [];
  const result = [];
  if (!same(project.stock.vendor, baseline.stock.vendor)) result.push({category:'Vendor', kind:'modified', name:'Vendor metadata'});
  if (!same(Object.fromEntries(Object.entries(project.stock).filter(([k]) => !['vendor','cables'].includes(k))), Object.fromEntries(Object.entries(baseline.stock).filter(([k]) => !['vendor','cables'].includes(k))))) result.push({category:'Vendor',kind:'modified',name:'Root custom fields'});
  if (project.vendorVersion !== baseline.vendorVersion) result.push({category:'Vendor',kind:'modified',name:'Generator vendor version'});
  if (project.filename !== baseline.filename) result.push({category:'Vendor',kind:'modified',name:'Output filename'});
  for (const cat of new Set([...Object.keys(baseline.stock.cables), ...Object.keys(project.stock.cables)])) {
    const oldRows = baseline.stock.cables[cat] || [], rows = project.stock.cables[cat] || [];
    if (!(cat in baseline.stock.cables)) result.push({category:cat,kind:'added',name:'Category'});
    if (!(cat in project.stock.cables)) result.push({category:cat,kind:'removed',name:'Category'});
    const oldIds = baseline.rowIds[cat] || [], ids = project.rowIds[cat] || [];
    if (!same(ids.filter(id => oldIds.includes(id)), oldIds.filter(id => ids.includes(id)))) result.push({category:cat,kind:'modified',name:'Row order'});
    rows.forEach((row, i) => {
      const old = oldIds.indexOf(ids[i]);
      if (old < 0 || !same(row, oldRows[old]) || !!project.adaptors?.[ids[i]] !== !!baseline.adaptors?.[oldIds[old]]) result.push({category:cat,kind:old < 0 ? 'added':'modified',name:row.name || `Row ${i + 1}`});
    });
    oldRows.forEach((row, i) => { if (!ids.includes(oldIds[i])) result.push({category:cat,kind:'removed',name:row.name || `Row ${i+1}`}); });
  }
  for (const loom of project.looms) {
    const old = baseline.looms?.find(x => x.id === loom.id);
    if (!old || !same(old, loom)) result.push({category:'Stock / Pre-Made Looms',kind:old ? 'modified':'added',name:loom.name});
  }
  for (const loom of baseline.looms || []) if (!project.looms.some(x => x.id === loom.id)) result.push({category:'Stock / Pre-Made Looms',kind:'removed',name:loom.name});
  return result;
}
export function validate(project, refs) {
  const issues = [];
  const add = (level, category, row, field, message, fix) => issues.push({level,category,row,field,message,fix});
  if (typeof project.stock.vendor.name !== 'string' || !project.stock.vendor.name.trim()) add('error','Vendor',null,'name','Vendor name is empty or invalid.','Enter the vendor name.');
  if (!['m','ft'].includes(project.stock.vendor.lengthUnit)) add('error','Vendor',null,'lengthUnit','Unknown length unit.','Choose metres or feet. Numbers will not be converted.');
  if (!project.filename || !/^[^/\\]+\.json$/i.test(project.filename)) add('warning','Vendor',null,'filename','Output filename is not confirmed.','Use the imported filename or the exact manifest filename.');
  const expectedFile = refs?.manifest?.catalogues.find(r => r.vendor === project.stock.vendor.name)?.file?.split('/').at(-1);
  if (expectedFile && project.filename && project.filename !== expectedFile) add('warning','Vendor',null,'filename',`The manifest expects ${expectedFile}, but the output filename is ${project.filename}.`,'Confirm the intended filename before replacing a Lampy file.');
  if (project.vendorVersion && !/^v\d+(?:\.\d+)?$/.test(project.vendorVersion)) add('warning','Vendor',null,'vendorVersion','Use a vendor version such as v2 or v2.1.','Edit the generator vendor version.');
  const lengths = (values, category, row, field = 'lengths') => {
    if (!Array.isArray(values) || values.some(n => typeof n !== 'number' || !Number.isFinite(n) || n <= 0)) add('error',category,row,field,'Lengths must be an array of positive numbers.','Edit lengths; remove invalid values.');
    else {
      if (!values.length) add('warning',category,row,field,'No available lengths.','Add at least one length.');
      if (new Set(values).size !== values.length) add('warning',category,row,field,'Duplicate lengths.','Remove repeated lengths.');
    }
  };
  for (const [category, rows] of Object.entries(project.stock.cables)) {
    const names = new Set();
    rows.forEach((row, i) => {
      if (typeof row.name !== 'string' || !row.name.trim()) add('error',category,i,'name','Cable name is empty or invalid.','Enter a cable type or alias.');
      else if (names.has(row.name.toLowerCase())) add('warning',category,i,'name',`Duplicate cable name: ${row.name}.`,'Check whether this is a deliberate variant.');
      names.add(String(row.name).toLowerCase());
      lengths(row.lengths,category,i);
      if (!['male-female','bidirectional'].includes(row.direction)) add('warning',category,i,'direction','Direction is not demonstrated by the source schema.','Use male-female or bidirectional, or verify compatibility.');
      if (!object(row.connectors)) add('error',category,i,'start','Connectors are invalid.','Enter the connectors using the connector columns.');
      else {
        const keys = row.direction === 'male-female' ? ['male','female'] : row.direction === 'bidirectional' ? ['end'] : [];
        for (const key of keys) if (typeof row.connectors[key] !== 'string' || !row.connectors[key].trim()) add('error',category,i,key==='male'?'start':'end',`Missing ${key} connector.`,'Enter the connector in the cable table; recognised cable types inherit reference defaults.');
      }
    });
  }
  if (project.looms.length) add('warning','Stock / Pre-Made Looms',null,'name','Stock looms are included in JSON; Lampy Paperwork needs its planned update to use them.','Keep a project JSON or Excel backup for descriptions, connector overrides and component lengths.');
  const loomIds=new Set();
  project.looms.forEach((loom, i) => {
    if (typeof loom.id!=='string' || !loom.id.trim() || loomIds.has(loom.id)) add('error','Stock / Pre-Made Looms',i,'name','Loom IDs must be non-empty and unique.','Use a unique ID for each stock loom.');
    loomIds.add(loom.id);
    if (!loom.name?.trim()) add('error','Stock / Pre-Made Looms',i,'name','Loom name is required.','Name this packaged item.');
    lengths(loom.lengths,'Stock / Pre-Made Looms',i);
    if (!Array.isArray(loom.components) || !loom.components.length) add('error','Stock / Pre-Made Looms',i,'components','A loom needs components.','Add the cables inside one loom.');
    (loom.components || []).forEach((c, j) => {
      if (typeof c.type!=='string' || !c.type.trim() || !Number.isSafeInteger(c.count) || c.count <= 0) add('error','Stock / Pre-Made Looms',i,'components',`Component ${j+1} needs a type and positive integer count.`,'Count cables inside one loom, not stock quantities.');
      if (c.lengths?.length) lengths(c.lengths,'Stock / Pre-Made Looms',i,'components');
    });
  });
  if (refs) issues.push(...validateReferences(refs));
  return issues;
}
export function validateReferences(refs) {
  const issues = [];
  const add = (category,row,field,message) => issues.push({level:'error',category:`Settings: ${category}`,row,field,message,fix:'Correct this reference cell, or undo the edit.'});
  for (const [key, data] of Object.entries(refs)) {
    if (key === 'length_colours') continue;
    const rows = data.catalogues || data.vendors || data.items || [];
    const seen = new Map();
    rows.forEach((row,i) => {
      const field = key === 'manifest' ? 'vendor' : 'name';
      if (typeof row[field] !== 'string' || !row[field].trim()) add(key,i,field,'Name is required.');
      const terms = [row[field], ...(row.aliases || [])];
      for (const term of terms) {
        const n = String(term || '').trim().toLowerCase();
        if (n && seen.has(n) && seen.get(n) !== i) add(key,i,field,`Duplicate name or alias: ${term}.`);
        else if (n) seen.set(n,i);
      }
      if (key === 'manifest') {
        if (!relativePath(row.file) || !row.file.endsWith('.json')) add(key,i,'file','Use a relative .json path without .., query strings or a leading slash.');
        if (rows.some((r,j) => j < i && r.file === row.file)) add(key,i,'file','Duplicate catalogue path.');
        if (Object.keys(row).some(k => !['vendor','file'].includes(k))) add(key,i,'file','Manifest entries may contain vendor and file only.');
      }
      if (key === 'lighting_vendors' && row.logo && (!relativePath(row.logo) || !row.logo.startsWith('images/vendor/'))) add(key,i,'logo','Logo must be under images/vendor/ using its original filename.');
      if (key === 'cable_types' && isLoomCategory(row.category,refs)) {
        const loom=referenceLoom(row);
        if(!['m','ft'].includes(loom.lengthUnit))add(key,i,'lengthUnit','Choose metres or feet for this loom.');
        if(!Array.isArray(loom.lengths)||loom.lengths.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<=0))add(key,i,'lengths','Loom lengths must be positive numbers.');
        try{prepareLoomDraft(loom,refs.cable_types.items);}catch(e){add(key,i,'name',e.message);}
      } else if (key === 'cable_types') {
        if (!object(row.connectors)) add(key,i,'connectors','Default connectors must be a JSON object.');
        if (!row.category?.trim()) add(key,i,'category','A default category is required.');
        if (!['male-female','bidirectional'].includes(row.direction)) add(key,i,'direction','Default direction must match the supplied schema.');
      }
    });
  }
  return issues;
}
export function relativePath(path) { return typeof path === 'string' && /^(?![/.\\])(?!.*(?:^|\/)\.\.(?:\/|$))[\p{L}\p{N}_ .\-/]+$/u.test(path) && !path.includes('//'); }
export function normaliseVendorVersion(value){
  const text=String(value??'').trim();
  return /^v?\d+(?:\.\d+)?$/i.test(text)?`v${text.replace(/^v/i,'')}`:text;
}
export function incrementVersion(value, major) {
  const m = /^v(\d+)(?:\.(\d+))?$/.exec(value || 'v0');
  if (!m) throw new Error('Enter a vendor version such as v2 or v2.1 first.');
  return major ? `v${Number(m[1])+1}` : `v${m[1]}.${Number(m[2] || 0)+1}`;
}
export function mergeProjects(current, incoming, partial = false) {
  const result = clone(current);
  if (!partial) {
    result.stock = {...result.stock, ...clone(incoming.stock), cables: clone(current.stock.cables)};
    result.vendorVersion = incoming.vendorVersion;
    if(incoming.lengthDisplay!==undefined)result.lengthDisplay=clone(checkLengthDisplay(incoming.lengthDisplay));else delete result.lengthDisplay;
    result.filename = incoming.filename || current.filename;
    if (incoming.stockLooms) result.stockLooms=true;
  }
  for (const [cat, rows] of Object.entries(incoming.stock.cables)) {
    result.stock.cables[cat] ||= [];
    result.rowIds[cat] ||= [];
    const matched = new Set();
    rows.forEach((row, i) => {
      const id = incoming.rowIds[cat][i];
      let target = result.rowIds[cat].indexOf(id);
      if (target < 0) target = result.stock.cables[cat].findIndex((r,j) => r.name === row.name && !matched.has(j));
      if (target < 0) { target=result.stock.cables[cat].length; result.stock.cables[cat].push(clone(row)); result.rowIds[cat].push(id); }
      else result.stock.cables[cat][target] = clone(row);
      setCableAdaptor(result,cat,target,isCableAdaptor(incoming,cat,i));
      matched.add(target);
    });
  }
  for (const loom of incoming.looms) {
    const i = result.looms.findIndex(l => l.id === loom.id);
    if (i < 0) result.looms.push(clone(loom)); else result.looms[i] = clone(loom);
  }
  return result;
}

// Category sheets preserve original reference objects and category wording.
export function cableTypeSheets(refs){return [...new Set([...(refs.categories?.items||[]).map(r=>r.name),...(refs.cable_types?.items||[]).map(r=>r.category||''),''])];}
export function isLoomCategory(category,refs){return category==='Stock / Pre-Made Looms'||referenceMatch(refs.categories?.items||[],category)?.id==='cat-looms';}
// Legacy reference rows gain editor defaults in memory only, without changing source data.
export function referenceLoom(row){return {lengths:[],components:[],description:'',lengthUnit:'m',...row};}
export function replaceLoomReferences(items,category,looms){
  const remaining=new Map(looms.map(l=>[l.id,l]));
  const result=items.flatMap(row=>{if((row.category||'')!==category)return [row];const next=remaining.get(row.id);remaining.delete(row.id);return next?[next]:[];});
  return result.concat([...remaining.values()]);
}
export function cableTypeRows(rows,category){return rows.filter(r=>(r.category||'')===category);}
export function visibleTableColumns(columns,adaptors=true){return columns.filter(c=>c.type!=='json'&&(adaptors||!['direction','start','end'].includes(c.key)));}

export function connectorTypeCategories(row,refs){
  if(Object.hasOwn(row,'category'))return [row.category||''];
  const categories=[...new Set((refs.cable_types?.items||[]).filter(cable=>object(cable.connectors)&&Object.values(cable.connectors).some(name=>referenceMatch([row],String(name).trim()))).map(cable=>cable.category||''))];
  return categories.length?categories:[''];
}
export function connectorTypeSheets(refs){return [...new Set([...(refs.categories?.items||[]).map(r=>r.name),...(refs.connector_types?.items||[]).flatMap(row=>connectorTypeCategories(row,refs)),''])];}
export function connectorTypeRows(rows,category,refs){return rows.filter(row=>connectorTypeCategories(row,refs).includes(category));}

// View rows reference saved looms; hierarchy never enters project/runtime JSON.
export function loomRows(looms){return looms.flatMap(loom=>[{loom,component:null},...loom.components.map(component=>({loom,component}))]);}
export function loomOrder(rows,expanded,filter='',sort={key:'name',dir:1}){
  const query=filter.trim().toLocaleLowerCase(),groups=[];
  rows.forEach((row,id)=>{if(!row.component)groups.push({row,id,children:[]});else groups.at(-1).children.push(id);});
  const text=row=>[row.loom.name,row.loom.description,...row.loom.lengths,...row.loom.components.flatMap(c=>[c.type,c.count])].join(' ').toLocaleLowerCase();
  const value=row=>sort?.key==='lengths'?row.loom.lengths.join(', '):sort?.key==='description'?row.loom.description||'':row.loom.name;
  groups.sort((a,b)=>String(value(a.row)).localeCompare(String(value(b.row)),undefined,{numeric:true,sensitivity:'base'})*(sort?.dir||1));
  return groups.filter(g=>!query||text(g.row).includes(query)).flatMap(g=>{
    const children=[...g.children].sort((a,b)=>{const x=rows[a].component,y=rows[b].component;return (sort?.key==='count'?x.count-y.count:x.type.localeCompare(y.type,undefined,{numeric:true,sensitivity:'base'}))*(sort?.dir||1);});
    return [g.id,...(expanded.has(g.row.loom.id)||query?children:[])];
  });
}
export function prepareLoomDraft(draft,cableTypes){
  const result=clone(draft);result.name=result.name.trim();
  if(!result.name)throw new Error('Enter a loom name.');
  if(!result.components.length)throw new Error('Add at least one cable type and quantity.');
  for(const c of result.components){
    c.type=c.type.trim();if(!c.type)throw new Error('Enter a cable type for every component.');
    if(!Number.isSafeInteger(Number(c.count))||Number(c.count)<1)throw new Error('Quantity must be a positive whole number.');c.count=Number(c.count);
    if(!Object.keys(c.connectors).length){const ref=referenceMatch(cableTypes,c.type);c.connectors=clone(ref?.connectors||{male:c.type,female:c.type});}
  }
  return result;
}
