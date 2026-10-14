// Read release metadata as text; never execute a newer module in an older session.
export function newerVersion(current, source) {
  const match = source.trim().match(/^export const APP_VERSION = ['"](v\d+\.\d+\.\d+)['"];?$/);
  if (!match || !/^v\d+\.\d+\.\d+$/.test(current)) return null;
  const next = match[1].slice(1).split('.').map(Number), old = current.slice(1).split('.').map(Number);
  for (let i=0;i<3;i++) { if(next[i]>old[i])return match[1];if(next[i]<old[i])return null; }
  return null;
}

export function watchUpdates(current, available, {fetcher=fetch, doc=document, win=window, interval=300000}={}) {
  let busy=false, last=0;
  const check=async()=>{
    if(busy||doc.hidden||Date.now()-last<30000)return;
    busy=true;last=Date.now();
    try {
      const url=new URL('js/version.js',doc.baseURI);url.searchParams.set('check',String(last));
      const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(response.ok){const version=newerVersion(current,await response.text());if(version)available(version);}
    }catch{/* Offline or incomplete publishing must not interrupt editing. */}
    finally{busy=false;}
  };
  const timer=win.setInterval(check,interval);
  doc.addEventListener('visibilitychange',check);win.addEventListener('focus',check);check();
  return ()=>{win.clearInterval(timer);doc.removeEventListener('visibilitychange',check);win.removeEventListener('focus',check);};
}

export function safeRefresh({blocked,editors,persist,reload}) {
  let reason=blocked();if(reason)throw new Error(reason);
  // Multiple loom grids can contain pending entries. Refuse rather than let a
  // page rebuild discard another grid's editor during the first commit.
  const pending=editors().filter(g=>g.editor&&!g.editor.disabled&&g.editor.value!==g.editorOriginal);
  if(pending.length>1)throw new Error('Apply your pending table entries before updating. Your entries have been kept.');
  for(const g of pending)if(!g.commitEditor())throw new Error('Correct the selected cell before updating. Your entry has been kept.');
  reason=blocked();if(reason)throw new Error(reason);
  persist();reload();
}

// A fresh document plus release-specific module URLs avoids stale reload loops.
export function freshDocumentURL(current, token=Date.now()) {
  const url=new URL(current);url.searchParams.set('_lampy_update',String(token));return url.href;
}
