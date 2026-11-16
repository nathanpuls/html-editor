/* HTML Editor v1 — standalone, dependency-free.
   Source: extracted from Dino → Shared!B22; this copy does not modify live.ends.at.
   Include with <script src="editor.js" defer></script> in any editable HTML page. */
(()=>{if(window.__universalEditReady)return;window.__universalEditReady=true;
const editorStyle=document.createElement('style');
editorStyle.id='ue-style';
editorStyle.textContent="#ue-pencil{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:2147483000;display:grid;place-items:center;width:44px;height:44px;border:1px solid #ddd;border-radius:50%;background:white;color:#111;box-shadow:0 3px 16px #0002;cursor:pointer}\n#ue-pencil svg,#ue-screen svg{width:18px;height:18px}\n#ue-screen{position:fixed;inset:0;z-index:2147483600;overflow:auto;height:100dvh;background:white;color:#171717;padding:calc(22px + env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));font:15px/1.5 Manrope,system-ui,sans-serif}\n#ue-screen[hidden],#ue-pencil[hidden]{display:none!important}\n#ue-screen *{box-sizing:border-box}\n#ue-wrap{max-width:560px;margin:auto}\n#ue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:24px}\n#ue-head strong{font-size:21px}\n#ue-screen button{font:inherit;cursor:pointer}\n#ue-head button,#ue-add{border:1px solid #ddd;background:#fff;color:#171717;border-radius:9px;padding:10px 13px}\n#ue-head #ue-copy{background:#171717;color:#fff;border-color:#171717}\n#ue-fields{display:grid;gap:18px}\n.ue-item{display:grid;gap:9px;padding-bottom:18px}\n.ue-item label{display:grid;gap:5px;font:700 12px/1.5 Manrope,system-ui,sans-serif;color:#666}\n.ue-item input,.ue-item textarea{width:100%;border:1px solid #ddd;border-radius:8px;padding:11px;background:#fff;color:#171717;font:500 16px/1.5 Manrope,system-ui,sans-serif}\n.ue-item textarea{min-height:110px;max-height:60dvh;resize:vertical;overflow-y:hidden}\n.ue-image-preview{display:block;max-width:100%;max-height:190px;object-fit:contain;object-position:left center;border-radius:8px;background:#f4f4f4}\n.ue-image-preview:not([src]){display:none}\n.ue-item textarea.ue-article{min-height:200px;line-height:1.7}\n#ue-screen.ue-fullscreen .ue-item textarea{max-height:80dvh}\n.ue-controls{display:flex;justify-content:flex-end;gap:5px}\n.ue-controls button{width:38px;height:36px;border:0;border-radius:7px;background:#f3f3f3;display:grid;place-items:center}\n.ue-controls button:disabled{opacity:.3}\n#ue-add{display:flex;align-items:center;gap:8px;margin-top:20px}\n#ue-add[hidden]{display:none!important}\n#ue-message{font-size:13px;color:#a22}\n#ue-screen{box-sizing:border-box;left:auto;right:0;top:0;bottom:0;width:min(430px,100%);height:100dvh;max-height:100dvh;border-left:1px solid #ddd;box-shadow:-12px 0 45px #0002;overflow:hidden;padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}\n#ue-wrap{display:flex;flex-direction:column;height:100%;min-height:0}\n#ue-head{flex:none;margin-bottom:16px;position:relative;justify-content:center;min-height:32px}\n#ue-fullscreen{position:absolute;right:0;top:0;display:grid;place-items:center;width:32px;height:32px;border:0!important;border-radius:7px;padding:0!important;background:transparent!important;color:#555!important}\n#ue-fullscreen:hover{background:#f2f2f2!important}\n#ue-body{scrollbar-width:none}\n#ue-body::-webkit-scrollbar{display:none}\n#ue-screen.ue-fullscreen{inset:0;width:100%;height:100dvh;max-height:100dvh;border:0;box-shadow:none;border-radius:0;padding:calc(22px + env(safe-area-inset-top)) 28px calc(16px + env(safe-area-inset-bottom))}\n#ue-screen.ue-fullscreen #ue-wrap{width:100%;max-width:880px;margin:0 auto}\n#ue-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 3px 24px}\n#ue-actions{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px 2px;background:white}\n#ue-actions button{min-width:104px;padding:11px 18px;border:1px solid #ddd;border-radius:9px;background:#fff;color:#171717}\n#ue-actions #ue-copy{background:#171717;color:white;border-color:#171717}\n@media(max-width:640px){#ue-screen:not(.ue-fullscreen){top:auto;bottom:0;left:0;right:0;width:100%;height:min(62dvh,620px);border-left:0;border-top:1px solid #ddd;border-radius:16px 16px 0 0;box-shadow:0 -12px 40px #0002}#ue-screen.ue-fullscreen{padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}}\n";
document.head.append(editorStyle);
function init(){
 const selector='[data-edit]';
 function editable(){return Array.from(document.querySelectorAll(selector)).filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!el.querySelector(selector));}
 if(!editable().length)return;
 const pencil=document.createElement('button');pencil.id='ue-pencil';pencil.type='button';pencil.title='Edit';pencil.setAttribute('aria-label','Edit page');pencil.innerHTML='<i data-lucide="pencil"></i>';
 const screen=document.createElement('section');screen.id='ue-screen';screen.hidden=true;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Edit page');
 screen.innerHTML='<div id="ue-wrap"><div id="ue-head"><strong>Edit page</strong><button id="ue-fullscreen" type="button" aria-label="Expand editor" title="Fullscreen"><i data-lucide="maximize"></i></button></div><div id="ue-body"><div id="ue-fields"></div><button id="ue-add" type="button" hidden><i data-lucide="plus"></i> Add link</button><p id="ue-message" role="status"></p></div><div id="ue-actions"><button id="ue-cancel" type="button">Cancel</button><button id="ue-copy" type="button">Copy</button></div></div>';
 document.body.append(pencil,screen);
 const fields=screen.querySelector('#ue-fields'),add=screen.querySelector('#ue-add'),message=screen.querySelector('#ue-message');
 const fullscreenButton=screen.querySelector('#ue-fullscreen');
 const scrollBody=screen.querySelector('#ue-body');
 screen.addEventListener('wheel',event=>{
  if(scrollBody.contains(event.target)||event.ctrlKey)return;
  if(scrollBody.scrollHeight<=scrollBody.clientHeight)return;
  event.preventDefault();
  const factor=event.deltaMode===1?16:event.deltaMode===2?scrollBody.clientHeight:1;
  scrollBody.scrollBy({top:event.deltaY*factor,left:event.deltaX*factor,behavior:'instant'});
 },{passive:false});
 function setFullscreen(on){
  screen.classList.toggle('ue-fullscreen',on);
  fullscreenButton.setAttribute('aria-label',on?'Exit fullscreen':'Expand editor');
  fullscreenButton.title=on?'Exit fullscreen':'Fullscreen';
  fullscreenButton.innerHTML='<i data-lucide="'+(on?'minimize':'maximize')+'"></i>';
  window.lucide?.createIcons?.();
 }
 fullscreenButton.onclick=()=>{setFullscreen(!screen.classList.contains('ue-fullscreen'));requestAnimationFrame(()=>fields.querySelectorAll('textarea').forEach(fitTextarea))};
 let model=[],baseline='',liveNodes=[],liveSnapshots=[],liveRoots=[],rootSnapshots=[];
 let draftActive=false,initialModel='';
 const hasChanges=()=>draftActive&&JSON.stringify(model)!==initialModel;
 function hideEditor(){if(!draftActive||screen.hidden)return;screen.hidden=true;pencil.hidden=false;pencil.title=hasChanges()?'Resume editing (unsaved changes)':'Resume editing'}
 window.addEventListener('beforeunload',event=>{if(!hasChanges())return;event.preventDefault();event.returnValue='';});
 const setText=(el,value)=>{el.textContent=value};
 const articleText=el=>Array.from(el.children).map(p=>p.textContent.trim()).join('\n\n');
 const isArticle=el=>/^(DIV|SECTION|ARTICLE|MAIN)$/.test(el.tagName)&&el.children.length>0&&Array.from(el.children).every(c=>c.tagName==='P');
 const setArticle=(el,value)=>{
  const doc=el.ownerDocument;
  const paragraphs=value.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/);
  el.replaceChildren(...paragraphs.map(text=>{const p=doc.createElement('p');p.textContent=text.trim().replace(/\n/g,' ');return p}));
 };
 function restoreLive(){
  liveRoots.forEach((root,i)=>{root.innerHTML=rootSnapshots[i]});
  liveSnapshots.forEach(({node,html,href,src,alt,srcset,sizes})=>{if(!node.isConnected)return;if(node.tagName==='IMG'){for(const [k,v] of [['src',src],['alt',alt],['srcset',srcset],['sizes',sizes]]){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}}else{node.innerHTML=html;if(href===null)node.removeAttribute('href');else node.setAttribute('href',href)}});
 }
 function syncLive(){
  for(const item of model){
   if(item.group!==null||item.added)continue;
   const node=liveSnapshots[item.index]?.node;
   if(!node?.isConnected)continue;
   if(item.image){if(item.src!==item.originalSrc&&validImageURL(item.src)){node.setAttribute('src',normalizeURL(item.src));node.removeAttribute('srcset');node.removeAttribute('sizes')}node.setAttribute('alt',item.alt);continue}
   if(item.article){if(item.text!==item.originalText)setArticle(node,item.text)}else setText(node,item.text);
   if(item.link&&validURL(item.url))node.setAttribute('href',normalizeURL(item.url));
  }
  liveRoots.forEach((root,gi)=>{
   root.innerHTML=rootSnapshots[gi];
   [...root.children].filter(el=>el.matches('a[data-edit]')).forEach(el=>el.remove());
   for(const item of model.filter(x=>x.group===gi)){
    if(!item.link)continue;
    const node=item.added?document.createElement('a'):liveSnapshots[item.index]?.clone.cloneNode(true);
    if(!node)continue;
    node.setAttribute('data-edit','');
    node.setAttribute('href',normalizeURL(item.url)||'#');
    setText(node,item.text);
    if(root.lastChild&&root.lastChild.nodeType!==3)root.append(document.createTextNode(' '));
    root.append(node);
   }
  });
 }
 const icons=()=>window.lucide?.createIcons?.();
 const normalizeURL=value=>{
  const input=String(value||'').trim();
  if(!input||/\s/.test(input))return '';
  if(/^(mailto:|tel:|\/|#)/i.test(input))return input;
  const candidate=/^https?:\/\//i.test(input)?input:'https://'+input;
  try{const u=new URL(candidate);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))return '';return candidate}catch{return ''}
 };
 const validURL=v=>Boolean(normalizeURL(v));
 const validImageURL=v=>Boolean(normalizeURL(v)&&/^https?:\/\//i.test(normalizeURL(v)));
 const displayURL=v=>String(v||'').replace(/^https:\/\//i,'');
 function fitTextarea(input){
  const wasScrolled=input.scrollTop;
  input.style.height='auto';
  const limit=window.innerHeight*(screen.classList.contains('ue-fullscreen')?.8:.6);
  const min=input.classList.contains('ue-article')?200:110;
  input.style.height=Math.max(min,Math.min(input.scrollHeight,limit))+'px';
  input.style.overflowY=input.scrollHeight>limit?'auto':'hidden';
  input.scrollTop=wasScrolled;
 }
 function render(){
  fields.replaceChildren();
  for(const item of model){
   const box=document.createElement('div');box.className='ue-item';
   const label=document.createElement('label');label.textContent=item.label|| (item.image?'Image':item.link?'Link text':item.tag==='p'?'Paragraph':'Text');
   if(item.image){
    const preview=document.createElement('img');preview.className='ue-image-preview';preview.alt='Image preview';
    const updatePreview=()=>{if(validImageURL(item.src)){preview.src=normalizeURL(item.src)}else{preview.removeAttribute('src')}};
    updatePreview();box.append(preview);
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com/photo.jpg';url.value=displayURL(item.src);
    url.oninput=()=>{item.src=url.value;updatePreview();syncLive()};
    label.append(url);box.append(label);
    const altLabel=document.createElement('label');altLabel.textContent='Alt text';
    const altInput=document.createElement('input');altInput.type='text';altInput.value=item.alt;
    altInput.oninput=()=>{item.alt=altInput.value;syncLive()};
    altLabel.append(altInput);box.append(altLabel);
   }else{
    const input=document.createElement(item.article||item.tag==='p'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';if(item.article)input.classList.add('ue-article');input.value=item.text;input.oninput=()=>{item.text=input.value;if(input.tagName==='TEXTAREA')fitTextarea(input);syncLive()};label.append(input);box.append(label);
   }
   if(item.link){
    const lbl=document.createElement('label');lbl.textContent='URL';const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com';url.value=item.url.replace(/^https:\/\//i,'');url.oninput=()=>{item.url=url.value;syncLive()};lbl.append(url);box.append(lbl);
   }
   if(item.group!==null){
    const controls=document.createElement('div');controls.className='ue-controls';
    for(const [verb,ico] of [['up','arrow-up'],['down','arrow-down'],['delete','trash-2']]){
     const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',verb);b.title=verb;b.innerHTML='<i data-lucide="'+ico+'"></i>';
     b.onclick=()=>{const group=model.filter(x=>x.group===item.group),i=group.indexOf(item);if(verb==='delete')model.splice(model.indexOf(item),1);else if(verb==='up'&&i>0){const j=model.indexOf(group[i-1]),k=model.indexOf(item);[model[j],model[k]]=[model[k],model[j]]}else if(verb==='down'&&i<group.length-1){const j=model.indexOf(group[i+1]),k=model.indexOf(item);[model[j],model[k]]=[model[k],model[j]]}render()};controls.append(b)
    }box.append(controls);
   }
   fields.append(box);
  }fields.querySelectorAll('textarea').forEach(fitTextarea);icons();syncLive();
 }
 function close(restore=true){if(restore)restoreLive();draftActive=false;initialModel='';screen.hidden=true;pencil.hidden=false;pencil.title='Edit'}
 function copyHTML(){
  const parser=new DOMParser(),doc=parser.parseFromString(baseline,'text/html');
  const source=Array.from(doc.querySelectorAll('[data-edit]')).filter(el=>!el.querySelector('[data-edit]'));
  const originals=model.filter(x=>!x.added);
  if(source.length!==liveSnapshots.length)throw Error('Page structure changed. Reload and try again.');
  for(const item of originals){
   const element=source[item.index];if(!element)throw Error('Editable element missing.');
   if(item.image){if(!validImageURL(item.src))throw Error('Enter a valid image URL.');if(item.src!==item.originalSrc){element.setAttribute('src',normalizeURL(item.src));element.removeAttribute('srcset');element.removeAttribute('sizes')}element.setAttribute('alt',item.alt);continue}
   if(item.article){if(item.text!==item.originalText)setArticle(element,item.text)}else element.textContent=item.text;
   if(item.link){if(!validURL(item.url.trim()))throw Error('Invalid link URL.');element.setAttribute('href',normalizeURL(item.url))}
  }
  // Link collections are opt-in: <nav data-edit="links"><a data-edit ...>...</a></nav>
  const groups=Array.from(doc.querySelectorAll('[data-edit="links"]'));
  groups.forEach((g,gi)=>{
   const members=model.filter(x=>x.group===gi);
   const old=Array.from(g.children).filter(el=>el.matches('a[data-edit]'));
   old.forEach(el=>el.remove());
   for(const item of members){
    if(!item.link||!validURL(item.url.trim()))throw Error('Enter a valid link URL.');
    const node=item.added?doc.createElement('a'):source[item.index].cloneNode(true);
    node.setAttribute('data-edit','');node.setAttribute('href',normalizeURL(item.url));
    node.textContent=item.text;
    if(g.lastChild&&g.lastChild.nodeType!==3)g.append(doc.createTextNode(' '));
    g.append(node);
   }
  });
  doc.querySelector('#ue-pencil')?.remove();doc.querySelector('#ue-screen')?.remove();doc.querySelector('#ue-style')?.remove();doc.querySelector('#ue-script')?.remove();
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 }
 pencil.onclick=()=>{
  if(draftActive){screen.hidden=false;pencil.hidden=true;return}
  const sourceTag=document.getElementById('ends-nav-data');
  let sourceHTML;
  try{sourceHTML=JSON.parse(sourceTag?.textContent||'{}').source}catch{}
  if(typeof sourceHTML!=='string'||!sourceHTML.trim()){
   sourceHTML='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  }
  baseline=sourceHTML;
  const roots=Array.from(document.querySelectorAll('[data-edit="links"]')).filter(root=>root.querySelector('a[data-edit]'));
  liveRoots=roots;rootSnapshots=roots.map(root=>root.innerHTML);
  liveNodes=editable().filter(el=>el.getAttribute('data-edit')!=='links');
  liveSnapshots=liveNodes.map(node=>({node,html:node.innerHTML,href:node.getAttribute('href'),src:node.getAttribute('src'),alt:node.getAttribute('alt'),srcset:node.getAttribute('srcset'),sizes:node.getAttribute('sizes'),clone:node.cloneNode(true)}));
  model=liveNodes.map((el,i)=>{
   const group=el.closest('[data-edit="links"]');
   const article=isArticle(el),image=el.tagName==='IMG',text=article?articleText(el):el.textContent.trim();
   return {index:i,tag:el.tagName.toLowerCase(),article,image,src:el.getAttribute('src')||'',originalSrc:el.getAttribute('src')||'',alt:el.getAttribute('alt')||'',originalText:text,link:el.tagName==='A',label:(el.getAttribute('data-label')||el.getAttribute('aria-label')||'').trim(),text,url:el.getAttribute('href')||'',group:group?roots.indexOf(group):null};
  });
  draftActive=true;initialModel=JSON.stringify(model);
  pencil.hidden=true;screen.hidden=false;message.textContent='';
  add.hidden=!model.some(item=>item.link&&item.group!==null);render();
 };
 add.onclick=()=>{const group=model.find(x=>x.link&&x.group!==null)?.group;if(group===undefined)return;model.push({added:true,index:-1,tag:'a',link:true,text:'',url:'',group});render();fields.lastElementChild?.querySelector('input')?.focus()};
 screen.querySelector('#ue-cancel').onclick=()=>close(true);
 document.addEventListener('pointerdown',event=>{
  if(!draftActive||screen.hidden)return;
  if(screen.contains(event.target)||pencil.contains(event.target))return;
  hideEditor();
 });
 screen.querySelector('#ue-copy').onclick=async()=>{
  try{
   if(model.some(x=>x.link&&(!x.text.trim()||!validURL(x.url.trim()))))throw Error('Every link needs text and a valid URL.');
   const value=copyHTML();
   if(window.endsSharedCopyText)await window.endsSharedCopyText(value);else await navigator.clipboard.writeText(value);
   const sourceTag=document.getElementById('ends-nav-data');
   if(sourceTag){try{const data=JSON.parse(sourceTag.textContent||'{}');data.source=value;sourceTag.textContent=JSON.stringify(data).replace(/</g,'\\u003c')}catch{}}
   close(false);
  }catch(e){message.textContent=e.message||'Copy failed';}
 };
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!screen.hidden){hideEditor();return}
  if(e.key.toLowerCase()!=='e'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||!screen.hidden)return;
  const target=e.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'))return;
  e.preventDefault();pencil.click();
 });icons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
