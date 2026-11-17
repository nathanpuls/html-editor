/* Inline Editor variant: reuse the existing editor engine without changing it. */
(()=>{
 const base=new URL('.',document.currentScript.src);
 const original=new URL('../editor.js',base);
 const script=document.createElement('script');
 script.src=original.href;script.defer=true;
 script.onload=()=>{
   const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('inline.css',base).href;document.head.append(css);
   import(new URL('inline.js',base).href).then(m=>m.mountInlineEditor());
 };
 document.head.append(script);
})();