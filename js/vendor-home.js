import {clone,parseJSON,relativePath,normaliseVendorVersion} from './model.js';
import {RiggingStore,blankRigging,importRigging} from './rigging.js';

// Read the selected vendor's retained Rigging project without changing either
// workspace. Opening Home must not replace the last active Rigging draft.
export async function homeRigging(workspace,storage,name,read){
  const store=new RiggingStore(storage),active=store.load();
  let project=workspace.get('rigging',name)?.project;
  if(!project&&active?.project.catalogue.vendor.name===name)project=active.project;
  if(!project){
    const published=await read('data/rigging_manifest.json');
    const raw=storage.getItem('lampy-rigging:references:1');
    const manifest=raw?parseJSON(raw).refs?.rigging_manifest||published:published;
    const entry=manifest.catalogues.find(r=>r.vendor.toLocaleLowerCase()===name.toLocaleLowerCase());
    if(entry){if(!relativePath(entry.file))throw Error('Rigging catalogue path must be relative.');project=importRigging(await read(entry.file));}
    else project=blankRigging(name);
  }
  project=importRigging(project);
  if(project.catalogue.vendor.name.toLocaleLowerCase()!==name.toLocaleLowerCase())throw Error('Rigging catalogue vendor does not match the selected vendor.');
  return {project,save(next){
    if(storage.getItem('lampy-rigging:draft:1')!==store.raw)throw Error('Another tab changed Rigging. Reload before editing its setup.');
    workspace.check();
    if(active&&active.project.catalogue.vendor.name!==name)workspace.archive('rigging',active.project,active.dirty);
    workspace.archive('rigging',next,true);store.save(next,true);project=clone(next);
  }};
}

export async function renderHomeRigging(host,{workspace,storage,name,read,notice,open}){
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
  host.append(el('h2','Rigging'),el('p',name?'Loading this vendor’s rigging setup…':'Choose a vendor above to set up Rigging.'));
  if(!name||!workspace)return;
  try{
    const state=await homeRigging(workspace,storage,name,read);if(!host.isConnected)return;
    host.replaceChildren(el('h2','Rigging'));
    const form=el('div');form.className='rigging-fields';
    for(const [label,key,value]of [['Catalogue version','version',state.project.catalogue.catalogueVersion||''],['Rigging output filename','filename',state.project.filename]]){
      const l=el('label',label),input=el('input');input.value=value;input.dataset.draftValue=value;input.setAttribute('aria-label',label);
      input.onchange=()=>{try{const next=clone(state.project);if(key==='version')next.catalogue.catalogueVersion=normaliseVendorVersion(input.value);else next.filename=input.value;state.save(next);state.project=next;input.value=key==='version'?next.catalogue.catalogueVersion:next.filename;input.dataset.draftValue=input.value;notice('Rigging setup saved locally.');}catch(e){notice(e.message,true);}};l.append(input);form.append(l);
    }
    const count=Object.values(state.project.catalogue.categories).reduce((n,r)=>n+r.length,0),button=el('button','Open Rigging');button.type='button';button.className='primary';button.onclick=open;
    host.append(el('p',`${count} items · ${Object.keys(state.project.catalogue.categories).length} categories`),form,button);
  }catch(e){if(host.isConnected)host.append(el('p','Rigging setup unavailable: '+e.message));}
}
