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
import {toolbarHTML,mountTools} from './toolbar.js?v=20261117-search-match';
import {hex,ensureGoogleFont} from './design.js';
import {createHistory,createDraftStore,applyDocument} from './history.js';
import {captureAuthorAttributes,exportHTML,copyHTML} from './export.js';

/* Selection and interaction logic extracted from Pages!B4. */
export function startEditor(){
 const {snapshot,restore}=createHistory(()=>[...document.querySelectorAll('[data-built-at-editor-runtime],#ie-toolbar,#ie-image-popup,#ie-marquee,#ie-resume')]);
 // Capture the loaded document before editor setup or any saved draft is applied.
 const original=snapshot();
 const originalRecords=new Map(original.map(record=>[record.node,record]));
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
 document.body.prepend(bar);document.body.classList.add('ie-enabled');

 const imagePopup=document.createElement('div');imagePopup.id='ie-image-popup';imagePopup.dataset.builtAtEditorRuntime='';imagePopup.hidden=true;
 imagePopup.innerHTML='<label for="ie-image-url">Image URL</label><input id="ie-image-url" type="url" placeholder="Paste image URL"><label for="ie-image-alt" id="ie-image-alt-label">Alt text</label><input id="ie-image-alt" type="text"><label for="ie-link-url" id="ie-link-url-label">Link URL</label><input id="ie-link-url" type="text"><button type="button" id="ie-add-link" hidden>Add new link</button><button type="button" id="ie-image-apply">Apply</button>';
 document.body.append(imagePopup);
 const imageInput=imagePopup.querySelector('input');
 const imageTarget=el=>el?.tagName==='IMG'||el?.matches('.hero-art,[role="img"]')||!!el&&getComputedStyle(el).backgroundImage!=='none';
 const imageValue=el=>{if(el.tagName==='IMG')return el.getAttribute('src')||'';const bg=getComputedStyle(el).backgroundImage;return bg.startsWith('url(')?bg.slice(4,-1).replace(/^["']|["']$/g,''):''};
 const collectionLink=el=>{const link=el?.closest('a');return link?.closest('[data-edit="links"]')?link:null};
 const showImagePopup=el=>{imagePopup.hidden=false;imagePopup.querySelector('#ie-add-link').hidden=!collectionLink(el);const image=imageTarget(el),link=el.closest('a');imageInput.hidden=!image;imagePopup.querySelector('label[for=ie-image-url]').hidden=!image;imageInput.value=image?imageValue(el):'';for(const id of ['ie-image-alt','ie-image-alt-label'])imagePopup.querySelector('#'+id).hidden=el.tagName!=='IMG';imagePopup.querySelector('#ie-image-alt').value=el.getAttribute('alt')||'';for(const id of ['ie-link-url','ie-link-url-label'])imagePopup.querySelector('#'+id).hidden=!link;imagePopup.querySelector('#ie-link-url').value=link?.getAttribute('href')||'';const r=el.getBoundingClientRect();imagePopup.style.left=Math.max(10,Math.min(innerWidth-310,r.left))+'px';imagePopup.style.top=Math.max(10,Math.min(innerHeight-300,Math.max(10,r.bottom+10)))+'px'};
 const hideImagePopup=()=>{imagePopup.hidden=true};
 const applyImage=()=>{const el=active;if(!el||!el.isConnected)return;const url=imageInput.value.trim();const link=el.closest('a'),href=imagePopup.querySelector('#ie-link-url').value.trim();if(link&&/^\s*(javascript|vbscript|data):/i.test(href))return;undo.push(snapshot());redo.length=0;if(el.tagName==='IMG'){el.setAttribute('src',url);el.setAttribute('alt',imagePopup.querySelector('#ie-image-alt').value)}else if(imageTarget(el)){el.style.backgroundImage=url?'url("'+url.replace(/"/g,'%22')+'")':'none';el.style.backgroundSize='cover';el.style.backgroundPosition='center';if(el.matches('.hero-art')){el.style.fontSize=url?'0px':'';el.style.minHeight='125px'}}if(link)link.setAttribute('href',href);imagePopup.querySelector('#ie-image-apply').textContent='Applied';setTimeout(()=>{imagePopup.querySelector('#ie-image-apply').textContent='Apply'},1200)};
 imagePopup.querySelector('#ie-add-link').onclick=()=>{
  const link=collectionLink(active);if(!link)return;
  undo.push(snapshot());redo.length=0;
  let item=link;const collection=link.closest('[data-edit="links"]');
  while(item.parentElement!==collection&&item.parentElement.children.length===1)item=item.parentElement;
  const clone=item.cloneNode(true);const suffix='-'+Date.now().toString(36);const ids=new Map();
  for(const node of [clone,...clone.querySelectorAll('*')]){if(node.id){ids.set(node.id,node.id+suffix);node.id+=suffix}node.classList.remove('ie-active-field');node.removeAttribute('contenteditable');node.removeAttribute('spellcheck');node.style.removeProperty('--ie-selection-outline');if(node.hasAttribute('data-edit')&&node!==collection)node.setAttribute('data-edit',node.getAttribute('data-edit')+' copy')}
  for(const node of [clone,...clone.querySelectorAll('*')])for(const attr of [...node.attributes]){let value=attr.value;for(const [old,id] of ids){if(value==='#'+old)value='#'+id;value=value.replaceAll('url(#'+old+')','url(#'+id+')');if(['aria-labelledby','aria-describedby','for'].includes(attr.name))value=value.split(' ').map(x=>x===old?id:x).join(' ')}if(value!==attr.value)node.setAttribute(attr.name,value)}
  item.after(clone);const next=clone.matches('a')?clone:clone.querySelector('a');select(next);drafts.save();
 };
 for(const input of [imageInput,imagePopup.querySelector('#ie-link-url')]){input.addEventListener('focus',()=>input.select());input.addEventListener('click',()=>input.select())}
 imagePopup.querySelector('#ie-image-apply').onclick=applyImage;imageInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();applyImage()}if(e.key==='Escape')hideImagePopup()};
 imagePopup.addEventListener('pointerdown',e=>e.stopPropagation());
 
 const updateToolbarHeight=()=>document.body.style.setProperty('--ie-toolbar-height',Math.ceil(bar.getBoundingClientRect().height)+'px');
 new ResizeObserver(updateToolbarHeight).observe(bar);updateToolbarHeight();
 const $=id=>bar.querySelector('#'+id);
 const current=()=>mode==='page'?document.body:(active||document.body);const structural=el=>el&&el.matches('header,footer,section,article,aside,nav,.card,.hero-art,[role="img"],button,.button,.btn,img,[data-section]');
 const editableSelector='[data-edit="links"] a,[data-edit],article,.tile,.card,.hero-art,img,[role="img"],header,footer,section,aside,nav,[data-section]';
 const editableElements=()=>[...document.querySelectorAll(editableSelector)].filter(el=>!el.closest('#ie-toolbar,#ie-image-popup')&&el.isConnected);
 const elementName=el=>{if(!el)return 'Select Item';if(el.getAttribute('data-edit'))return el.getAttribute('data-edit');if(el.matches('article,.tile,.card')){const group=editableElements().filter(x=>x.matches('article,.tile,.card'));return 'Article '+(group.indexOf(el)+1)}if(el.matches('img,.hero-art,[role="img"]'))return el.getAttribute('data-edit')||'Hero image';const label=el.getAttribute('data-edit');if(label)return label;const tag=el.tagName.toLowerCase();const group=editableElements().filter(x=>x.tagName===el.tagName);return tag.charAt(0).toUpperCase()+tag.slice(1)+(group.length>1?' '+(group.indexOf(el)+1):'')};
 let elementOptions=[];
 const refreshElementList=()=>{const list=$('ie-label');const elements=editableElements();elementOptions=elements;list.replaceChildren(new Option('Select Item',''));elements.forEach((el,i)=>list.add(new Option(elementName(el),String(i))));list.value=active?String(elements.indexOf(active)):'';if(list.value==='-1')list.value=''};
  const syncControls=()=>{syncHistoryButtons();$('ie-delete').hidden=false;$('ie-delete').disabled=mode!=='element'||!active;const enabled=mode==='page'||!!active;const targets=mode==='page'?[document.body]:[...selected].filter(el=>el.isConnected);
const textCapable=el=>!el.matches('img,hr,svg,video,canvas,[role="img"]')&&(!!el.textContent.trim()||el.matches('input,textarea,select,button'));
['ie-font','ie-size'].forEach(id=>$(id).disabled=!enabled||!targets.length||!targets.every(textCapable));
$('ie-color').disabled=!enabled||!targets.length||!targets.every(el=>textCapable(el)||el.matches('svg,svg *'));
['ie-bg','ie-radius','ie-border','ie-border-none'].forEach(id=>$(id).disabled=!enabled||!targets.length);
const el=enabled?current():null;$('ie-label').hidden=false;const name=selected.size>1?selected.size+' selected':elementName(active);refreshElementList();$('ie-label').title=name;$('ie-label').classList.toggle('ie-selected',mode==='element'&&!!active);if(!enabled)return;const c=getComputedStyle(current());const paint=current().matches('svg,svg *')?[current(),...current().querySelectorAll('*')].map(node=>getComputedStyle(node)).find(style=>style.stroke!=='none'||style.fill!=='none'):null;$('ie-font').value=[...$('ie-font').options].some(o=>o.value===c.fontFamily)?c.fontFamily:'';$('ie-size').value=Math.round(parseFloat(c.fontSize))||16;$('ie-color').value=mode==='page'?(document.body.style.getPropertyValue('--ie-page-text-color')||hex(c.color)):(paint?hex(paint.stroke!=='none'?paint.stroke:paint.fill):(current().style.color?hex(current().style.color):hex(c.color)));$('ie-bg').value=c.backgroundColor==='rgba(0, 0, 0, 0)'?'#ffffff':hex(c.backgroundColor);$('ie-radius').value=Math.round(parseFloat(c.borderTopLeftRadius))||0;$('ie-size-value').textContent=$('ie-size').value+'px';$('ie-radius-value').textContent=$('ie-radius').value+'px';$('ie-border').value=hex(c.borderTopColor);$('ie-border-none').dataset.none=(c.borderTopStyle==='none'||parseFloat(c.borderTopWidth)===0)?'true':'false';$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true';updateColorSwatches()};
 const updateColorSwatches=()=>{const t=$('ie-text-swatch'),b=$('ie-bg-swatch'),r=$('ie-border-swatch');t.style.color=$('ie-color').value;b.style.setProperty('--ie-swatch-color',$('ie-bg').value);r.style.setProperty('--ie-swatch-color',$('ie-border').value);r.style.opacity=$('ie-border-none').dataset.none==='true'?'.3':'1';$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true';$('ie-border-none').closest('label').dataset.ieTooltip=$('ie-border-none').checked?'Remove border':'Add border';};['ie-color','ie-bg','ie-border'].forEach(id=>$(id).addEventListener('input',updateColorSwatches));
 let colorSession=null;
 const matchingElements=el=>mode==='element'&&selected.size>1?[...selected].filter(x=>x.isConnected):[el];
 const styleChange=(key,value,live=false)=>{if(mode==='element'&&!active)return;const el=current();if(live){if(!colorSession||colorSession.el!==el||colorSession.key!==key){undo.push(snapshot());redo.length=0;colorSession={el,key}}}else{colorSession=null;undo.push(snapshot());redo.length=0}if(mode==='page'&&key==='fontFamily'){
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
 }else {for(const target of matchingElements(el)){if(key==='borderColor'){target.style.removeProperty('border-style');target.style.setProperty('border-color',value,'important');const cs=getComputedStyle(target);if(parseFloat(cs.borderTopWidth)===0||cs.borderTopStyle==='none'){target.style.setProperty('border-width','1px','important');target.style.setProperty('border-style','solid','important')}}else if(key==='color'&&mode==='element'){target.style.setProperty('color',value,'important');if(target.matches('svg,svg *'))for(const part of [target,...target.querySelectorAll('*')])for(const paint of ['stroke','fill']){const cs=getComputedStyle(part);if(cs[paint]&&cs[paint]!=='none')part.style.setProperty(paint,'currentColor','important')}}else if(key==='fontFamily')target.style.setProperty('font-family',value,'important');else target.style.setProperty(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important')}}if(key==='backgroundColor')updateSelectionContrast()};
 $('ie-font').onchange=e=>{ensureGoogleFont(e.target.value);styleChange('fontFamily',e.target.value)};
 $('ie-size').oninput=e=>{const n=Number(e.target.value);$('ie-size-value').textContent=n+'px';styleChange('fontSize',n+'px',true)};$('ie-size').onchange=()=>{colorSession=null};
 $('ie-color').oninput=e=>styleChange('color',e.target.value,true);$('ie-color').onchange=()=>{colorSession=null};
 $('ie-bg').oninput=e=>styleChange('backgroundColor',e.target.value,true);$('ie-bg').onchange=()=>{colorSession=null};$('ie-border').oninput=e=>{$('ie-border-none').dataset.none='false';$('ie-border-none').checked=true;updateColorSwatches();styleChange('borderColor',e.target.value,true)};$('ie-border').onchange=()=>{colorSession=null};$('ie-border-none').onchange=e=>{colorSession=null;undo.push(snapshot());redo.length=0;for(const el of matchingElements(current())){if(!e.target.checked)el.style.setProperty('border-style','none','important');else{el.style.setProperty('border-style','solid','important');if(parseFloat(getComputedStyle(el).borderTopWidth)===0)el.style.setProperty('border-width','1px','important')}}e.target.dataset.none=e.target.checked?'false':'true';updateColorSwatches()};$('ie-radius').oninput=e=>{const n=Number(e.target.value);$('ie-radius-value').textContent=n+'px';styleChange('borderRadius',n+'px',true)};$('ie-radius').onchange=()=>{colorSession=null};
 const enablePxEntry=(sliderId,outputId,property)=>{
  const slider=$(sliderId),output=$(outputId);
  output.title='Click to type an exact pixel value';
  output.onclick=()=>{
   if(slider.disabled)return;
   const input=document.createElement('input');input.type='number';input.className='ie-px-entry';input.min='0';input.step='1';input.value=slider.value;
   output.replaceWith(input);input.focus();input.select();
   let done=false;
   const close=apply=>{
    if(done)return;done=true;
    if(apply&&input.value.trim()!==''){
     const n=Math.max(Number(slider.min),Math.round(Number(input.value)));
     if(Number.isFinite(n)&&n!==parseFloat(getComputedStyle(current())[property])){slider.max=Math.max(Number(slider.max),n);slider.value=n;styleChange(property,n+'px')}
    }
    output.textContent=slider.value+'px';input.replaceWith(output)
   };
   input.addEventListener('keydown',e=>{if(e.key==='Enter')close(true);if(e.key==='Escape')close(false)});
   input.addEventListener('blur',()=>close(true));
  }
 };
 enablePxEntry('ie-size','ie-size-value','fontSize');
 enablePxEntry('ie-radius','ie-radius-value','borderRadius');
  $('ie-delete').onclick=()=>{if(!active)return;const items=[...selected];undo.push(snapshot());redo.length=0;finish();for(const el of items){removed.add(el);el.remove()}syncControls()};
 let textEditing=false;
 const canEditText=el=>el?.hasAttribute('data-edit')&&!el.matches('header,footer,section,article,aside,nav,[data-section],img,svg,svg *,video,canvas,input,textarea,select,hr')&&!imageTarget(el);
 const placeCaret=(el,point)=>{
  const selection=document.getSelection();let range=null;
  if(point){if(document.caretPositionFromPoint){const caret=document.caretPositionFromPoint(point.x,point.y);if(caret&&el.contains(caret.offsetNode)){range=document.createRange();range.setStart(caret.offsetNode,caret.offset);range.collapse(true)}}else if(document.caretRangeFromPoint){const hit=document.caretRangeFromPoint(point.x,point.y);if(hit&&el.contains(hit.startContainer))range=hit}}
  if(!range){range=document.createRange();range.selectNodeContents(el);range.collapse(false)}
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
  finish();colorSession=null;mode='element';$('ie-page').classList.remove('ie-selected');active=el;selected.add(el);if(el.hasAttribute('data-edit')){el.contentEditable='false';el.spellcheck=true;}el.classList.add('ie-active-field');updateSelectionContrast();
  $('ie-label').textContent=el.getAttribute('data-edit')||el.tagName.toLowerCase();el.focus();syncControls();if(imageTarget(el)||el.closest('a'))showImagePopup(el);
 }
 document.addEventListener('pointerdown',e=>{
  if(preview||bar.contains(e.target)||imagePopup.contains(e.target)||e.target.closest?.('[data-built-at-editor-runtime]'))return;
  const el=e.target.closest?.('[data-edit="links"] a,[data-edit],header,footer,section,article,aside,nav,.card,.hero-art,[role="img"],button,.button,.btn,img,[data-section]');
  if(!el){setMode('page');return;}
  if(e.shiftKey){e.preventDefault();if(!selected.size){select(el)}else if(selected.has(el)){selected.delete(el);el.classList.remove('ie-active-field');if(el.hasAttribute('data-edit'))el.contentEditable='false';active=[...selected].at(-1)||null;if(!active)finish();else syncControls()}else{selected.add(el);el.classList.add('ie-active-field');active=el;syncControls();}syncControls();return}if(active===el&&selected.size===1&&!textEditing&&canEditText(el)){e.preventDefault();beginTextEdit(el,{point:{x:e.clientX,y:e.clientY}});return}
  if(active!==el||selected.size>1){select(el)}
 },true);
 document.addEventListener('dblclick',e=>{
  if(preview||e.shiftKey||e.target.closest?.('[data-built-at-editor-runtime]'))return;
  const el=e.target.closest?.('[data-edit]');
  if(el===active&&selected.size===1&&canEditText(el)){e.preventDefault();if(!textEditing)beginTextEdit(el,{point:{x:e.clientX,y:e.clientY}});else placeCaret(el,{x:e.clientX,y:e.clientY})}
 },true);
 // Drag a rectangle to select multiple page elements.
 const marquee=document.createElement('div');marquee.id='ie-marquee';marquee.dataset.builtAtEditorRuntime='';marquee.hidden=true;document.body.append(marquee);
 let drag=null;
 const dragCandidates=()=>editableElements().filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'});
 document.addEventListener('pointerdown',e=>{
  if(preview||e.button!==0||!e.isPrimary||bar.contains(e.target)||imagePopup.contains(e.target)||e.target.closest?.('[data-built-at-editor-runtime]')||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  drag={x:e.clientX,y:e.clientY,shift:e.shiftKey,started:false,original:new Set(e.shiftKey?selected:[]),pointerId:e.pointerId};
 },true);
 document.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.started&&Math.hypot(dx,dy)<7)return;
  if(!drag.started){drag.started=true;marquee.hidden=false;document.getSelection()?.removeAllRanges();document.body.classList.add('ie-dragging')}
  e.preventDefault();
  const x=Math.min(drag.x,e.clientX),y=Math.min(drag.y,e.clientY),w=Math.abs(dx),h=Math.abs(dy);
  Object.assign(marquee.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  const hits=dragCandidates().filter(el=>{const r=el.getBoundingClientRect();return r.left<x+w&&r.right>x&&r.top<y+h&&r.bottom>y});
  const next=new Set([...drag.original,...hits]);
  for(const el of selected)if(!next.has(el))el.classList.remove('ie-active-field');
  selected.clear();for(const el of next){selected.add(el);el.classList.add('ie-active-field')}
  active=[...selected].at(-1)||null;updateSelectionContrast();mode=active?'element':'page';$('ie-page').classList.toggle('ie-selected',!active);syncControls();
 },{capture:true,passive:false});
 const endDrag=()=>{if(!drag)return;const wasDragging=drag.started;drag=null;marquee.hidden=true;document.body.classList.remove('ie-dragging');if(wasDragging)syncControls()};
 document.addEventListener('pointerup',endDrag,true);
 document.addEventListener('pointercancel',endDrag,true);
 document.addEventListener('keydown',e=>{
  if(e.target.closest?.('[data-built-at-editor-runtime]')&&e.target.matches('input,textarea,select'))return;
  if(!preview&&(e.metaKey||e.ctrlKey)&&!e.altKey&&e.key.toLowerCase()==='a'){
    const target=e.target;
    if(!target?.isContentEditable&&!target?.closest?.('input,textarea,select,[contenteditable="true"]')&&!bar.contains(target)){
      e.preventDefault();finish();selected.forEach(el=>el.classList.remove('ie-active-field'));selected.clear();
      for(const el of editableElements())if(el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'){selected.add(el);el.classList.add('ie-active-field')}
      active=[...selected].at(-1)||null;mode=active?'element':'page';$('ie-page').classList.toggle('ie-selected',!active);
      updateSelectionContrast();syncControls();return;
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
  if(e.key==='Enter'&&active&&!textEditing&&!preview&&!e.target.closest('input,textarea,select')){if(canEditText(active)){e.preventDefault();beginTextEdit(active)}return}
  if(!preview&&active&&!textEditing&&selected.size===1&&!e.defaultPrevented&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.isComposing&&[...e.key].length===1&&!e.target.closest?.('[data-built-at-editor-runtime],input,textarea,select,[contenteditable="true"]')){
   if(canEditText(active)){e.preventDefault();beginTextEdit(active,{replace:e.key});return}
  }
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!preview){e.preventDefault();e.shiftKey?$('ie-redo').click():$('ie-undo').click()}
 });
 syncControls();
 $('ie-undo').onclick=()=>{finish();if(!undo.length)return;redo.push(snapshot());restore(undo.pop());setMode('page')};
 $('ie-redo').onclick=()=>{finish();if(!redo.length)return;undo.push(snapshot());restore(redo.pop());setMode('page')};
 let tools=null;
 const applyPreview=()=>{document.body.classList.toggle('ie-preview',preview);if(preview){finish();tools?.close()}};
 $('ie-close').onclick=()=>{preview=true;applyPreview()};
 applyPreview();
 setMode('page');
 let copyFeedbackTimer;
 $('ie-copy').onclick=async()=>{
  if(textEditing&&active){active.blur();active.contentEditable='false';textEditing=false}
  try{await copyHTML(exportHTML(authorAttributes));clearTimeout(copyFeedbackTimer);$('ie-copy').classList.add('ie-copied');$('ie-copy-label').textContent='Copied!';copyFeedbackTimer=setTimeout(()=>{$('ie-copy-label').textContent='';$('ie-copy').classList.remove('ie-copied')},1600)}
  catch(error){console.error('Editor export copy failed',error);$('ie-copy-label').textContent='Copy failed'}
 };
 document.addEventListener('click',e=>{if(!preview&&!bar.contains(e.target)&&!imagePopup.contains(e.target)&&!e.target.closest('[data-built-at-editor-runtime]')&&e.target.closest('a,button,input[type=submit]')){e.preventDefault();e.stopPropagation()}},true);
 document.addEventListener('submit',e=>{if(!preview&&!e.target.closest('[data-built-at-editor-runtime]'))e.preventDefault()},true);
 const resume=document.createElement('button');resume.id='ie-resume';resume.dataset.builtAtEditorRuntime='';resume.type='button';resume.innerHTML='<svg data-lucide="pencil" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" /> </svg>';resume.setAttribute('aria-label','Open editor');document.body.append(resume);
 resume.onclick=()=>{preview=false;applyPreview()};
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.target.closest('input,textarea,select,[contenteditable=true]')){preview=false;applyPreview()}});

 const afterRestore=()=>{
  captureAuthorAttributes(authorAttributes);
  document.body.classList.remove('ie-enabled','ie-preview');
  document.body.style.setProperty('--ie-original-padding-top',getComputedStyle(document.body).paddingTop);
  document.body.classList.add('ie-enabled');updateToolbarHeight();setMode('page');
 };
 const drafts=createDraftStore(sourceHTML,()=>exportHTML(authorAttributes),html=>{applyDocument(html);afterRestore()});
 tools=mountTools({bar,select,elementName,
  similarInfo:()=>{
   if(mode!=='element'||!active)return null;
   const group=active.getAttribute('data-edit-group');let elements=[];
   if(group)elements=[...document.querySelectorAll('[data-edit-group]')].filter(el=>el.getAttribute('data-edit-group')===group);
   else if(collectionLink(active)){elements=[...collectionLink(active).closest('[data-edit="links"]').querySelectorAll('a')]}
   else{const classes=[...active.classList].filter(c=>c!=='ie-active-field');elements=[...(active.parentElement?.children||[])].filter(el=>el.tagName===active.tagName&&(classes.length?classes.every(c=>el.classList.contains(c)):el.hasAttribute('data-edit')&&el.getAttribute('data-edit')===active.getAttribute('data-edit')))}
   elements=elements.filter(el=>!el.closest('[data-built-at-editor-runtime]'));return elements.length>1?{group:group||'items',elements}:null;
  },
  selectSimilar:elements=>{finish();mode='element';for(const el of elements){if(!el.isConnected)continue;selected.add(el);el.classList.add('ie-active-field')}active=[...selected].at(-1)||null;$('ie-page').classList.remove('ie-selected');updateSelectionContrast();syncControls()},

  change:fn=>{finish();undo.push(snapshot());redo.length=0;fn();drafts.save()},
  selectionInfo:()=>mode==='element'&&selected.size?{count:selected.size}:null,
  revertSelection:()=>{
   const targets=[...selected].filter(el=>el.isConnected);if(!targets.length)return;
   undo.push(snapshot());redo.length=0;finish();
   // Restore only baseline records below the selected roots. New elements
   // have no original version, so reverting them removes the addition.
   const records=new Map();
   const collect=node=>{const record=originalRecords.get(node);if(!record||records.has(node))return;records.set(node,record);record.children.forEach(collect)};
   for(const el of targets){if(originalRecords.has(el))collect(el);else el.remove()}
   restore([...records.values()]);setMode('page');drafts.save();
  },
  revert:()=>drafts.reset(()=>{finish();undo.push(snapshot());redo.length=0;restore(original);preview=false;afterRestore()})
 });
 drafts.restore();drafts.watch();

 // Selection frames stay rectangular and never alter the author's border or shadow.
 const frames=new Map();
 const drawSelection=()=>{
  const items=preview?new Set():selected;
  for(const [el,frame] of frames)if(!items.has(el)||!el.isConnected){frame.remove();frames.delete(el)}
  for(const el of items){if(!el.isConnected)continue;let frame=frames.get(el);
   if(!frame){frame=document.createElement('div');frame.dataset.builtAtEditorRuntime='';frame.className='ie-selection-frame';frame.setAttribute('aria-hidden','true');document.body.append(frame);frames.set(el,frame)}
   const r=el.getBoundingClientRect();const style='left:'+(r.left-3)+'px;top:'+(r.top-3)+'px;width:'+(r.width+6)+'px;height:'+(r.height+6)+'px';
   if(frame.style.cssText.replace(/\s/g,'')!==style+';')frame.style.cssText=style;
  }
 };
 new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('[data-built-at-editor-runtime]')))drawSelection()}).observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});
 window.addEventListener('scroll',drawSelection,true);window.addEventListener('resize',drawSelection);
 document.addEventListener('pointerup',drawSelection,true);document.addEventListener('keydown',()=>queueMicrotask(drawSelection));
}
