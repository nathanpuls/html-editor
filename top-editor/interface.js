import {toolbarHTML,mountTools} from './toolbar.js?v=20261117-search-match';
import {hex,ensureGoogleFont} from './design.js';
import {createHistory,createDraftStore,applyDocument} from './history.js';
import {captureAuthorAttributes,exportHTML,copyHTML} from './export.js';

/* Selection and interaction logic extracted from Pages!B4. */
export function startEditor(){
 const authorAttributes=captureAuthorAttributes();
 const sourceHTML=exportHTML(authorAttributes);
 document.body.style.setProperty('--ie-original-padding-top',getComputedStyle(document.body).paddingTop);

 if(document.getElementById('ie-toolbar')?.dataset.ready==='true')return;
 const undo=[],redo=[];let active=null,preview=false,mode='page';const selected=new Set();const removed=new Set();
 const bar=document.getElementById('ie-toolbar')||document.createElement('div');bar.id='ie-toolbar';bar.dataset.ready='true';bar.dataset.builtAtEditorRuntime='';
 bar.innerHTML=toolbarHTML;
 document.body.prepend(bar);document.body.classList.add('ie-enabled');

 const imagePopup=document.createElement('div');imagePopup.id='ie-image-popup';imagePopup.dataset.builtAtEditorRuntime='';imagePopup.hidden=true;
 imagePopup.innerHTML='<label for="ie-image-url">Image URL</label><input id="ie-image-url" type="url" placeholder="Paste image URL"><label for="ie-image-alt" id="ie-image-alt-label">Alt text</label><input id="ie-image-alt" type="text"><label for="ie-link-url" id="ie-link-url-label">Link URL</label><input id="ie-link-url" type="text"><button type="button" id="ie-image-apply">Apply</button>';
 document.body.append(imagePopup);
 const imageInput=imagePopup.querySelector('input');
 const imageTarget=el=>el?.tagName==='IMG'||el?.matches('.hero-art,[role="img"]')||!!el&&getComputedStyle(el).backgroundImage!=='none';
 const imageValue=el=>{if(el.tagName==='IMG')return el.getAttribute('src')||'';const bg=getComputedStyle(el).backgroundImage;return bg.startsWith('url(')?bg.slice(4,-1).replace(/^["']|["']$/g,''):''};
 const showImagePopup=el=>{imagePopup.hidden=false;const image=imageTarget(el),link=el.closest('a');imageInput.hidden=!image;imagePopup.querySelector('label[for=ie-image-url]').hidden=!image;imageInput.value=image?imageValue(el):'';for(const id of ['ie-image-alt','ie-image-alt-label'])imagePopup.querySelector('#'+id).hidden=el.tagName!=='IMG';imagePopup.querySelector('#ie-image-alt').value=el.getAttribute('alt')||'';for(const id of ['ie-link-url','ie-link-url-label'])imagePopup.querySelector('#'+id).hidden=!link;imagePopup.querySelector('#ie-link-url').value=link?.getAttribute('href')||'';const r=el.getBoundingClientRect();imagePopup.style.left=Math.max(10,Math.min(innerWidth-310,r.left))+'px';imagePopup.style.top=Math.max(10,Math.min(innerHeight-300,Math.max(10,r.bottom+10)))+'px'};
 const hideImagePopup=()=>{imagePopup.hidden=true};
 const applyImage=()=>{const el=active;if(!el||!el.isConnected)return;const url=imageInput.value.trim();const link=el.closest('a'),href=imagePopup.querySelector('#ie-link-url').value.trim();if(link&&/^\s*(javascript|vbscript|data):/i.test(href))return;undo.push(snapshot());redo.length=0;if(el.tagName==='IMG'){el.setAttribute('src',url);el.setAttribute('alt',imagePopup.querySelector('#ie-image-alt').value)}else if(imageTarget(el)){el.style.backgroundImage=url?'url("'+url.replace(/"/g,'%22')+'")':'none';el.style.backgroundSize='cover';el.style.backgroundPosition='center';if(el.matches('.hero-art')){el.style.fontSize=url?'0px':'';el.style.minHeight='125px'}}if(link)link.setAttribute('href',href);imagePopup.querySelector('button').textContent='Applied';setTimeout(()=>{imagePopup.querySelector('button').textContent='Apply'},1200)};
 imagePopup.querySelector('button').onclick=applyImage;imageInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();applyImage()}if(e.key==='Escape')hideImagePopup()};
 imagePopup.addEventListener('pointerdown',e=>e.stopPropagation());
 
 const updateToolbarHeight=()=>document.body.style.setProperty('--ie-toolbar-height',Math.ceil(bar.getBoundingClientRect().height)+'px');
 new ResizeObserver(updateToolbarHeight).observe(bar);updateToolbarHeight();
 const $=id=>bar.querySelector('#'+id);
 const current=()=>mode==='page'?document.body:(active||document.body);const structural=el=>el&&el.matches('header,footer,section,article,aside,nav,.card,.hero-art,[role="img"],button,.button,.btn,img,[data-section]');
 const editableSelector='[data-edit],article,.tile,.card,.hero-art,img,[role="img"],header,footer,section,aside,nav,[data-section]';
 const editableElements=()=>[...document.querySelectorAll(editableSelector)].filter(el=>!el.closest('#ie-toolbar,#ie-image-popup')&&el.isConnected);
 const elementName=el=>{if(!el)return 'Select Item';if(el.getAttribute('data-edit'))return el.getAttribute('data-edit');if(el.matches('article,.tile,.card')){const group=editableElements().filter(x=>x.matches('article,.tile,.card'));return 'Article '+(group.indexOf(el)+1)}if(el.matches('img,.hero-art,[role="img"]'))return el.getAttribute('data-edit')||'Hero image';const label=el.getAttribute('data-edit');if(label)return label;const tag=el.tagName.toLowerCase();const group=editableElements().filter(x=>x.tagName===el.tagName);return tag.charAt(0).toUpperCase()+tag.slice(1)+(group.length>1?' '+(group.indexOf(el)+1):'')};
 let elementOptions=[];
 const refreshElementList=()=>{const list=$('ie-label');const elements=editableElements();elementOptions=elements;list.replaceChildren(new Option('Select Item',''));elements.forEach((el,i)=>list.add(new Option(elementName(el),String(i))));list.value=active?String(elements.indexOf(active)):'';if(list.value==='-1')list.value=''};
  const syncControls=()=>{$('ie-delete').hidden=false;$('ie-delete').disabled=mode!=='element'||!active;const enabled=mode==='page'||!!active;const targets=mode==='page'?[document.body]:[...selected].filter(el=>el.isConnected);
const textCapable=el=>!el.matches('img,hr,svg,video,canvas,[role="img"]')&&(!!el.textContent.trim()||el.matches('input,textarea,select,button'));
['ie-font','ie-size','ie-color'].forEach(id=>$(id).disabled=!enabled||!targets.length||!targets.every(textCapable));
['ie-bg','ie-radius','ie-border','ie-border-none'].forEach(id=>$(id).disabled=!enabled||!targets.length);
const el=enabled?current():null;$('ie-label').hidden=false;const name=selected.size>1?selected.size+' selected':elementName(active);refreshElementList();$('ie-label').title=name;$('ie-label').classList.toggle('ie-selected',mode==='element'&&!!active);if(!enabled)return;const c=getComputedStyle(current());$('ie-font').value=[...$('ie-font').options].some(o=>o.value===c.fontFamily)?c.fontFamily:'';$('ie-size').value=Math.round(parseFloat(c.fontSize))||16;$('ie-color').value=mode==='page'?(document.body.style.getPropertyValue('--ie-page-text-color')||hex(c.color)):(current().style.color?hex(current().style.color):hex(c.color));$('ie-bg').value=c.backgroundColor==='rgba(0, 0, 0, 0)'?'#ffffff':hex(c.backgroundColor);$('ie-radius').value=Math.round(parseFloat(c.borderTopLeftRadius))||0;$('ie-size-value').textContent=$('ie-size').value+'px';$('ie-radius-value').textContent=$('ie-radius').value+'px';$('ie-border').value=hex(c.borderTopColor);$('ie-border-none').dataset.none=(c.borderTopStyle==='none'||parseFloat(c.borderTopWidth)===0)?'true':'false';$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true';updateColorSwatches()};
 const updateColorSwatches=()=>{const t=$('ie-text-swatch'),b=$('ie-bg-swatch'),r=$('ie-border-swatch');t.style.color=$('ie-color').value;b.style.setProperty('--ie-swatch-color',$('ie-bg').value);r.style.setProperty('--ie-swatch-color',$('ie-border').value);r.style.opacity=$('ie-border-none').dataset.none==='true'?'.3':'1';$('ie-border-none').checked=$('ie-border-none').dataset.none!=='true';};['ie-color','ie-bg','ie-border'].forEach(id=>$(id).addEventListener('input',updateColorSwatches));
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
 }else {for(const target of matchingElements(el)){if(key==='borderColor'){target.style.removeProperty('border-style');target.style.setProperty('border-color',value,'important');const cs=getComputedStyle(target);if(parseFloat(cs.borderTopWidth)===0||cs.borderTopStyle==='none'){target.style.setProperty('border-width','1px','important');target.style.setProperty('border-style','solid','important')}}else if(key==='color'&&mode==='element')target.style.setProperty('color',value,'important');else if(key==='fontFamily')target.style.setProperty('font-family',value,'important');else target.style.setProperty(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value,'important')}}if(key==='backgroundColor')updateSelectionContrast()};
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
 enablePxEntry('ie-radius','ie-radius-value','borderRadius'); const {snapshot,restore}=createHistory(()=>[bar,imagePopup,document.getElementById('ie-marquee'),document.getElementById('ie-resume')].filter(Boolean));
  $('ie-delete').onclick=()=>{if(!active)return;const items=[...selected];undo.push(snapshot());redo.length=0;finish();for(const el of items){removed.add(el);el.remove()}syncControls()};
 let textEditing=false;const finish=()=>{textEditing=false;hideImagePopup();for(const el of selected){if(el.hasAttribute('data-edit'))el.contentEditable='false';el.classList.remove('ie-active-field');el.style.removeProperty('--ie-selection-outline')}selected.clear();active=null;if(mode==='element')$('ie-label').textContent='Select an element';syncControls()};
 const setMode=m=>{colorSession=null;mode=m;if(m==='page')finish();$('ie-page').classList.toggle('ie-selected',m==='page');$('ie-label').textContent=m==='page'?'Whole page':(active?.getAttribute('data-edit')||'Select an element');syncControls()};
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
  const el=e.target.closest?.('[data-edit],header,footer,section,article,aside,nav,.card,.hero-art,[role="img"],button,.button,.btn,img,[data-section]');
  if(!el){setMode('page');return;}
  if(e.shiftKey){e.preventDefault();if(!selected.size){select(el)}else if(selected.has(el)){selected.delete(el);el.classList.remove('ie-active-field');if(el.hasAttribute('data-edit'))el.contentEditable='false';active=[...selected].at(-1)||null;if(!active)finish();else syncControls()}else{selected.add(el);el.classList.add('ie-active-field');active=el;syncControls();}syncControls();return}if(active===el&&selected.size===1&&el.hasAttribute('data-edit')&&!el.matches('header,footer,section,article,aside,nav,[data-section]')&&!imageTarget(el)&&!textEditing){undo.push(snapshot());redo.length=0;textEditing=true;el.contentEditable='true';el.focus();return}
  if(active!==el||selected.size>1){select(el)}
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

  if(e.key==='Escape'&&textEditing&&active){active.contentEditable='false';textEditing=false;active.blur();return}
  if(e.key==='Escape'&&active){finish();return}
  if(e.key==='Escape'&&!preview){preview=true;applyPreview();return}
  if(e.key==='Enter'&&active&&!textEditing&&!preview&&!e.target.closest('input,textarea,select')){if(active.hasAttribute('data-edit')&&!imageTarget(active)){e.preventDefault();undo.push(snapshot());redo.length=0;textEditing=true;active.contentEditable='true';active.focus()}return}
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
 $('ie-copy').onclick=async()=>{
  if(textEditing&&active){active.blur();active.contentEditable='false';textEditing=false}
  try{await copyHTML(exportHTML(authorAttributes));$('ie-copy').classList.add('ie-copied');$('ie-copy-label').textContent='Copied!';setTimeout(()=>{$('ie-copy-label').textContent='HTML';$('ie-copy').classList.remove('ie-copied')},1600)}
  catch(error){console.error('Editor export copy failed',error);$('ie-copy-label').textContent='Copy failed'}
 };
 document.addEventListener('click',e=>{if(!preview&&!bar.contains(e.target)&&!imagePopup.contains(e.target)&&!e.target.closest('[data-built-at-editor-runtime]')&&e.target.closest('a,button,input[type=submit]')){e.preventDefault();e.stopPropagation()}},true);
 document.addEventListener('submit',e=>{if(!preview&&!e.target.closest('[data-built-at-editor-runtime]'))e.preventDefault()},true);
 const resume=document.createElement('button');resume.id='ie-resume';resume.dataset.builtAtEditorRuntime='';resume.type='button';resume.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 5 3 3M4 20l4.5-1 11-11a2.12 2.12 0 0 0-3-3l-11 11L4 20Z"/></svg>';resume.setAttribute('aria-label','Open editor');document.body.append(resume);
 resume.onclick=()=>{preview=false;applyPreview()};
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.target.closest('input,textarea,select,[contenteditable=true]')){preview=false;applyPreview()}});

 const original=snapshot();
 const afterRestore=()=>{
  captureAuthorAttributes(authorAttributes);
  document.body.classList.remove('ie-enabled','ie-preview');
  document.body.style.setProperty('--ie-original-padding-top',getComputedStyle(document.body).paddingTop);
  document.body.classList.add('ie-enabled');updateToolbarHeight();setMode('page');
 };
 const drafts=createDraftStore(sourceHTML,()=>exportHTML(authorAttributes),html=>{applyDocument(html);afterRestore()});
 tools=mountTools({bar,select,elementName,
  change:fn=>{finish();undo.push(snapshot());redo.length=0;fn();drafts.save()},
  revert:()=>drafts.reset(()=>{finish();restore(original);undo.length=redo.length=0;preview=false;afterRestore()})
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
