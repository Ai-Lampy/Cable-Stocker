import {restoreProject,parseJSON} from './model.js';

export function vendorProjectFilename(name,vendors=[]){
  const stem=value=>String(value).trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  const value=String(name||'').trim(),base=stem(value);
  if(!base||base.length>160)throw new Error('Enter a vendor name with letters or numbers (up to 160 filename characters).');
  if(vendors.some(v=>v.name.trim().toLowerCase()!==value.toLowerCase()&&stem(v.name)===base))throw new Error('Two vendor names produce the same project filename. Give these vendors distinct names before saving or loading.');
  return `${base}.lampy-project.json`;
}
export async function loadVendorProject(name,vendors,fetcher=fetch){
  const path=`projects/${vendorProjectFilename(name,vendors)}`;
  const response=await fetcher(path,{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(response.status===404)return null;
  if(!response.ok)throw new Error(`Could not load saved project (${response.status}). Your current draft is unchanged.`);
  const project=restoreProject(parseJSON(await response.text()));
  if(String(project.stock.vendor.name).trim().toLowerCase()!==name.trim().toLowerCase())throw new Error('Saved project vendor does not match your selection. Your current draft is unchanged.');
  return project;
}
