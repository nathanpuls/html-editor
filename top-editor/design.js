import {createHistory,createDraftStore,applyDocument} from './history.js';
import {captureAuthorAttributes,exportHTML} from './export.js';
/* Color and font helpers from the experimental editor. */
export function rgba(color){
 const value=String(color).trim();
 const match=value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
 if(match){let h=match[1];if(h.length<5)h=[...h].map(c=>c+c).join('');if(h.length===6)h+='ff';return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).concat(parseInt(h.slice(6,8),16)/255)}
 if(value==='transparent')return [0,0,0,0];
 const rgb=value.match(/^rgba?\(([^)]+)\)$/i);
 if(rgb){const parts=rgb[1].trim().split(/[,\s/]+/);return parts.slice(0,3).map(n=>Math.max(0,Math.min(255,parseFloat(n)*(n.endsWith('%')?2.55:1)))).concat(parts[3]===undefined?1:parseFloat(parts[3])/(parts[3].endsWith('%')?100:1))}
 if(typeof document!=='undefined'&&CSS.supports('color',value)){const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=value;ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;return [...p.slice(0,3),p[3]/255]}
 return [255,255,255,1];
}
export const colorHex=([r,g,b,a=1])=>'#'+[r,g,b,...(Math.round(a*255)<255?[a*255]:[])].map(n=>Math.round(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0')).join('');
export const hex=color=>colorHex(rgba(color));
export function rgbToHSV([r,g,b]){
 r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
 let h=0;if(delta){if(max===r)h=((g-b)/delta)%6;else if(max===g)h=(b-r)/delta+2;else h=(r-g)/delta+4}
 return [(h*60+360)%360,max?delta/max:0,max];
}
export function hsvToRGB([h,s,v],alpha=1){
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return rgb.map(n=>(n+m)*255).concat(alpha);
}

 const googleFonts=["Inter","Manrope","Roboto","Open Sans","Lato","Montserrat","Poppins","Nunito","Nunito Sans","DM Sans","Outfit","Raleway","Work Sans","Source Sans 3","Plus Jakarta Sans","Rubik","Quicksand","Ubuntu","Oswald","Roboto Slab","Merriweather","Playfair Display","Lora","Libre Baskerville","Cormorant Garamond","Bebas Neue","Anton","Space Grotesk","Space Mono","Fira Code"];
export const ensureGoogleFont=value=>{const family=googleFonts.find(f=>value.startsWith(f+','));if(!family)return;const id='ie-google-font-'+family.toLowerCase().replace(/[^a-z0-9]+/g,'-');if(document.getElementById(id))return;const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family).replace(/%20/g,'+')+':wght@400;500;600;700;800&display=swap';document.head.append(link)};

/* One shared live picker for text, SVG paint, backgrounds and borders. */
export function mountColorPicker(bar){
 const panel=document.createElement('div');panel.id='ie-color-popover';panel.className='ie-popover';panel.dataset.builtAtEditorRuntime='';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Color picker');
 panel.innerHTML='<div class="ie-color-area" role="slider" tabindex="0" aria-label="Color area" aria-valuemin="0" aria-valuemax="100"><span class="ie-color-cursor"></span></div><label class="ie-picker-row"><span>Hue</span><input class="ie-hue" type="range" min="0" max="359" step="1" aria-label="Hue"></label><label class="ie-picker-row"><span>Opacity</span><input class="ie-alpha" type="range" min="0" max="100" step="1" aria-label="Opacity"><output class="ie-alpha-value">100%</output></label><label class="ie-hex-row"><span>HEX</span><input class="ie-hex" type="text" spellcheck="false" autocomplete="off" aria-label="HEX" maxlength="9"></label>';
 document.body.append(panel);
 const area=panel.querySelector('.ie-color-area'),cursor=panel.querySelector('.ie-color-cursor'),hue=panel.querySelector('.ie-hue'),opacity=panel.querySelector('.ie-alpha'),output=panel.querySelector('output'),field=panel.querySelector('.ie-hex');
 let trigger=null,hsv=[0,0,1],alpha=1;
 const end=()=>trigger?.dispatchEvent(new Event('change',{bubbles:true}));
 const close=()=>{end();panel.hidden=true;trigger?.setAttribute('aria-expanded','false');trigger=null};
 const draw=()=>{const rgb=hsvToRGB(hsv,alpha),solid=colorHex(hsvToRGB(hsv,1));area.style.backgroundColor='hsl('+hsv[0]+' 100% 50%)';cursor.style.left=(hsv[1]*100)+'%';cursor.style.top=((1-hsv[2])*100)+'%';hue.value=Math.round(hsv[0]);opacity.value=Math.round(alpha*100);output.textContent=Math.round(alpha*100)+'%';opacity.style.setProperty('--ie-alpha-color',solid);field.value=colorHex(rgb).toUpperCase();field.removeAttribute('aria-invalid');area.setAttribute('aria-valuenow',Math.round(hsv[1]*100));area.setAttribute('aria-valuetext','Saturation '+Math.round(hsv[1]*100)+'%, brightness '+Math.round(hsv[2]*100)+'%')};
 const update=()=>{draw();if(trigger){trigger.value=colorHex(hsvToRGB(hsv,alpha));trigger.dispatchEvent(new Event('input',{bubbles:true}))}};
 for(const id of ['ie-color','ie-bg','ie-border']){const button=bar.querySelector('#'+id);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.onclick=()=>{if(trigger===button&&!panel.hidden){close();return}close();trigger=button;const color=rgba(button.value);hsv=rgbToHSV(color);alpha=color[3];draw();panel.hidden=false;button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,r.left))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,r.bottom+8))+'px';area.focus({preventScroll:true})}}
 const point=e=>{const r=area.getBoundingClientRect();hsv[1]=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));hsv[2]=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));update()};
 area.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();area.focus();area.setPointerCapture(e.pointerId);point(e)});
 area.addEventListener('pointermove',e=>{if(area.hasPointerCapture(e.pointerId))point(e)});
 area.addEventListener('pointerup',e=>{if(area.hasPointerCapture(e.pointerId)){area.releasePointerCapture(e.pointerId);end()}});
 area.addEventListener('pointercancel',end);
 area.addEventListener('keydown',e=>{const step=e.shiftKey?.1:.01;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();hsv[1]=Math.max(0,Math.min(1,hsv[1]+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0)));hsv[2]=Math.max(0,Math.min(1,hsv[2]+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0)));update()}});
 area.addEventListener('keyup',e=>{if(e.key.startsWith('Arrow'))end()});
 hue.oninput=()=>{hsv[0]=Number(hue.value);update()};opacity.oninput=()=>{alpha=Number(opacity.value)/100;update()};
 hue.onchange=opacity.onchange=end;
 field.oninput=()=>{let value=field.value.trim();if(!value.startsWith('#'))value='#'+value;if(!/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)){field.setAttribute('aria-invalid','true');return}const color=rgba(value);hsv=rgbToHSV(color);if([4,8].includes(value.length-1))alpha=color[3];const selection=field.selectionStart;update();field.setSelectionRange(selection,selection)};
 field.onchange=()=>{draw();end()};field.addEventListener('focus',()=>field.select());
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();const button=trigger;close();button?.focus()}},true);
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger?.contains(e.target))close()},true);
 window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
 return {close};
}

/* Clone author markup while keeping identities and SVG references independent. */
let cloneSequence=0;
export function cloneEditable(target){
 const clone=target.cloneNode(true),suffix='-copy-'+Date.now().toString(36)+'-'+(++cloneSequence),ids=new Map(),labels=new Set([...document.querySelectorAll('[data-edit]')].map(el=>el.getAttribute('data-edit')));
 for(const node of [clone,...clone.querySelectorAll('*')]){
  if(node.id){ids.set(node.id,node.id+suffix);node.id+=suffix}
  if(node.hasAttribute('data-edit')){const base=node.getAttribute('data-edit')+' copy ';let number=cloneSequence;while(labels.has(base+number))number++;node.setAttribute('data-edit',base+number);labels.add(base+number)}
  node.classList.remove('ie-active-field');node.style.removeProperty('--ie-selection-outline');
  node.removeAttribute('contenteditable');node.removeAttribute('spellcheck');if(!node.classList.length)node.removeAttribute('class');if(!node.getAttribute('style')?.trim())node.removeAttribute('style');
 }
 for(const node of [clone,...clone.querySelectorAll('*')])for(const attr of [...node.attributes]){
  let value=attr.value;
  for(const [old,id] of ids){if(value==='#'+old)value='#'+id;value=value.replaceAll('url(#'+old+')','url(#'+id+')');if(['aria-labelledby','aria-describedby','aria-controls','for','headers'].includes(attr.name))value=value.split(' ').map(x=>x===old?id:x).join(' ')}
  if(value!==attr.value)node.setAttribute(attr.name,value);
 }
 return clone;
}
const authorNode=el=>!el.closest('[data-built-at-editor-runtime],[data-codex-agent-overlay-root]')&&!el.matches('script,style,link,meta,title,template,noscript,source');
export const canArrange=(source,target)=>!!source&&!!target&&source!==target&&source.parentElement===target.parentElement&&authorNode(source)&&authorNode(target)&&!source.contains(target);
export function mountArrange({elementName,change}){
 const panel=document.createElement('aside');panel.id='ie-arrange';panel.dataset.builtAtEditorRuntime='';panel.hidden=true;panel.setAttribute('aria-label','Arrange elements');
 panel.innerHTML='<header><strong>Arrange</strong><button type="button" aria-label="Close Arrange" title="Close">'+"<svg data-lucide=\"x\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" /> </svg> "+'</button></header><p>Drag items within their container. Expand an item to arrange its contents.</p><div class="ie-outline"></div><p class="ie-arrange-status" role="status"></p>';
 document.body.append(panel);const list=panel.querySelector('.ie-outline'),status=panel.querySelector('[role=status]'),expanded=new WeakMap();let dragged=null,queued=false,pointerDrag=null;const rowElements=new WeakMap();
 const close=()=>{panel.hidden=true;dragged=null;pointerDrag=null};panel.querySelector('button').onclick=close;
 const children=el=>el.matches('svg')?[]:[...el.children].filter(authorNode);
 const render=()=>{
  if(panel.hidden||dragged)return;list.replaceChildren();
  const visit=(el,level)=>{
   const kids=children(el),wrapper=document.createElement(kids.length?'details':'div');wrapper.className='ie-outline-item';
   const row=document.createElement(kids.length?'summary':'div');row.className='ie-outline-row';rowElements.set(row,el);
   const handle=document.createElement('button');handle.type='button';handle.className='ie-drag-handle';handle.draggable=false;handle.innerHTML="<svg data-lucide=\"grip-vertical\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"9\" cy=\"12\" r=\"1\" /> <circle cx=\"9\" cy=\"5\" r=\"1\" /> <circle cx=\"9\" cy=\"19\" r=\"1\" /> <circle cx=\"15\" cy=\"12\" r=\"1\" /> <circle cx=\"15\" cy=\"5\" r=\"1\" /> <circle cx=\"15\" cy=\"19\" r=\"1\" /> </svg> ";handle.setAttribute('aria-label','Drag '+elementName(el));handle.title='Drag to reorder';handle.onclick=e=>e.preventDefault();
   const name=document.createElement('span');name.textContent=el.getAttribute('data-section')||el.getAttribute('data-edit')||el.getAttribute('aria-label')||el.tagName.toLowerCase()+(el.id?' #'+el.id:'');row.append(handle,name);if(kids.length){const caret=document.createElement('span');caret.className='ie-outline-caret';caret.innerHTML="<svg data-lucide=\"chevron-right\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m9 18 6-6-6-6\" /> </svg> ";row.append(caret)}wrapper.append(row);
   if(kids.length){wrapper.open=expanded.has(el)?expanded.get(el):level<1;wrapper.addEventListener('toggle',()=>expanded.set(el,wrapper.open));const nested=document.createElement('div');nested.className='ie-outline-children';kids.forEach(child=>nested.append(visit(child,level+1)));wrapper.append(nested)}
   handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();handle.setPointerCapture(e.pointerId);pointerDrag={el,row,handle,id:e.pointerId,x:e.clientX,y:e.clientY,target:null,before:true};});
   return wrapper;
  };
  children(document.body).forEach(el=>list.append(visit(el,0)));
 };
 const clearDrop=()=>panel.querySelectorAll('.ie-drop-before,.ie-drop-after').forEach(row=>row.classList.remove('ie-drop-before','ie-drop-after'));
 panel.addEventListener('pointermove',e=>{
  if(!pointerDrag||e.pointerId!==pointerDrag.id)return;
  if(!dragged&&Math.hypot(e.clientX-pointerDrag.x,e.clientY-pointerDrag.y)<5)return;
  dragged=pointerDrag.el;pointerDrag.row.classList.add('ie-drag-source');e.preventDefault();clearDrop();
  const row=document.elementFromPoint(e.clientX,e.clientY)?.closest('.ie-outline-row'),target=row&&rowElements.get(row);pointerDrag.target=null;
  if(canArrange(dragged,target)){pointerDrag.target=target;pointerDrag.before=e.clientY<row.getBoundingClientRect().top+row.offsetHeight/2;row.classList.add(pointerDrag.before?'ie-drop-before':'ie-drop-after')}
  const rect=list.getBoundingClientRect();if(e.clientY<rect.top+25)list.scrollTop-=12;else if(e.clientY>rect.bottom-25)list.scrollTop+=12;
 });
 const endPointer=e=>{if(!pointerDrag||e.pointerId!==pointerDrag.id)return;const state=pointerDrag;pointerDrag=null;dragged=null;clearDrop();if(state.handle.hasPointerCapture(e.pointerId))state.handle.releasePointerCapture(e.pointerId);if(e.type!=='pointercancel'&&state.target&&canArrange(state.el,state.target)){change(()=>state.before?state.target.before(state.el):state.target.after(state.el));status.textContent='Moved '+(state.el.getAttribute('data-edit')||state.el.tagName.toLowerCase())}render()};
 panel.addEventListener('pointerup',endPointer);panel.addEventListener('pointercancel',endPointer);
 const observer=new MutationObserver(records=>{if(panel.hidden||queued||!records.some(r=>authorNode(r.target.nodeType===1?r.target:r.target.parentElement)))return;queued=true;requestAnimationFrame(()=>{queued=false;render()})});observer.observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});
 return {open:()=>{panel.hidden=false;render()},close};
}

/* A separate content-only mobile editor. No desktop controls are mounted. */
export function startMobileEditor({authorAttributes,sourceHTML}){
 const panel=document.createElement('div');panel.id='ie-mobile-editor';panel.dataset.builtAtEditorRuntime='';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Edit content');panel.setAttribute('aria-modal','true');
 panel.innerHTML='<header><strong>Edit content</strong><div><button type="button" class="ie-mobile-undo" aria-label="Undo" disabled>'+"<svg data-lucide=\"undo-2\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M9 14 4 9l5-5\" /> <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\" /> </svg> "+'</button><button type="button" class="ie-mobile-close" aria-label="Close">'+"<svg data-lucide=\"x\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" /> </svg> "+'</button></div></header><form></form>';
 const resume=document.createElement('button');resume.id='ie-mobile-resume';resume.dataset.builtAtEditorRuntime='';resume.type='button';resume.textContent='Edit';resume.hidden=true;
 document.body.append(panel,resume);
 const {snapshot,restore}=createHistory(()=>[panel,resume]),undo=[],form=panel.querySelector('form'),undoButton=panel.querySelector('.ie-mobile-undo');
 let session=null,sequence=0;const pending=new Map(),versions=new WeakMap();
 const drafts=createDraftStore(sourceHTML,()=>exportHTML(authorAttributes),html=>{applyDocument(html);captureAuthorAttributes(authorAttributes)});
 const sync=()=>{undoButton.disabled=!undo.length};
 const commit=(input,fn)=>{if(session!==input){undo.push(snapshot());session=input}fn();sync();drafts.save()};
 const textNodes=el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode()){const node=walker.currentNode;if(node.data.trim()&&(node.parentElement.closest('[data-edit]')===el&&(!node.parentElement.closest('a')||node.parentElement.closest('a')===el||!el.contains(node.parentElement.closest('a')))||el.matches('a')&&!el.hasAttribute('data-edit')&&node.parentElement.closest('[data-edit]')===el.closest('[data-edit="links"]'))&&!node.parentElement.closest('svg,script,style,input,textarea,select'))nodes.push(node)}return nodes};
 const valid=(value,image=false)=>{if(!value||/\s/.test(value))return false;try{const url=new URL(value,document.baseURI);return image?['http:','https:','blob:'].includes(url.protocol)||value.startsWith('data:image/'):['http:','https:','mailto:','tel:'].includes(url.protocol)}catch{return false}};
 const flush=()=>{for(const [input,task] of pending){clearTimeout(task.timer);pending.delete(input);task.run()}};
 const cancel=()=>{for(const task of pending.values())clearTimeout(task.timer);pending.clear();sequence++};
 const render=()=>{
  form.replaceChildren();const sections=new Map();
  const sectionFor=el=>{const section=el.closest('[data-section],section,article,header,footer,nav'),key=section||document.body;if(!sections.has(key)){const fieldset=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=section?.getAttribute('data-section')||section?.getAttribute('data-edit')||section?.querySelector('h1,h2,h3')?.textContent.trim()||'Page';fieldset.append(legend);sections.set(key,fieldset);form.append(fieldset)}return sections.get(key)};
  const field=(el,label,value,kind,write)=>{
   const wrap=document.createElement('label'),caption=document.createElement('span'),input=document.createElement(kind==='text'?'textarea':'input'),status=document.createElement('small');caption.textContent=label;input.value=value;input.setAttribute('aria-label',label);input.dataset.mobileField=kind;
   if(kind==='text'){input.rows=Math.min(6,Math.max(2,Math.ceil(value.length/42)))}else{input.type='text';input.inputMode='url';input.autocapitalize='off';input.spellcheck=false;input.addEventListener('focus',()=>input.select());input.addEventListener('click',()=>input.select())}
   status.setAttribute('role','status');wrap.append(caption,input,status);sectionFor(el).append(wrap);
   const apply=()=>{
    if(!el.isConnected)return;const next=kind==='text'?input.value:input.value.trim();
    if(kind==='image'){
     const token={sequence,number:(versions.get(input)?.number||0)+1};versions.set(input,token);if(!valid(next,true)){status.textContent=next?'Enter an image URL.':'';return}if(next===write())return;
     const previous=write(),probe=new Image();probe.onload=()=>{if(sequence!==token.sequence||versions.get(input)!==token||!el.isConnected||write()!==previous)return;commit(input,()=>write(next));status.textContent=''};probe.onerror=()=>{if(sequence===token.sequence&&versions.get(input)===token)status.textContent='Image could not load. Previous image kept.'};probe.src=next;return;
    }
    if(kind==='url'&&!valid(next)){status.textContent=next?'Enter a valid URL.':'';return}
    if(next!==write())commit(input,()=>write(next));status.textContent='';
   };
   input.addEventListener('input',e=>{if(kind==='image')versions.delete(input);const old=pending.get(input);if(old)clearTimeout(old.timer);if(kind==='text'||e.inputType==='insertFromPaste')apply();else{const task={run:apply};task.timer=setTimeout(()=>{pending.delete(input);apply()},350);pending.set(input,task)}});
   input.addEventListener('blur',()=>{const task=pending.get(input);if(task){clearTimeout(task.timer);pending.delete(input);task.run()}session=null});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'&&kind!=='text'){e.preventDefault();flush();input.blur()}});
  };
  for(const el of [...document.querySelectorAll('[data-edit],[data-edit="links"] a,img')].filter(authorNode)){
   const label=el.getAttribute('data-edit')||el.getAttribute('aria-label')||el.getAttribute('alt')||el.textContent.trim().slice(0,50)||el.tagName.toLowerCase();
   const nodes=textNodes(el);if(nodes.length){const read=()=>nodes.map(node=>node.data).join(' ').trim();field(el,label,read(),'text',value=>{if(value===undefined)return read();nodes[0].data=value;for(const node of nodes.slice(1))node.data=''})}
   if(el.matches('a'))field(el,label+' — URL',el.getAttribute('href')||'','url',value=>value===undefined?el.getAttribute('href')||'':el.setAttribute('href',value));
   if(el.matches('img'))field(el,label+' — Image URL',el.getAttribute('src')||'','image',value=>{if(value===undefined)return el.getAttribute('src')||'';el.src=value;el.removeAttribute('srcset');el.removeAttribute('sizes');el.closest('picture')?.querySelectorAll('source').forEach(source=>source.removeAttribute('srcset'))});
   else{const background=getComputedStyle(el).backgroundImage;if(background.startsWith('url(')){const read=()=>getComputedStyle(el).backgroundImage.slice(4,-1).replace(/^["']|["']$/g,'');field(el,label+' — Image URL',read(),'image',value=>{if(value===undefined)return read();el.style.backgroundImage='url('+JSON.stringify(value)+')'})}}
  }
  if(!form.querySelector('input,textarea')){const empty=document.createElement('p');empty.textContent='No editable content on this page.';form.append(empty)}
 };
 const close=()=>{flush();session=null;drafts.save();panel.hidden=true;resume.hidden=false};
 panel.querySelector('.ie-mobile-close').onclick=close;resume.onclick=()=>{panel.hidden=false;resume.hidden=true;render()};
 undoButton.onclick=()=>{cancel();session=null;if(!undo.length)return;restore(undo.pop());document.body.classList.remove('ie-enabled');captureAuthorAttributes(authorAttributes);render();sync();drafts.save()};
 form.onsubmit=e=>e.preventDefault();panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});
 window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
 drafts.restore();drafts.watch();render();sync();
}
