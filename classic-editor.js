/* HTML Editor: one-tag loader. Loads a fresh module and stylesheet on every page load. */
(()=>{
 const script=document.currentScript;
 if(!script?.src)return;
 const base=new URL('.',script.src);
 const stamp=String(Date.now());
 const asset=name=>{const url=new URL(name,base);url.searchParams.set('editor-load',stamp);return url.href};
 const style=document.createElement('link');style.id='ue-stylesheet';style.rel='stylesheet';style.href=asset('editor.css');
 document.head.append(style);
 import(asset('interface.js')).then(({startEditor})=>startEditor()).catch(error=>console.error('HTML Editor failed to initialize',error));
})();
