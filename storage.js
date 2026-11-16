/* Draft identity and compatibility helpers. */
export const pageSignature=()=>{
  const content=document.querySelectorAll('[data-edit]');
  const page=[document.title,...Array.from(document.querySelectorAll('style:not(#ue-style)')).map(el=>el.textContent),...Array.from(content).map(el=>el.outerHTML)].join('\u001f');
  let hash=2166136261;
  for(let i=0;i<page.length;i++)hash=Math.imul(hash^page.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
 };

export const draftCompatible=(saved,current)=>{
  if(!saved||!Array.isArray(saved.model))return false;
  const originals=saved.model.filter(item=>!item.added);
  if(originals.length!==current.length)return false;
  return current.every((item,i)=>{
   const old=originals[i];
   return old&&old.tag===item.tag&&old.label===item.label&&old.group===item.group;
  });
 };
// The edit flag and transient preview query parameters must never change
// the browser storage address for the same document.
export const draftStorageKey=(url=location.href)=>{
 const page=new URL(url);
 return 'html-editor:draft:v2:'+page.origin+page.pathname;
};
export const recoverDraftModel=(saved,current)=>{
 if(!saved||!Array.isArray(saved.model))return null;
 if(draftCompatible(saved,current))return saved.model;
 // Recover by field identity when a generated preview adds, removes, or
 // reorders fields. Duplicate labels are paired by their source order.
 const identity=item=>[item.tag,item.label,item.group].join('\\u001f');
 const pools=new Map();
 for(const item of saved.model.filter(x=>!x.added)){
  const key=identity(item);
  if(!pools.has(key))pools.set(key,[]);
  pools.get(key).push(item);
 }
 let matched=0;
 const rebuilt=current.map(item=>{
  const found=pools.get(identity(item))?.shift();
  if(!found)return item;
  matched++;
  return {...item,...found,index:item.index,tag:item.tag,label:item.label,group:item.group,added:false};
 });
 if(!matched)return null;
 // Added links can be retained if their target link group still exists.
 for(const item of saved.model.filter(x=>x.added&&x.link&&Number.isInteger(x.group))){
  if(current.some(x=>x.group===item.group&&x.link))rebuilt.push({...item});
 }
 return rebuilt;
};

/* Browser storage may be blocked by privacy settings or file:// origins. */
export function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
export function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
export function removeStorage(key){try{localStorage.removeItem(key)}catch{}}
export function pushHistory(stack,snapshot,limit=80){if(stack.at(-1)===snapshot)return;stack.push(snapshot);if(stack.length>limit)stack.shift()}
export function popHistory(stack){const value=stack.pop();return value===undefined?null:JSON.parse(value)}
