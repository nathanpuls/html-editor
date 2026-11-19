/* Lucide icons — https://lucide.dev
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
import {toolbarHTML,mountTools} from './toolbar.js?v=20261119-selection';
import {hex,ensureGoogleFont,mountColorPicker,cloneEditable,mountPageDrag,mountNumber,mountFontPicker,mountOverflow,contrastingInk,outlineName,mountPageColors,restoreStyleProperties} from './design.js?v=20261119-selection';
import {createHistory,createDraftStore,applyDocument} from './history.js';
import {captureAuthorAttributes,exportHTML,copyHTML} from './export.js';

/* Selection and interaction logic extracted from Pages!B4. */
export function startEditor(){
 const {snapshot,restore}=createHistory(()=>[...document.querySelectorAll('[data-built-at-editor-runtime],#ie-toolbar,#ie-image-popup,#ie-marquee,#ie-resume')]);
 // Capture the loaded document before editor setup or any saved draft is applied.
 const original=snapshot();
 const originalRecords=new Map(original.map(record=>[record.node,record]));
 const originalStyles=new WeakMap(original.filter(record=>record.attributes).map(record=>[record.node,record.attributes.find(([name])=>name==='style')?.[1]||'']));
 const authorAttributes=captureAuthorAttributes();
 const sourceHTML=exportHTML(authorAttributes);

 document.body.style.setProperty('--ie-original-padding-top',getComputedStyle(document.body).paddingTop);

 if(document.getElementById('ie-toolbar')?.dataset.ready==='true')return;
 function syncHistoryButtons(){
 const undoButton=document.getElementById('ie-undo'),redoButton=document.getElementById('ie-redo');
 if(undoButton)undoButton.disabled=undo.length===0;
 if(redoButton)redoButton.disabled=redo.length===0;
 }
 const historyStack=()=>new Proxy([],{set(target,key,value){const result=Reflect.set(target,key,value);syncHistoryButtons();return result}});
 const undo=historyStack(),redo=historyStack();let active=null,preview=false,mode='page';const selected=new Set();const removed=new Set();
 const bar=document.getElementById('ie-toolbar')||document.createElement('div');bar.id='ie-toolbar';bar.dataset.ready='true';bar.dataset.builtAtEditorRuntime='';
 bar.innerHTML=toolbarHTML;
 bar.querySelector('#ie-delete').before(bar.querySelector('#ie-undo'),bar.querySelector('#ie-redo'));
 bar.querySelector('#ie-redo').after(bar.querySelector('#ie-revert-selected'));
 document.body.prepend(bar);document.body.classList.add('ie-enabled');

 const imagePopup=document.createElement('div');imagePopup.id='ie-image-popup';imagePopup.dataset.builtAtEditorRuntime='';imagePopup.hidden=true;
 imagePopup.innerHTML='<label for="ie-image-url">Image URL</label><input id="ie-image-url" type="url" placeholder="Paste image URL"><label for="ie-image-alt" id="ie-image-alt-label">Alt text</label><input id="ie-image-alt" type="text"><label for="ie-link-url" id="ie-link-url-label">Link URL</label><input id="ie-link-url" type="text"><label for="ie-placeholder">Placeholder</label><input id="ie-placeholder" type="text"><label for="ie-icon-name">Lucide icon</label><input id="ie-icon-name" type="text" placeholder="arrow-up-right"><p id="ie-url-status" role="status" aria-live="polite" hidden></p>';
 document.body.append(imagePopup);
 const imageInput=imagePopup.querySelector('input');
 const imageTarget=el=>el?.tagName==='IMG'||el?.matches('.hero-art,[role="img"]')||!!el&&getComputedStyle(el).backgroundImage!=='none';
 const imageValue=el=>{if(el.tagName==='IMG')return el.getAttribute('src')||'';const bg=getComputedStyle(el).backgroundImage;return bg.startsWith('url(')?bg.slice(4,-1).replace(/^["']|["']$/g,''):''};
 let popupTarget=null;
 const showImagePopup=el=>{document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:imagePopup}));popupTarget=el;imagePopup.querySelector('#ie-url-status').hidden=true;imagePopup.hidden=false;const image=imageTarget(el),link=el.closest('a');for(const id of ['ie-placeholder']){const input=imagePopup.querySelector('#'+id),visible=el.matches('input,textarea');input.hidden=!visible;input.previousElementSibling.hidden=!visible;input.value=el.getAttribute('placeholder')||''}const icon=imagePopup.querySelector('#ie-icon-name'),svg=el.matches('svg')?el:el.querySelector('svg');icon.hidden=!svg;icon.previousElementSibling.hidden=!svg;icon.value=svg?.getAttribute('data-lucide')||el.getAttribute('data-lucide')||'';imageInput.hidden=!image;imagePopup.querySelector('label[for=ie-image-url]').hidden=!image;imageInput.value=image?imageValue(el):'';for(const id of ['ie-image-alt','ie-image-alt-label'])imagePopup.querySelector('#'+id).hidden=el.tagName!=='IMG';imagePopup.querySelector('#ie-image-alt').value=el.getAttribute('alt')||'';for(const id of ['ie-link-url','ie-link-url-label'])imagePopup.querySelector('#'+id).hidden=!link;imagePopup.querySelector('#ie-link-url').value=link?.getAttribute('href')||'';const r=el.getBoundingClientRect();imagePopup.style.left=Math.max(10,Math.min(innerWidth-310,r.left))+'px';imagePopup.style.top=Math.max(10,Math.min(innerHeight-imagePopup.offsetHeight-10,Math.max(bar.getBoundingClientRect().bottom+8,r.bottom+10)))+'px'};
 const pendingFields=new Map();let imageRevision=0;
 const urlStatus=message=>{const status=imagePopup.querySelector('#ie-url-status');status.textContent=message;status.hidden=!message};
 const validURL=(value,image=false)=>{if(!value||/\s/.test(value))return false;try{const url=new URL(value,document.baseURI);return image?['http:','https:','blob:'].includes(url.protocol)||/^data:image\//i.test(value):['http:','https:','mailto:','tel:'].includes(url.protocol)}catch{return false}};
 const recordChange=fn=>{undo.push(snapshot());redo.length=0;fn();drafts.save()};
 const applyField=({input,el,value,revision})=>{
  if(!el?.isConnected)return;
  if(input.id==='ie-placeholder'){if(el.getAttribute('placeholder')!==value)recordChange(()=>el.setAttribute('placeholder',value));return}
  if(input.id==='ie-icon-name'){
   if(!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value))return;const svg=el.matches('svg')?el:el.querySelector('svg');if(!svg||svg.getAttribute('data-lucide')===value)return;
   fetch('https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/'+value+'.svg').then(response=>{if(!response.ok)throw Error();return response.text()}).then(source=>{
    if(revision!==imageRevision||!svg.isConnected)return;const parsed=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;if(parsed.localName!=='svg'||parsed.querySelector('parsererror'))throw Error();
    const shapes=[...parsed.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse')].map(shape=>{const node=document.createElementNS('http://www.w3.org/2000/svg',shape.localName);for(const attr of [...shape.attributes])if(['d','cx','cy','r','rx','ry','x','y','x1','x2','y1','y2','width','height','points'].includes(attr.name))node.setAttribute(attr.name,attr.value);return node});
    if(!shapes.length)throw Error();recordChange(()=>{svg.replaceChildren(...shapes);svg.setAttribute('data-lucide',value);svg.style.removeProperty('fill');svg.style.removeProperty('stroke');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round')});urlStatus('');
   }).catch(()=>{if(revision===imageRevision)urlStatus('Icon not found. Previous icon kept.')});return;
  }
  if(input.id==='ie-link-url'){const link=el.closest('a');if(link&&validURL(value)&&link.getAttribute('href')!==value)recordChange(()=>link.setAttribute('href',value));return}
  if(input.id==='ie-image-alt'){if(el.tagName==='IMG'&&el.getAttribute('alt')!==value)recordChange(()=>el.setAttribute('alt',value));return}
  if(!validURL(value,true)||imageValue(el)===value)return;
  const previous=imageValue(el),probe=new Image();
  probe.onload=()=>{if(revision!==imageRevision||!el.isConnected||imageValue(el)!==previous)return;
   recordChange(()=>{if(el.tagName==='IMG'){el.setAttribute('src',value);el.removeAttribute('srcset');el.removeAttribute('sizes');const picture=el.closest('picture');picture?.querySelectorAll('source').forEach(source=>{source.removeAttribute('srcset');source.removeAttribute('sizes')})}else{el.style.backgroundImage='url('+JSON.stringify(value)+')';el.style.backgroundSize='cover';el.style.backgroundPosition='center';if(el.matches('.hero-art')){el.style.fontSize='0px';el.style.minHeight='125px'}}});if(popupTarget===el)urlStatus('');
  };
  probe.onerror=()=>{if(revision===imageRevision&&popupTarget===el)urlStatus('Image could not load. Previous image kept.')};
  probe.src=value;
 };
 const flushFields=()=>{for(const [input,record] of pendingFields){clearTimeout(record.timer);pendingFields.delete(input);applyField(record)}};
 const cancelURLUpdates=()=>{imageRevision++;for(const record of pendingFields.values())clearTimeout(record.timer);pendingFields.clear()};
 const hideImagePopup=()=>{flushFields();imagePopup.hidden=true};
 document.addEventListener('ie-open-panel',()=>hideImagePopup());window.addEventListener('resize',hideImagePopup);
 const queueField=(input,immediate=false)=>{
  if(input===imageInput)urlStatus('');
  const prior=pendingFields.get(input);if(prior)clearTimeout(prior.timer);
  const record={input,el:popupTarget,value:input.id==='ie-placeholder'?input.value:input.value.trim(),revision:input===imageInput||input.id==='ie-icon-name'?++imageRevision:imageRevision};
  pendingFields.delete(input);if(immediate)applyField(record);else{record.timer=setTimeout(()=>{pendingFields.delete(input);applyField(record)},350);pendingFields.set(input,record)}
 };
 for(const input of imagePopup.querySelectorAll('input')){
  let pasting=false;input.addEventListener('paste',()=>{pasting=true;queueMicrotask(()=>{pasting=false})});
  input.addEventListener('input',e=>queueField(input,pasting||e.inputType==='insertFromPaste'));
  input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();hideImagePopup()}});
 }
 document.addEventListener('pointerdown',e=>{if(!imagePopup.hidden&&!imagePopup.contains(e.target))hideImagePopup()},true);
 for(const input of [imageInput,imagePopup.querySelector('#ie-link-url')]){input.addEventListener('focus',()=>input.select());input.addEventListener('click',()=>input.select())}

 imagePopup.addEventListener('pointerdown',e=>e.stopPropagation());
 
 const updateToolbarHeight=()=>document.body.style.setProperty('--ie-toolbar-height',Math.ceil(bar.getBoundingClientRect().height)+'px');
 new ResizeObserver(updateToolbarHeight).observe(bar);updateToolbarHeight();
 const $=id=>document.getElementById(id);
 // Compare authored state only; selection and editing markers are not edits.
 const authorAttributesFor=attributes=>{
  const values=new Map(attributes.filter(([name])=>!['contenteditable','spellcheck'].includes(name)));
  if(values.has('class')){const value=values.get('class').split(/\s+/).filter(c=>c&&!['ie-active-field','ie-enabled','ie-preview','ie-dragging'].includes(c)).sort().join(' ');if(value)values.set('class',value);else values.delete('class')}
  if(values.has('style')){const style=document.createElement('span').style;style.cssText=values.get('style');for(const name of ['--ie-selection-outline','--ie-toolbar-height','--ie-original-padding-top'])style.removeProperty(name);const value=[...style].sort().map(name=>name+':'+style.getPropertyValue(name)+'!'+style.getPropertyPriority(name)).join(';');if(value)values.set('style',value);else values.delete('style')}
  return JSON.stringify([...values].sort(([a],[b])=>a.localeCompare(b)));
 };
 const changedFromOriginal=node=>{
  const record=originalRecords.get(node);if(!record)return true;
  if(record.text!==null&&node.data!==record.text)return true;
  if(record.attributes&&authorAttributesFor([...node.attributes].map(a=>[a.name,a.value]))!==authorAttributesFor(record.attributes))return true;
  const children=[...node.childNodes].filter(child=>!(child.nodeType===1&&child.matches('[data-built-at-editor-runtime]')));
  return children.length!==record.children.length||children.some((child,index)=>child!==record.children[index]||changedFromOriginal(child));
 };
 const canRevertSelection=()=>mode==='element'&&[...selected].some(el=>el.isConnected&&changedFromOriginal(el));
 const syncRevertButton=()=>{const button=bar.querySelector('#ie-revert-selected');if(button){const disabled=preview||!canRevertSelection();if(button.disabled!==disabled)button.disabled=disabled}};
 const current=()=>mode==='page'?document.body:(active||document.body);const structural=el=>el&&el.matches('header,footer,section,article,aside,nav,.card,.hero-art,[role="img"],button,.button,.btn,img');
 const editableSelector='[data-edit]';
 const editableElements=()=>[...document.querySelectorAll(editableSelector)].filter(el=>!el.closest('[data-built-at-editor-runtime]')&&el.isConnected);
 const elementName=el=>el?outlineName(el):'Page';
 let elementOptions=[];
 const refreshElementList=()=>{const list=$('ie-label');const elements=editableElements();elementOptions=elements;list.replaceChildren(new Option('Select Item',''));elements.forEach((el,i)=>list.add(new Option(elementName(el),String(i))));list.value=active?String(elements.indexOf(active)):'';if(list.value==='-1')list.value=''};
  const syncControls=()=>{syncHistoryButtons();$('ie-duplicate').disabled=mode!=='element'||selected.size!==1;syncRevertButton();$('ie-delete').hidden=false;$('ie-delete').disabled=mode!=='element'||!active;const enabled=mode==='page'||!!active;const targets=mode==='page'?[document.body]:[...selected].filter(el=>el.isConnected);
const textCapable=el=>!el.matches('img,hr,svg,video,canvas,[role="img"]')&&(!!el.textContent.trim()||el.matches('input,textarea,select,button'));
$('ie-font').disabled=!enabled||!targets.length||!targets.every(textCapable);$('ie-size').disabled=!enabled||!targets.length||!targets.every(el=>textCapable(el)||el.matches('svg,img'));
$('ie-color').disabled=!enabled||!targets.length||!targets.every(el=>textCapable(el)||el.matches('svg,svg *'));
['ie-bg','ie-radius','ie-border','ie-border-none','ie-padding'].forEach(id=>$(id).disabled=!enabled||!targets.length);
updateEmphasis();for(const control of document.querySelectorAll('.ie-format')){const input=control.querySelector('#ie-font,#ie-size,#ie-color,#ie-bg,#ie-border,#ie-radius,#ie-padding');control.hidden=!!input?.disabled}const el=enabled?current():null;$('ie-label').hidden=false;const name=selected.size>1?selected.size+' selected':elementName(active);refreshElementList();$('ie-label').title=name;$('ie-label').classList.toggle('ie-selected',mode==='element'&&!!active);if(!enabled)return;const c=getComputedStyle(current());$('ie-padding').value=Math.round(parseFloat(c.paddingLeft))||0;$('ie-padding').setAttribute('aria-valuenow',$('ie-padding').value);const paint=current().matches('svg,svg *')?[current(),...current().querySelectorAll('*')].map(node=>getComputedStyle(node)).find(style=>style.stroke!=='none'||style.fill!=='none'):null;if(![...$('ie-font').options].some(o=>o.value===c.fontFamily))$('ie-font').add(new Option(c.fontFamily.split(',')[0].replaceAll('"',''),c.fontFamily));$('ie-font').value=c.fontFamily;$('ie-size').value=Math.round(parseFloat(current().matches('svg,img')?c.width:c.fontSize))||16;$('ie-size').setAttribute('aria-valuenow',$('ie-size').value);$('ie-color').value=mode==='page'?(document.body.style.getPropertyValue('--ie-page-text-color')||hex(c.color)):(paint?hex(paint.stroke!=='none'?paint.stroke:paint.fill):(current().style.color?hex(current().style.color):hex(c.color)));$('ie-bg').value=hex(c.backgroundColor);$('ie-radius').value=Math.round(parseFloat(c.borderTopLeftRadius))||0;$('ie-radius').setAttribute('aria-valuenow',$('ie-radius').value);$('ie-size-value').textContent=$('ie-size').value+'px';$('ie-radius-value').textContent=$('ie-radius').value+'px';$('ie-border').value=hex(c.borderTopColor);$('ie-border-none').dataset.none=(c.borderTopStyle==='none'||parseFloat(c.borderTopWidth)===0)?'true':'false';$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true';updateColorSwatches();const fontLabel=$('ie-font').selectedOptions[0]?.textContent||c.fontFamily;$('ie-font-trigger').dataset.ieTooltip='Font: '+(fontLabel==='Default'?c.fontFamily:fontLabel);};
 const updateColorSwatches=()=>{for(const id of ['ie-color','ie-bg','ie-border']){const button=$(id);button.style.background=button.value;button.style.color=contrastingInk(button.value)}$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true'};['ie-color','ie-bg','ie-border'].forEach(id=>$(id).addEventListener('input',updateColorSwatches));
 let colorSession=null;
 const matchingElements=el=>mode==='element'&&selected.size>1?[...selected].filter(x=>x.isConnected):[el];
 const styleChange=(key,value,live=false)=>{if(mode==='element'&&!active)return;const el=current();if(live){if(!colorSession||colorSession.el!==el||colorSession.key!==key){undo.push(snapshot());redo.length=0;colorSession={el,key}}}else{colorSession=null;undo.push(snapshot());redo.length=0}if(mode==='page'&&key==='padding'){document.body.style.setProperty('padding',value);document.body.style.setProperty('--ie-original-padding-top',value)}else if(mode==='page'&&key==='fontFamily'){
  const targets=[document.body,...document.body.querySelectorAll('*')].filter(target=>!target.closest('[data-built-at-editor-runtime],#ie-toolbar,#ie-image-popup,#ie-marquee,#ie-resume,[data-codex-agent-overlay-root]'));
  for(const target of targets){if(value)target.style.setProperty('font-family',value,'important');else target.style.removeProperty('font-family')}
  let sheet=document.getElementById('ie-page-font-style');
  if(!value){sheet?.remove()}else{
   if(!sheet){sheet=document.createElement('style');sheet.id='ie-page-font-style';document.head.append(sheet)}
   // CSSOM serialization keeps font names inside a valid declaration.
   const declaration=document.createElement('span');declaration.style.fontFamily=value;
   sheet.textContent='body,body :not([data-built-at-editor-runtime]):not([data-built-at-editor-runtime] *){font-family:'+declaration.style.fontFamily+'!important}';
  }
 }else if(mode==='page'&&key==='color'){
  document.body.style.setProperty('--ie-page-text-color',value);
  let sheet=document.getElementById('ie-page-text-style');
  if(!sheet){sheet=document.createElement('style');sheet.id='ie-page-text-style';document.head.append(sheet)}
  sheet.textContent='body :not(#ie-toolbar):not(#ie-toolbar *):not([data-built-at-editor-runtime]):not([data-built-at-editor-runtime] *){color:var(--ie-page-text-color)!important}';
 }else {for(const target of matchingElements(el)){if(key==='iconSize'){target.style.setProperty('width',value,'important');target.style.setProperty('height',target.matches('img')?'auto':value,'important')}else if(key==='borderColor'){target.style.removeProperty('border-style');target.style.setProperty('border-color',value,'important');const cs=getComputedStyle(target);if(parseFloat(cs.borderTopWidth)===0||cs.borderTopStyle==='none'){target.style.setProperty('border-width','1px','important');target.style.setProperty('border-style','solid','important')}}else if(key==='color'&&mode==='element'){target.style.setProperty('color',value,'important');if(target.matches('svg,svg *'))for(const part of [target,...target.querySelectorAll('*')])for(const paint of ['stroke','fill']){const cs=getComputedStyle(part);if(cs[paint]&&cs[paint]!=='none')part.style.setProperty(paint,'currentColor','important')}}else if(key==='fontFamily')target.style.setProperty('font-family',value,'important');else target.style.setProperty(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important')}}if(key==='backgroundColor')updateSelectionContrast()};
 const resetFormatting=key=>{
  if(mode==='element'&&!active)return;const target=current(),page=mode==='page';
  colorPicker?.close();colorSession=null;undo.push(snapshot());redo.length=0;
  const targets=page&&key==='fontFamily'?[document.body,...document.body.querySelectorAll('*')].filter(el=>!el.closest('[data-built-at-editor-runtime]')):matchingElements(target);
  const borderProperties=['top','right','bottom','left'].flatMap(side=>['color','style','width'].map(part=>'border-'+side+'-'+part));
  for(const el of targets){
   const properties=key==='size'?(el.matches('svg,img')?['width','height']:['font-size']):key==='borderColor'?borderProperties:key==='padding'?['padding-top','padding-right','padding-bottom','padding-left']:key==='borderRadius'?['border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius']:[{fontFamily:'font-family',color:'color',backgroundColor:'background-color'}[key]];
   restoreStyleProperties(el,originalStyles.get(el),properties);
   if(key==='color'&&el.matches('svg,svg *'))for(const part of [el,...el.querySelectorAll('*')])restoreStyleProperties(part,originalStyles.get(part),['stroke','fill']);
  }
  if(page&&key==='padding'){const baseline=document.createElement('span').style;baseline.cssText=originalStyles.get(document.body)||'';document.body.style.setProperty('--ie-original-padding-top',baseline.paddingTop||'0px')}
  if(page&&key==='fontFamily')document.getElementById('ie-page-font-style')?.remove();
  if(page&&key==='color'){document.getElementById('ie-page-text-style')?.remove();restoreStyleProperties(document.body,originalStyles.get(document.body),['--ie-page-text-color'])}
  updateSelectionContrast();syncControls();drafts.save();
 };

 // Formatting applies to every text run in the selected elements.
 const emphasisControls=[];
 for(const [name,key,on,off,path] of [
 ['Bold','fontWeight','700','400','<path d="M6 12h9a4 4 0 0 1 0 8H6z"/><path d="M6 4h8a4 4 0 0 1 0 8H6z"/>'],
 ['Italic','fontStyle','italic','normal','<path d="M19 4h-9M14 20H5M15 4 9 20"/>']
 ]){
  const wrap=document.createElement('div');wrap.className='ie-format';wrap.dataset.format=name;
  const button=document.createElement('button');button.type='button';button.className='ie-circle';button.id='ie-'+name.toLowerCase();button.setAttribute('aria-label',name);button.title=name;button.setAttribute('aria-pressed','false');
  button.innerHTML='<svg data-lucide="'+name.toLowerCase()+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
  const label=document.createElement('span');label.className='ie-format-label';label.textContent=name;wrap.append(button,label);document.querySelector('[data-format="Size"]').after(wrap);
  const isOn=el=>key==='fontWeight'?Number(getComputedStyle(el)[key])>=600:getComputedStyle(el)[key]==='italic';
  button.addEventListener('pointerdown',e=>e.preventDefault());
  button.onclick=()=>{
   const targets=mode==='page'?[document.body]:[...selected].filter(el=>el.isConnected);if(!targets.length)return;
   const next=targets.every(isOn)?off:on;
   colorSession=null;undo.push(snapshot());redo.length=0;
   for(const target of targets)for(const node of [target,...target.querySelectorAll('*')]){
    if(node.closest('[data-built-at-editor-runtime]')||node.matches('svg,svg *,script,style,img,input,textarea,select'))continue;
    if(node.textContent.trim())node.style.setProperty(key==='fontWeight'?'font-weight':'font-style',next,'important');
   }
   updateEmphasis();drafts.save();
  };
  emphasisControls.push({wrap,button,isOn});
 }
 function updateEmphasis(){
  for(const {wrap,button,isOn} of emphasisControls){
   const targets=mode==='page'?[document.body]:[...selected].filter(el=>el.isConnected);
   wrap.hidden=document.getElementById('ie-font').disabled;button.disabled=wrap.hidden;
   const pressed=targets.length>0&&targets.every(isOn);button.setAttribute('aria-pressed',String(pressed));button.style.background=pressed?'#ddd':'#f4f4f4';
  }
 }

 const paddingWrap=document.createElement('div');paddingWrap.className='ie-format';paddingWrap.dataset.format='Padding';
 paddingWrap.innerHTML='<div class="ie-circle ie-number-circle"><input class="ie-number" id="ie-padding" type="text" inputmode="numeric" role="spinbutton" aria-label="Padding" value="0" autocomplete="off"><button class="ie-number-handle" type="button" id="ie-padding-handle" aria-label="Drag to adjust padding"><svg data-lucide="move-horizontal" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4M6 8l-4 4 4 4M2 12h20"/></svg></button></div><span class="ie-format-label">Padding</span>';
 document.getElementById('ie-format-row').append(paddingWrap);
 document.getElementById('ie-padding').addEventListener('ie-number-input',e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<0)return;styleChange('padding',n+'px',true)});
 document.getElementById('ie-padding').onchange=()=>{colorSession=null};
 mountNumber(document.getElementById('ie-padding'),0,1000,100,{reset:resetFormatting,closeOnRelease:true});
 $('ie-font').onchange=e=>{ensureGoogleFont(e.target.value);styleChange('fontFamily',e.target.value)};
 $('ie-size').addEventListener('ie-number-input',e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<1)return;$('ie-size-value').textContent=n+'px';styleChange(current().matches('svg,img')?'iconSize':'fontSize',n+'px',true)});$('ie-size').onchange=()=>{colorSession=null};
 $('ie-color').oninput=e=>styleChange('color',e.target.value,true);$('ie-color').onchange=()=>{colorSession=null};
 $('ie-bg').oninput=e=>styleChange('backgroundColor',e.target.value,true);$('ie-bg').onchange=()=>{colorSession=null};$('ie-border').oninput=e=>{$('ie-border-none').dataset.none='false';$('ie-border-none').checked=true;updateColorSwatches();styleChange('borderColor',e.target.value,true)};$('ie-border').onchange=()=>{colorSession=null};$('ie-border-none').onchange=e=>{colorSession=null;undo.push(snapshot());redo.length=0;for(const el of matchingElements(current())){if(!e.target.checked)el.style.setProperty('border-style','none','important');else{el.style.setProperty('border-style','solid','important');if(parseFloat(getComputedStyle(el).borderTopWidth)===0)el.style.setProperty('border-width','1px','important')}}e.target.dataset.none=e.target.checked?'false':'true';updateColorSwatches()};$('ie-radius').addEventListener('ie-number-input',e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<0)return;$('ie-radius-value').textContent=n+'px';styleChange('borderRadius',n+'px',true)});$('ie-radius').onchange=()=>{colorSession=null};
 mountFontPicker($('ie-font'),$('ie-font-trigger'),{reset:resetFormatting});mountNumber($('ie-size'),1,500,72,{reset:resetFormatting});mountNumber($('ie-radius'),0,1000,100,{reset:resetFormatting});
  $('ie-delete').onclick=()=>{if(!active)return;const items=[...selected];undo.push(snapshot());redo.length=0;finish();for(const el of items){removed.add(el);el.remove()}syncControls()};
 let textEditing=false;
 const canEditText=el=>el&&!!el.textContent.trim()&&!el.querySelector('[data-edit]')&&!el.matches('header,footer,section,article,aside,nav,img,svg,svg *,video,canvas,input,textarea,select,hr')&&!imageTarget(el);
 const placeCaret=(el,point)=>{
  const selection=document.getSelection();let range=null;
  if(point){if(document.caretPositionFromPoint){const caret=document.caretPositionFromPoint(point.x,point.y);if(caret&&el.contains(caret.offsetNode)){range=document.createRange();range.setStart(caret.offsetNode,caret.offset);range.collapse(true)}}else if(document.caretRangeFromPoint){const hit=document.caretRangeFromPoint(point.x,point.y);if(hit&&el.contains(hit.startContainer))range=hit}}
  if(!range){range=document.createRange();range.selectNodeContents(el);range.collapse(point?.start===true)}
  selection.removeAllRanges();selection.addRange(range);
 };
 const beginTextEdit=(el,{point=null,replace=null}={})=>{
  if(!canEditText(el)||selected.size!==1)return false;
  undo.push(snapshot());redo.length=0;hideImagePopup();textEditing=true;el.contentEditable='true';el.focus({preventScroll:true});
  if(replace!==null){
   // Replace text while retaining inline elements and SVG icons.
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('svg,script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   const first=nodes.shift()||el.appendChild(document.createTextNode(''));first.data=replace;for(const node of nodes)node.data='';
   const range=document.createRange();range.setStart(first,first.length);range.collapse(true);const selection=document.getSelection();selection.removeAllRanges();selection.addRange(range);
  }else placeCaret(el,point);
  return true;
 };
 const finish=()=>{textEditing=false;hideImagePopup();for(const el of selected){if(el.hasAttribute('data-edit'))el.contentEditable='false';el.classList.remove('ie-active-field');el.style.removeProperty('--ie-selection-outline')}selected.clear();active=null;if(mode==='element')$('ie-label').textContent='Select an element';syncControls()};
 const setMode=m=>{colorSession=null;mode=m;if(m==='page')finish();$('ie-page').classList.toggle('ie-selected',m==='page');$('ie-label').textContent=m==='page'?'Page':(active?.getAttribute('data-edit')||'Select an element');syncControls()};
 $('ie-page').onclick=()=>setMode('page');
 $('ie-label').addEventListener('change',e=>{const el=elementOptions[Number(e.target.value)];if(el){select(el);el.scrollIntoView({block:'nearest',behavior:'smooth'})}});
 const updateSelectionContrast=()=>{for(const el of selected){if(!el.isConnected)continue;let node=el,rgb=[255,255,255],layers=[];while(node&&node.nodeType===1){const c=getComputedStyle(node).backgroundColor;const m=c.match(/^rgba?\(([^)]+)\)/);if(m){const v=m[1].split(/[,\s/]+/).map(Number);if(v.length>=3)layers.push([v.slice(0,3),v[3]??1])}node=node.parentElement}for(const [c,a] of layers.reverse())rgb=rgb.map((v,i)=>c[i]*a+v*(1-a));el.style.setProperty('--ie-selection-outline',(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2])<135?'#ccc':'#666')}};
 function select(el){
  if(active===el&&selected.size===1)return;
  finish();colorSession=null;mode='element';$('ie-page').classList.remove('ie-selected');active=el;selected.add(el);if(el.hasAttribute('data-edit')){if(!el.matches('input,textarea,svg')){el.contentEditable='false';el.spellcheck=true;}}el.classList.add('ie-active-field');updateSelectionContrast();
  $('ie-label').textContent=el.getAttribute('data-edit')||el.tagName.toLowerCase();el.focus();if(document.activeElement!==el)document.activeElement?.blur();syncControls();if(imageTarget(el)||el.closest('a')||el.matches('input,textarea,svg,[data-lucide]'))showImagePopup(el);
 }
 document.addEventListener('pointerdown',e=>{
  if(preview||bar.contains(e.target)||imagePopup.contains(e.target)||e.target.closest?.('[data-built-at-editor-runtime]'))return;
  const el=e.target.closest?.('[data-edit]');
  if(!el){setMode('page');return;}
  if(e.shiftKey){e.preventDefault();if(!selected.size){select(el)}else if(selected.has(el)){selected.delete(el);el.classList.remove('ie-active-field');if(el.hasAttribute('data-edit'))el.contentEditable='false';active=[...selected].at(-1)||null;if(!active)finish();else syncControls()}else{selected.add(el);el.classList.add('ie-active-field');active=el;syncControls();}syncControls();return}if(active===el&&selected.size===1&&!textEditing&&canEditText(el)){e.preventDefault();beginTextEdit(el,{point:{x:e.clientX,y:e.clientY}});return}
  if(active!==el||selected.size>1){select(el)}
  if(el.closest('a'))showImagePopup(el);
  if(!textEditing&&canEditText(el))e.preventDefault();
 },true);
 document.addEventListener('dblclick',e=>{
  if(preview||e.shiftKey||e.target.closest?.('[data-built-at-editor-runtime]'))return;
  const el=e.target.closest?.('[data-edit]');
  if(el===active&&selected.size===1&&canEditText(el)){e.preventDefault();if(!textEditing)beginTextEdit(el,{point:{x:e.clientX,y:e.clientY}});else placeCaret(el,{x:e.clientX,y:e.clientY})}
 },true);
 const selectAllElements=()=>{      finish();selected.forEach(el=>el.classList.remove('ie-active-field'));selected.clear();
      for(const el of editableElements())if(el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'){selected.add(el);el.classList.add('ie-active-field')}
      active=[...selected].at(-1)||null;mode=active?'element':'page';$('ie-page').classList.toggle('ie-selected',!active);
      updateSelectionContrast();syncControls();};
 document.addEventListener('keydown',e=>{
  if(e.target.matches?.('input,textarea,select'))return;
  if(e.target.closest?.('[data-built-at-editor-runtime]')&&!e.metaKey&&!e.ctrlKey&&!['Escape','Delete','Backspace'].includes(e.key))return;
  if(!preview&&(e.metaKey||e.ctrlKey)&&!e.altKey&&e.key.toLowerCase()==='a'){
    const target=e.target;
    if(!target?.isContentEditable&&!target?.closest?.('input,textarea,select,[contenteditable="true"]')&&!bar.contains(target)){
      e.preventDefault();selectAllElements();return;
    }
  }
  if((e.key==='Delete'||e.key==='Backspace')&&active&&!preview&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
    const target=e.target;
    const editing=target?.isContentEditable||target?.matches?.('input,textarea,select,[contenteditable="true"]');
    if(!editing&&!textEditing){e.preventDefault();$('ie-delete').click();return}
  }

  if(e.key==='Escape'&&textEditing&&active){e.preventDefault();active.contentEditable='false';textEditing=false;document.getSelection()?.removeAllRanges();active.blur();return}
  if(e.key==='Escape'&&active){finish();return}
  if(e.key==='Escape'&&!preview){preview=true;applyPreview();return}
  if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&active&&!textEditing&&!preview&&!e.target.closest('input,textarea,select')){if(canEditText(active)){e.preventDefault();beginTextEdit(active,{point:e.key==='ArrowLeft'?{start:true}:null})}return}
  if(e.key==='Enter'&&active&&!textEditing&&!preview&&!e.target.closest('input,textarea,select')){if(canEditText(active)){e.preventDefault();beginTextEdit(active)}return}
  if(!preview&&active&&!textEditing&&selected.size===1&&!e.defaultPrevented&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.isComposing&&[...e.key].length===1&&!e.target.closest?.('[data-built-at-editor-runtime],input,textarea,select,[contenteditable="true"]')){
   if(canEditText(active)){e.preventDefault();beginTextEdit(active,{replace:e.key});return}
  }
  if(textEditing)return;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!preview){e.preventDefault();e.shiftKey?$('ie-redo').click():$('ie-undo').click()}
 });
 syncControls();
 $('ie-undo').onclick=()=>{cancelURLUpdates();finish();if(!undo.length)return;redo.push(snapshot());restore(undo.pop());setMode('page')};
 $('ie-redo').onclick=()=>{cancelURLUpdates();finish();if(!redo.length)return;undo.push(snapshot());restore(redo.pop());setMode('page')};
 let tools=null,colorPicker=null,pageDrag=null;
 const applyPreview=()=>{document.body.classList.toggle('ie-preview',preview);if(preview){finish();tools?.close();colorPicker?.close();pageDrag?.close()}};
 $('ie-close').onclick=()=>{preview=true;applyPreview()};
 applyPreview();
 setMode('page');
 let copyFeedbackTimer;
 $('ie-copy').onclick=async()=>{
  if(textEditing&&active){active.blur();active.contentEditable='false';textEditing=false}
  try{await copyHTML(exportHTML(authorAttributes));clearTimeout(copyFeedbackTimer);$('ie-copy').classList.add('ie-copied');$('ie-copy-label').textContent='Copied!';copyFeedbackTimer=setTimeout(()=>{$('ie-copy-label').textContent='Copy';$('ie-copy').classList.remove('ie-copied')},1600)}
  catch(error){console.error('Editor export copy failed',error);$('ie-copy-label').textContent='Copy failed'}
 };
 document.addEventListener('click',e=>{if(!preview&&!bar.contains(e.target)&&!imagePopup.contains(e.target)&&!e.target.closest('[data-built-at-editor-runtime]')&&e.target.closest('a,button,input[type=submit]')){e.preventDefault();e.stopPropagation()}},true);
 document.addEventListener('submit',e=>{if(!preview&&!e.target.closest('[data-built-at-editor-runtime]'))e.preventDefault()},true);
 const resume=document.createElement('button');resume.id='ie-resume';resume.dataset.builtAtEditorRuntime='';resume.type='button';resume.innerHTML='<svg data-lucide="pencil" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" /> </svg>';resume.setAttribute('aria-label','Open editor');document.body.append(resume);
 resume.onclick=()=>{preview=false;applyPreview()};


 const afterRestore=()=>{
  captureAuthorAttributes(authorAttributes);
  document.body.classList.remove('ie-enabled','ie-preview');
  document.body.style.setProperty('--ie-original-padding-top',getComputedStyle(document.body).paddingTop);
  document.body.classList.add('ie-enabled');updateToolbarHeight();setMode('page');
 };
 const drafts=createDraftStore(sourceHTML,()=>exportHTML(authorAttributes),html=>{applyDocument(html);afterRestore()});
 const revertSelected=()=>{
   cancelURLUpdates();const targets=[...selected].filter(el=>el.isConnected);if(!targets.length)return;
   undo.push(snapshot());redo.length=0;finish();
   // Restore only baseline records below the selected roots. New elements
   // have no original version, so reverting them removes the addition.
   const records=new Map();
   const collect=node=>{const record=originalRecords.get(node);if(!record||records.has(node))return;records.set(node,record);record.children.forEach(collect)};
   for(const el of targets){if(originalRecords.has(el))collect(el);else el.remove()}
   restore([...records.values()]);setMode('page');drafts.save();
  };
 bar.querySelector('#ie-revert-selected').onclick=()=>{if(canRevertSelection())revertSelected()};
 const duplicateSelected=()=>{if(!active||selected.size!==1)return;const target=active;finish();undo.push(snapshot());redo.length=0;const clone=cloneEditable(target);const sourceNodes=[target,...target.querySelectorAll('*')],cloneNodes=[clone,...clone.querySelectorAll('*')];cloneNodes.forEach((node,index)=>originalStyles.set(node,originalStyles.get(sourceNodes[index])||''));target.after(clone);captureAuthorAttributes(authorAttributes);select(clone);clone.blur?.();drafts.save()};
 $('ie-duplicate').onclick=duplicateSelected;
 pageDrag=mountPageDrag({getActive:()=>!preview&&selected.size===1?active:null,onHover:()=>!preview,beforeDrag:el=>{if(active&&textEditing){active.contentEditable='false';textEditing=false}if(active!==el)select(el)},change:(fn,el)=>{finish();undo.push(snapshot());redo.length=0;fn();select(el);drafts.save()}});
 let pageColorSession=null;
 tools=mountTools({bar,select,elementName,pageColors:settings=>{pageColorSession=null;mountPageColors(settings,(fn,name,end=false)=>{if(end){pageColorSession=null;return}if(pageColorSession!==name){finish();undo.push(snapshot());redo.length=0;pageColorSession=name}fn();drafts.save()})},
  ensureEditor:()=>{preview=false;applyPreview()},
  shortcutActions:()=>[
   {label:'Undo',key:'undo',enabled:!preview&&undo.length>0,run:()=>$('ie-undo').click()},
   {label:'Redo',key:'redo',enabled:!preview&&redo.length>0,run:()=>$('ie-redo').click()},
   {label:'Select all elements',key:'all',enabled:!preview&&editableElements().length>0,run:selectAllElements},
   {label:'Edit text at end',key:'edit',enabled:!preview&&selected.size===1&&canEditText(active)&&!textEditing,run:()=>beginTextEdit(active)},
   {label:'Delete selected',key:'delete',enabled:!!active,run:()=>$('ie-delete').click()},
   {label:'Deselect',key:'escape',enabled:!!active,run:finish},
   {label:preview?'Edit':'Close editor',key:'toggle',enabled:true,run:()=>{preview=!preview;applyPreview()}}
  ],
  similarInfo:()=>{
   if(mode!=='element'||!active)return null;
   const group=active.getAttribute('data-edit-group');let elements=[];
   if(group)elements=[...document.querySelectorAll('[data-edit-group]')].filter(el=>el.getAttribute('data-edit-group')===group);
   elements=elements.filter(el=>!el.closest('[data-built-at-editor-runtime]'));return elements.length>1?{group:group||'items',elements}:null;
  },
  selectSimilar:elements=>{finish();mode='element';for(const el of elements){if(!el.isConnected)continue;selected.add(el);el.classList.add('ie-active-field')}active=[...selected].at(-1)||null;$('ie-page').classList.remove('ie-selected');updateSelectionContrast();syncControls()},

  change:fn=>{finish();undo.push(snapshot());redo.length=0;fn();drafts.save()},
  selectionInfo:()=>mode==='element'&&selected.size?{count:selected.size,changed:canRevertSelection()}:null,
  revertSelection:revertSelected,
  revert:()=>drafts.reset(()=>{cancelURLUpdates();finish();undo.push(snapshot());redo.length=0;restore(original);preview=false;afterRestore()})
 });
 drafts.restore();drafts.watch();
 colorPicker=mountColorPicker(bar,{reset:resetFormatting});
 mountOverflow(bar,tools);

 // Selection frames stay rectangular and never alter the author's border or shadow.
 const frames=new Map();
 const drawSelection=()=>{
  pageDrag?.update();
  const items=preview?new Set():selected;
  for(const [el,frame] of frames)if(!items.has(el)||!el.isConnected){frame.remove();frames.delete(el)}
  for(const el of items){if(!el.isConnected)continue;let frame=frames.get(el);
   if(!frame){frame=document.createElement('div');frame.dataset.builtAtEditorRuntime='';frame.className='ie-selection-frame';frame.setAttribute('aria-hidden','true');document.body.append(frame);frames.set(el,frame)}
   const r=el.getBoundingClientRect();const style='left:'+(r.left-3)+'px;top:'+(r.top-3)+'px;width:'+(r.width+6)+'px;height:'+(r.height+6)+'px';
   if(frame.style.cssText.replace(/\s/g,'')!==style+';')frame.style.cssText=style;
  }
 };
 new MutationObserver(records=>{if(records.some(r=>!(r.target.nodeType===1?r.target:r.target.parentElement)?.closest('[data-built-at-editor-runtime]'))){drawSelection();syncRevertButton()}}).observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});
 window.addEventListener('scroll',drawSelection,true);window.addEventListener('resize',drawSelection);
 document.addEventListener('pointerup',drawSelection,true);document.addEventListener('keydown',()=>queueMicrotask(drawSelection));
}
