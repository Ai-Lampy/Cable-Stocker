const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,run,cls)=>{const b=node('button',text,cls);b.type='button';b.onclick=run;return b;};
export function vendorSelector({getName,getVendors,onSelect}){
  const host=node('div',null,'vendor-field'),label=node('label','Vendor name'),controls=node('div',null,'vendor-controls'),box=node('div',null,'vendor-input-wrap'),input=node('input'),measure=node('span',null,'vendor-input-measure'),list=node('div',null,'vendor-options');
  input.id='vendor-name-input';input.type='text';input.value=getName();input.dataset.draftValue=input.value;input.autocomplete='off';
  measure.setAttribute('aria-hidden','true');const fit=()=>{measure.textContent=input.value+'\u00a0';};fit();
  label.htmlFor=input.id;input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls','vendor-options');input.setAttribute('aria-expanded','false');
  list.id='vendor-options';list.setAttribute('role','listbox');list.setAttribute('aria-label','Available vendors');list.hidden=true;
  let active=-1,options=[];
  const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
  const restore=()=>{input.value=getName();input.dataset.draftValue=input.value;fit();};
  const commit=name=>{close();restore();if(String(name).trim())onSelect(name);};
  const highlight=()=>{options.forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));if(active>=0){input.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');};
  const show=(query='')=>{
    fit();list.replaceChildren();options=[];active=-1;
    const names=[...new Set(getVendors().map(v=>v.name))].sort((a,b)=>a.localeCompare(b));
    for(const name of names.filter(name=>name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))){
      const option=node('div',name,'vendor-option');option.id=`vendor-option-${options.length}`;option.setAttribute('role','option');option.setAttribute('aria-selected','false');
      option.onmousedown=e=>e.preventDefault();option.onclick=()=>commit(name);options.push(option);list.append(option);
    }
    if(!options.length)list.append(node('p','No matching vendors. Enter a new name to add one.'));
    list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
  };
  input.onfocus=()=>{show();input.select();};input.onclick=()=>show();input.oninput=()=>show(input.value);
  input.onkeydown=e=>{
    if(e.key==='Escape'){e.preventDefault();close();restore();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();if(list.hidden)show();if(options.length){active=active<0?(e.key==='ArrowDown'?0:options.length-1):(active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;highlight();}return;
    }
    if(e.key==='Enter'){e.preventDefault();commit(active>=0?options[active].textContent:input.value);}
    if(e.key==='Tab'&&active>=0)commit(options[active].textContent);
  };
  const clear=btn('❌',()=>{input.value='';input.focus();show();},'vendor-clear');clear.setAttribute('aria-label','Clear vendor search');clear.title='Clear vendor search';clear.onmousedown=e=>e.preventDefault();
  input.onblur=e=>{if(e.relatedTarget===clear){close();return;}const value=input.value,changed=value!==input.dataset.draftValue;close();restore();if(changed&&value.trim()&&value!==getName())onSelect(value);};
  clear.onblur=e=>{if(e.relatedTarget!==input){close();restore();}};
  box.append(measure,input,list);controls.append(box,clear);host.append(label,controls);return host;
}
