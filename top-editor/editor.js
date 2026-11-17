/* One-tag Built.at top-toolbar loader. */
(()=>{
 if(window.__builtAtToolbarLoading)return;
 const script=document.currentScript;if(!script?.src)return;
 window.__builtAtToolbarLoading=true;
 script.dataset.builtAtEditorRuntime='';
 const base=new URL('.',script.src);
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('editor.css?v=20261117-copy-blue',base);style.dataset.builtAtEditorRuntime='';
 const ready=new Promise((resolve,reject)=>{style.onload=resolve;style.onerror=reject});document.head.append(style);
 Promise.all([ready,import(new URL('interface.js?v=20261117-copy-blue',base).href)]).then(([,module])=>{
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',module.startEditor,{once:true});else module.startEditor();
 }).catch(error=>{window.__builtAtToolbarLoading=false;console.error('Built.at editor failed to load',error)});
})();
