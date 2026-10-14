import {clone, same, object, parseJSON, parseLengths, visibleTableColumns} from './model.js';

export function display(value) { return Array.isArray(value) ? value.join(', ') : value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''); }
export function sortedLengths(values){return [...values].sort((a,b)=>{const valid=x=>typeof x==='number'&&Number.isFinite(x);return valid(a)&&valid(b)?a-b:valid(a)?-1:valid(b)?1:0;});}
export function parseCell(value, column) {
  if(column.parse)return column.parse(value);
  if(column.type==='boolean'){const text=String(value).trim().toLowerCase();if(!['','yes','no','true','false'].includes(text))throw new Error('Use yes or no.');return ['yes','true'].includes(text);}
  if(column.type==='positive'){const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new Error('Use one positive number.');return n;}
  if (column.type === 'lengths') {const parsed=parseLengths(value);if(parsed.duplicates.length)throw new Error(`Duplicate lengths: ${parsed.duplicates.join(', ')}. Remove duplicates or use the chip editor.`);return parsed.values;}
  if (column.type === 'aliases') return String(value).split(/[;,]/).map(x => x.trim()).filter(Boolean);
  if (column.type === 'json') {const parsed=parseJSON(String(value).trim() || '{}');if(!object(parsed))throw new Error('This column needs a JSON object.');return parsed;}
  if (column.type === 'integer') { if (!/^\d+$/.test(String(value)) || Number(value) < 1) throw new Error('Use a positive whole number.'); return Number(value); }
  return String(value);
}
// Quoted TSV supports multiline cells copied from Excel.
export function parseTSV(text) {
  const rows = [[]]; let value = '', quoted = false;
  text = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  for (let i=0;i<text.length;i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i+1] === '"') {value += '"'; i++;}
      else if (quoted || !value) quoted = !quoted;
      else value += c;
    } else if (!quoted && (c === '\t' || c === '\n')) { rows.at(-1).push(value); value=''; if (c==='\n') rows.push([]); }
    else value += c;
  }
  if (quoted) throw new Error('Unclosed quote in clipboard data.');
  rows.at(-1).push(value);
  if (rows.length > 1 && rows.at(-1).length === 1 && rows.at(-1)[0] === '') rows.pop();
  return rows;
}
export function toTSV(rows) { return rows.map(row => row.map(x => { const s=display(x); return /[\t\n"]/.test(s) ? `"${s.replaceAll('"','""')}"` : s; }).join('\t')).join('\n'); }
const el = (tag, text, className) => { const n=document.createElement(tag); if(text!=null)n.textContent=text; if(className)n.className=className; return n; };
export class Grid {
  constructor(host, options) {
    this.host=host;host.dataset.lampyGrid='';host.lampyGrid=this; this.o={...options,columns:visibleTableColumns(options.columns)}; this.selection={r:0,c:0,rr:0,cc:0}; this.filter=''; this.sort=this.defaultSort();
    try { this.prefs=JSON.parse(localStorage.getItem(`lampy-grid:${options.key}`)) || {}; } catch { this.prefs={}; }
    this.prefs={zoom:1,wrap:true,...this.prefs,...(this.prefs.layoutVersion===2?{}:{widths:{},align:'center',layoutVersion:2})};
    this.render();
  }
  defaultSort(){const key=['name','vendor','type','length'].find(key=>this.o.columns.some(col=>col.key===key));return key?{key,dir:1}:null;}
  resetSort(){if(this.editing&&!this.commitEditor())return false;const target=this.currentGrid();target.sort=target.defaultSort();target.renderBody();return true;}
  resetWidths(){if(this.editing&&!this.commitEditor())return false;const target=this.currentGrid();target.prefs.widths={};target.pref();target.renderBody();return true;}
  pref() { try {localStorage.setItem(`lampy-grid:${this.o.key}`, JSON.stringify(this.prefs));} catch {this.o.notice('Table preferences could not be saved.');} }
  indices() {
    let ids=Array.from({length:Math.max(5,this.o.rows().length,...[...(this.entryIds||[])].map(i=>i+1))},(_,i)=>i);
    if(this.filter)ids=ids.filter(i=>this.entryIds?.has(i)||this.o.columns.some(c=>display(this.value(i,c.key)).toLowerCase().includes(this.filter.toLowerCase())));
    if(this.sort)ids.sort((a,b)=>{const count=this.o.rows().length;if(a>=count||b>=count)return a>=count?(b>=count?0:1):-1;const av=display(this.value(a,this.sort.key)).trim(),bv=display(this.value(b,this.sort.key)).trim();if(!av||!bv)return !av?(!bv?0:1):-1;const an=this.value(a,this.sort.key),bn=this.value(b,this.sort.key);return (typeof an==='number'&&typeof bn==='number'?an-bn:av.localeCompare(bv,undefined,{numeric:true,sensitivity:'base'}))*this.sort.dir;});
    return ids;
  }
  render() {
    this.host.replaceChildren();
    const toolbar=el('div',null,'grid-toolbar');
    const button=(label,fn,title)=>{const b=el('button',label);b.type='button';if(title)b.title=title;b.onclick=fn;toolbar.append(b);return b;};
    button('+ Row',()=>{this.o.add();this.render();});
    button('Undo',()=>this.o.undo()); button('Redo',()=>this.o.redo());
    button('Copy',()=>this.copy()); button('Paste',()=>this.pasteClipboard());
    button('Fill down',()=>this.fill());
    button('Delete rows',()=>this.remove());
    button('Clear sort',()=>this.resetSort(),'Restore the default table order');
    button('Reset widths',()=>this.resetWidths(),'Reset this table’s columns to 150 px');
    const search=el('input');search.type='search';search.placeholder='Search this table';search.setAttribute('aria-label','Search this table');search.value=this.filter;
    search.oninput=()=>{this.filter=search.value;this.selection={r:0,c:0,rr:0,cc:0};this.renderBody();};toolbar.append(search);
    button('−',()=>this.zoom(-.1),'Zoom out');
    this.zoomLabel=button(`${Math.round(this.prefs.zoom*100)}%`,()=>{this.prefs.zoom=1;this.updateStyle();},'Reset table zoom');
    button('+',()=>this.zoom(.1),'Zoom in');
    const align=el('select');align.setAttribute('aria-label','Text alignment');
    for(const value of ['left','center','right']){const option=el('option',`${value[0].toUpperCase()+value.slice(1)} align`);option.value=value;align.append(option);}align.value=this.prefs.align;align.onchange=()=>{this.prefs.align=align.value;this.updateStyle();};toolbar.append(align);
    button('Wrap text',()=>{this.prefs.wrap=!this.prefs.wrap;this.updateStyle();});
    const save=button('Save table',()=>{
      if(this.editor.value!==this.editorOriginal&&!this.commitEditor())return;
      if(this.o.save?.()!==true)return;
      const previous=this.prefs.highlights;
      this.prefs.highlights={context:this.o.highlightContext,rows:this.o.rows().map((r,i)=>({id:this.o.rowKey?.(r,i)??i,values:Object.fromEntries((this.o.highlightColumns||this.o.columns).map(c=>[c.key,clone(this.o.get(r,c.key))]))}))};
      try{localStorage.setItem(`lampy-grid:${this.o.key}`,JSON.stringify(this.prefs));this.renderBody();if(!this.host.isConnected)this.o.saved?.();}
      catch{this.prefs.highlights=previous;this.o.notice('Data saved, but table highlights could not be saved.',true);}
    },'Save this table locally and clear its edit highlights');save.className='primary save-table';
    this.host.append(toolbar);
    this.address=el('span');this.editor=el('input');this.editor.className='cell-editor';this.editor.setAttribute('aria-label','Edit selected cell');this.editorOriginal='';this.editing=false;
    this.editor.onclick=e=>e.stopPropagation();this.editor.ondblclick=e=>e.stopPropagation();
    this.editor.onkeydown=e=>{
      e.stopPropagation();
      if(e.isComposing)return;
      if(this.suggestionKey(e))return;
      if(e.key==='Tab'){e.preventDefault();this.moveTab(e.shiftKey,true);}
      else if(e.key==='Enter'){e.preventDefault();this.moveEnter(e.shiftKey,true);}
      else if(e.key==='Escape'){e.preventDefault();this.editing=false;this.renderBody();this.focusCell();}
    };
    this.scroller=el('div',null,'grid-scroll');this.table=el('table',null,'sheet');this.table.setAttribute('aria-label',this.o.label);this.table.setAttribute('role','grid');this.table.tabIndex=0;
    this.scroller.append(this.table);this.host.append(this.scroller);
    const hint='Type to edit the selected cell · Double-click or F2: edit existing text · Tab / Enter: accept and move · Escape: cancel · Shift+arrows: select range · Drag the green corner to fill · Paste: Excel cells';
    this.host.append(this.o.hint?this.o.hint(hint):el('p',hint,'grid-help'));
    const footer=el('div',null,'grid-footer'),bottomSave=el('button','Save table','primary save-table');bottomSave.type='button';bottomSave.title=save.title;bottomSave.onclick=save.onclick;footer.append(bottomSave);this.host.append(footer);
    this.table.onkeydown=e=>this.key(e);
    this.table.oncopy=e=>{if(e.target.closest('input,button'))return;e.preventDefault();e.clipboardData.setData('text/plain',this.selectionText());};
    this.table.onpaste=e=>{if(e.target.closest('input,button'))return;e.preventDefault();this.paste(e.clipboardData.getData('text/plain'));};
    this.renderBody();this.updateStyle();
  }
  renderBody() {
    this.closeSuggestions();
    this.ids=this.indices();this.table.replaceChildren();this.sizeColumns();
    const head=el('thead'),tr=el('tr');tr.append(el('th','#'));
    this.o.columns.forEach((col,c)=>{
      const th=el('th');th.style.width=`${this.columnWidth(col)}px`;
      const b=el('button',`${String.fromCharCode(65+c)} · ${col.label}${this.sort?.key===col.key?(this.sort.dir===1?' ↑':' ↓'):''}`);b.onclick=()=>{if(this.editing&&!this.commitEditor())return;const target=this.currentGrid();target.sort={key:col.key,dir:target.sort?.key===col.key?-target.sort.dir:1};target.renderBody();};th.append(b);
      const handle=el('span',null,'resize-handle');handle.role='separator';handle.tabIndex=0;handle.setAttribute('aria-label',`Resize ${col.label} column`);
      handle.onpointerdown=e=>{e.preventDefault();const x=e.clientX,w=th.getBoundingClientRect().width/this.prefs.zoom;handle.setPointerCapture(e.pointerId);handle.onpointermove=m=>{this.prefs.widths[col.key]=Math.max(1,w+(m.clientX-x)/this.prefs.zoom);th.style.width=`${this.prefs.widths[col.key]}px`;this.sizeColumns();};handle.onpointerup=()=>{handle.onpointermove=null;this.pref();};};
      handle.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopPropagation();this.prefs.widths[col.key]=Math.max(1,this.columnWidth(col)+(e.key==='ArrowRight'?20:-20));this.pref();th.style.width=`${this.columnWidth(col)}px`;this.sizeColumns();}};
      th.append(handle);tr.append(th);
    });head.append(tr);this.table.append(head);
    const body=el('tbody');
    this.ids.forEach((id,r)=>{
      const row=this.o.rows()[id],tr=el('tr');const num=el('th',String(r+1));num.scope='row';tr.append(num);
      this.o.columns.forEach((col,c)=>{
        const td=el('td');td.dataset.r=r;td.dataset.c=c;td.tabIndex=-1;td.setAttribute('role','gridcell');td.setAttribute('aria-label',`${col.label}, row ${r+1}`);
        const saved=this.prefs.highlights?.context===this.o.highlightContext?this.prefs.highlights:null;
        const previous=row&&saved?.rows.find(r=>r.id===(this.o.rowKey?.(row,id)??id));
        if(row&&(saved?!!previous&&!same(previous.values[col.key],this.o.get(row,col.key)):this.o.changed?.(id,col.key)))td.classList.add('changed');
        if(row&&(saved?!previous:this.o.added?.(id)))td.classList.add('added');
        const value=this.value(id,col.key);
        if(col.type==='boolean'){
          const check=el('input');check.type='checkbox';check.checked=!!value;check.setAttribute('aria-label',`${col.label}, row ${r+1}`);check.onclick=e=>e.stopPropagation();check.onchange=()=>this.apply([{id,col,text:String(check.checked)}]);td.append(check);
        }else if(col.render){col.render(value,td,{rowId:id,commit:text=>this.apply([{id,col,text}]),edit:initial=>this.edit(r,c,initial),enter:reverse=>{this.select(r,c);this.moveEnter(reverse);},tab:reverse=>{this.select(r,c);this.moveTab(reverse);}});
        }else if(col.type==='lengths'){
          const chips=el('div',null,'cell-chips');
          if(Array.isArray(value))sortedLengths(value).forEach(v=>chips.append(this.o.lengthChip?.(v)||el('span',String(v),'chip mini')));else chips.append(el('span',display(value),'invalid'));
          td.append(chips);
          const edit=el('button','Edit lengths','cell-action');edit.onclick=e=>{e.stopPropagation();if(this.editing&&!this.commitEditor())return;if(row)this.o.lengths(id);else this.edit(r,c);};td.append(edit);
        }else td.append(el('span',col.format?col.format(value):display(value),'cell-text'));
        td.onclick=e=>{if(this.filled){this.filled=false;return;}this.select(r,c,e.shiftKey);};
        td.ondblclick=()=>this.edit(r,c);
        td.onpointerenter=()=>{if(this.filling){this.selection.rr=r;this.selection.cc=c;this.paint();}};
        tr.append(td);
      });body.append(tr);
    });this.table.append(body);
    if(!this.ids.length){const row=el('tr'),td=el('td','No rows. Add a row or clear your search.');td.colSpan=this.o.columns.length+1;row.append(td);body.append(row);}
    this.selection.r=Math.max(0,Math.min(this.selection.r,this.ids.length-1));this.selection.rr=Math.max(0,Math.min(this.selection.rr,this.ids.length-1));this.paint();
  }
  columnWidth(col){return Math.max(1,this.prefs.widths[col.key]??150);}
  sizeColumns(){this.table.style.width=`${42+this.o.columns.reduce((sum,col)=>sum+this.columnWidth(col),0)}px`;}
  updateStyle(){this.table.style.zoom=this.prefs.zoom;this.table.style.textAlign=this.prefs.align;this.table.style.setProperty('--cell-justify',this.prefs.align==='center'?'center':this.prefs.align==='right'?'flex-end':'flex-start');this.table.classList.toggle('nowrap',!this.prefs.wrap);this.zoomLabel.textContent=`${Math.round(this.prefs.zoom*100)}%`;this.pref();}
  zoom(delta){this.prefs.zoom=Math.max(.5,Math.min(2,Math.round((this.prefs.zoom+delta)*10)/10));this.updateStyle();}
  bounds(){const s=this.selection;return {r:Math.min(s.r,s.rr),rr:Math.max(s.r,s.rr),c:Math.min(s.c,s.cc),cc:Math.max(s.c,s.cc)};}
  value(id,key){const row=this.o.rows()[id];return row?this.o.get(row,key):'';}
  currentGrid(){return this.host.isConnected?this:(this.o.current?.()||[...document.querySelectorAll('[data-lampy-grid]')].map(el=>el.lampyGrid).find(g=>g.o.key===this.o.key)||this);}
  select(r,c,extend=false){if(this.editing){if(!this.commitEditor())return false;const target=this.currentGrid();if(target!==this)return target.select(r,c,extend);}if(!this.ids.length)return; r=Math.max(0,Math.min(this.ids.length-1,r));c=Math.max(0,Math.min(this.o.columns.length-1,c));if(extend){this.selection.rr=r;this.selection.cc=c;}else this.selection={r,c,rr:r,cc:c};this.paint();this.focusCell(extend?r:undefined,extend?c:undefined);}
  paint(){
    const b=this.bounds();this.table.querySelectorAll('td[data-r]').forEach(td=>{const r=+td.dataset.r,c=+td.dataset.c,selected=r>=b.r&&r<=b.rr&&c>=b.c&&c<=b.cc;td.classList.toggle('selected',selected);td.setAttribute('aria-selected',String(selected));td.querySelector('.fill-handle')?.remove();});
    const {r,c}=this.selection;this.address.textContent=`${String.fromCharCode(65+c)}${r+1}`;
    this.editor.value=this.ids[r]===undefined?'':display(this.value(this.ids[r],this.o.columns[c].key));
    this.editor.value=this.o.columns[c].editFormat?.(this.editor.value)??this.editor.value;
    this.editorOriginal=this.editor.value;
    this.editor.disabled=!!this.o.readOnly?.(this.ids[r],this.o.columns[c].key);
    this.editor.setAttribute('list',this.o.columns[c].list||'');
    const last=this.table.querySelector(`td[data-r="${b.rr}"][data-c="${b.cc}"]`);
    if(last){const h=el('span',null,'fill-handle');h.title='Drag to copy selected cells';h.onpointerdown=e=>{e.stopPropagation();e.preventDefault();this.filling=clone(this.bounds());const finish=()=>{const source=this.filling;this.filling=null;this.filled=true;this.fill(source);document.removeEventListener('pointerup',finish);};document.addEventListener('pointerup',finish);};last.append(h);}
  }
  focusCell(r=this.selection.r,c=this.selection.c){const td=this.table.querySelector(`td[data-r="${r}"][data-c="${c}"]`);td?.focus({preventScroll:true});td?.scrollIntoView({block:'nearest',inline:'nearest'});}
  commitEditor(){
    if(!this.editing&&this.editor.value===this.editorOriginal)return true;
    const {r,c}=this.selection;if(this.ids[r]===undefined)return true;
    if(this.editor.value===this.editorOriginal){this.editing=false;this.renderBody();return true;}
    this.editing=false;
    const ok=this.apply([{id:this.ids[r],col:this.o.columns[c],text:this.editor.value}],true);
    if(!ok){this.editing=true;this.editor.focus();}return ok;
  }
  edit(r,c,initial){
    this.select(r,c);if(this.editing)return;
    const col=this.o.columns[c];if(this.o.readOnly?.(this.ids[r],col.key))return;
    const td=this.table.querySelector(`td[data-r="${r}"][data-c="${c}"]`);if(!td)return;
    this.editing=true;this.editor.disabled=false;this.editor.value=initial===undefined?this.editorOriginal:initial;
    this.editor.setAttribute('list',col.list||'');td.replaceChildren(this.editor);this.editor.focus();
    this.editor.oninput=()=>this.showSuggestions();this.showSuggestions();
    if(initial===undefined)this.editor.select();else this.editor.setSelectionRange(this.editor.value.length,this.editor.value.length);
  }
  closeSuggestions(){this.suggestionMenu?.remove();this.suggestionMenu=null;this.suggestionIndex=-1;this.editor?.removeAttribute?.('role');this.editor?.removeAttribute?.('aria-autocomplete');this.editor?.removeAttribute?.('aria-controls');this.editor?.removeAttribute?.('aria-expanded');this.editor?.removeAttribute?.('aria-activedescendant');}
  showSuggestions(){
    this.closeSuggestions();const col=this.o.columns[this.selection.c];if(!col.suggestions||!this.editing)return;
    this.suggestions=col.suggestions(this.editor.value);const menu=el('div',null,'colour-suggestions');menu.id=`suggest-${this.o.key.replace(/[^a-z0-9]/gi,'-')}`;menu.setAttribute('popover','manual');menu.setAttribute('role','listbox');menu.setAttribute('aria-label','Matching colours');
    const choose=option=>{this.editor.value=option.value;if(this.commitEditor())this.currentGrid().focusCell();};
    this.suggestions.forEach((option,i)=>{const b=el('button',option.label,'colour-option');b.type='button';b.id=`${menu.id}-${i}`;b.setAttribute('role','option');b.setAttribute('aria-selected','false');b.style.background=option.background;b.style.color=option.color;b.onpointerdown=e=>e.preventDefault();b.onclick=e=>{e.stopPropagation();choose(option);};menu.append(b);});
    if(!this.suggestions.length)menu.append(el('p','No matching colours. Choose a colour from the supplied palette.'));
    this.editor.parentElement.append(menu);this.suggestionMenu=menu;const rect=this.editor.getBoundingClientRect();menu.style.zoom=String(1/(this.prefs.zoom||1));menu.style.width=`${Math.max(180,rect.width)}px`;menu.style.left=`${Math.max(8,Math.min(rect.left,window.innerWidth-Math.max(180,rect.width)-8))}px`;menu.style.top=`${Math.min(rect.bottom+4,Math.max(8,window.innerHeight-220))}px`;menu.showPopover();
    this.editor.setAttribute('role','combobox');this.editor.setAttribute('aria-autocomplete','list');this.editor.setAttribute('aria-controls',menu.id);this.editor.setAttribute('aria-expanded','true');
  }
  suggestionKey(e){
    if(!this.suggestionMenu)return false;
    if(['ArrowDown','ArrowUp'].includes(e.key)){
      e.preventDefault();const n=this.suggestions.length;if(!n)return true;
      this.suggestionIndex=this.suggestionIndex<0?(e.key==='ArrowDown'?0:n-1):(this.suggestionIndex+(e.key==='ArrowDown'?1:-1)+n)%n;
      [...this.suggestionMenu.querySelectorAll('[role="option"]')].forEach((el,i)=>{el.setAttribute('aria-selected',String(i===this.suggestionIndex));if(i===this.suggestionIndex){this.editor.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'});}});return true;
    }
    if(['Enter','Tab'].includes(e.key)&&this.suggestionIndex>=0)this.editor.value=this.suggestions[this.suggestionIndex].value;
    return false;
  }
  moveEnter(reverse=false,commit=false){
    const {r,c}=this.selection,id=this.ids[r],key=this.o.columns[c]?.key,last=r===this.ids.length-1;
    if(id===undefined)return false;
    if(commit&&!this.commitEditor())return false;
    const target=this.currentGrid();
    target.entryIds=new Set([...(target.entryIds||[]),...(this.entryIds||[])]);
    const column=Math.max(0,target.o.columns.findIndex(col=>col.key===key));
    if(!reverse&&last){
      // A blank entry slot is UI only until the user enters data.
      const next=Math.max(5,target.o.rows().length,...target.ids.map(i=>i+1),...[...target.entryIds].map(i=>i+1));
      target.entryIds.add(next);target.renderBody();target.select(target.ids.indexOf(next),column);
    }else{
      const row=target.ids.indexOf(id);target.select((row<0?r:row)+(reverse?-1:1),column);
    }
    return true;
  }
  moveTab(reverse=false,commit=false){
    const {r,c}=this.selection,id=this.ids[r],key=this.o.columns[c]?.key;
    if(commit&&this.editor.value!==this.editorOriginal&&!this.commitEditor()){this.editor.focus();return false;}
    // Editing a cable name/adaptor can rebuild the table and its visible columns.
    const target=this.host.isConnected?this:(this.o.current?.()||this);
    if(!target.ids.length)return true;
    const row=Math.max(0,target.ids.indexOf(id)),column=Math.max(0,target.o.columns.findIndex(col=>col.key===key));
    const width=target.o.columns.length,last=target.ids.length*width-1;
    const next=Math.max(0,Math.min(last,row*width+column+(reverse?-1:1)));
    target.select(Math.floor(next/width),next%width);return true;
  }
  key(e){
    if(e.isComposing||e.target.classList?.contains('cell-editor'))return;
    if(e.key==='Enter'&&e.target.closest('td[data-r]')&&!e.target.closest('button')){e.preventDefault();const cell=e.target.closest('td[data-r]');this.selection={r:+cell.dataset.r,c:+cell.dataset.c,rr:+cell.dataset.r,cc:+cell.dataset.c};this.moveEnter(e.shiftKey);return;}
    if(e.key==='Tab'&&e.target.closest('td[data-r]')){e.preventDefault();const cell=e.target.closest('td[data-r]');this.selection={r:+cell.dataset.r,c:+cell.dataset.c,rr:+cell.dataset.r,cc:+cell.dataset.c};this.moveTab(e.shiftKey);return;}
    if(e.target.closest('input,button'))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?this.o.redo():this.o.undo();return;}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();this.selection={r:0,c:0,rr:this.ids.length-1,cc:this.o.columns.length-1};this.paint();return;}
    const moves={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
    if(moves[e.key]){e.preventDefault();const [dr,dc]=moves[e.key],r=e.shiftKey?this.selection.rr:this.selection.r,c=e.shiftKey?this.selection.cc:this.selection.c;this.select(r+dr,c+dc,e.shiftKey&&e.key!=='Enter');}
    else if(e.key==='Enter'){e.preventDefault();this.moveEnter(e.shiftKey);}
    else if(e.key==='Tab'){e.preventDefault();this.moveTab(e.shiftKey);}
    else if(e.key==='F2'){e.preventDefault();this.edit(this.selection.r,this.selection.c);}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();const b=this.bounds(),patch=[];for(let r=b.r;r<=b.rr;r++)for(let c=b.c;c<=b.cc;c++)patch.push({id:this.ids[r],col:this.o.columns[c],text:''});this.apply(patch);}
    else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();this.edit(this.selection.r,this.selection.c,e.key);}
  }
  selectionText(){const b=this.bounds(),rows=[];for(let r=b.r;r<=b.rr;r++){if(this.ids[r]===undefined)continue;const row=[];for(let c=b.c;c<=b.cc;c++)row.push(this.value(this.ids[r],this.o.columns[c].key));rows.push(row);}return toTSV(rows);}
  async copy(){try{await navigator.clipboard.writeText(this.selectionText());this.o.notice('Selected cells copied.');}catch{this.o.notice('Clipboard permission unavailable. Select cells and press Ctrl/⌘ C.');}}
  async pasteClipboard(){try{this.paste(await navigator.clipboard.readText());}catch{this.o.notice('Clipboard permission unavailable. Select a cell and press Ctrl/⌘ V.');}}
  paste(text){try{
    const matrix=parseTSV(text),{r,c}=this.selection,patch=[];
    if(matrix.some(row=>row.length+c>this.o.columns.length))throw new Error('Paste exceeds the table columns. Nothing changed.');
    if(this.filter&&r+matrix.length>this.ids.length)throw new Error('Clear the search filter before pasting new rows.');
    const nextId=Math.max(this.o.rows().length,...this.ids.map(id=>id+1));
    matrix.forEach((row,dr)=>row.forEach((v,dc)=>patch.push({id:this.ids[r+dr]??nextId+(r+dr-this.ids.length),col:this.o.columns[c+dc],text:v})));
    this.apply(patch,true);
  }catch(error){this.o.notice(error.message,true);}}
  apply(patches,allowNew=false){try{
    if(this.editing&&!this.commitEditor())return false;
    // Parse every cell before mutating anything: a bad rectangle is atomic.
    const parsed=patches.filter(p=>{
      if(p.id>=this.o.rows().length&&!String(p.text).trim())return false;
      if(!this.o.readOnly?.(p.id,p.col.key,patches))return true;
      if(String(p.text).trim())throw new Error('This field is editable only for adaptors.');
      return false;
    }).map(p=>({...p,value:parseCell(p.text,p.col)}));
    if(!parsed.length){this.renderBody();return true;}
    this.o.apply(parsed,allowNew||parsed.some(p=>p.id>=this.o.rows().length));this.renderBody();this.focusCell();
    return true;
  }catch(error){this.o.notice(`${error.message} No cells from this operation were changed.`,true);return false;}}
  fill(source){const target=this.bounds();source||={r:target.r,rr:target.r,c:target.c,cc:target.cc};const patches=[];
    for(let r=target.r;r<=target.rr;r++)for(let c=target.c;c<=target.cc;c++){
      const sr=source.r+(r-target.r)%(source.rr-source.r+1),sc=source.c+(c-target.c)%(source.cc-source.c+1);
      if(this.ids[r]!==undefined&&this.ids[sr]!==undefined)patches.push({id:this.ids[r],col:this.o.columns[c],text:display(this.value(this.ids[sr],this.o.columns[sc].key))});
    }this.apply(patches);
  }
  remove(){const b=this.bounds(),ids=this.ids.slice(b.r,b.rr+1).filter(id=>id<this.o.rows().length);if(ids.length)this.o.remove(ids);}
}
