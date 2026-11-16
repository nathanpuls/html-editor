/* Draft identity and compatibility helpers. */
export const pageSignature=()=>{
  const content=document.querySelectorAll('[data-edit]');
  const page=[document.title,...Array.from(document.querySelectorAll('style:not(#ue-style)')).map(el=>el.textContent),...Array.from(content).map(el=>el.outerHTML)].join('\u001f');
  let hash=2166136261;
  for(let i=0;i<page.length;i++)hash=Math.imul(hash^page.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
 };

export const draftCompatible=(saved,current)=>{
  if(!saved||!Array.isArray(saved.model)||saved.model.length<current.length)return false;
  const originals=saved.model.filter(item=>!item.added);
  if(originals.length!==current.length)return false;
  const byIndex=new Map(originals.map(item=>[item.index,item]));
  return byIndex.size===current.length&&current.every(item=>{
   const old=byIndex.get(item.index);
   return old&&old.tag===item.tag&&old.label===item.label&&old.group===item.group;
  });
 };

/* Browser storage may be blocked by privacy settings or file:// origins. */
export function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
export function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
export function removeStorage(key){try{localStorage.removeItem(key)}catch{}}
export function pushHistory(stack,snapshot,limit=80){if(stack.at(-1)===snapshot)return;stack.push(snapshot);if(stack.length>limit)stack.shift()}
export function popHistory(stack){const value=stack.pop();return value===undefined?null:JSON.parse(value)}
