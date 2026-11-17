/* Clone the whole current page, retaining all author head/body content. */
export function captureAuthorAttributes(attributes=new WeakMap()){for(const el of document.querySelectorAll('*'))if(!attributes.has(el))attributes.set(el,{contenteditable:el.getAttribute('contenteditable'),spellcheck:el.getAttribute('spellcheck')});return attributes}
const runtimeSelector='#ie-toolbar,#ie-image-popup,#ie-marquee,#ie-resume,[data-built-at-editor-runtime],[data-codex-agent-overlay-root]';
export function exportHTML(originals){
 const page=document.documentElement.cloneNode(true);
 const live=[document.documentElement,...document.documentElement.querySelectorAll('*')];
 const clones=[page,...page.querySelectorAll('*')];
 clones.forEach((el,i)=>{
  if(el.matches(runtimeSelector)){el.remove();return}
  if(el.tagName==='SCRIPT'&&el.src){
   const url=new URL(el.getAttribute('src'),document.baseURI);
   if(['edit.built.at','side-edit.built.at'].includes(url.hostname)){el.remove();return}
  }
  if(el.classList.contains('ie-active-field')){el.classList.remove('ie-active-field');if(!el.className)el.removeAttribute('class')}
  if(el===page.querySelector('body'))el.classList.remove('ie-enabled','ie-preview','ie-dragging');
  const original=originals.get(live[i]);
  if(original)for(const name of ['contenteditable','spellcheck']){if(original[name]===null)el.removeAttribute(name);else el.setAttribute(name,original[name])}
  if(el.hasAttribute('style')){el.style.removeProperty('--ie-selection-outline');el.style.removeProperty('--ie-toolbar-height');el.style.removeProperty('--ie-original-padding-top');if(!el.getAttribute('style').trim())el.removeAttribute('style')}
 });
 const doctype=document.doctype;
 const declaration=doctype?'<!DOCTYPE '+doctype.name+(doctype.publicId?' PUBLIC "'+doctype.publicId+'"':'')+(doctype.systemId?(doctype.publicId?' "':' SYSTEM "')+doctype.systemId+'"':'')+'>':'<!DOCTYPE html>';
 return declaration+'\n'+page.outerHTML;
}
export async function copyHTML(html){
 if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(html);return}
 const input=document.createElement('textarea');input.value=html;input.style.cssText='position:fixed;left:-10000px';input.dataset.builtAtEditorRuntime='';document.body.append(input);input.select();
 try{if(!document.execCommand('copy'))throw new Error('Clipboard unavailable')}finally{input.remove()}
}
