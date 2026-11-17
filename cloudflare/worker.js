// Built.at editor assets. Side-panel release is pinned independently.
const sideRelease='4feade71c37eb8c3a66a8e44bc9c1aa159fb3d70';
const sideFiles=new Set(['classic-editor.js','interface.js','content.js','design.js','storage.js','export.js','json-schema.js','visual-controls.js','branding.js','editor.css','demo.html']);
const topFiles=new Set(['editor.js','interface.js','toolbar.js','design.js','history.js','export.js','editor.css','demo.html','sample.html']);
export default {async fetch(request){
 const url=new URL(request.url);
 const top=url.hostname==='edit.built.at'||url.pathname.startsWith('/top/');
 let file=decodeURIComponent(url.pathname.replace(/^\/top\//,'/')).slice(1);
 if(!file||file==='editor.js')file=top?'editor.js':'classic-editor.js';
 const headers={'access-control-allow-origin':'*','cache-control':'no-store, max-age=0','x-content-type-options':'nosniff'};
 if(request.method==='OPTIONS')return new Response(null,{headers:{...headers,'access-control-allow-methods':'GET, HEAD, OPTIONS'}});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
 if(!(top?topFiles:sideFiles).has(file))return new Response('Not found',{status:404,headers});
 const source=new URL('https://raw.githubusercontent.com/nathanpuls/html-editor/'+(top?'main/top-editor/':sideRelease+'/')+file);
 if(top)source.searchParams.set('refresh',String(Date.now()));
 try{
  const response=await fetch(source,{cf:{cacheTtl:0}});
  if(!response.ok)return new Response('Editor asset unavailable',{status:502,headers});
  headers['content-type']=file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript; charset=utf-8';
  let body=response.body;
  if(!top&&file==='demo.html')body=(await response.text()).replaceAll('https://edit.built.at','https://side-edit.built.at');
  return new Response(request.method==='HEAD'?null:body,{headers});
 }catch{return new Response('Editor asset unavailable',{status:502,headers})}
}};
