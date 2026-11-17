/* Built.at editor entry: temporarily show the experimental inline toolbar.
   The original pencil editor remains available through classic-editor.js. */
(()=>{
 const script=document.currentScript;
 if(!script?.src)return;
 const base=new URL('.',script.src);
 const stamp=String(Date.now());
 const asset=name=>{const url=new URL(name,base);url.searchParams.set('editor-load',stamp);return url.href};
 for(const name of ['editor.css','inline editor/inline.css']){
   const style=document.createElement('link');style.rel='stylesheet';style.href=asset(name);document.head.append(style);
 }
 import(asset('interface.js')).then(async({startEditor})=>{
   startEditor();
   const {mountInlineEditor}=await import(asset('inline editor/inline.js'));
   mountInlineEditor();
 }).catch(error=>console.error('HTML Editor failed to initialize',error));
})();
