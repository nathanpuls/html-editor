/* Common design transformations. */
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
export const safeColor=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
export const rgbToHex=value=>{
  const v=String(value||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  const m=v.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return m?'#'+[m[1],m[2],m[3]].map(n=>Math.min(255,Number(n)).toString(16).padStart(2,'0')).join(''):null;
 };

export const hexColor=value=>{
  const v=String(value).trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  if(/^#[0-9a-f]{3}$/i.test(v))return '#'+[...v.slice(1)].map(c=>c+c).join('').toLowerCase();
  return rgbToHex(v);
 };

export const varLabel=name=>name.slice(2).split(/[-_]+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');

export function drawDesign(ctx){
 const {screen,add,stylePanel,model,liveSnapshots,styleSettings,variableSettings,buttonSettings,buttonAppearance,expandedButtonControls,checkpoint,styleFonts,originalVariables,originalAppearance,refreshButtonSample,applyStyle,renderStyle,saveDraft,hideEditor,icons,clamp,hexColor,varLabel}=ctx;
  stylePanel.replaceChildren();
  const controls=[
   ['Page background','background','color'],['Text color','text','color'],['Accent color','accent','color'],
   ['Font family','font','font'],['Heading 1 size (px)','h1','number'],['Heading 2 size (px)','h2','number'],
   ['Heading 3 size (px)','h3','number'],['Paragraph size (px)','p','number'],
   ['Corner roundness (px)','radius','radius'],
   ['All buttons background','buttonBackground','color'],['All buttons text','buttonText','color']
  ].filter(([,key])=>!Object.keys(originalVariables).length||!['background','text','accent','buttonBackground','buttonText','radius'].includes(key));
  const update=()=>{applyStyle();saveDraft()};
  for(const [title,key,kind] of controls){
   const row=document.createElement('div');row.className='ue-setting';
   const label=document.createElement('label');label.textContent=title;row.append(label);
   if(kind==='color'){
    const pair=document.createElement('div');pair.className='ue-color-row';
    const swatch=document.createElement('input');swatch.type='color';swatch.value=styleSettings[key];
    const text=document.createElement('input');text.type='text';text.value=styleSettings[key];text.setAttribute('aria-label',title+' hex');
    swatch.oninput=()=>{checkpoint();styleSettings[key]=swatch.value;text.value=swatch.value;update()};
    text.onchange=()=>{const v=text.value.trim();if(/^#[0-9a-f]{6}$/i.test(v)){checkpoint();styleSettings[key]=v;swatch.value=v;update()}else text.value=styleSettings[key]};
    pair.append(swatch,text);row.append(pair);
   }else if(kind==='font'){
    const select=document.createElement('select');for(const font of Object.keys(styleFonts)){const option=document.createElement('option');option.value=font;option.textContent=font;select.append(option)}
    select.value=styleSettings[key];select.onchange=()=>{checkpoint();styleSettings[key]=select.value;update()};row.append(select);
   }else{
    const input=document.createElement('input');input.type='number';input.min=kind==='radius'?'0':'8';input.max=kind==='radius'?'64':'120';input.step='1';input.value=styleSettings[key];
    input.oninput=()=>{if(input.value==='')return;checkpoint();styleSettings[key]=clamp(input.value,kind==='radius'?0:8,kind==='radius'?64:120);update()};row.append(input);
   }
   const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+title;reset.setAttribute('aria-label','Reset '+title);
   reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=String(styleSettings[key])===String(originalAppearance[key]);
   reset.onclick=event=>{event.preventDefault();checkpoint();styleSettings[key]=originalAppearance[key];applyStyle();saveDraft();renderStyle()};
   const refreshReset=()=>{reset.disabled=String(styleSettings[key])===String(originalAppearance[key])};
   row.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',refreshReset));
   row.append(reset);stylePanel.append(row);
  }
  const custom=Object.entries(originalVariables);
  if(custom.length){
   const heading=document.createElement('div');heading.className='ue-custom-heading';heading.textContent='Website colors & sizes';stylePanel.append(heading);
   for(const [name,config] of custom){
    const row=document.createElement('div');row.className='ue-setting';
    const label=document.createElement('label');label.textContent=varLabel(name);row.append(label);
    const value=variableSettings[name];
    let input;
    if(config.kind==='color'){
     const pair=document.createElement('div');pair.className='ue-color-row';
     const swatch=document.createElement('input');swatch.type='color';swatch.value=hexColor(value)||'#000000';
     input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',varLabel(name)+' color');
     swatch.oninput=()=>{checkpoint();variableSettings[name]=swatch.value;input.value=swatch.value;applyStyle();saveDraft();reset.disabled=false};
     input.onchange=()=>{const color=hexColor(input.value);if(!color){input.value=variableSettings[name];return}checkpoint();variableSettings[name]=input.value.trim();swatch.value=color;applyStyle();saveDraft();reset.disabled=variableSettings[name]===config.value};
     pair.append(swatch,input);row.append(pair);
    }else{
     input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',varLabel(name)+' size');
     input.onchange=()=>{const val=input.value.trim();if(!/^-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(val)){input.value=variableSettings[name];return}checkpoint();variableSettings[name]=val;applyStyle();saveDraft();reset.disabled=val===config.value};
     row.append(input);
    }
    const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+varLabel(name);reset.setAttribute('aria-label',reset.title);reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=value===config.value;
    reset.onclick=()=>{checkpoint();variableSettings[name]=config.value;applyStyle();saveDraft();renderStyle()};
    row.append(reset);stylePanel.append(row);
   }
  }
  const buttons=Object.entries(buttonAppearance);
  if(buttons.length){
   const heading=document.createElement('div');heading.className='ue-custom-heading';heading.textContent='Individual buttons';stylePanel.append(heading);
   for(const [index,info] of buttons){
    const item=model.find(x=>!x.added&&x.index===Number(index));
    if(!item||item.deleted)continue;
    const block=document.createElement('details');block.className='ue-button-block';block.dataset.ueButtonBlock=index;
    block.open=expandedButtonControls.has(index);
    block.addEventListener('toggle',()=>{if(block.open)expandedButtonControls.add(index);else expandedButtonControls.delete(index)});
    const summary=document.createElement('summary');summary.className='ue-button-summary';
    const name=document.createElement('div');name.className='ue-button-title';name.textContent=info.label;summary.append(name);
    // Preview only: read the source element's appearance; never clone its markup
    // or insert an interactive duplicate into the website.
    const preview=document.createElement('div');preview.className='ue-button-preview';
    preview.dataset.ueButtonPreview=index;
    preview.setAttribute('aria-label','Preview of '+info.label);
    summary.append(preview);
    const hint=document.createElement('div');hint.className='ue-button-hint';hint.textContent='Click to edit colors';
    summary.append(hint);block.append(summary);
    const jump=document.createElement('span');jump.className='ue-button-jump';jump.setAttribute('role','button');jump.setAttribute('tabindex','0');
    jump.title='Find '+info.label+' on the website';jump.setAttribute('aria-label',jump.title);
    jump.innerHTML='<i data-lucide="arrow-up-right"></i>';
    jump.onclick=event=>{
     event?.preventDefault();event?.stopPropagation();
     const node=liveSnapshots[Number(index)]?.node;
     if(!node?.isConnected)return;
     if(screen.classList.contains('ue-fullscreen'))hideEditor();
     const top=Math.max(0,window.scrollY+node.getBoundingClientRect().top-32);
     window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    };
    // A secondary action within the always-visible summary.
    jump.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();jump.click()}});
    summary.append(jump);
    const updatePreview=()=>refreshButtonSample(preview,index);
    updatePreview();
    for(const [key,label] of [['background','Background'],['color','Text color']]){
     const row=document.createElement('div');row.className='ue-setting';
     const lbl=document.createElement('label');lbl.textContent=label;row.append(lbl);
     const pair=document.createElement('div');pair.className='ue-color-row';
     const value=buttonSettings[index]?.[key]||info[key];
     const swatch=document.createElement('input');swatch.type='color';swatch.value=hexColor(value)||'#000000';
     const input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',info.label+' '+label);
     const setValue=v=>{checkpoint();buttonSettings[index]={...buttonSettings[index],[key]:v};applyStyle();updatePreview();saveDraft();reset.disabled=v===info[key]};
     swatch.oninput=()=>{input.value=swatch.value;setValue(swatch.value)};
     input.onchange=()=>{const color=hexColor(input.value);if(!color){input.value=buttonSettings[index]?.[key]||info[key];return}swatch.value=color;setValue(input.value.trim())};
     pair.append(swatch,input);row.append(pair);
     const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+info.label+' '+label;reset.setAttribute('aria-label',reset.title);reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=value===info[key];
     reset.onclick=()=>{checkpoint();if(buttonSettings[index]){delete buttonSettings[index][key];if(!Object.keys(buttonSettings[index]).length)delete buttonSettings[index]}applyStyle();saveDraft();renderStyle()};
     row.append(reset);block.append(row);
    }
    stylePanel.append(block);
   }
  }
  icons();
 }

export function buildStyleSheet(ctx){
 const {selector,pencil,screen,variableSettings,buttonSettings,buttonAppearance,styleDefaults,styleFonts,originalVariables,originalVariableOverrides,originalAppearance,originalOverrides,styleSheetText,clamp,safeColor,hexColor,a}=ctx;
  // Store exact settings, but override only properties changed from the
  // original page, preserving responsive typography and existing CSS.
  const parts=['/* editor-style:'+encodeURIComponent(JSON.stringify(a))+' */'];
  const changed=k=>originalOverrides.has(k)||String(a[k])!==String(originalAppearance[k]);
  const colors=['background','text','accent','buttonBackground','buttonText'];
  const vars=colors.filter(changed).map(k=>'--ue-'+k+':'+safeColor(a[k],styleDefaults[k])+';');
  const customVars=Object.keys(originalVariables).filter(name=>originalVariableOverrides.has(name)||variableSettings[name]!==originalVariables[name].value).map(name=>name+':'+variableSettings[name]+';');
  if(vars.length||customVars.length)parts.push(':root{'+[...vars,...customVars].join('')+'}');
  const rule=(selector,declaration)=>parts.push(selector+'{'+declaration+'}');
  if(changed('background'))rule('html body','background-color:var(--ue-background)!important');
  if(changed('text'))rule('html body,html body :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,small,span):not(#ue-screen *)','color:var(--ue-text)!important');
  if(changed('accent'))rule('html body a:not(.button):not(.btn):not([role=button]):not(#ue-screen a)','color:var(--ue-accent)!important');
  if(changed('font'))rule('html body','font-family:'+(styleFonts[a.font]||styleFonts['system-ui'])+'!important');
  for(const tag of ['h1','h2','h3','p'])if(changed(tag))rule('html body '+tag+':not(#ue-screen '+tag+')','font-size:'+clamp(a[tag],8,120)+'px!important');
  if(changed('radius'))rule('html body :is(button,.button,.btn,[role=button],.card,.hero-visual,.photo,img,input,textarea):not(#ue-screen *):not(#ue-pencil),html body nav[data-edit=links] a','border-radius:'+clamp(a.radius,0,64)+'px!important');
  const buttonSelectors='html body :is(button,.button,.btn,[role=button]):not(#ue-screen *):not(#ue-pencil),html body nav[data-edit=links] a';
  if(changed('buttonBackground'))rule(buttonSelectors,'background-color:var(--ue-buttonBackground)!important');
  if(changed('buttonText'))rule(buttonSelectors,'color:var(--ue-buttonText)!important');
  for(const [index,settings] of Object.entries(buttonSettings)){
   const original=buttonAppearance[index];
   if(!original)continue;
   for(const key of ['background','color']){
    const value=settings[key];
    if(value&&hexColor(value)&&value!==original[key])rule('html body '+original.selector,key==='background'?'background-color:'+value+'!important':'color:'+value+'!important');
   }
  }
  return parts.join('\n');
 };
