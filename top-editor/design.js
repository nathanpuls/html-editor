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
 const borderSwitch=document.createElement('label');borderSwitch.className='ie-border-switch';borderSwitch.innerHTML='<input type="checkbox" aria-label="Border enabled">Border enabled';borderSwitch.hidden=true;panel.append(borderSwitch);const borderToggle=borderSwitch.querySelector('input');borderToggle.onchange=()=>{const original=document.getElementById('ie-border-none');original.checked=borderToggle.checked;original.dispatchEvent(new Event('change',{bubbles:true}))};
 document.body.append(panel);
 const area=panel.querySelector('.ie-color-area'),cursor=panel.querySelector('.ie-color-cursor'),hue=panel.querySelector('.ie-hue'),opacity=panel.querySelector('.ie-alpha'),output=panel.querySelector('output'),field=panel.querySelector('.ie-hex');
 let trigger=null,hsv=[0,0,1],alpha=1;
 const end=()=>trigger?.dispatchEvent(new Event('change',{bubbles:true}));
 const close=()=>{end();panel.hidden=true;trigger?.setAttribute('aria-expanded','false');trigger=null};
 const draw=()=>{const rgb=hsvToRGB(hsv,alpha),solid=colorHex(hsvToRGB(hsv,1));area.style.backgroundColor='hsl('+hsv[0]+' 100% 50%)';cursor.style.left=(hsv[1]*100)+'%';cursor.style.top=((1-hsv[2])*100)+'%';hue.value=Math.round(hsv[0]);opacity.value=Math.round(alpha*100);output.textContent=Math.round(alpha*100)+'%';opacity.style.setProperty('--ie-alpha-color',solid);field.value=colorHex(rgb).toUpperCase();field.removeAttribute('aria-invalid');area.setAttribute('aria-valuenow',Math.round(hsv[1]*100));area.setAttribute('aria-valuetext','Saturation '+Math.round(hsv[1]*100)+'%, brightness '+Math.round(hsv[2]*100)+'%')};
 const update=()=>{draw();if(trigger){trigger.value=colorHex(hsvToRGB(hsv,alpha));trigger.dispatchEvent(new Event('input',{bubbles:true}))}};
 for(const id of ['ie-color','ie-bg','ie-border']){const button=document.getElementById(id);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.onclick=()=>{if(trigger===button&&!panel.hidden){close();return}const anchor=button.getBoundingClientRect();close();document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));trigger=button;borderSwitch.hidden=id!=='ie-border';borderToggle.checked=document.getElementById('ie-border-none').checked;const color=rgba(button.value);hsv=rgbToHSV(color);alpha=color[3];draw();panel.hidden=false;button.setAttribute('aria-expanded','true');const r=anchor;panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,r.left))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,r.bottom+8))+'px';area.focus({preventScroll:true})}}
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
 document.addEventListener('ie-open-panel',e=>{if(e.detail!==panel)close()});
 window.addEventListener('resize',close);
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

const readableName=value=>String(value||'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase());
export function outlineName(el){
 const named=el.getAttribute('data-edit')||el.getAttribute('aria-label')||el.getAttribute('alt');
 if(named){let label=readableName(named).replace(/\s+(?:link\s+)?item$/i,'');if(el.matches?.('a'))label=label.replace(/\s+link$/i,'');if(label.toLowerCase()==='links'&&el.children?.length)return 'Link list';return label.slice(0,60)}
 const kinds={DIV:'Container',MAIN:'Page content',SECTION:'Section',ARTICLE:'Card',NAV:'Navigation',HEADER:'Header',FOOTER:'Footer',UL:'List',OL:'List',LI:'List item',A:'Link',IMG:'Image',SVG:'Icon',SPAN:'Text',P:'Paragraph',H1:'Heading',H2:'Heading',H3:'Heading',BUTTON:'Button',FORM:'Form'};
 const kind=kinds[el.tagName]||'Element';
 const heading=el.querySelector('h1,h2,h3,h4'),text=(heading?.textContent||(!el.children.length?el.textContent:'')||'').replace(/\s+/g,' ').trim();
 return kind+(text?' · '+text.slice(0,42):'');
}


/* Compact inputs use one click for entry and a small motion threshold for scrubbing. */
export function mountNumber(input,min,max){
 let gesture=null;
 const commit=()=>{const n=Math.max(min,Math.min(max,Math.round(Number(input.value))));if(!Number.isFinite(n))return;input.value=n;input.setAttribute('aria-valuenow',n);input.dispatchEvent(new Event('input',{bubbles:true}))};
 input.setAttribute('aria-valuemin',min);input.setAttribute('aria-valuemax',max);
 input.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();gesture={id:e.pointerId,x:e.clientX,value:Number(input.value)||0,dragged:false};input.setPointerCapture(e.pointerId)});
 input.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x;if(!gesture.dragged&&Math.abs(dx)<5)return;gesture.dragged=true;input.value=Math.max(min,Math.min(max,gesture.value+Math.round(dx/2)));commit()});
 input.addEventListener('pointerup',e=>{if(!gesture)return;const dragged=gesture.dragged;gesture=null;input.releasePointerCapture(e.pointerId);if(dragged)input.dispatchEvent(new Event('change',{bubbles:true}));else{input.focus();input.select()}});
 input.addEventListener('pointercancel',()=>{gesture=null;input.dispatchEvent(new Event('change',{bubbles:true}))});
 input.addEventListener('keydown',e=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.key)){e.preventDefault();e.stopPropagation();input.value=(Number(input.value)||0)+(e.key==='ArrowUp'||e.key==='ArrowRight'?1:-1)*(e.shiftKey?10:1);commit()}if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();e.stopPropagation();input.blur()}});
 input.addEventListener('blur',()=>{commit();input.dispatchEvent(new Event('change',{bubbles:true}))});
}
/* Measure the actual content, moving the original controls rather than clones. */
export function mountOverflow(bar,tools){
 const row=document.getElementById('ie-format-row'),formats=[...row.children],actions=['ie-duplicate','ie-revert-selected','ie-delete','ie-undo','ie-redo'].map(id=>document.getElementById(id));
 let queued=false;
 const layout=()=>{
  if(!bar.getClientRects().length)return;
  bar.classList.remove('ie-micro');for(const el of formats)row.append(el);
  const menu=document.getElementById('ie-menu');
  for(const el of actions)menu.before(el);
  const crowded=()=>bar.scrollWidth>bar.clientWidth;
  for(const name of ['Radius','Border','Background','Text Color','Font','Size']){
   if(!crowded())break;const el=formats.find(el=>el.dataset.format===name);if(!el.hidden)tools.formatOverflow.append(el);
  }
  for(const el of actions){if(!crowded())break;tools.actionOverflow.append(el)}for(const el of formats)if(el.parentElement===tools.formatOverflow)tools.formatOverflow.append(el);if(crowded())bar.classList.add('ie-micro');
 };
 const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;layout()})};
 new ResizeObserver(schedule).observe(bar);
 new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='hidden'))schedule()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();return {layout:schedule};
}
export function contrastingInk(color){
 const [r,g,b,a]=rgba(color),background=[r,g,b].map(n=>n*a+255*(1-a));
 const linear=n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4};
 return .2126*linear(background[0])+.7152*linear(background[1])+.0722*linear(background[2])>.179?'#000000':'#ffffff';
}
/* Sibling-only movement preserves HTML parent-child validity. */
export function mountPageDrag({getActive,beforeDrag,change}){
 const handle=document.createElement('button');handle.id='ie-page-drag';handle.type='button';handle.dataset.builtAtEditorRuntime='';handle.setAttribute('aria-label','Drag selected element');handle.title='Drag to reorder';
 handle.innerHTML="<svg aria-hidden=\"true\" data-lucide=\"grip-vertical\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"9\" cy=\"12\" r=\"1\" /> <circle cx=\"9\" cy=\"5\" r=\"1\" /> <circle cx=\"9\" cy=\"19\" r=\"1\" /> <circle cx=\"15\" cy=\"12\" r=\"1\" /> <circle cx=\"15\" cy=\"5\" r=\"1\" /> <circle cx=\"15\" cy=\"19\" r=\"1\" /> </svg> ";
 const line=document.createElement('div');line.id='ie-insertion';line.dataset.builtAtEditorRuntime='';line.hidden=true;handle.hidden=true;document.body.append(handle,line);
 let state=null,frame=null;
 const update=()=>{
  const el=getActive();if(!el?.isConnected){handle.hidden=true;return}
  const r=el.getBoundingClientRect();handle.hidden=false;handle.style.left=Math.max(4,Math.min(innerWidth-30,r.left-29))+'px';handle.style.top=Math.max(80,Math.min(innerHeight-30,r.top))+'px';
 };
 const aim=()=>{
  if(!state)return;const siblings=[...state.el.parentElement.children].filter(el=>el!==state.el&&authorNode(el)&&el.getClientRects().length);
  const hit=siblings.find(el=>{const r=el.getBoundingClientRect();return state.y>=r.top&&state.y<=r.bottom&&state.x>=r.left-40&&state.x<=r.right+40});
  const target=hit||siblings.reduce((best,el)=>{const r=el.getBoundingClientRect(),distance=Math.abs(state.y-(r.top+r.height/2));return !best||distance<best.distance?{el,distance}:best},null)?.el;
  state.target=target;if(!target){line.hidden=true;return}
  const r=target.getBoundingClientRect(),style=getComputedStyle(target.parentElement),horizontal=style.display.includes('flex')&&style.flexDirection==='row';
  state.before=horizontal?state.x<r.left+r.width/2:state.y<r.top+r.height/2;
  line.hidden=false;Object.assign(line.style,horizontal?{left:(state.before?r.left:r.right)+'px',top:r.top+'px',width:'3px',height:r.height+'px'}:{left:r.left+'px',top:(state.before?r.top:r.bottom)+'px',width:r.width+'px',height:'3px'});
 };
 const scroll=()=>{if(!state)return;const top=document.getElementById('ie-toolbar').getBoundingClientRect().bottom+35,delta=!state.moved?0:state.y<top?-Math.min(22,(top-state.y)/3):state.y>innerHeight-60?Math.min(22,(state.y-innerHeight+60)/3):0;if(delta){window.scrollBy(0,delta);aim()}frame=requestAnimationFrame(scroll)};
 handle.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const el=getActive();if(!el)return;beforeDrag();state={el,id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};handle.setPointerCapture(e.pointerId);frame=requestAnimationFrame(scroll)};
 handle.onpointermove=e=>{if(!state)return;state.x=e.clientX;state.y=e.clientY;if(Math.hypot(state.x-state.startX,state.y-state.startY)>5){state.moved=true;aim()}};
 const end=e=>{if(!state)return;const old=state;state=null;cancelAnimationFrame(frame);line.hidden=true;if(handle.hasPointerCapture(old.id))handle.releasePointerCapture(old.id);if(e.type!=='pointercancel'&&old.moved&&canArrange(old.el,old.target))change(()=>old.before?old.target.before(old.el):old.target.after(old.el));update()};
 handle.onpointerup=end;handle.onpointercancel=end;window.addEventListener('scroll',update,true);window.addEventListener('resize',update);return {update,close:()=>{handle.hidden=true;line.hidden=true}};
}

/* Only authored root color tokens are editable. Derived tokens follow CSS normally. */
export function mountPageColors(settings,change){
 settings.querySelector('.ie-page-colors')?.remove();
 const box=document.createElement('div');box.className='ie-page-colors';box.innerHTML='<h4>Page colors</h4>';settings.append(box);
 const declarations=new Map();
 const collect=style=>{for(const name of style)if(name.startsWith('--')&&!name.startsWith('--ie-'))declarations.set(name,style.getPropertyValue(name).trim())};
 const scan=rules=>{for(const rule of rules){if(rule.selectorText&&document.documentElement.matches(rule.selectorText))collect(rule.style);if(rule.cssRules&&(!rule.conditionText||!rule.media||matchMedia(rule.conditionText).matches))scan(rule.cssRules)}};
 for(const sheet of document.styleSheets)try{if(!sheet.disabled)scan(sheet.cssRules)}catch{}
 // Keep original dependencies even after a local draft adds root overrides.
 const derived=new Set([...declarations].filter(([,value])=>value.includes('var(')).map(([name])=>name));
 collect(document.documentElement.style);
 const root=getComputedStyle(document.documentElement);
 for(const [name,authored] of declarations){
  const value=root.getPropertyValue(name).trim();if(derived.has(name)||authored.includes('var(')||!CSS.supports('color',value))continue;
  const label=document.createElement('label'),swatch=document.createElement('i'),text=document.createElement('span'),input=document.createElement('input');
  text.textContent=name.slice(2).replace(/[-_]/g,' ');input.value=hex(value);input.setAttribute('aria-label',text.textContent+' color');input.spellcheck=false;swatch.style.background=value;
  label.append(swatch,text,input);box.append(label);let last=input.value;
  const apply=()=>{let next=input.value.trim();if(!next.startsWith('#'))next='#'+next;if(!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(next)||hex(next)===hex(last))return;change(()=>document.documentElement.style.setProperty(name,next));last=next;swatch.style.background=next};
  input.onchange=apply;input.oninput=()=>{if(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(input.value))apply()};
 }
 const note=document.createElement('p');note.textContent=box.children.length>1?'Shared CSS colors. Linked shades and transparency follow automatically; element formatting stays local.':'Define shared colors as CSS variables on :root to edit them here.';box.append(note);
}
