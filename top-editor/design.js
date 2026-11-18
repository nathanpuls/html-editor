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
