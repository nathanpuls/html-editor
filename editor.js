/* HTML Editor: one-tag loader. This classic script loads native ES modules. */
(()=>{
 const script=document.currentScript;
 if(!script?.src)return;
 const base=new URL('.',script.src);
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('editor.css',base).href;
 document.head.append(style);
 import(new URL('interface.js',base).href).then(({startEditor})=>startEditor()).catch(error=>console.error('HTML Editor failed to initialize',error));
})();
