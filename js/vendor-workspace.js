import {clone,object,parseJSON} from './model.js';
export const VENDOR_WORKSPACE_KEY='lampy:vendor-workspaces:1';
const nameOf=(kind,project)=>kind==='cable'?project.stock.vendor.name:project.catalogue.vendor.name;
const slot=name=>'vendor:'+encodeURIComponent(String(name).trim().toLocaleLowerCase());
// Keep the existing draft keys intact. This additional index retains each vendor's
// last draft and carries the single selected vendor between the two editors.
export class VendorWorkspace{
  constructor(storage){
    this.storage=storage;this.key=VENDOR_WORKSPACE_KEY;this.raw=storage.getItem(this.key);
    this.value=this.raw===null?{version:1,selected:null,cable:{},rigging:{}}:parseJSON(this.raw);
    if(this.value.version!==1||!object(this.value.cable)||!object(this.value.rigging)||(this.value.selected!==null&&typeof this.value.selected!=='string'))throw Error('Saved vendor workspaces need recovery. Existing drafts have not been replaced.');
  }
  check(){if(this.storage.getItem(this.key)!==this.raw)throw Error('Another tab changed the selected vendor. Download a backup before reloading.');}
  write(value){this.check();const raw=JSON.stringify(value);this.storage.setItem(this.key,raw);if(this.storage.getItem(this.key)!==raw)throw Error('Could not verify saved vendor workspaces.');this.raw=raw;this.value=value;}
  get(kind,name){const saved=this.value[kind][slot(name)];return saved?clone(saved):null;}
  archive(kind,project,dirty){const next=clone(this.value);next[kind][slot(nameOf(kind,project))]={project:clone(project),dirty:!!dirty};this.write(next);}
  save(kind,project,dirty){const next=clone(this.value);next[kind][slot(nameOf(kind,project))]={project:clone(project),dirty:!!dirty};next.selected=nameOf(kind,project);this.write(next);}
  async activate(kind,project,dirty,load){
    this.archive(kind,project,dirty);
    let selected=this.value.selected;
    if(selected===null){
      // Upgrading with an existing cable draft uses its established selection.
      const cable=this.storage.getItem('lampy-cable:draft:1');
      selected=kind==='rigging'&&cable?parseJSON(cable)?.project?.stock?.vendor?.name:nameOf(kind,project);
      selected=typeof selected==='string'?selected:nameOf(kind,project);
    }
    let saved={project,dirty};
    if(slot(selected)!==slot(nameOf(kind,project)))saved=this.get(kind,selected)||{project:await load(selected),dirty:false};
    this.check();this.save(kind,saved.project,saved.dirty);return clone(saved);
  }
}
