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

/* Small property-specific reset shared by the formatting panels. */
function makeResetButton(run){
 const button=document.createElement('button');button.type='button';button.className='ie-control-reset';button.textContent='Reset';button.setAttribute('aria-label','Reset');button.onclick=run;return button;
}
export function restoreStyleProperties(target,originalStyle,properties){
 const baseline=document.createElement('span').style;baseline.cssText=originalStyle||'';
 for(const property of properties){const value=baseline.getPropertyValue(property);if(value)target.style.setProperty(property,value,baseline.getPropertyPriority(property));else target.style.removeProperty(property)}
 if(!target.getAttribute('style')?.trim())target.removeAttribute('style');
}

/* One shared live picker for text, SVG paint, backgrounds and borders. */
export function mountColorPicker(bar,{reset}={}){
 const panel=document.createElement('div');panel.id='ie-color-popover';panel.className='ie-popover';panel.dataset.builtAtEditorRuntime='';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Color picker');
 panel.innerHTML='<div class="ie-color-area" role="slider" tabindex="0" aria-label="Color area" aria-valuemin="0" aria-valuemax="100"><span class="ie-color-cursor"></span></div><label class="ie-picker-row"><span>Hue</span><input class="ie-hue" type="range" min="0" max="359" step="1" aria-label="Hue"></label><label class="ie-picker-row"><span>Opacity</span><input class="ie-alpha" type="range" min="0" max="100" step="1" aria-label="Opacity"><output class="ie-alpha-value">100%</output></label><label class="ie-hex-row"><span>HEX</span><input class="ie-hex" type="text" spellcheck="false" autocomplete="off" aria-label="HEX" maxlength="9"></label>';
 const borderSwitch=document.createElement('label');borderSwitch.className='ie-border-switch';borderSwitch.innerHTML='<input type="checkbox" aria-label="Border enabled">Border enabled';borderSwitch.hidden=true;panel.append(borderSwitch);const borderToggle=borderSwitch.querySelector('input');borderToggle.onchange=()=>{const original=document.getElementById('ie-border-none');original.checked=borderToggle.checked;original.dispatchEvent(new Event('change',{bubbles:true}))};
 document.body.append(panel);
 const area=panel.querySelector('.ie-color-area'),cursor=panel.querySelector('.ie-color-cursor'),hue=panel.querySelector('.ie-hue'),opacity=panel.querySelector('.ie-alpha'),output=panel.querySelector('output'),field=panel.querySelector('.ie-hex');
 let trigger=null,hsv=[0,0,1],alpha=1,alphaTouched=false;
 const resetButton=makeResetButton(()=>{const key={"ie-color":"color","ie-bg":"backgroundColor","ie-border":"borderColor"}[trigger?.id];close();if(key)reset?.(key)});panel.append(resetButton);
 const end=()=>trigger?.dispatchEvent(new Event('change',{bubbles:true}));
 const close=()=>{end();panel.hidden=true;trigger?.setAttribute('aria-expanded','false');trigger=null};
 const draw=()=>{const rgb=hsvToRGB(hsv,alpha),solid=colorHex(hsvToRGB(hsv,1));area.style.backgroundColor='hsl('+hsv[0]+' 100% 50%)';cursor.style.left=(hsv[1]*100)+'%';cursor.style.top=((1-hsv[2])*100)+'%';hue.value=Math.round(hsv[0]);opacity.value=Math.round(alpha*100);output.textContent=Math.round(alpha*100)+'%';opacity.style.setProperty('--ie-alpha-color',solid);field.value=colorHex(rgb).toUpperCase();field.removeAttribute('aria-invalid');area.setAttribute('aria-valuenow',Math.round(hsv[1]*100));area.setAttribute('aria-valuetext','Saturation '+Math.round(hsv[1]*100)+'%, brightness '+Math.round(hsv[2]*100)+'%')};
 const update=()=>{if(alpha===0&&!alphaTouched)alpha=1;draw();if(trigger){trigger.value=colorHex(hsvToRGB(hsv,alpha));trigger.dispatchEvent(new Event('input',{bubbles:true}))}};
 const open=(button,pageColor=false)=>{
  if(trigger===button&&!panel.hidden){close();return}
  const anchor=button.getBoundingClientRect();close();panel.dataset.ieKeepSettings=String(pageColor);
  document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));trigger=button;
  resetButton.hidden=pageColor;borderSwitch.hidden=pageColor||button.id!=='ie-border';borderToggle.checked=document.getElementById('ie-border-none').checked;
  const color=rgba(button.value);hsv=rgbToHSV(color);alpha=color[3];alphaTouched=false;draw();panel.hidden=false;button.setAttribute('aria-expanded','true');
  let left=anchor.left,top=anchor.bottom+8;
  if(pageColor){left=anchor.left-panel.offsetWidth-10;if(left<8)left=anchor.right+10;top=anchor.top}
  panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,left))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,top))+'px';area.focus({preventScroll:true});
 };
 for(const id of ['ie-color','ie-bg','ie-border']){const button=document.getElementById(id);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.onclick=()=>open(button)}
 document.addEventListener('ie-pick-page-color',e=>open(e.detail,true));
 const point=e=>{const r=area.getBoundingClientRect();hsv[1]=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));hsv[2]=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));update()};
 area.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();area.focus();area.setPointerCapture(e.pointerId);point(e)});
 area.addEventListener('pointermove',e=>{if(area.hasPointerCapture(e.pointerId))point(e)});
 area.addEventListener('pointerup',e=>{if(area.hasPointerCapture(e.pointerId)){area.releasePointerCapture(e.pointerId);end()}});
 area.addEventListener('pointercancel',end);
 area.addEventListener('keydown',e=>{const step=e.shiftKey?.1:.01;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();hsv[1]=Math.max(0,Math.min(1,hsv[1]+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0)));hsv[2]=Math.max(0,Math.min(1,hsv[2]+(e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0)));update()}});
 area.addEventListener('keyup',e=>{if(e.key.startsWith('Arrow'))end()});
 hue.oninput=()=>{hsv[0]=Number(hue.value);update()};opacity.oninput=()=>{alphaTouched=true;alpha=Number(opacity.value)/100;update()};
 hue.onchange=opacity.onchange=end;
 field.oninput=()=>{let value=field.value.trim();if(!value.startsWith('#'))value='#'+value;if(!/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)){field.setAttribute('aria-invalid','true');return}const color=rgba(value);hsv=rgbToHSV(color);alpha=color[3];alphaTouched=true;const selection=field.selectionStart;update();field.setSelectionRange(selection,selection)};
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
/* Visible, keyboard-accessible font menu; the hidden select is only the value model. */
export function mountFontPicker(select,button,{reset}={}){
 const panel=document.createElement('div');panel.id='ie-font-popover';panel.className='ie-popover';panel.dataset.builtAtEditorRuntime='';panel.hidden=true;panel.setAttribute('role','listbox');panel.setAttribute('aria-label','Fonts');document.body.append(panel);
 button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',panel.id);
 const close=(focus=false)=>{panel.hidden=true;button.setAttribute('aria-expanded','false');if(focus&&button.getClientRects().length)button.focus({preventScroll:true})};
 const open=()=>{
  if(select.disabled)return;const anchor=button.getBoundingClientRect();
  document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));
  panel.replaceChildren();
  for(const option of select.options){
   const item=document.createElement('button');item.type='button';item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));item.textContent=option.textContent;item.style.fontFamily=option.value||'system-ui,sans-serif';item.tabIndex=option.selected?0:-1;
   item.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));button.dataset.ieTooltip='Font: '+option.textContent;close(true)};
   panel.append(item);
  }
  panel.append(makeResetButton(()=>{close(true);reset?.('fontFamily')}));
  panel.hidden=false;button.setAttribute('aria-expanded','true');
  panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,anchor.left))+'px';
  const top=Math.max(8,Math.min(innerHeight-80,anchor.bottom+8));panel.style.top=top+'px';panel.style.height=Math.max(0,(innerHeight-top-8)*.93)+'px';
  const chosen=panel.querySelector('[aria-selected="true"]')||panel.firstElementChild;chosen?.focus({preventScroll:true});if(chosen)panel.scrollTop=Math.max(0,chosen.offsetTop-panel.clientHeight/2);
 };
 button.onclick=()=>panel.hidden?open():close(true);
 panel.addEventListener('keydown',e=>{
  const items=[...panel.children],index=items.indexOf(document.activeElement);let next=null;
  if(e.key==='ArrowDown')next=items[(index+1)%items.length];
  if(e.key==='ArrowUp')next=items[(index-1+items.length)%items.length];
  if(e.key==='Home')next=items[0];if(e.key==='End')next=items.at(-1);
  if(next){e.preventDefault();e.stopImmediatePropagation();next.focus();return}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true)}
  if(e.key==='Tab')close();
 });
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!button.contains(e.target))close()},true);
 document.addEventListener('ie-open-panel',e=>{if(e.detail!==panel)close()});
 window.addEventListener('resize',()=>close());window.addEventListener('scroll',e=>{if(!panel.contains(e.target))close()},true);
 return {close};
}

/* Type without rewriting incomplete input; drag from a separate handle in one gesture. */
export function mountNumber(input,min,max,sliderMax=max,{reset,closeOnRelease=false}={}){
 const control=input.closest('.ie-format'),handle=control.querySelector('.ie-number-handle');
 const panel=document.createElement('div');panel.className='ie-number-slider';panel.dataset.builtAtEditorRuntime='';panel.hidden=true;
 const range=document.createElement('input');range.type='range';range.min=min;range.max=sliderMax;range.step=1;range.setAttribute('aria-label',input.getAttribute('aria-label')+' slider');panel.append(range,makeResetButton(()=>{input.blur();reset?.(input.id==='ie-size'?'size':input.id==='ie-padding'?'padding':'borderRadius');applied=current();draw();close()}));document.body.append(panel);
 input.setAttribute('aria-valuemin',min);input.setAttribute('aria-valuemax',max);handle.setAttribute('aria-controls',panel.id=input.id+'-slider');
 let gesture=null,editing=false,startValue=Number(input.value)||min,applied=startValue;
 const clamp=value=>Math.max(min,Math.min(max,Math.round(value)));
 const current=()=>{const n=Number(input.value);return input.value.trim()!==''&&Number.isFinite(n)?clamp(n):startValue};
 const draw=()=>{const n=current();range.max=Math.max(sliderMax,n);range.value=n;range.style.setProperty('--ie-range-fill',((n-min)/(Number(range.max)-min)*100)+'%');input.setAttribute('aria-valuenow',n)};
 const emit=value=>{const next=clamp(value),changed=next!==applied;input.value=next;draw();if(changed){applied=next;input.dispatchEvent(new Event('ie-number-input',{bubbles:true}))}};
 const end=()=>input.dispatchEvent(new Event('change',{bubbles:true}));
 const close=()=>{if(gesture)return;panel.hidden=true};
 const show=()=>{
  if(input.disabled||editing)return;draw();
  if(panel.hidden){document.dispatchEvent(new CustomEvent('ie-number-preview',{detail:panel}));panel.hidden=false}
  const r=handle.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,r.left+r.width/2-panel.offsetWidth/2))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,r.bottom+3))+'px';
 };
 input.addEventListener('focus',()=>{editing=true;startValue=applied=current();close();input.select()});
 input.addEventListener('click',()=>input.select());
 input.addEventListener('blur',()=>{if(!editing)return;editing=false;const n=Number(input.value);emit(input.value.trim()===''||!Number.isFinite(n)?startValue:n);end()});
 input.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();emit(current()+(e.key==='ArrowUp'?1:-1)*(e.shiftKey?10:1));end()}
  if(e.key==='Enter'){e.preventDefault();e.stopPropagation();input.blur()}
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();input.value=startValue;input.blur();close()}
 });
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==0||input.disabled)return;e.preventDefault();e.stopPropagation();input.blur();editing=false;show();
  document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));
  applied=current();gesture={id:e.pointerId,x:e.clientX,value:current(),span:Number(range.max)-min,width:range.getBoundingClientRect().width};handle.setPointerCapture(e.pointerId);
 });
 handle.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId)emit(gesture.value+(e.clientX-gesture.x)/gesture.width*gesture.span)});
 const stop=()=>{if(!gesture)return;const id=gesture.id;gesture=null;if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);end();if(closeOnRelease)close()};
 handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);handle.addEventListener('lostpointercapture',stop);
 handle.addEventListener('click',e=>{if(e.detail===0){show();document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));range.focus()}});
 range.addEventListener('focus',()=>{applied=current()});range.addEventListener('pointerdown',()=>{applied=current();document.dispatchEvent(new CustomEvent('ie-open-panel',{detail:panel}));/* Slider remains open until dismissed. */});
 range.addEventListener('input',()=>emit(Number(range.value)));range.addEventListener('change',end);
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();handle.focus()}});
 document.addEventListener('pointerdown',e=>{if(!control.contains(e.target)&&!panel.contains(e.target))close()},true);
 document.addEventListener('ie-open-panel',e=>{if(e.detail!==panel)close()});document.addEventListener('ie-number-preview',e=>{if(e.detail!==panel)close()});
 window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
 return {close};
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
  for(const name of ['Padding','Radius','Border','Background','Text Color','Italic','Bold','Font','Size']){
   if(!crowded())break;const el=formats.find(el=>el.dataset.format===name);if(!el.hidden)tools.formatOverflow.append(el);
  }
  for(const el of actions){if(!crowded())break;tools.actionOverflow.append(el)}for(const el of formats)if(el.parentElement===tools.formatOverflow)tools.formatOverflow.append(el);if(crowded())bar.classList.add('ie-micro');
 };
 const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;layout()})};
 new ResizeObserver(schedule).observe(bar);
 new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='hidden'&&(r.target.matches('.ie-format')||r.target.id==='ie-select-similar')))schedule()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();return {layout:schedule};
}
export function contrastingInk(color){
 const [r,g,b,a]=rgba(color),background=[r,g,b].map(n=>n*a+255*(1-a));
 const linear=n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4};
 return .2126*linear(background[0])+.7152*linear(background[1])+.0722*linear(background[2])>.179?'#000000':'#ffffff';
}
/* Sibling-only movement preserves HTML parent-child validity. */
export function mountPageDrag({getActive,beforeDrag,change,onHover}){
 const edges=document.createElement('div');edges.id='ie-drag-edges';edges.dataset.builtAtEditorRuntime='';edges.hidden=true;
 for(const side of ['top','right','bottom','left']){const edge=document.createElement('div');edge.className='ie-drag-edge ie-drag-'+side;edges.append(edge)}
 const line=document.createElement('div');line.id='ie-insertion';line.dataset.builtAtEditorRuntime='';line.hidden=true;document.body.append(edges,line);
 let state=null,frame=null,hovered=null;
 const update=()=>{
  const el=state?.el||hovered||getActive();if(!el?.isConnected||!el.getClientRects().length){edges.hidden=true;return}
  const r=el.getBoundingClientRect();edges.hidden=false;
  Object.assign(edges.style,{left:r.left-3+'px',top:r.top-3+'px',width:r.width+6+'px',height:r.height+6+'px'});
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
 // Borders are the hit area; the element interior remains available for text editing.
 document.addEventListener('pointermove',e=>{
  if(state||e.target.closest?.('[data-built-at-editor-runtime]'))return;
  const candidates=[];let node=e.target.closest?.('[data-edit]');
  while(node){if(authorNode(node)&&node.parentElement){const r=node.getBoundingClientRect();if(e.clientX>=r.left-4&&e.clientX<=r.right+4&&e.clientY>=r.top-4&&e.clientY<=r.bottom+4&&Math.min(Math.abs(e.clientX-r.left),Math.abs(e.clientX-r.right),Math.abs(e.clientY-r.top),Math.abs(e.clientY-r.bottom))<=5)candidates.push(node)}node=node.parentElement?.closest('[data-edit]')}
  hovered=onHover?.()===false?null:candidates[0]||null;update();
 },true);
 edges.addEventListener('pointerleave',e=>{if(!state&&!edges.contains(e.relatedTarget)){hovered=null;update()}});
 edges.onpointerdown=e=>{
  if(e.button!==0)return;const el=hovered||getActive();if(!el)return;
  e.preventDefault();e.stopPropagation();beforeDrag(el);hovered=null;
  state={el,id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};
  edges.classList.add('ie-grabbing');edges.setPointerCapture(e.pointerId);frame=requestAnimationFrame(scroll);
 };
 edges.onpointermove=e=>{if(!state)return;state.x=e.clientX;state.y=e.clientY;if(Math.hypot(state.x-state.startX,state.y-state.startY)>5){state.moved=true;aim()}};
 const end=e=>{
  if(!state)return;const old=state;state=null;cancelAnimationFrame(frame);line.hidden=true;edges.classList.remove('ie-grabbing');
  if(edges.hasPointerCapture(old.id))edges.releasePointerCapture(old.id);
  if(!['pointercancel','lostpointercapture'].includes(e.type)&&old.moved&&canArrange(old.el,old.target))change(()=>old.before?old.target.before(old.el):old.target.after(old.el),old.el);
  update();
 };
 edges.onpointerup=end;edges.onpointercancel=end;edges.onlostpointercapture=end;
 window.addEventListener('scroll',update,true);window.addEventListener('resize',update);
 return {update,close:()=>{hovered=null;edges.hidden=true;line.hidden=true}};
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
  const label=document.createElement('label'),swatch=document.createElement('button'),text=document.createElement('span'),input=document.createElement('input');
  text.textContent=name.slice(2).replace(/[-_]/g,' ');input.value=hex(value);input.setAttribute('aria-label',text.textContent+' color');input.spellcheck=false;swatch.style.background=value;swatch.type='button';swatch.className='ie-page-color-swatch';swatch.value=hex(value);swatch.setAttribute('aria-label','Choose '+text.textContent+' color');swatch.setAttribute('aria-haspopup','dialog');swatch.setAttribute('aria-expanded','false');swatch.onclick=e=>{e.preventDefault();document.dispatchEvent(new CustomEvent('ie-pick-page-color',{detail:swatch}))};
  label.append(swatch,text,input);box.append(label);let last=input.value;
  const apply=()=>{let next=input.value.trim();if(!next.startsWith('#'))next='#'+next;if(!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(next)||hex(next)===hex(last))return;change(()=>document.documentElement.style.setProperty(name,next),name);last=next;swatch.value=hex(next);swatch.style.background=next};
  swatch.oninput=()=>{input.value=swatch.value;apply()};swatch.onchange=()=>change(null,name,true);
  input.onchange=()=>{apply();change(null,name,true)};input.oninput=()=>{if(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(input.value))apply()};
 }
 const note=document.createElement('p');note.textContent=box.children.length>1?'Shared CSS colors. Linked shades and transparency follow automatically; element formatting stays local.':'Define shared colors as CSS variables on :root to edit them here.';box.append(note);
}
