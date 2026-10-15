import {vendorProjectFilename,loadVendorProject} from './vendor-projects.js';
import {watchUpdates, safeRefresh, freshDocumentURL} from './updates.js';
import {APP_VERSION} from './version.js';
import {loomRows,loomOrder,prepareLoomDraft,clone,same,uid,cableTypeSheets,cableTypeRows,connectorTypeSheets,connectorTypeRows,connectorTypeCategories,visibleTableColumns,object,safeKey,parseJSON,projectFromStock,restoreProject,newProject,snapshot,runtimeJSON,stockLoomJSON,parseLengths,combineLengths,referenceMatch,defaultCable,inheritCableConnectors,fillCableConnectors,connectorReviews,approveConnector,cableNeedsConnectorInputs,getCell,setCell,baselineRow,stockImportChanges,syncVendorManifest,categoryCables,isCableAdaptor,setCableAdaptor,colourSuggestions,resolveColour,validateLengthColours,changes,validate,normaliseVendorVersion,incrementVersion,mergeProjects,relativePath} from './model.js';
import {Grid,display,sortedLengths} from './grid.js';
import {toWorkbook,fromWorkbook,replaceWorkbook} from './excel.js';

const $=selector=>document.querySelector(selector);
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,fn,cls)=>{const b=node('button',text,cls);b.type='button';b.onclick=fn;return b;};
const field=(label,value,onchange,{type='text',list,help}={})=>{
  const l=node('label',label),input=node(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;
  input.value=value??'';input.dataset.draftValue=input.value;if(list)input.setAttribute('list',list);input.onchange=()=>onchange(input.value,input);l.append(input);if(help)l.append(node('small',help));return l;
};
const KEYS={draft:'lampy-cable:draft:1',prefs:'lampy-cable:references:1'};
const LOOMS='Stock / Pre-Made Looms';
const REF_NAMES={categories:'Categories',cable_types:'Cable Types',connector_types:'Connectors',lighting_vendors:'Lighting Vendors',manifest:'Vendor Manifest',length_colours:'Length colour'};
let colourPalette={},project=newProject(),refs={},referenceBaseline={},referenceExports={},dirty=false,refDirty=false,page='vendor',settingsTab='categories',cableTypesSheet=null,connectorTypesSheet=null,grid=null,history=[],future=[],copiedLengths=null,toastTimer,loaded=false,saveError='',saveBlocked=false,sessionIssues=[];
let lastSavedDraft='',lastSavedRefs='',updateReload=false,importPending=false,vendorLoadSequence=0;
const issueTimes=new Map();let issueSequence=0;
function notice(message,error=false){const t=$('#toast');t.textContent=message;t.className=`show${error?' error':''}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.className='',error?11000:5000);}
function capture(){return {project:clone(project),refs:clone(refs),dirty,refDirty};}
function change(fn,{references=false,renderPage=true}={}){
  const before=capture();
  try{fn();syncVendorManifest(refs);if(fillCableConnectors(project,refs))dirty=true;}catch(e){project=before.project;refs=before.refs;notice(e.message,true);throw e;}
  history.push(before);if(history.length>100)history.shift();future=[];dirty=references?dirty:true;refDirty=references?true:refDirty;save();renderShell();if(renderPage)render();
}
function undo(){if(!history.length)return;future.push(capture());const s=history.pop();({project,refs,dirty,refDirty}=s);save();renderAll();notice('Edit undone.');}
function redo(){if(!future.length)return;history.push(capture());const s=future.pop();({project,refs,dirty,refDirty}=s);save();renderAll();notice('Edit restored.');}
function save(){try{
  if(saveBlocked){status();return;}
  const existing=localStorage.getItem(KEYS.draft);
  if((lastSavedDraft&&existing!==lastSavedDraft)||(lastSavedRefs&&localStorage.getItem(KEYS.prefs)!==lastSavedRefs)){saveBlocked=true;saveError='Another tab changed this workspace. Download your backups, then reload.';notice(saveError,true);status();return;}
  refDirty=!same(refs,referenceExports);
  localStorage.setItem(KEYS.draft,JSON.stringify({project,dirty}));localStorage.setItem(KEYS.prefs,JSON.stringify({refs,refDirty,referenceExports}));lastSavedDraft=localStorage.getItem(KEYS.draft);lastSavedRefs=localStorage.getItem(KEYS.prefs);saveError='';
}catch(e){saveError='Autosave failed. Download a project backup now.';notice(saveError,true);}status();}
function status(){$('#save-status').textContent=saveError||(!loaded?'Loading references…':dirty||refDirty?'Draft saved · unexported edits':'Draft saved locally');}
function saveTable(){save();if(saveError||saveBlocked)notice(saveError||'Saving is paused. Download a backup.',true);else notice('Table saved locally. Download a backup to keep a separate copy.');return !saveError&&!saveBlocked;}
function allIssues(){const issues=[...validate(project,refs),...connectorReviews(project,refs).map(review=>({level:'warning',category:review.usages[0].category,row:review.usages[0].row,field:review.usages[0].key==='male'?'start':'end',connectorReview:review.name,message:`Connector “${review.name}” needs review (${review.usages.length} cable ends).`,fix:'Review the connector name, then approve it to add it to Connectors.'})),...validateLengthColours(refs.length_colours,colourPalette),...sessionIssues],active=new Set();for(const issue of issues){const key=JSON.stringify(issue);active.add(key);if(!issueTimes.has(key))issueTimes.set(key,++issueSequence);}for(const key of issueTimes.keys())if(!active.has(key))issueTimes.delete(key);return issues.sort((a,b)=>issueTimes.get(JSON.stringify(a))-issueTimes.get(JSON.stringify(b)));}
function renderShell(){
  $('#app-version').textContent=`App ${APP_VERSION}`;
  const name=String(project.stock.vendor.name||'Choose your vendor');$('#vendor-name').textContent=name;
  const count=Object.values(project.stock.cables).reduce((n,r)=>n+r.length,0);
  $('#vendor-summary').textContent=`${count} cable types · ${project.looms.length} looms · ${project.stock.vendor.lengthUnit||'unit unset'}${project.vendorVersion?` · Vendor ${project.vendorVersion}`:''}`;
  const logo=$('#vendor-logo');logo.replaceChildren();const record=refs.lighting_vendors?.vendors.find(v=>v.name===project.stock.vendor.name);
  if(record?.logo&&relativePath(record.logo)&&record.logo.startsWith('images/vendor/')){const img=node('img');img.src=record.logo;img.alt=name;img.onerror=()=>{logo.textContent=name.split(/\s+/).map(w=>w[0]).slice(0,3).join('');};logo.append(img);}else logo.textContent=name==='Choose your vendor'?'L':name.split(/\s+/).map(w=>w[0]).slice(0,3).join('');
  const nav=$('#category-nav');nav.replaceChildren();const tab=(label,dest)=>{const b=btn(label,()=>navigate(dest),page===dest?'active':'');b.setAttribute('aria-current',page===dest?'page':'false');nav.append(b);};tab('Vendor','vendor');
  for(const cat of Object.keys(project.stock.cables))tab(cat,`category:${cat}`);
  if(project.looms.length||project.loomTab)tab(LOOMS,'looms');
  const add=btn('+',addCategory,'add-category');add.setAttribute('aria-label','Add or search category');nav.append(add);
  const issues=allIssues(),errors=issues.filter(i=>i.level==='error').length;$('#error-count').textContent=errors;$('#error-count').classList.toggle('zero',!errors);$('#errors-button').setAttribute('aria-label',`Errors ${errors}, warnings ${issues.length-errors}`);
  const reviews=connectorReviews(project,refs).length;let badge=$('#connector-review-count');if(!badge){badge=node('span',null,'review-badge');badge.id='connector-review-count';$('#errors-button').append(badge);}badge.hidden=!reviews;badge.textContent=`⚠ ${reviews}`;badge.title=`${reviews} connectors need review`;$('#errors-button').setAttribute('aria-label',`Errors ${errors}, warnings ${issues.length-errors}, ${reviews} connectors need review`);
  const tip=$('#recent-issues');tip.replaceChildren(node('strong',`${errors} errors · ${issues.length-errors} warnings`));for(const i of issues.slice(-5).reverse())tip.append(node('p',`${i.category}: ${i.message} ${i.fix}`));if(!issues.length)tip.append(node('p','No issues found in the current draft.'));
  rebuildLists();status();
}
function rebuildLists(){const host=$('#datalists');host.replaceChildren();const colours=node('datalist');colours.id='colours-list';for(const value of [...new Set([colourPalette.noColour.name,...colourPalette.noColour.aliases,...Object.entries(colourPalette.colours).flatMap(([hex,c])=>[...c.names,hex])])]){const option=node('option');option.value=value;colours.append(option);}host.append(colours);const units=node('datalist');units.id='units-list';for(const value of ['m','ft']){const o=node('option');o.value=value;units.append(o);}host.append(units);for(const [id,entries]of [['vendors-list',refs.lighting_vendors?.vendors||[]],['categories-list',refs.categories?.items||[]],['cables-list',refs.cable_types?.items||[]],['connectors-list',refs.connector_types?.items||[]]]){const list=node('datalist');list.id=id;for(const item of entries){for(const name of new Set([item.name,...(item.aliases||[])])){const option=node('option');option.value=name;if(name!==item.name)option.label=`${name} · ${item.name}`;list.append(option);}}host.append(list);}const list=node('datalist');list.id='directions-list';for(const value of ['male-female','bidirectional']){const o=node('option');o.value=value;list.append(o);}host.append(list);}
function navigate(next){page=next;renderAll();window.scrollTo({top:0,behavior:'instant'});}
function renderAll(){renderShell();render();}
function heading(title,description,actions=[]){const head=node('div',null,'page-heading'),text=node('div');text.append(node('span','CABLE STOCK WORKSPACE','eyebrow'),node('h1',title));if(description)text.append(node('p',description));head.append(text);if(actions.length){const a=node('div',null,'actions');a.append(...actions);head.append(a);}$('#main').append(head);}
function render(){grid=null;$('#main').replaceChildren();if(page==='settings')renderSettings();else if(page==='errors')renderErrors();else if(page==='looms')renderLooms();else if(page.startsWith('category:')&&project.stock.cables[page.slice(9)])renderCategory(page.slice(9));else{page='vendor';renderVendor();}}
function openDialog(title,build,actions=[]){const dialog=$('#dialog');if(dialog.open)dialog.close();const content=$('#dialog-content');content.replaceChildren();const head=node('div',null,'dialog-head'),close=btn('×',()=>dialog.close(),'dialog-close');close.setAttribute('aria-label','Close dialog');head.append(node('h2',title),close);const body=node('div',null,'dialog-body');content.append(head,body);build(body);const footer=node('div',null,'dialog-actions');for(const action of actions)footer.append(btn(action.label,()=>action.run?.(dialog),action.cls));if(!actions.length)footer.append(btn('Close',()=>dialog.close()));content.append(footer);dialog.showModal();return body;}
function confirmAction(title,message,onConfirm,label='Continue'){openDialog(title,b=>b.append(node('p',message)),[{label:'Cancel',run:d=>d.close()},{label,cls:'primary',run:d=>{d.close();onConfirm();}}]);}
function requireSafe(message,fn){if(dirty)confirmAction('Protect your draft',message,fn);else fn();}
function chosenFilename(name){const path=refs.manifest.catalogues.find(v=>v.vendor===name)?.file;return path?path.split('/').at(-1):'';}
function renderVendor(){
  heading('Vendor setup','Choose a vendor, set its unit once, then build its cable categories.',[btn('Import JSON / Excel',()=>$('#file-input').click()),btn('New vendor',()=>requireSafe('Start a new vendor? Your current autosaved draft will be replaced. Download a project backup first if you need it.',()=>{change(()=>project=newProject());navigate('vendor');}))]);
  const layout=node('div',null,'vendor-layout'),panel=node('section',null,'panel');panel.append(node('h2','Vendor details'));const form=node('div',null,'form-grid');
  const vendor=field('Vendor name',project.stock.vendor.name,(value,input)=>{input.value=project.stock.vendor.name;input.dataset.draftValue=input.value;selectVendorProject(value);},{list:'vendors-list',help:'Select a vendor to load its uploaded generator project from projects/. Current work is protected before replacement.'});form.append(vendor);
  const unit=node('label','Length unit'),select=node('select');select.setAttribute('aria-label','Length unit');for(const [value,text]of [['m','Metric · metres (m)'],['ft','Imperial · feet (ft)']]){const o=node('option',text);o.value=value;select.append(o);}select.value=project.stock.vendor.lengthUnit;select.onchange=()=>{const value=select.value;select.value=project.stock.vendor.lengthUnit;confirmAction('Change length unit',`Switch to ${value}? All length numbers will stay exactly the same. Review them manually; this does not convert lengths.`,()=>change(()=>project.stock.vendor.lengthUnit=value),'Change unit');};unit.append(select,node('small','Applies to all cables and looms. Numbers are never converted.'));form.append(unit);
  form.append(field('Cable-stock output filename',project.filename,value=>change(()=>project.filename=value),{help:chosenFilename(project.stock.vendor.name)?`Confirmed by manifest: ${chosenFilename(project.stock.vendor.name)}`:'No manifest match. Enter the destination filename you intend to use.'}));
  const version=field('Vendor version',project.vendorVersion,value=>change(()=>project.vendorVersion=normaliseVendorVersion(value)),{help:'Enter a number such as 2 or 2.1; the v prefix is added automatically. For your generator backup and Excel. Independent of the app version. Imported runtime version fields remain in custom metadata.'});const increments=node('div',null,'actions');increments.append(btn('+ Major',()=>bumpVersion(true)),btn('+ Minor',()=>bumpVersion(false)));version.append(increments);form.append(version);
  for(const [labelEl,key]of [[vendor,'name'],[unit,'lengthUnit']])if(!same(project.stock.vendor[key],project.baseline?.stock.vendor[key]))labelEl.classList.add('inline-changed');
  panel.append(form);
  const meta=node('details');meta.append(node('summary','Custom metadata · preserved on import'));
  meta.append(metadataForm('vendor','Additional vendor fields'),metadataForm('root','Additional document fields'));panel.append(meta);
  const actions=node('div',null,'form-actions');actions.append(btn('+ Add category',addCategory,'primary'),btn('Save project backup',downloadBackup),btn('Save vendor project',saveVendorProject),btn('Load saved vendor project',()=>selectVendorProject(project.stock.vendor.name,true)));panel.append(actions);layout.append(panel);
  const side=node('aside',null,'panel');side.append(node('h2','Your workspace'));
  const stats=node('div',null,'stat-row');for(const [n,t]of [[Object.keys(project.stock.cables).length,'categories'],[Object.values(project.stock.cables).reduce((s,r)=>s+r.length,0),'cable types'],[project.looms.length,'looms']]){const d=node('div',null,'stat');d.append(node('strong',n),node('span',t));stats.append(d);}side.append(stats);
  for(const [number,title,desc]of [[1,'Choose your vendor','Select its unit and confirm the cable-stock filename.'],[2,'Build cable stock','Add categories, choose cable types and enter available lengths.'],[3,'Review & download','Check changes and issues, then download JSON or Excel.']]){const d=node('div',null,'step'),text=node('div');text.append(node('strong',title),node('p',desc));d.append(node('span',number,'step-number'),text);side.append(d);}
  side.append(node('p','Your files stay in this browser. Local drafts are not permanent backups.','note'));
  side.append(node('p','Cable-stock JSON includes loom names, IDs, available lengths and cable quantities. Lampy Paperwork needs its planned update to use them. Save project JSON or Excel to also retain the vendor version, loom descriptions, connector overrides and component lengths.','note warning'));layout.append(side);$('#main').append(layout);
}
async function selectVendorProject(value,force=false){
  const name=String(value).trim();if(!name||(!force&&name===project.stock.vendor.name))return;
  const sequence=++vendorLoadSequence;let before=JSON.stringify(capture());notice(`Looking for ${name}’s saved project…`);
  try{
    const incoming=await loadVendorProject(name,refs.lighting_vendors.vendors);
    if(sequence!==vendorLoadSequence)return;
    if(force&&!incoming){notice(`No saved project found for ${name}. Your draft is unchanged.`,true);return;}
    if($('#dialog').open){notice('Close the current dialog, then select the vendor again.',true);return;}
    if(before!==JSON.stringify(capture())){notice('Your workspace changed while loading. Select the vendor again when ready.',true);return;}
    const apply=()=>{
      if(sequence!==vendorLoadSequence||before!==JSON.stringify(capture())){notice('Your workspace changed. Select the vendor again.',true);return;}
      change(()=>{project=incoming||newProject();if(!incoming){project.stock.vendor.name=name;project.filename=chosenFilename(name);}});navigate('vendor');notice(incoming?`Loaded saved project for ${name}.`:`No saved project found for ${name}. Started an empty vendor project.`);
      if(!refs.lighting_vendors.vendors.some(v=>v.name===name))offerVendor(name);
    };
    const hasWork=dirty||project.stock.vendor.name||Object.keys(project.stock.cables).length||project.looms.length;
    if(hasWork)openDialog('Switch vendor project',body=>body.append(node('p',`${incoming?'A saved project is available':'No saved project was found'} for ${name}. ${incoming?'Load it':'Start an empty project'} and replace the current workspace? Download a backup first to keep your current work.`)),[{label:'Cancel',run:d=>d.close()},{label:'Save current backup',run:()=>{downloadBackupNow();before=JSON.stringify(capture());}},{label:incoming?'Load saved project':'Start empty project',cls:'primary',run:d=>{d.close();apply();}}]);else apply();
  }catch(error){if(sequence===vendorLoadSequence)notice(error.message||'Saved project could not be loaded. Your current draft is unchanged.',true);}
}
function saveVendorProject(){
  let filename;try{filename=vendorProjectFilename(project.stock.vendor.name,refs.lighting_vendors.vendors);restoreProject(project);}catch(error){notice(error.message,true);return;}
  const copy=clone(project),text=JSON.stringify(copy,null,2);
  openDialog('Save vendor project for this generator',body=>{
    body.append(node('p',`Save this file in your Cable Stocker project folder at projects/${filename}, then upload it to the same projects/ folder on GitHub. Selecting this vendor will load that file.`, 'note'));
    body.append(node('p','This is a complete generator project, including cable stock, looms, vendor version and baseline. It does not replace your Lampy cable-stock export or manifest. Uploaded projects are available to anyone who can access the hosted files.'));
    body.append(node('p','For a new vendor, also download Lighting Vendors in Settings and upload reference/lighting_vendors.json so it appears in the selector. Connector/reference edits remain separate downloads.'));
  },[{label:'Cancel',run:d=>d.close()},...(typeof window.showSaveFilePicker==='function'?[{label:'Choose save location',cls:'primary',run:async d=>{
    try{const handle=await window.showSaveFilePicker({suggestedName:filename,types:[{description:'Generator project JSON',accept:{'application/json':['.json']}}]});const stream=await handle.createWritable();await stream.write(text);await stream.close();d.close();notice(`Project saved. Upload it as projects/${filename}.`);}catch(error){if(error.name!=='AbortError')notice('Could not save the file. Use Download project JSON instead.',true);}
  }}]:[]),{label:'Download project JSON',run:d=>{download(filename,copy);d.close();notice(`Place the download in projects/${filename}, then upload that file.`);}}]);
}
function offerVendor(name){confirmAction('Add vendor to references',`Add “${name}” to the Lighting Vendors reference? You can set its logo path in Settings.`,()=>change(()=>refs.lighting_vendors.vendors.push({name,logo:''}),{references:true}),'Add vendor');}
function metadataTarget(scope,path=[]){
  let target=scope==='vendor'?project.stock.vendor:project.stock;
  for(const key of path)target=target[key];return target;
}
function metadataForm(scope,title){
  const host=node('section',null,'metadata-form');
  const reserved=scope==='vendor'?['name','lengthUnit']:['vendor','cables','looms'];
  const update=(path,key,value,remove=false)=>change(()=>{const target=metadataTarget(scope,path);if(remove){if(Array.isArray(target))target.splice(Number(key),1);else delete target[key];}else target[key]=value;},{renderPage:false});
  function add(path){
    const list=Array.isArray(metadataTarget(scope,path));let nameInput,kind='text';
    openDialog(list?'Add item':'Add field',body=>{
      if(!list){const nameField=field('Field name','',()=>{});nameInput=nameField.querySelector('input');body.append(nameField);}
      const label=node('label','Value type'),select=node('select');
      for(const [value,text]of [['text','Text'],['number','Number'],['boolean','Yes / No'],['group','Group of fields'],['list','List'],['empty','No value']]){const o=node('option',text);o.value=value;select.append(o);}select.onchange=()=>kind=select.value;label.append(select);body.append(label);
    },[{label:'Cancel',run:d=>d.close()},{label:list?'Add item':'Add field',cls:'primary',run:d=>{
      const target=metadataTarget(scope,path),key=list?target.length:nameInput.value.trim();
      if(!list&&(!key||!safeKey(key)||Object.hasOwn(target,key)||(!path.length&&reserved.includes(key)))){notice('Enter a unique field name. Standard vendor fields use their own controls.',true);return;}
      update(path,key,({text:'',number:0,boolean:false,group:{},list:[],empty:null})[kind]);d.close();draw();
    }}]);
  }
  function draw(){
    host.replaceChildren(node('h3',title));
    function group(parent,path){
      const target=metadataTarget(scope,path),list=Array.isArray(target);
      const entries=Object.entries(target).filter(([key])=>path.length||!reserved.includes(key));
      if(!entries.length)parent.append(node('p',list?'No items yet.':'No additional fields.','muted'));
      for(const [key,value]of entries){
        const label=list?`Item ${Number(key)+1}`:key,row=node('div',null,'metadata-row');
        if(value!==null&&typeof value==='object'){
          const box=node('fieldset');box.append(node('legend',label));group(box,[...path,key]);row.append(box);
        }else if(typeof value==='boolean'){
          const l=node('label',label),select=node('select');for(const [v,t]of [['true','Yes'],['false','No']]){const o=node('option',t);o.value=v;select.append(o);}select.value=String(value);select.onchange=()=>update(path,key,select.value==='true');l.append(select);row.append(l);
        }else if(value===null){row.append(node('span',`${label}: No value`),btn('Enter text',()=>{update(path,key,'');draw();}));
        }else{
          const numeric=typeof value==='number';
          const l=field(label,value,(text,input)=>{
            if(numeric&&(!text.trim()||!Number.isFinite(Number(text)))){input.setCustomValidity('Enter a valid number.');input.reportValidity();return;}
            input.setCustomValidity('');update(path,key,numeric?Number(text):text);input.dataset.draftValue=input.value;
          },{type:numeric?'number':'textarea'});
          const input=l.querySelector('input,textarea');if(numeric)input.step='any';else input.rows=2;
          input.oninput=()=>input.setCustomValidity('');row.append(l);
        }
        const remove=btn('Remove',()=>confirmAction('Remove field',`Remove “${label}” and its value?`,()=>{update(path,key,undefined,true);draw();},'Remove'),'danger');remove.setAttribute('aria-label',`Remove ${label}`);row.append(remove);parent.append(row);
      }
      parent.append(btn(list?'+ Add item':'+ Add field',()=>add(path)));
    }
    group(host,[]);
  }
  draw();return host;
}
function bumpVersion(major){try{const next=incrementVersion(project.vendorVersion,major);confirmAction('Increment vendor version',`${project.vendorVersion||'(unset)'} → ${next}. This updates your generator backup version only.`,()=>change(()=>project.vendorVersion=next),'Increment');}catch(e){notice(e.message,true);}}
function addCategory(){let input;openDialog('Add a cable category',body=>{
  body.append(node('p','Choose a category to start with its associated cable types, or type a new name. Lengths start empty.'));
  const label=node('label','Choose a category'),select=node('select');select.setAttribute('aria-label','Choose a category');
  const empty=node('option','Type a new category or choose below');empty.value='';select.append(empty);
  for(const ref of refs.categories.items)for(const name of new Set([ref.name,...(ref.aliases||[])])){const option=node('option',name);option.value=name;select.append(option);}
  label.append(select);body.append(label);
  const l=field('Category name','',()=>{},{list:'categories-list'});input=l.querySelector('input');body.append(l);select.onchange=()=>input.value=select.value;
},[{label:'Cancel',run:d=>d.close()},{label:'Add category',cls:'primary',run:d=>{
  const name=input.value.trim();if(!name||!safeKey(name)){notice('Enter a valid category name.',true);return;}d.close();
  if(name===LOOMS||referenceMatch(refs.categories.items,name)?.id==='cat-looms'){change(()=>project.loomTab=true);navigate('looms');return;}
  if(!Object.hasOwn(project.stock.cables,name))change(()=>{const entries=categoryCables(name,refs);project.stock.cables[name]=entries.map(e=>e.row);project.rowIds[name]=entries.map(()=>uid());entries.forEach((e,i)=>setCableAdaptor(project,name,i,e.adaptor));});
  navigate(`category:${name}`);
}}]);}
function adaptorAfterPaste(current,i,patches){const patch=patches?.find(p=>p.id===i&&p.col.key==='adaptor');return patch?['true','yes'].includes(String(patch.text).trim().toLowerCase()):!!current;}
const cableColumns=[{key:'name',label:'Cable type / name',list:'cables-list',width:220},{key:'adaptor',label:'Adaptor',type:'boolean',width:105},{key:'direction',label:'Adaptor direction',list:'directions-list',width:165},{key:'start',label:'Start / male',list:'connectors-list',width:185},{key:'end',label:'End / female',list:'connectors-list',width:185},{key:'lengths',label:'Available lengths',type:'lengths',width:380},{key:'connectors',label:'Connectors JSON',type:'json',width:250},{key:'custom',label:'Custom fields JSON',type:'json',width:240}];
function renderCategory(category){
  const repaired=clone(project.stock.cables[category]);let inherited=false;for(const row of repaired)inherited=inheritCableConnectors(row,refs.cable_types.items)||inherited;if(inherited)change(()=>project.stock.cables[category]=repaired,{renderPage:false});
  heading(category,`${project.stock.cables[category].length} cable types · lengths in ${project.stock.vendor.lengthUnit} · yellow marks edits since import or this table’s last Save`,[btn('JSON preview',()=>preview(category)),btn('Category Excel',()=>reviewExport('excel',category)),btn('Remove category',()=>confirmAction('Remove category',`Remove ${category} and all its cable rows? You can undo this.`,()=>{change(()=>{delete project.stock.cables[category];delete project.rowIds[category];});navigate('vendor');},'Remove'),'danger')]);
  const host=node('div',null,'grid-panel');$('#main').append(host);
  grid=new Grid(host,{current:()=>grid,key:`cables:${category}`,highlightContext:JSON.stringify([project.stock.vendor,project.baseline]),rowKey:(_,i)=>project.rowIds[category][i],label:`${category} cable stock`,highlightColumns:cableColumns,columns:visibleTableColumns(cableColumns,project.stock.cables[category].some((_,i)=>isCableAdaptor(project,category,i))).map(col=>col.key==='name'?{...col,render:(value,cell,editor)=>{cell.append(node('span',value,'cell-text'));const row=project.stock.cables[category][editor.rowId];if(row&&cableNeedsConnectorInputs(row,refs.cable_types.items)){const button=btn('Connectors',e=>{e.stopPropagation();if(grid?.editing&&!grid.commitEditor())return;editCableConnectors(category,editor.rowId);},'cell-action');button.setAttribute('aria-label',`Edit connectors for ${row.name||'unnamed cable'}`);cell.append(button);}}}:col),rows:()=>project.stock.cables[category],get:(r,k)=>k==='adaptor'?isCableAdaptor(project,category,project.stock.cables[category].indexOf(r)):['direction','start','end'].includes(k)&&!isCableAdaptor(project,category,project.stock.cables[category].indexOf(r))?'':getCell(r,k),readOnly:(i,k,patches)=>['direction','start','end'].includes(k)&&!adaptorAfterPaste(isCableAdaptor(project,category,i),i,patches),
    changed:(i,k)=>{const old=baselineRow(project,category,i);return !!old&&(k==='adaptor'?!!project.baseline.adaptors?.[project.rowIds[category][i]]!==isCableAdaptor(project,category,i):!same(getCell(old,k),getCell(project.stock.cables[category][i],k)));},added:i=>!baselineRow(project,category,i),
    add:()=>change(()=>{project.stock.cables[category].push(defaultCable());project.rowIds[category].push(uid());},{renderPage:false}),
    apply:(patches,allowNew)=>{
      change(()=>{
        for(const p of patches){while(project.stock.cables[category].length<=p.id){if(!allowNew)throw new Error('Row no longer exists.');project.stock.cables[category].push(defaultCable());project.rowIds[category].push(uid());}
          const row=project.stock.cables[category][p.id];
          if(p.col.key==='adaptor')setCableAdaptor(project,category,p.id,p.value);else setCell(row,p.col.key,p.value);
          if(p.col.key==='name'){inheritCableConnectors(row,refs.cable_types.items);const ref=referenceMatch(refs.cable_types.items,String(p.value).trim());if(ref?.adaptor===true)setCableAdaptor(project,category,p.id,true);}
        }
      },{renderPage:patches.some(p=>['adaptor','name'].includes(p.col.key))});
    },remove:ids=>confirmAction('Delete cable rows',`Delete ${ids.length} selected row(s)? Undo is available.`,()=>change(()=>{for(const i of ids.sort((a,b)=>b-a)){if(project.adaptors)delete project.adaptors[project.rowIds[category][i]];project.stock.cables[category].splice(i,1);project.rowIds[category].splice(i,1);}}),'Delete rows'),
    undo,redo,notice,save:saveTable,saved:renderAll,lengthChip:makeLengthChip,lengths:i=>lengthEditor(project.stock.cables[category][i],()=>renderAll())});
  const removed=changes(project).filter(c=>c.category===category&&c.kind==='removed');if(removed.length)$('#main').append(node('p',`Removed since import: ${removed.map(x=>x.name).join(', ')}`,'note warning'));
}
function editCableConnectors(category,index){
  const row=project.stock.cables[category]?.[index];if(!row)return;
  const id=project.rowIds[category][index];let direction,start,end;
  openDialog(`Connectors · ${row.name||'Unnamed cable'}`,body=>{
    const label=node('label','Direction');direction=node('select');for(const value of ['male-female','bidirectional']){const option=node('option',value==='male-female'?'Male / female':'Same connector at both ends');option.value=value;direction.append(option);}direction.value=['male-female','bidirectional'].includes(row.direction)?row.direction:'male-female';label.append(direction);body.append(label);
    const first=field('Start / male connector',getCell(row,'start'),()=>{},{list:'connectors-list'}),last=field('End / female connector',getCell(row,'end'),()=>{},{list:'connectors-list'});start=first.querySelector('input');end=last.querySelector('input');body.append(first,last);
    const update=()=>{last.hidden=direction.value==='bidirectional';first.firstChild.textContent=last.hidden?'Connector at both ends':'Start / male connector';};direction.onchange=update;update();
  },[{label:'Cancel',run:d=>d.close()},{label:'Save connectors',cls:'primary',run:d=>{
    if(!start.value.trim()||(direction.value==='male-female'&&!end.value.trim())){notice('Enter a connector for each required end.',true);return;}
    const current=project.rowIds[category].indexOf(id);if(current<0){notice('This cable no longer exists.',true);return;}
    const a=start.value.trim(),b=end.value.trim(),dir=direction.value;d.close();change(()=>{const target=project.stock.cables[category][current];target.direction=dir;setCell(target,'start',a);if(dir==='male-female')setCell(target,'end',b);});
  }}]);
}
function reviewConnector(name){
  const review=connectorReviews(project,refs).find(r=>r.name===name);if(!review)return;let input;
  openDialog('Review connector',body=>{
    body.append(node('p',`“${name}” is used on ${review.usages.length} cable ends. Confirm the type or correct it below. Approval updates all listed ends and adds the name to your local Connectors list.`));
    const label=field('Connector name',name,()=>{},{list:'connectors-list'});input=label.querySelector('input');body.append(label);
    const list=node('ul');for(const use of review.usages)list.append(node('li',`${use.category} · ${project.stock.cables[use.category][use.row].name} · ${use.key}`));body.append(list,node('p','To keep this in the published permanent list, download connector_types.json and upload it to data/connector_types.json.','note'));
  },[{label:'Cancel',run:d=>d.close()},{label:'Approve & add to Connectors',cls:'primary',run:d=>{
    if(!input.value.trim()){notice('Enter a connector name before approval.',true);input.focus();return;}
    change(()=>{approveConnector(project,refs,name,input.value);dirty=true;},{references:true});d.close();notice('Connector approved. Download the connector list to publish your changes.');
  }}]);
}
function renderColourCell(value,host,editor){
  const entries=[['', {names:[colourPalette.noColour.name]}],...Object.entries(colourPalette.colours)];
  let hex;try{hex=resolveColour(value,colourPalette);}catch{hex=String(value);}
  const paint=(el,code)=>{const item=colourPalette.colours[code];el.style.backgroundColor=item?code:'#fff';el.style.color=item?.fontColour||'#777';if(item)el.style.textShadow=`-1px 0 ${item.outlineColour}, 0 1px ${item.outlineColour}, 1px 0 ${item.outlineColour}, 0 -1px ${item.outlineColour}`;};
  const trigger=btn(hex?(colourPalette.colours[hex]?.names[0]||hex):'Colour',()=>{},'colour-field');trigger.setAttribute('aria-label',host.getAttribute('aria-label'));trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');host.classList.add('colour-cell');paint(host,hex);
  const menu=node('div',null,'colour-menu');menu.setAttribute('popover','auto');menu.id=`colour-${uid()}`;trigger.setAttribute('aria-controls',menu.id);menu.role='listbox';menu.setAttribute('aria-label','Choose colour');
  const options=entries.map(([code,item])=>{const option=btn(item.names[0],()=>{menu.hidePopover();editor.commit(code);},'colour-option');option.role='option';option.setAttribute('aria-selected',String(code===hex));paint(option,code);if(!code)option.classList.add('no-colour');menu.append(option);return option;});
  menu.onclick=e=>e.stopPropagation();menu.onkeydown=e=>{e.stopPropagation();if(e.isComposing)return;if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();menu.hidePopover();editor.edit(e.key);return;}const i=options.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();options[e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();}};
  menu.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(menu.matches(':popover-open'))));
  trigger.onclick=e=>{e.stopPropagation();if(menu.matches(':popover-open')){menu.hidePopover();return;}const rect=trigger.getBoundingClientRect();menu.style.zoom=String(1/(parseFloat(host.closest('table').style.zoom)||1));menu.style.width=`${rect.width}px`;menu.style.left=`${Math.min(rect.left,window.innerWidth-rect.width-8)}px`;const below=window.innerHeight-rect.bottom-12;menu.style.top=`${below>=180?rect.bottom+5:Math.max(8,rect.top-280)}px`;menu.style.maxHeight=`${below>=180?Math.min(280,below):Math.min(280,rect.top-16)}px`;menu.showPopover();options[Math.max(0,entries.findIndex(([code])=>code===hex))].focus();};
  trigger.onkeydown=e=>{e.stopPropagation();if(e.isComposing)return;if(e.key==='Enter'){e.preventDefault();editor.enter(e.shiftKey);return;}if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();editor.edit(e.key);return;}if(e.key==='F2'){e.preventDefault();editor.edit();return;}if(e.key==='Tab'){e.preventDefault();editor.tab(e.shiftKey);return;}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();trigger.click();}};host.append(trigger,menu);

}
function makeLengthChip(value){
  const chip=node('span',String(value),'chip mini');
  const matches=refs.length_colours.items.filter(r=>String(r.vendor).trim().toLowerCase()===String(project.stock.vendor.name).trim().toLowerCase()&&r.unit===project.stock.vendor.lengthUnit&&r.length===value);
  if(matches.length===1){const bands=node('span',null,'length-colour-bands'),names=[];for(const key of ['colour1','colour2','colour3']){try{const hex=resolveColour(matches[0][key],colourPalette),band=node('span');band.style.background=hex||'transparent';bands.append(band);names.push(hex?colourPalette.colours[hex].names[0]:colourPalette.noColour.name);}catch{names.push('Invalid colour');}}chip.append(bands);chip.title=names.join(' / ');}
  return chip;
}
function lengthEditor(target,after){
  let values=Array.isArray(target.lengths)?clone(target.lengths):[],input,chipHost,pasteHost;
  const draw=()=>{chipHost.replaceChildren();values.forEach((value,i)=>{const chip=node('span',null,`chip${typeof value!=='number'||value<=0?' invalid':''}`);chip.append(makeLengthChip(value),btn('×',()=>{values.splice(i,1);draw();}));chip.lastChild.setAttribute('aria-label',`Remove length ${display(value)}`);chipHost.append(chip);});};
  const add=()=>{try{const parsed=parseLengths(input.value),duplicates=parsed.duplicates.concat(parsed.values.filter(n=>values.includes(n)));values=combineLengths(values,parsed.values,'merge');input.value='';draw();if(duplicates.length)notice(`Duplicate lengths skipped: ${[...new Set(duplicates)].join(', ')}`);return true;}catch(e){notice(e.message,true);return false;}};
  openDialog(`Available lengths · ${target.name||target.type||'Untitled'}`,body=>{
    body.append(node('p',`Enter a positive number and press Enter. Paste comma, semicolon or whitespace-separated numbers. Unit: ${project.stock.vendor.lengthUnit}.`));
    chipHost=node('div',null,'length-chips');body.append(chipHost);draw();
    const line=node('div',null,'length-input');input=node('input');input.placeholder='Type a length, then Enter';input.setAttribute('aria-label','New length');input.inputMode='decimal';input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add();}if(e.key==='Backspace'&&!input.value){values.pop();draw();}};input.onpaste=e=>{const text=e.clipboardData.getData('text/plain');if(/[\s,;]/.test(text.trim())){e.preventDefault();input.value=text;add();}};line.append(input,node('strong',project.stock.vendor.lengthUnit),btn('Add',add));body.append(line);
    const actions=node('div',null,'actions');actions.append(btn('Copy Lengths',()=>{if(input.value.trim()&&!add())return;copiedLengths={values:clone(values),unit:project.stock.vendor.lengthUnit};notice('Lengths copied inside the app.');}),btn('Apply / Paste Lengths',()=>{
      if(!copiedLengths){notice('Use Copy Lengths on another entry first.',true);return;}
      pasteHost.replaceChildren();if(copiedLengths.unit!==project.stock.vendor.lengthUnit)pasteHost.append(node('p',`Copied values are labelled ${copiedLengths.unit}. This vendor uses ${project.stock.vendor.lengthUnit}; numbers will not be converted.`,'note warning'));
      const apply=mode=>{values=combineLengths(values,copiedLengths.values,mode);draw();pasteHost.replaceChildren();};if(!values.length&&copiedLengths.unit===project.stock.vendor.lengthUnit)apply('replace');else{pasteHost.append(node('p','How should the copied lengths be applied?'),btn('Replace',()=>apply('replace')),btn('Merge',()=>apply('merge')),btn('Cancel',()=>pasteHost.replaceChildren()));}
    }));body.append(actions);pasteHost=node('div');body.append(pasteHost);
  },[{label:'Cancel',run:d=>d.close()},{label:'Save lengths',cls:'primary',run:d=>{if(input.value.trim()&&!add())return;change(()=>target.lengths=values,{renderPage:false});d.close();after();}}]);
}
const expandedLooms=new Set();
function newLoom(){return {id:uid(),name:'',lengths:[],description:'',components:[]};}
function editLoom(existing){
  if(grid?.editing&&!grid.commitEditor())return false;
  const draft=existing?clone(existing):newLoom(),original=clone(draft),workspace=project;
  const pane=node('dialog',null,'loom-pane');pane.id='loom-pane';pane.setAttribute('aria-labelledby','loom-pane-title');
  const title=node('h2',existing?'Edit loom':'Add loom');title.id='loom-pane-title';
  const header=node('div',null,'dialog-head'),body=node('div',null,'loom-pane-body'),footer=node('div',null,'dialog-actions');
  const warning=node('p',null,'note error-note');warning.hidden=true;warning.setAttribute('role','alert');
  const discard=node('div',null,'loom-discard');discard.hidden=true;
  const close=()=>{pane.close();pane.remove();};
  const cancel=()=>{if(same(draft,original)){close();return;}discard.hidden=false;};
  const closeButton=btn('×',cancel,'dialog-close');closeButton.setAttribute('aria-label','Close loom pane');header.append(title,closeButton);
  const nameLabel=node('label','Loom name'),name=node('input');name.value=draft.name;name.required=true;name.oninput=()=>{draft.name=name.value;warning.hidden=true;};nameLabel.append(name);
  const table=node('table',null,'loom-entry-table');table.setAttribute('aria-label','Loom components');
  const head=node('thead'),headRow=node('tr');headRow.append(node('th','Cable Type'),node('th','Quantity'));head.append(headRow);const tbody=node('tbody');table.append(head,tbody);
  function addComponent(){draft.components.push({id:uid(),type:'',count:1,connectors:{},lengths:[]});draw();tbody.lastElementChild.querySelector('input').focus();}
  function draw(){
    tbody.replaceChildren();draft.components.forEach((component,index)=>{
      const row=node('tr'),typeCell=node('td'),qtyCell=node('td'),type=node('input'),qty=node('input');
      type.value=component.type;type.setAttribute('list','cables-list');type.setAttribute('aria-label',`Cable Type, component ${index+1}`);type.oninput=()=>{component.type=type.value;warning.hidden=true;};
      qty.type='number';qty.min='1';qty.step='1';qty.value=component.count;qty.setAttribute('aria-label',`Quantity, component ${index+1}`);qty.oninput=()=>{component.count=qty.value;warning.hidden=true;};
      for(const [col,input]of [type,qty].entries())input.onkeydown=e=>{
        if(e.key==='Enter'){e.preventDefault();if(index===draft.components.length-1)addComponent();tbody.children[index+1]?.querySelectorAll('input')[col]?.focus();}
        if(e.key==='Tab'){const inputs=[...tbody.querySelectorAll('input')],next=inputs[inputs.indexOf(input)+(e.shiftKey?-1:1)];if(next){e.preventDefault();next.focus();}}
      };
      const remove=btn('×',()=>{draft.components.splice(index,1);draw();},'remove-component');remove.setAttribute('aria-label',`Remove component ${index+1}`);
      typeCell.append(type);qtyCell.append(qty,remove);row.append(typeCell,qtyCell);tbody.append(row);
    });
  }
  draw();
  body.append(nameLabel,node('p','Add the cable types and quantities inside one loom. Available lengths are edited on the saved loom row.','muted'),table,btn('+ Cable type',addComponent),warning,discard);
  discard.append(node('p','Discard your unsaved loom changes?'),btn('Keep editing',()=>discard.hidden=true),btn('Discard changes',close,'danger'));
  footer.append(btn('Cancel',cancel),btn('Save loom',()=>{
    try{
      if(project!==workspace||saveBlocked)throw new Error('The workspace changed. Keep this pane open and copy your entries before reloading.');
      const saved=prepareLoomDraft(draft,refs.cable_types.items),index=existing?project.looms.findIndex(l=>l.id===existing.id):-1;
      if(existing&&index<0)throw new Error('This loom no longer exists.');
      change(()=>{if(existing)project.looms[index]=saved;else project.looms.push(saved);project.loomTab=true;});
      close();notice('Loom saved locally; download a project backup to keep a separate copy.');
    }catch(e){warning.textContent=e.message;warning.hidden=false;}
  },'primary'));
  pane.append(header,body,footer);pane.oncancel=e=>{e.preventDefault();cancel();};document.body.append(pane);pane.showModal();name.focus();return false;
}
function renderLooms(){
  heading(LOOMS,'Expand a loom name to show its cable types and quantities.',[btn('Add loom',()=>editLoom(),'primary'),btn('Loom JSON preview',previewLooms),btn('Loom Excel',()=>reviewExport('excel',LOOMS))]);
  $('#main').append(node('p','Cable-stock JSON includes loom names, IDs, available lengths and cable quantities. Lampy Paperwork needs its planned update to use them. Keep project JSON or Excel for descriptions, connector overrides and component lengths.','note warning'));
  const host=node('div',null,'grid-panel');$('#main').append(host);
  const rows=()=>loomRows(project.looms),value=(row,key)=>key==='name'?(row.component?.type??row.loom.name):key==='count'?(row.component?.count??''):key==='lengths'?(row.component?.lengths??row.loom.lengths):row.component?'':row.loom[key];
  const baseline=row=>{const loom=project.baseline.looms?.find(l=>l.id===row.loom.id);return row.component?loom?.components.find(c=>c.id===row.component.id):loom;};
  grid=new Grid(host,{current:()=>grid,key:'looms',label:LOOMS,highlightContext:JSON.stringify([project.stock.vendor,project.baseline]),rowKey:r=>r.component?`${r.loom.id}:${r.component.id}`:r.loom.id,
    newEntries:false,addLabel:'Add loom',rows,get:value,order:(filter,sort)=>loomOrder(rows(),expandedLooms,filter,sort),rowClass:row=>row.component?'loom-child-row':'loom-parent-row',
    columns:[{key:'name',label:'Name / Cable Type',render:(text,cell,editor)=>{
      const row=rows()[editor.rowId];if(!row)return;
      if(!row.component){const open=expandedLooms.has(row.loom.id)||!!grid?.filter;
        const toggle=btn(open?'▾':'▸',e=>{e.stopPropagation();if(grid.editing&&!grid.commitEditor())return;if(grid.filter){notice('Clear the search to collapse matching looms.');return;}if(expandedLooms.has(row.loom.id))expandedLooms.delete(row.loom.id);else expandedLooms.add(row.loom.id);grid.renderBody();},'loom-toggle');toggle.setAttribute('aria-label',`${open?'Collapse':'Expand'} ${row.loom.name}`);toggle.setAttribute('aria-expanded',String(open));cell.append(toggle);
      }
      cell.append(node('span',text,'cell-text'));
      if(!row.component){const edit=btn('Edit loom',e=>{e.stopPropagation();editLoom(row.loom);},'cell-action');edit.setAttribute('aria-label',`Edit loom ${row.loom.name}`);cell.append(edit);}
    }},{key:'count',label:'Quantity',type:'integer'},{key:'lengths',label:`Available lengths (${project.stock.vendor.lengthUnit})`,type:'lengths',render:(lengths,cell,editor)=>{
      const row=rows()[editor.rowId],chips=node('div',null,'cell-chips');for(const length of sortedLengths(lengths))chips.append(makeLengthChip(length));cell.append(chips);
      if(!row.component)cell.append(btn('Edit lengths',e=>{e.stopPropagation();if(grid.editing&&!grid.commitEditor())return;lengthEditor(row.loom,renderAll);},'cell-action'));
    }}],
    readOnly:(i,key)=>{const row=rows()[i];return !row||(!row.component&&key==='count')||(!!row.component&&key==='lengths');},readOnlyMessage:'Edit loom quantities on child rows and available lengths on the parent row.',
    changed:(i,key)=>{const row=rows()[i],old=baseline(row);return !!old&&!(!row.component&&key==='count')&&!same(key==='name'&&row.component?old.type:old[key],value(row,key));},added:i=>!baseline(rows()[i]),
    add:()=>editLoom(),apply:patches=>{const before=rows();change(()=>{for(const p of patches){const row=before[p.id];if(!row)throw new Error('Use Add loom to create a loom.');const target=row.component||row.loom,key=row.component&&p.col.key==='name'?'type':p.col.key;target[key]=p.value;}},{renderPage:false});},
    remove:ids=>{const selected=ids.map(i=>rows()[i]),parents=new Set(selected.filter(r=>!r.component).map(r=>r.loom.id));confirmAction('Delete loom rows','Delete the selected rows? Deleting a parent also deletes its components. Undo is available.',()=>change(()=>{for(const row of selected)if(row.component&&!parents.has(row.loom.id))row.loom.components=row.loom.components.filter(c=>c.id!==row.component.id);project.looms=project.looms.filter(l=>!parents.has(l.id));}),'Delete rows');},
    undo,redo,notice,save:saveTable,saved:renderAll,lengthChip:makeLengthChip,lengths:i=>lengthEditor(rows()[i].loom,renderAll)});
}
function refRows(key=settingsTab){return refs[key].items||refs[key].vendors||refs[key].catalogues;}
function refColumns(key,includeHidden=false){if(key==='length_colours')return [{key:'length',label:`Length (${project.stock.vendor.lengthUnit})`,type:'positive',format:value=>value===''?'':`${value} ${project.stock.vendor.lengthUnit}`},...['colour1','colour2','colour3'].map((key,i)=>({key,label:`Colour ${i+1}`,width:180,suggestions:v=>colourSuggestions(v,colourPalette),editFormat:v=>colourPalette.colours[v]?.names[0]||v,parse:v=>resolveColour(v,colourPalette),render:renderColourCell}))];if(key==='manifest')return [{key:'vendor',label:'vendor',width:280,list:'vendors-list'},{key:'file',label:'file',width:500}];if(key==='lighting_vendors')return [{key:'name',label:'Name',width:280},{key:'logo',label:'Logo path',width:400}];const columns=[{key:'name',label:'Canonical name',width:230},{key:'aliases',label:'Aliases (comma-separated)',type:'aliases',width:300}];if(key==='connector_types')columns.push({key:'category',label:'Category',width:180,suggestions:value=>connectorTypeSheets(refs).filter(name=>(name||'Uncategorised').toLocaleLowerCase().includes(String(value).trim().toLocaleLowerCase())).map(name=>({value:name,label:name||'Uncategorised'})),suggestionsLabel:'Available categories',noSuggestions:'No matching categories. Type a new category or clear the cell for Uncategorised.'});if(key==='cable_types')columns.push({key:'adaptor',label:'Adaptor',type:'boolean',width:105},{key:'category',label:'Default category',list:'categories-list',width:180},{key:'direction',label:'Direction',list:'directions-list',width:170},{key:'connectors',label:'Default connectors JSON',type:'json',width:350});return key==='cable_types'?columns.filter(c=>includeHidden||c.key!=='direction'||cableTypeRows(refs.cable_types.items,cableTypesSheet).some(r=>r.adaptor)):columns;}
function newRef(key){if(key==='length_colours')return {vendor:project.stock.vendor.name||'',unit:project.stock.vendor.lengthUnit||'m',length:'',colour1:'',colour2:'',colour3:''};if(key==='manifest')return {vendor:'',file:''};if(key==='lighting_vendors')return {name:'',logo:''};const value={id:uid(),name:'',aliases:[]};if(key==='connector_types')value.category=connectorTypesSheet||'';if(key==='cable_types')Object.assign(value,{category:cableTypesSheet||'',direction:'male-female',connectors:{male:'',female:''}});return value;}
const readSettingsNotes=new Set();
function settingsNote(message){
  const storageKey='lampy-cable:read-notes:1';
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))saved.forEach(text=>readSettingsNotes.add(text));}catch{}
  const note=node('div',null,'note settings-note');
  if(readSettingsNotes.has(message)){note.hidden=true;return note;}
  note.append(node('span',message),btn('Ok',()=>{
    readSettingsNotes.add(message);
    try{localStorage.setItem(storageKey,JSON.stringify([...readSettingsNotes]));}catch{notice('Acknowledgement kept for this session only; browser storage is unavailable.',true);}
    note.remove();
  }));return note;
}
function renderSettings(){
  heading('Reference settings',null,[btn(`Download ${settingsTab}.json`,()=>exportReference(settingsTab),'primary')]);
  $('#main').append(settingsNote('Edits apply immediately in this browser. Download each changed file to keep it.'));
  const tabs=node('nav',null,'tabs settings-tabs');for(const [key,label]of Object.entries(REF_NAMES))tabs.append(btn(label,()=>{settingsTab=key;renderSettingsPage();},settingsTab===key?'active':''));$('#main').append(tabs);
  if(settingsTab==='manifest')$('#main').append(settingsNote('Exact Lampy schema: { "catalogues": [{ "vendor": "…", "file": "…" }] }. Existing source: reference/manifest.json. File paths refer to Lampy Paperwork, not this generator.'));
  else if(['categories','cable_types','connector_types'].includes(settingsTab))$('#main').append(settingsNote('New generator reference dataset, derived from the supplied Christie stock example. Internal IDs stay in references and never enter Lampy cable-stock JSON.'));
  if(settingsTab==='length_colours')$('#main').append(settingsNote('Only the selected vendor’s length colours are shown. New rows inherit that vendor and unit. Choose another vendor on the Vendor tab. Download length_colours.json to keep all vendors’ assignments.'));
  const key=settingsTab,host=node('div',null,'grid-panel');$('#main').append(host);
  const vendor=project.stock.vendor.name,unit=project.stock.vendor.lengthUnit;
  const categoryTable=['cable_types','connector_types'].includes(key);
  if(categoryTable){
    const sheets=key==='cable_types'?cableTypeSheets(refs):connectorTypeSheets(refs);
    let selected=key==='cable_types'?cableTypesSheet:connectorTypesSheet;if(!sheets.includes(selected))selected=sheets[0];
    if(key==='cable_types')cableTypesSheet=selected;else connectorTypesSheet=selected;
    const tabs=node('nav',null,'tabs settings-tabs');tabs.setAttribute('aria-label',key==='cable_types'?'Cable type categories':'Connector categories');
    for(const category of sheets){const b=btn(category||'Uncategorised',()=>{if(key==='cable_types')cableTypesSheet=category;else connectorTypesSheet=category;renderSettingsPage();},category===selected?'active':'');b.setAttribute('aria-current',category===selected?'page':'false');tabs.append(b);}
    host.before(tabs,settingsNote(`${REF_NAMES[key]} · ${selected||'Uncategorised'} · New rows inherit this category. Download includes all category sheets.`));
  }
  const sheet=key==='connector_types'?connectorTypesSheet:cableTypesSheet;
  const scoped=rows=>key==='cable_types'?cableTypeRows(rows,sheet):key==='connector_types'?connectorTypeRows(rows,sheet,refs):key==='length_colours'?rows.filter(r=>String(r.vendor).trim().toLowerCase()===String(vendor).trim().toLowerCase()&&r.unit===unit):rows;
  const rows=()=>scoped(refRows(key));
  if(key==='length_colours'){
    host.before(node('p',`${vendor||'No vendor selected'} · Lengths in ${unit||'unit unset'}`,'colour-context'));
    if(!vendor||!['m','ft'].includes(unit)){host.replaceWith(settingsNote('Select a vendor and unit on the Vendor tab before adding length colours.'));return;}
  }
  const old=scoped(referenceBaseline[key].items||referenceBaseline[key].vendors||referenceBaseline[key].catalogues);
  grid=new Grid(host,{hint:settingsNote,current:()=>grid,key:`settings:${key}${key==='length_colours'?':'+JSON.stringify([vendor,unit]):categoryTable?':'+JSON.stringify(sheet):''}`,rowKey:r=>r.id,highlightContext:JSON.stringify(referenceBaseline[key]),label:`${REF_NAMES[key]}${categoryTable?' · '+(sheet||'Uncategorised'):''} reference table`,columns:refColumns(key),highlightColumns:refColumns(key,true),rows,get:(r,k)=>key==='connector_types'&&k==='category'?(Object.hasOwn(r,'category')?r.category:sheet):k==='direction'&&key==='cable_types'&&!r.adaptor?'':r[k],readOnly:(i,k,patches)=>key==='cable_types'&&k==='direction'&&!adaptorAfterPaste(rows()[i]?.adaptor,i,patches),changed:(i,k)=>!same(rows()[i][k],old[i]?.[k]),added:i=>i>=old.length,
    add:()=>change(()=>refRows(key).push(newRef(key)),{references:true,renderPage:false}),apply:(patches,allowNew)=>change(()=>{const targets=[...rows()];for(const p of patches){while(targets.length<=p.id){if(!allowNew)throw new Error('Missing reference row.');const row=newRef(key);refRows(key).push(row);targets.push(row);}targets[p.id][p.col.key]=p.value;}},{references:true,renderPage:categoryTable&&patches.some(p=>['adaptor','category'].includes(p.col.key))}),remove:ids=>confirmAction('Delete reference rows',`Delete ${ids.length} selected row(s)? Existing vendor wording stays unchanged.`,()=>change(()=>{const selected=ids.map(i=>rows()[i]);for(const row of selected)refRows(key).splice(refRows(key).indexOf(row),1);},{references:true}),'Delete'),undo,redo,notice,save:saveTable,saved:renderAll,lengthChip:makeLengthChip});
}
function renderSettingsPage(){$('#main').replaceChildren();renderSettings();}
function renderErrors(){
  const issues=allIssues();heading('Errors & warnings',`${issues.filter(i=>i.level==='error').length} errors · ${issues.filter(i=>i.level==='warning').length} warnings. You can always preview and export.`,[btn('Download connector list',()=>exportReference('connector_types')),btn('Review export',()=>reviewExport('json'))]);
  if(!issues.length)$('#main').append(node('div','No issues found in the current draft.','empty'));
  const groups=Map.groupBy?Map.groupBy(issues,x=>x.category):issues.reduce((m,i)=>(m.has(i.category)?m.get(i.category).push(i):m.set(i.category,[i]),m),new Map());
  for(const [category,items]of groups){const group=node('section',null,'issue-group');group.append(node('h2',category));for(const issue of items){const detail=node('details',null,'issue'),summary=node('summary');summary.append(node('span',issue.level,`severity ${issue.level}`),node('span',`${issue.row!=null?`Row ${issue.row+1}: `:''}${issue.message}`));detail.append(summary,node('p',issue.fix),btn(issue.connectorReview?'Review connector':'Jump to field',()=>issue.connectorReview?reviewConnector(issue.connectorReview):jump(issue)));group.append(detail);}$('#main').append(group);}
}
function jump(issue){if(issue.category.startsWith('Settings: ')){settingsTab=issue.category.slice(10);if(settingsTab==='connector_types')connectorTypesSheet=connectorTypeCategories(refRows('connector_types')[issue.row],refs)[0];if(settingsTab==='cable_types')cableTypesSheet=refRows('cable_types')[issue.row]?.category||'';navigate('settings');}else if(issue.category==='Vendor'){navigate('vendor');const labels={name:'Vendor name',lengthUnit:'Length unit',filename:'Cable-stock output filename',vendorVersion:'Vendor version'};const label=[...document.querySelectorAll('#main label')].find(l=>l.firstChild?.textContent===labels[issue.field]);label?.querySelector('input,select')?.focus();return;}else if(issue.category===LOOMS){const loom=project.looms[issue.row||0];if(loom)expandedLooms.add(loom.id);navigate('looms');const id=grid.o.rows().findIndex(row=>row.loom.id===loom?.id&&!row.component);if(id>=0)grid.select(grid.ids.indexOf(id),0);return;}else {navigate(`category:${issue.category}`);if(['start','end','connectors','direction'].includes(issue.field)&&!isCableAdaptor(project,issue.category,issue.row)){editCableConnectors(issue.category,issue.row);return;}}if(grid&&issue.row!=null){let row=['Settings: cable_types','Settings: connector_types'].includes(issue.category)?grid.o.rows().indexOf(refRows(settingsTab)[issue.row]):issue.row;if(issue.category==='Settings: length_colours'){const target=refRows('length_colours')[issue.row];row=grid.o.rows().indexOf(target);if(row<0){notice(`This colour assignment belongs to ${target?.vendor||'an unset vendor'} (${target?.unit||'unit unset'}). Select that vendor and unit on the Vendor tab to edit it.`,true);return;}}const col=Math.max(0,grid.o.columns.findIndex(c=>c.key===issue.field));grid.select(Math.max(0,grid.ids.indexOf(row)),col);}}
function download(name,value,type='application/json'){
  const blob=value instanceof Blob?value:new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)+'\n'],{type});const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notice(`Download requested: ${name}`);
}
function safeFilename(){return /^[^/\\]+\.json$/i.test(project.filename)?project.filename:'unconfirmed_cable_stock.json';}
function downloadBackupNow(){download(`${safeFilename().replace(/\.json$/i,'')}.lampy-project.json`,project);dirty=false;save();}
function downloadBackup(){openDialog('Review project backup',body=>{body.append(node('p','Complete generator backup: cable stock, looms, adaptor markers, vendor version and imported baseline. This file is for reopening in this app.','note'));reviewBody(body);},[{label:'Cancel',run:d=>d.close()},{label:'Download project backup',cls:'primary',run:d=>{downloadBackupNow();d.close();}}]);}
function previewLooms(){const text=JSON.stringify({looms:project.looms.map(stockLoomJSON)},null,2);openDialog('Loom JSON · stock fragment',body=>{body.append(node('p','Loom stock fragment only. Use the complete cable-stock export to include vendor details and reopen it in this app. Lampy Paperwork needs its planned update to use these looms.','note warning'));reviewBody(body,changes(project).filter(c=>c.category===LOOMS),allIssues().filter(i=>i.category===LOOMS));body.append(node('pre',text));},[{label:'Copy JSON',run:async()=>{try{await navigator.clipboard.writeText(text);notice('Loom fragment copied.');}catch{notice('Select and copy the preview text.',true);}}},{label:'Download fragment',run:()=>download('looms.fragment.json',text)},{label:'Close',run:d=>d.close()}]);}
function preview(category){const value=category?{[category]:clone(project.stock.cables[category])}:runtimeJSON(project);const text=JSON.stringify(value,null,2);openDialog(category?`${category} · JSON fragment`:'Complete Lampy cable-stock JSON',body=>{if(category)body.append(node('p','Category fragment only. This is not a complete vendor document.','note warning'));reviewBody(body,changes(project).filter(c=>!category||c.category===category),allIssues().filter(i=>!category||i.category===category));body.append(node('pre',text));},[{label:'Copy JSON',run:async()=>{try{await navigator.clipboard.writeText(text);notice('JSON copied.');}catch{notice('Clipboard unavailable. Select and copy the preview text.',true);}}},{label:category?'Download fragment':'Download cable-stock JSON',run:()=>download(category?`${category.replace(/[/\\]/g,'_')}.fragment.json`:safeFilename(),text)},{label:'Close',run:d=>d.close()}]);}
function reviewBody(body,changeList=changes(project),issues=allIssues()){
  body.append(node('p',`${changeList.length} changes · ${issues.filter(i=>i.level==='error').length} errors · ${issues.filter(i=>i.level==='warning').length} warnings`,'note'));
  if(issues.some(i=>i.level==='error'))body.append(node('p','This draft contains errors. Downloading is allowed, but the output is not validated as ready for Lampy.','note error-note'));
  const categories=[...new Set(changeList.map(c=>c.category))];for(const cat of categories){body.append(node('h3',cat));const list=node('ul',null,'review-list');for(const c of changeList.filter(x=>x.category===cat)){const li=node('li');li.append(node('span',c.kind,'change-tag'),node('span',c.name));list.append(li);}body.append(list);}
  if(!changeList.length)body.append(node('p','No changes from the imported baseline.'));
  for(const issue of issues)body.append(node('p',`${issue.level.toUpperCase()} · ${issue.category}: ${issue.message} ${issue.fix}`));
}
function reviewExport(kind='json',category=null,blank=false){
  openDialog(blank?'Blank Excel template':'Review & export',body=>{
    reviewBody(body);if(kind==='json'&&(project.looms.length||project.vendorVersion||Object.values(project.adaptors||{}).some(Boolean)))body.append(node('p','The cable-stock download includes stock looms. Adaptor markers, generator vendor version and extra loom details (descriptions, connector overrides and component lengths) stay in project JSON and Excel backups. Save a backup as well to retain them. Imported custom fields remain untouched.','note warning'));
    const choice=node('div',null,'actions');choice.append(btn('Lampy cable-stock JSON',()=>reviewExport('json')),btn('Complete Excel',()=>reviewExport('excel')),btn('Blank Excel template',()=>reviewExport('excel',null,true)),btn('Project backup',downloadBackup));body.append(choice);
    body.append(node('p',kind==='json'?`File: ${safeFilename()}`:`Excel scope: ${category||'complete vendor'}${blank?' · blank template':''}`));
  },[{label:'Cancel',run:d=>d.close()},{label:kind==='json'?'Preview JSON':'Preview workbook layout',run:()=>kind==='json'?preview():workbookPreview(category,blank)},{label:allIssues().some(i=>i.level==='error')?'Download anyway':'Download',cls:'primary',run:d=>{
    try{if(kind==='json'){const stock=runtimeJSON(project),text=JSON.stringify(stock,null,2);projectFromStock(parseJSON(text));download(safeFilename(),text);if(!project.looms.length&&!project.vendorVersion&&!Object.values(project.adaptors||{}).some(Boolean)){dirty=false;save();}}
    else {if(!window.XLSX)throw new Error('Excel library did not load. Check vendor/xlsx.full.min.js.');const book=toWorkbook(project,window.XLSX,{category,blank});const bytes=window.XLSX.write(book,{bookType:'xlsx',type:'array'});download(`${blank?'template':safeFilename().replace(/\.json$/i,'')}${category?`-${category.replace(/[^\p{L}\p{N}_ -]/gu,'_')}`:''}.xlsx`,new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));if(!category&&!blank){dirty=false;save();}}
    d.close();}catch(e){notice(e.message,true);}
  }}]);
}
function workbookPreview(category,blank){try{const book=toWorkbook(project,window.XLSX,{category,blank});openDialog('Workbook layout',body=>{body.append(node('p','Category names map through _Categories. _Metadata preserves vendor details and custom document fields.'));for(const name of book.SheetNames){const rows=window.XLSX.utils.sheet_to_json(book.Sheets[name],{header:1});body.append(node('h3',name),node('pre',rows.slice(0,4).map(r=>r.join(' | ')).join('\n')));}},[{label:'Back to review',run:()=>reviewExport('excel',category,blank)}]);}catch(e){notice(e.message,true);}}
function exportReference(key){const value=clone(refs[key]);const issues=allIssues().filter(i=>i.category===`Settings: ${key}`);openDialog(`Download ${key}.json`,body=>{body.append(node('p',`${issues.length} reference issues. The filename is exactly ${key}.json.`));for(const issue of issues)body.append(node('p',issue.message,'note warning'));body.append(node('pre',JSON.stringify(value,null,2)));},[{label:'Cancel',run:d=>d.close()},{label:issues.length?'Download anyway':'Download',cls:'primary',run:d=>{download(`${key}.json`,value);referenceExports[key]=clone(value);save();d.close();}}]);}
async function importFile(file){
  if(!file)return;
  if(file.size>25*1024*1024){notice('File is larger than 25 MB. Split it before importing; your draft is unchanged.',true);return;}
  try{
    if(/\.xlsx$/i.test(file.name)){
      if(!window.XLSX)throw new Error('Excel library unavailable.');
      const book=window.XLSX.read(await file.arrayBuffer(),{type:'array',cellFormula:true});const imported=fromWorkbook(book,window.XLSX,project);
      const replacement=replaceWorkbook(project,imported.project,imported.partial,imported.categories),merged=mergeProjects(project,imported.project,imported.partial);
      openDialog('Review Excel import',body=>{body.append(node('p',`${file.name}. Incoming vendor: ${imported.project.stock.vendor.name}; unit: ${imported.project.stock.vendor.lengthUnit}. ${imported.partial?'Current vendor metadata will be retained.':'Vendor metadata will be imported.'} No length numbers will be converted. Replace updates the imported scope and removes absent rows in that scope. Merge keeps absent rows. Your original baseline is retained.`,'note'));if(imported.project.stock.vendor.lengthUnit!==project.stock.vendor.lengthUnit)body.append(node('p',`Unit differs from the current ${project.stock.vendor.lengthUnit} draft. Review all length numbers before applying.`,'note warning'));for(const n of imported.notices)body.append(node('p',n,'note warning'));body.append(node('h3','If you choose Replace'));reviewBody(body,changes(replacement,snapshot(project)),validate(replacement,refs));body.append(node('h3','If you choose Merge'));reviewBody(body,changes(merged,snapshot(project)),validate(merged,refs));},[{label:'Cancel',run:d=>d.close()},{label:'Merge',run:d=>{d.close();change(()=>project=merged);navigate('vendor');}},{label:'Replace imported scope',cls:'primary',run:d=>{d.close();change(()=>project=replacement);navigate('vendor');}}]);
    }else{
      const value=parseJSON(await file.text()),isProject=value.format==='lampy-cable-generator-project';const imported=isProject?restoreProject(value):projectFromStock(value,file.name);
      const importChanges=isProject?changes(imported,snapshot(project)):stockImportChanges(imported,project);
      openDialog('Review JSON import',body=>{body.append(node('p',`Import ${file.name} for ${imported.stock.vendor.name||'(unnamed vendor)'}? Your current draft will be replaced. Use Save project backup first if you need it.`,'note warning'));reviewBody(body,importChanges,validate(imported,refs));},[{label:'Cancel',run:d=>d.close()},{label:'Save current backup',run:downloadBackupNow},{label:'Import & replace draft',cls:'primary',run:d=>{d.close();change(()=>project=imported);dirty=false;save();navigate('vendor');}}]);
    }
  }catch(e){notice(`Import not applied: ${e.message}`,true);}
}
async function read(path){const response=await fetch(path,{cache:'no-cache'});if(!response.ok)throw new Error(`Could not load ${path} (${response.status}).`);return parseJSON(await response.text());}
async function start(){
  try{
    const entries=await Promise.all(Object.keys(REF_NAMES).map(async key=>[key,await read(`${['manifest','lighting_vendors'].includes(key)?'reference':'data'}/${key}.json`)]));refs=Object.fromEntries(entries);colourPalette=await read('reference/colour_options.json');referenceBaseline=clone(refs);referenceExports=clone(refs);
    const stored=key=>{try{return localStorage.getItem(key);}catch{saveError='Browser storage is unavailable. Download backups to keep your work.';return null;}};
    const savedRefs=stored(KEYS.prefs);if(savedRefs){lastSavedRefs=savedRefs;try{const saved=parseJSON(savedRefs);if(saved.refs){for(const key of Object.keys(REF_NAMES))if(saved.refs[key])refs[key]=saved.refs[key];referenceExports={...referenceExports,...(saved.referenceExports||{})};refDirty=!same(refs,referenceExports);}}catch{notice('Saved references could not be read. Original files loaded.',true);}}
    const raw=stored(KEYS.draft);if(raw){try{const saved=parseJSON(raw);project=restoreProject(saved.project);dirty=!!saved.dirty;lastSavedDraft=raw;}catch{notice('Saved draft could not be read. It has not been overwritten. Download backups for new work; clear the damaged site storage only after recovery.',true);saveError='Saved draft needs recovery. Autosave paused.';saveBlocked=true;}}
    syncVendorManifest(refs);loaded=true;if(fillCableConnectors(project,refs)){dirty=true;save();}renderAll();
    $('#settings-button').onclick=()=>navigate('settings');$('#errors-button').onclick=()=>navigate('errors');$('#import-button').onclick=()=>$('#file-input').click();$('#export-button').onclick=()=>reviewExport('json');$('#backup-button').onclick=downloadBackup;
    $('#file-input').onchange=async e=>{const file=e.target.files[0];e.target.value='';importPending=true;try{await importFile(file);}finally{importPending=false;}};document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigate(b.dataset.page));$('.brand').onclick=e=>{e.preventDefault();navigate('vendor');};
    window.addEventListener('beforeunload',e=>{if(!updateReload&&(dirty||refDirty||$('#loom-pane')?.open||[...document.querySelectorAll('[data-lampy-grid]')].some(el=>el.lampyGrid.editing&&el.lampyGrid.editor.value!==el.lampyGrid.editorOriginal))){e.preventDefault();e.returnValue='';}});
    window.addEventListener('storage',e=>{if((e.key===KEYS.draft&&e.newValue!==lastSavedDraft)||(e.key===KEYS.prefs&&e.newValue!==lastSavedRefs)){saveBlocked=true;saveError='Another tab changed this workspace. Save your backups before reloading.';status();notice(saveError,true);}});
    document.addEventListener('click',e=>{for(const host of document.querySelectorAll('[data-lampy-grid]')){const g=host.lampyGrid;if(g.editing&&!g.table.contains(e.target)&&!g.commitEditor()){e.preventDefault();e.stopImmediatePropagation();return;}}},true);
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.target.closest('input,textarea,table')&&!$('#dialog').open&&!$('#loom-pane')?.open){e.preventDefault();e.shiftKey?redo():undo();}});
    if(!saveError)save();
    watchUpdates(APP_VERSION,version=>{
      const banner=$('#update-notice');banner.hidden=false;
      $('#update-message').textContent=`${version} is available. Save your work and refresh to update.`;
    });
    $('#refresh-update').onpointerdown=e=>e.preventDefault();
    $('#refresh-update').onclick=()=>{
      try{
        safeRefresh({
          blocked:()=>{if(importPending)return 'Wait for the import preview before updating.';if($('#dialog').open||$('#loom-pane')?.open)return 'Finish or close the open dialog before updating.';
            if(saveBlocked)return saveError||'Saving is paused. Download backups before reloading.';
            const pending=[...document.querySelectorAll('#main [data-draft-value]')].find(el=>el.value!==el.dataset.draftValue);
            if(pending){pending.focus();return 'Finish this field before updating. Your entry has been kept.';}return '';},
          editors:()=>[...document.querySelectorAll('[data-lampy-grid]')].map(el=>el.lampyGrid),
          persist:()=>{save();if(saveError||saveBlocked)throw new Error(saveError||'Saving is paused.');
            if(localStorage.getItem(KEYS.draft)!==JSON.stringify({project,dirty})||localStorage.getItem(KEYS.prefs)!==JSON.stringify({refs,refDirty,referenceExports}))throw new Error('Could not verify your saved work. Refresh cancelled.');},
          reload:()=>{updateReload=true;window.location.replace(freshDocumentURL(window.location.href));}
        });
      }catch(e){updateReload=false;notice(e.message,true);}
    };
  }catch(e){$('#main').replaceChildren(node('h1','Workspace could not load'),node('p',e.message,'note error-note'),node('p','Run this folder through a local HTTP server, for example: python3 -m http.server 8080. Then open http://localhost:8080. Opening index.html directly with file:// cannot fetch the reference files.'));$('#save-status').textContent='Startup error';}
}
start();
