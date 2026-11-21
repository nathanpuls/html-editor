/* One-tag Built.at top-toolbar loader. */
(()=>{
 if(window.__builtAtToolbarLoading)return;
 const script=document.currentScript;if(!script?.src)return;
 window.__builtAtToolbarLoading=true;
 script.dataset.builtAtEditorRuntime='';
 const base=new URL('.',script.src);
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('editor.css?v=20261120-color-swatches',base);style.dataset.builtAtEditorRuntime='';
 const ready=new Promise((resolve,reject)=>{style.onload=resolve;style.onerror=reject});document.head.append(style);
 Promise.all([ready,import(new URL('interface.js?v=20261120-direct-paste',base).href)]).then(([,module])=>{
  const start=()=>module.startEditor({
   startInPreview:script.hasAttribute('data-built-at-preview')&&!new URL(location.href).searchParams.has('edit'),
   workspace:script.getAttribute('data-built-at-workspace'),
   workspaceParent:script.getAttribute('data-built-at-parent-origin'),
   workspaceEmpty:script.hasAttribute('data-built-at-workspace-empty'),
   workspaceDraft:script.getAttribute('data-built-at-draft'),
   workspaceRecent:script.getAttribute('data-built-at-recent-colors')
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 }).catch(error=>{window.__builtAtToolbarLoading=false;console.error('Built.at editor failed to load',error)});
})();
