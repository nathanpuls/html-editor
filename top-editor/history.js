/* Snapshots keep node identities, listeners, every author attribute, and child order.
   This also restores deleted parents/children without reparsing HTML. */
export function createHistory(controls){
 const excluded=node=>controls().some(el=>el===node||el.contains(node))||node.nodeType===1&&node.matches('[data-built-at-editor-runtime]');
 const snapshot=()=>{
  const records=[];
  const visit=node=>{
   if(excluded(node))return;
   const children=[...node.childNodes].filter(child=>!excluded(child));
   records.push({node,children,attributes:node.nodeType===1?[...node.attributes].map(a=>[a.name,a.value]):null,text:node.nodeType===3||node.nodeType===8?node.data:null});
   children.forEach(visit);
  };
  visit(document.documentElement);return records;
 };
 const restore=records=>{
  for(const {node,children,attributes,text} of records){
   if(attributes){for(const attr of [...node.attributes])node.removeAttribute(attr.name);for(const [name,value] of attributes)node.setAttribute(name,value)}
   if(text!==null)node.data=text;
   for(const child of [...node.childNodes])if(!excluded(child)&&!children.includes(child))child.remove();
   // Insert in reverse so the exact sibling order is restored, preserving controls.
   let next=null;for(const child of [...children].reverse()){if(child.parentNode!==node||child.nextSibling!==next)node.insertBefore(child,next);next=child}
  }
  document.querySelectorAll('.ie-active-field').forEach(el=>{el.classList.remove('ie-active-field');el.style.removeProperty('--ie-selection-outline');if(el.hasAttribute('data-edit'))el.contentEditable='false'});
  document.body.classList.add('ie-enabled');document.body.classList.remove('ie-dragging');
 };
 return {snapshot,restore};
}

/* Apply saved author HTML without replacing the document or editor controls.
   Matching elements keep their node identities and existing page listeners. */
export function applyDocument(html){
 const parsed=new DOMParser().parseFromString(html,'text/html');
 const runtime=node=>node.nodeType===1&&node.matches('[data-built-at-editor-runtime],[data-codex-agent-overlay-root]');
 const key=node=>node.nodeType===1?[node.tagName,node.id,node.getAttribute('data-edit'),node.getAttribute('data-section')].join('|'):String(node.nodeType);
 const patch=(node,next)=>{
  if(node.nodeType===3||node.nodeType===8){if(node.data!==next.data)node.data=next.data;return}
  if(node.nodeType!==1)return;
  for(const a of [...node.attributes])if(!next.hasAttribute(a.name))node.removeAttribute(a.name);
  for(const a of next.attributes)if(node.getAttribute(a.name)!==a.value)node.setAttribute(a.name,a.value);
  const old=[...node.childNodes].filter(n=>!runtime(n));const used=new Set();
  let previous=null;
  for(const child of next.childNodes){
   let match=old.find(n=>!used.has(n)&&key(n)===key(child));
   if(match){used.add(match);patch(match,child)}else match=document.importNode(child,true);
   const anchor=previous?previous.nextSibling:node.firstChild;
   if(match!==anchor)node.insertBefore(match,anchor);
   previous=match;
  }
  for(const child of old)if(!used.has(child))child.remove();
 };
 patch(document.documentElement,parsed.documentElement);
}

/* Automatic per-page drafts. The source fingerprint rejects stale drafts. */
export function createDraftStore(sourceHTML,serialize,apply){
 let hash=2166136261;for(let i=0;i<sourceHTML.length;i++){hash^=sourceHTML.charCodeAt(i);hash=Math.imul(hash,16777619)}
 const url=new URL(location.href);for(const name of ['edit','preview','inspect','editor-load'])url.searchParams.delete(name);
 const key='built-at:toolbar:draft:'+url.origin+url.pathname+url.search;
 const source=sourceHTML.length+':'+(hash>>>0).toString(16);
 console.info('[Built.at draft] source',source);
 let last=sourceHTML,timer=null,paused=false;
 const clear=()=>{clearTimeout(timer);last=sourceHTML;try{localStorage.removeItem(key)}catch{}};
 const save=()=>{
  if(paused)return;
  const html=serialize();if(html===last)return;
  try{if(html===sourceHTML)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify({version:1,source,html}));last=html;console.info('[Built.at draft] saved',source,html.length)}catch(error){console.warn('[Built.at draft] save failed',String(error))}
 };
 const restore=()=>{
  try{const draft=JSON.parse(localStorage.getItem(key)||'null');if(!draft){console.info('[Built.at draft] none');return false}console.info('[Built.at draft] restoring',draft.source,source);
   if(draft.version!==1||draft.source!==source||typeof draft.html!=='string'){clear();return false}
   paused=true;apply(draft.html);last=draft.html;return true;
  }catch(error){console.warn('[Built.at draft] restore failed',String(error));clear();return false}finally{paused=false}
 };
 const observer=new MutationObserver(()=>{if(paused)return;clearTimeout(timer);timer=setTimeout(save,350)});
 const watch=()=>{observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true});document.addEventListener('input',schedule,true);window.addEventListener('pagehide',save)};
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(save,350)};
 const reset=fn=>{paused=true;observer.disconnect();clear();try{fn()}finally{paused=false;watch()}};
 return {restore,watch,clear,reset,save};
}
