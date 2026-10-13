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
  for (const [category, rows] of Object.entries(stock.cables)) project.rowIds[category] = rows.map(uid);
  project.baseline = snapshot(project);
  return project;
}
export function snapshot(project) {
  const {baseline, ...rest} = project;
  return clone(rest);
}
export function restoreProject(value) {
  if (value.format !== 'lampy-cable-generator-project' || value.formatVersion !== 1) throw new Error('Unsupported generator project format.');
  checkStock(value.stock);
  const p = clone(value);
  if (!Array.isArray(p.looms) || !object(p.rowIds)) throw new Error('Incomplete generator project.');
  for (const [cat, rows] of Object.entries(p.stock.cables)) {
    if (!Array.isArray(p.rowIds[cat]) || p.rowIds[cat].length !== rows.length || new Set(p.rowIds[cat]).size !== rows.length) throw new Error(`Invalid row keys in ${cat}.`);
  }
  if (!p.baseline) p.baseline = snapshot(p);
  checkStock(p.baseline.stock);
  if (!object(p.baseline.rowIds) || !Array.isArray(p.baseline.looms)) throw new Error('Invalid project baseline.');
  if (typeof p.filename !== 'string' || typeof p.vendorVersion !== 'string') throw new Error('Invalid project filename or version.');
  for (const loom of [...p.looms, ...p.baseline.looms]) {
    if (!object(loom) || typeof loom.id !== 'string' || typeof loom.name !== 'string' || !Array.isArray(loom.lengths) || !Array.isArray(loom.components)) throw new Error('Invalid generator loom structure.');
    for (const c of loom.components) if (!object(c) || typeof c.id !== 'string' || typeof c.type !== 'string' || !object(c.connectors) || !Array.isArray(c.lengths)) throw new Error('Invalid generator component structure.');
  }
  return p;
}
export function newProject(name = '') { return projectFromStock({vendor: {name, lengthUnit: 'm'}, cables: {}}); }
export function runtimeJSON(project) { return clone(project.stock); }
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
export function getCell(row, key) {
  if (key === 'start') return row.connectors?.male ?? row.connectors?.end ?? '';
  if (key === 'end') return row.connectors?.female ?? row.connectors?.end ?? '';
  if (key === 'custom') return Object.fromEntries(Object.entries(row).filter(([k]) => !['name','direction','connectors','lengths'].includes(k)));
  return row[key];
}
export function setCell(row, key, value) {
  if (key === 'start' || key === 'end') {
    if (!object(row.connectors)) row.connectors = {};
    if (row.direction === 'bidirectional' && !Object.hasOwn(row.connectors, 'male') && !Object.hasOwn(row.connectors, 'female')) row.connectors.end = value;
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
      if (old < 0 || !same(row, oldRows[old])) result.push({category:cat,kind:old < 0 ? 'added':'modified',name:row.name || `Row ${i + 1}`});
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
      if (!object(row.connectors)) add('error',category,i,'connectors','Connectors must be an object.','Enter a connectors JSON object.');
      else {
        const keys = row.direction === 'male-female' ? ['male','female'] : row.direction === 'bidirectional' ? ['end'] : [];
        for (const key of keys) if (typeof row.connectors[key] !== 'string' || !row.connectors[key].trim()) add('error',category,i,'connectors',`Missing ${key} connector.`,'Edit connectors to match the selected direction.');
      }
    });
  }
  if (project.looms.length) add('warning','Stock / Pre-Made Looms',null,'name','Looms are generator backup data only; Lampy runtime support is unverified.','Keep a project JSON or Excel backup. Runtime JSON does not include these looms.');
  project.looms.forEach((loom, i) => {
    if (!loom.name?.trim()) add('error','Stock / Pre-Made Looms',i,'name','Loom name is required.','Name this packaged item.');
    lengths(loom.lengths,'Stock / Pre-Made Looms',i);
    if (!Array.isArray(loom.components) || !loom.components.length) add('error','Stock / Pre-Made Looms',i,'components','A loom needs components.','Add the cables inside one loom.');
    (loom.components || []).forEach((c, j) => {
      if (!c.type?.trim() || !Number.isInteger(c.count) || c.count <= 0) add('error','Stock / Pre-Made Looms',i,'components',`Component ${j+1} needs a type and positive integer count.`,'Count cables inside one loom, not stock quantities.');
      if (!object(c.connectors) || !Object.keys(c.connectors).length || Object.values(c.connectors).some(v => typeof v !== 'string' || !v.trim())) add('error','Stock / Pre-Made Looms',i,'components',`Component ${j+1} needs valid connectors.`,'Select a cable type to inherit connectors, or enter overrides.');
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
      if (key === 'cable_types') {
        if (!object(row.connectors)) add(key,i,'connectors','Default connectors must be a JSON object.');
        if (!row.category?.trim()) add(key,i,'category','A default category is required.');
        if (!['male-female','bidirectional'].includes(row.direction)) add(key,i,'direction','Default direction must match the supplied schema.');
      }
    });
  }
  return issues;
}
export function relativePath(path) { return typeof path === 'string' && /^(?![/.\\])(?!.*(?:^|\/)\.\.(?:\/|$))[\p{L}\p{N}_ .\-/]+$/u.test(path) && !path.includes('//'); }
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
    result.filename = incoming.filename || current.filename;
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
      matched.add(target);
    });
  }
  for (const loom of incoming.looms) {
    const i = result.looms.findIndex(l => l.id === loom.id);
    if (i < 0) result.looms.push(clone(loom)); else result.looms[i] = clone(loom);
  }
  return result;
}
