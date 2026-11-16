/* HTML Editor v1 — standalone, dependency-free.
   Source: extracted from Dino → Shared!B22; this copy does not modify live.ends.at.
   Include with <script src="editor.js" defer></script> in any editable HTML page. */
(()=>{if(window.__universalEditReady)return;window.__universalEditReady=true;
const editorStyle=document.createElement('style');
editorStyle.id='ue-style';
editorStyle.textContent="#ue-pencil{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:2147483000;display:grid;place-items:center;width:44px;height:44px;border:1px solid #ddd;border-radius:50%;background:white;color:#111;box-shadow:0 3px 16px #0002;cursor:pointer}\n#ue-pencil svg,#ue-screen svg{width:18px;height:18px}\n#ue-screen{position:fixed;inset:0;z-index:2147483600;overflow:auto;height:100dvh;background:white;color:#171717;padding:calc(22px + env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));font:15px/1.5 Manrope,system-ui,sans-serif}\n#ue-screen[hidden],#ue-pencil[hidden]{display:none!important}\n#ue-screen *{box-sizing:border-box}\n#ue-wrap{max-width:560px;margin:auto}\n#ue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:24px}\n#ue-head strong{font-size:21px}\n#ue-screen button{font:inherit;cursor:pointer}\n#ue-head button,#ue-add{border:1px solid #ddd;background:#fff;color:#171717;border-radius:9px;padding:10px 13px}\n#ue-head #ue-copy{background:#171717;color:#fff;border-color:#171717}\n#ue-fields{display:grid;gap:18px}\n.ue-item{display:grid;gap:9px;padding-bottom:18px}\n.ue-item label{display:grid;gap:5px;font:700 12px/1.5 Manrope,system-ui,sans-serif;color:#666}\n.ue-item input,.ue-item textarea{width:100%;border:1px solid #ddd;border-radius:8px;padding:11px;background:#fff;color:#171717;font:500 16px/1.5 Manrope,system-ui,sans-serif}\n.ue-item textarea{min-height:110px;max-height:60dvh;resize:vertical;overflow-y:hidden}\n.ue-image-preview{display:block;max-width:100%;max-height:190px;object-fit:contain;object-position:left center;border-radius:8px;background:#f4f4f4}\n.ue-image-preview:not([src]){display:none}\n.ue-item textarea.ue-article{min-height:200px;line-height:1.7}\n#ue-screen.ue-fullscreen .ue-item textarea{max-height:80dvh}\n.ue-controls{display:flex;justify-content:flex-end;gap:5px}\n.ue-controls button{width:38px;height:36px;border:0;border-radius:7px;background:#f3f3f3;display:grid;place-items:center}\n.ue-controls button:disabled{opacity:.3}\n#ue-add{display:flex;align-items:center;gap:8px;margin-top:20px}\n#ue-add[hidden]{display:none!important}\n#ue-message{font-size:13px;color:#a22}\n#ue-screen{box-sizing:border-box;left:auto;right:0;top:0;bottom:0;width:min(430px,100%);height:100dvh;max-height:100dvh;border-left:1px solid #ddd;box-shadow:-12px 0 45px #0002;overflow:hidden;padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}\n#ue-wrap{display:flex;flex-direction:column;height:100%;min-height:0}\n#ue-head{flex:none;margin-bottom:16px;position:relative;justify-content:center;min-height:32px}\n#ue-fullscreen{position:absolute;right:0;top:0;display:grid;place-items:center;width:32px;height:32px;border:0!important;border-radius:7px;padding:0!important;background:transparent!important;color:#555!important}\n#ue-fullscreen:hover{background:#f2f2f2!important}\n#ue-body{scrollbar-width:none}\n#ue-body::-webkit-scrollbar{display:none}\n#ue-screen.ue-fullscreen{inset:0;width:100%;height:100dvh;max-height:100dvh;border:0;box-shadow:none;border-radius:0;padding:calc(22px + env(safe-area-inset-top)) 28px calc(16px + env(safe-area-inset-bottom))}\n#ue-screen.ue-fullscreen #ue-wrap{width:100%;max-width:880px;margin:0 auto}\n#ue-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 3px 24px}\n#ue-actions{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px 2px;background:white}\n#ue-actions button{min-width:104px;padding:11px 18px;border:1px solid #ddd;border-radius:9px;background:#fff;color:#171717}\n#ue-actions #ue-copy{background:#171717;color:white;border-color:#171717}\n@media(max-width:640px){#ue-screen:not(.ue-fullscreen){top:auto;bottom:0;left:0;right:0;width:100%;height:min(62dvh,620px);border-left:0;border-top:1px solid #ddd;border-radius:16px 16px 0 0;box-shadow:0 -12px 40px #0002}#ue-screen.ue-fullscreen{padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}}\n";
editorStyle.textContent+="\n#ue-tabs{display:flex;gap:4px;flex:none;margin:0 0 15px;border-bottom:1px solid #e8e8e8}\n#ue-tabs button{flex:1;border:0;background:transparent;color:#777;padding:10px 4px;font:600 13px Manrope,system-ui,sans-serif;border-bottom:2px solid transparent;cursor:pointer}\n#ue-tabs button[aria-selected=\"true\"]{color:#111;border-bottom-color:#111}\n#ue-fields[hidden],#ue-style-panel[hidden],#ue-sections[hidden]{display:none!important}\n#ue-style-panel,#ue-sections{display:grid;gap:13px}\n.ue-section-row{display:flex;gap:8px;align-items:center}.ue-section-row .ue-section-link{flex:1;min-width:0}.ue-section-row .ue-controls{flex:none}\n.ue-setting{display:grid;gap:7px;padding-bottom:12px;border-bottom:1px solid #eee}\n.ue-setting label{font:700 12px Manrope,system-ui,sans-serif;color:#555}\n.ue-setting input,.ue-setting select{min-height:40px;width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;background:white;color:#111;font:14px Manrope,system-ui,sans-serif}\n.ue-color-row{display:grid;grid-template-columns:45px minmax(0,1fr);gap:9px;align-items:center}\n.ue-color-row input[type=color]{padding:3px;width:45px;height:40px;cursor:pointer}\n.ue-section-link{display:block;width:100%;text-align:left;border:1px solid #ddd!important;border-radius:8px!important;background:#fff!important;padding:11px 12px!important;font:14px Manrope,system-ui,sans-serif}\n";
document.head.append(editorStyle);
function init(){
 const selector='[data-edit]';
 function editable(){return Array.from(document.querySelectorAll(selector)).filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!el.querySelector(selector));}
 if(!editable().length)return;
 const pencil=document.createElement('button');pencil.id='ue-pencil';pencil.type='button';pencil.title='Edit';pencil.setAttribute('aria-label','Edit page');pencil.innerHTML='<i data-lucide="pencil"></i>';
 const screen=document.createElement('section');screen.id='ue-screen';screen.hidden=true;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Edit page');
 screen.innerHTML='<div id="ue-wrap"><div id="ue-head"><strong>Edit page</strong><button id="ue-fullscreen" type="button" aria-label="Expand editor" title="Fullscreen"><i data-lucide="maximize"></i></button></div><div id="ue-tabs" role="tablist" aria-label="Editor tabs"><button type="button" data-tab="content" aria-selected="true">Content</button><button type="button" data-tab="style" aria-selected="false">Style</button><button type="button" data-tab="sections" aria-selected="false">Sections</button></div><div id="ue-body"><div id="ue-fields"></div><div id="ue-style-panel" hidden></div><div id="ue-sections" hidden></div><button id="ue-add" type="button" hidden><i data-lucide="plus"></i> Add link</button><p id="ue-message" role="status"></p></div><div id="ue-actions"><button id="ue-cancel" type="button">Cancel</button><button id="ue-copy" type="button">Copy</button></div></div>';
 document.body.append(pencil,screen);
 const fields=screen.querySelector('#ue-fields'),add=screen.querySelector('#ue-add'),message=screen.querySelector('#ue-message');
 const fullscreenButton=screen.querySelector('#ue-fullscreen');
 const scrollBody=screen.querySelector('#ue-body');
 const stylePanel=screen.querySelector('#ue-style-panel'),sectionsPanel=screen.querySelector('#ue-sections');
 let activeTab='content';
 function setTab(tab){
  activeTab=tab;
  screen.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  fields.hidden=tab!=='content';stylePanel.hidden=tab!=='style';sectionsPanel.hidden=tab!=='sections';
  add.hidden=tab!=='content'||!model.some(item=>item.link&&item.group!==null);
  if(tab==='sections')renderSections();
 }
 screen.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
 screen.addEventListener('wheel',event=>{
  if(scrollBody.contains(event.target)||event.ctrlKey)return;
  if(scrollBody.scrollHeight<=scrollBody.clientHeight)return;
  event.preventDefault();
  const factor=event.deltaMode===1?16:event.deltaMode===2?scrollBody.clientHeight:1;
  scrollBody.scrollBy({top:event.deltaY*factor,left:event.deltaX*factor,behavior:'instant'});
 },{passive:false});
 function setFullscreen(on){
  screen.classList.toggle('ue-fullscreen',on);
  fullscreenButton.setAttribute('aria-label',on?'Exit fullscreen':'Expand editor');
  fullscreenButton.title=on?'Exit fullscreen':'Fullscreen';
  fullscreenButton.innerHTML='<i data-lucide="'+(on?'minimize':'maximize')+'"></i>';
  icons();
 }
 fullscreenButton.onclick=()=>{setFullscreen(!screen.classList.contains('ue-fullscreen'));requestAnimationFrame(()=>fields.querySelectorAll('textarea').forEach(fitTextarea))};
 let model=[],baseline='',liveNodes=[],liveSnapshots=[],liveRoots=[],rootSnapshots=[];
 let draftActive=false,initialModel='',styleSettings={},initialStyle='',sectionOrder=[],initialSectionOrder=[],sectionNodes=[];
 const styleDefaults={background:'#ffffff',text:'#171717',accent:'#2563eb',font:'system-ui',h1:40,h2:30,h3:24,p:16,radius:8,buttonBackground:'#171717',buttonText:'#ffffff'};
 const styleFonts={'system-ui':'system-ui, sans-serif','Arial':'Arial, sans-serif','Georgia':'Georgia, serif','Times New Roman':'"Times New Roman", serif','Verdana':'Verdana, sans-serif','Trebuchet MS':'"Trebuchet MS", sans-serif','Courier New':'"Courier New", monospace','Manrope':'Manrope, system-ui, sans-serif','Inter':'Inter, system-ui, sans-serif'};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
 const safeColor=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
 const rgbToHex=value=>{
  const v=String(value||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  const m=v.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return m?'#'+[m[1],m[2],m[3]].map(n=>Math.min(255,Number(n)).toString(16).padStart(2,'0')).join(''):null;
 };
 const pageColor=(el,prop,fallback)=>rgbToHex(el?getComputedStyle(el)[prop]:'')||fallback;
 const pageButton=()=>document.querySelector('main .button,main .btn,main button,main [role="button"],main nav[data-edit="links"] a')||document.querySelector('body .button,body .btn');
 function readStyle(){
  const raw=document.getElementById('editor-page-style')?.textContent||'';
  const match=raw.match(/\/\* editor-style:(.*?) \*\//);
  if(match){try{return {...styleDefaults,...JSON.parse(decodeURIComponent(match[1]))}}catch{}}
  const body=getComputedStyle(document.body),button=pageButton();
  const heading=tag=>document.querySelector('main '+tag+',body '+tag);
  const size=tag=>{const el=heading(tag);return el?Math.round(parseFloat(getComputedStyle(el).fontSize))||styleDefaults[tag]:styleDefaults[tag]};
  const cards=document.querySelector('.card,.hero-visual,.photo');
  const initialFont=body.fontFamily.toLowerCase();
  const font=Object.keys(styleFonts).find(k=>initialFont.includes(k.toLowerCase()))||'system-ui';
  return {...styleDefaults,
   background:pageColor(document.body,'backgroundColor',styleDefaults.background),
   text:pageColor(document.body,'color',styleDefaults.text),
   accent:pageColor(document.querySelector('.site-nav a,a:not(.button):not(.btn)'), 'color',styleDefaults.accent),
   buttonBackground:pageColor(button,'backgroundColor',styleDefaults.buttonBackground),
   buttonText:pageColor(button,'color',styleDefaults.buttonText),
   font,h1:size('h1'),h2:size('h2'),h3:size('h3'),p:size('p'),
   radius:Math.round(parseFloat(cards?getComputedStyle(cards).borderTopLeftRadius:(button?getComputedStyle(button).borderTopLeftRadius:'8px')))||0
  };
 }
 const originalAppearance=readStyle();
 const styleSheetText=a=>{
  // Store exact settings, but override only properties changed from the
  // original page, preserving responsive typography and existing CSS.
  const parts=['/* editor-style:'+encodeURIComponent(JSON.stringify(a))+' */'];
  const changed=k=>String(a[k])!==String(originalAppearance[k]);
  const colors=['background','text','accent','buttonBackground','buttonText'];
  const vars=colors.filter(changed).map(k=>'--ue-'+k+':'+safeColor(a[k],styleDefaults[k])+';');
  if(vars.length)parts.push(':root{'+vars.join('')+'}');
  const rule=(selector,declaration)=>parts.push(selector+'{'+declaration+'}');
  if(changed('background'))rule('html body','background-color:var(--ue-background)!important');
  if(changed('text'))rule('html body,html body :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,small,span):not(#ue-screen *)','color:var(--ue-text)!important');
  if(changed('accent'))rule('html body a:not(.button):not(.btn):not([role=button]):not(#ue-screen a)','color:var(--ue-accent)!important');
  if(changed('font'))rule('html body','font-family:'+(styleFonts[a.font]||styleFonts['system-ui'])+'!important');
  for(const tag of ['h1','h2','h3','p'])if(changed(tag))rule('html body '+tag+':not(#ue-screen '+tag+')','font-size:'+clamp(a[tag],8,120)+'px!important');
  if(changed('radius'))rule('html body :is(button,.button,.btn,[role=button],.card,.hero-visual,.photo,img,input,textarea):not(#ue-screen *),html body nav[data-edit=links] a','border-radius:'+clamp(a.radius,0,64)+'px!important');
  const buttonSelectors='html body :is(button,.button,.btn,[role=button]):not(#ue-screen *):not(#ue-pencil),html body nav[data-edit=links] a';
  if(changed('buttonBackground'))rule(buttonSelectors,'background-color:var(--ue-buttonBackground)!important');
  if(changed('buttonText'))rule(buttonSelectors,'color:var(--ue-buttonText)!important');
  return parts.join('\n');
 };
 const applyStyle=()=>{
  let el=document.getElementById('editor-page-style');
  if(!el){el=document.createElement('style');el.id='editor-page-style';document.head.append(el)}
  el.textContent=styleSheetText(styleSettings);
 };
 const restoreStyle=()=>{
  const el=document.getElementById('editor-page-style');
  if(originalPageStyle===null)el?.remove();
  else{if(el)el.textContent=originalPageStyle;else{const node=document.createElement('style');node.id='editor-page-style';node.textContent=originalPageStyle;document.head.append(node)}}
 };
 const originalPageStyle=document.getElementById('editor-page-style')?.textContent??null;
 function renderStyle(){
  stylePanel.replaceChildren();
  const controls=[
   ['Page background','background','color'],['Text color','text','color'],['Accent color','accent','color'],
   ['Font family','font','font'],['Heading 1 size (px)','h1','number'],['Heading 2 size (px)','h2','number'],
   ['Heading 3 size (px)','h3','number'],['Paragraph size (px)','p','number'],
   ['Corner roundness (px)','radius','radius'],
   ['Button background','buttonBackground','color'],['Button text color','buttonText','color']
  ];
  const update=()=>{applyStyle();saveDraft()};
  for(const [title,key,kind] of controls){
   const row=document.createElement('div');row.className='ue-setting';
   const label=document.createElement('label');label.textContent=title;row.append(label);
   if(kind==='color'){
    const pair=document.createElement('div');pair.className='ue-color-row';
    const swatch=document.createElement('input');swatch.type='color';swatch.value=styleSettings[key];
    const text=document.createElement('input');text.type='text';text.value=styleSettings[key];text.setAttribute('aria-label',title+' hex');
    swatch.oninput=()=>{styleSettings[key]=swatch.value;text.value=swatch.value;update()};
    text.onchange=()=>{const v=text.value.trim();if(/^#[0-9a-f]{6}$/i.test(v)){styleSettings[key]=v;swatch.value=v;update()}else text.value=styleSettings[key]};
    pair.append(swatch,text);row.append(pair);
   }else if(kind==='font'){
    const select=document.createElement('select');for(const font of Object.keys(styleFonts)){const option=document.createElement('option');option.value=font;option.textContent=font;select.append(option)}
    select.value=styleSettings[key];select.onchange=()=>{styleSettings[key]=select.value;update()};row.append(select);
   }else{
    const input=document.createElement('input');input.type='number';input.min=kind==='radius'?'0':'8';input.max=kind==='radius'?'64':'120';input.step='1';input.value=styleSettings[key];
    input.oninput=()=>{if(input.value==='')return;styleSettings[key]=clamp(input.value,kind==='radius'?0:8,kind==='radius'?64:120);update()};row.append(input);
   }
   stylePanel.append(row);
  }
 }
 function findSections(root=document){
  return Array.from(root.querySelectorAll('[data-section]')).filter(el=>!el.parentElement?.closest('[data-section]')&&!el.closest('#ue-screen'));
 }
 function reorderSections(order=sectionOrder){
  if(!sectionNodes.length)return;
  const byId=new Map(sectionNodes.map(n=>[n.getAttribute('data-section'),n]));
  for(const id of order){
   const node=byId.get(id);if(!node||!node.parentElement)continue;
   // Same-parent sections can be moved safely without changing their internals.
   const siblings=sectionNodes.filter(n=>n.parentElement===node.parentElement);
   const parent=node.parentElement;
   const ordered=order.map(k=>byId.get(k)).filter(n=>n&&n.parentElement===parent&&siblings.includes(n));
   const after=siblings[siblings.length-1]?.nextSibling||null;
   for(const item of ordered)parent.insertBefore(item,after);
  }
 }
 function renderSections(){
  sectionsPanel.replaceChildren();
  if(!sectionNodes.length){
   const hint=document.createElement('p');hint.textContent='No sections found. Add data-section="unique-id" to the page sections you want to reorder.';sectionsPanel.append(hint);return;
  }
  for(const [i,id] of sectionOrder.entries()){
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id);if(!node)continue;
   const row=document.createElement('div');row.className='ue-section-row';
   const jump=document.createElement('button');jump.type='button';jump.className='ue-section-link';
   jump.textContent=node.getAttribute('aria-label')||node.querySelector('h1,h2,h3')?.textContent?.trim()||id;
   jump.onclick=()=>{hideEditor();node.scrollIntoView({behavior:'smooth',block:'start'})};
   const controls=document.createElement('div');controls.className='ue-controls';
   for(const [dir,name] of [[-1,'arrow-up'],[1,'arrow-down']]){
    const button=document.createElement('button');button.type='button';button.title=dir<0?'Move up':'Move down';button.setAttribute('aria-label',button.title+' '+jump.textContent);
    button.disabled=(i+dir<0||i+dir>=sectionOrder.length||sectionNodes.find(n=>n.getAttribute('data-section')===sectionOrder[i+dir])?.parentElement!==node.parentElement);
    button.innerHTML='<i data-lucide="'+name+'"></i>';
    button.onclick=()=>{const next=i+dir;[sectionOrder[i],sectionOrder[next]]=[sectionOrder[next],sectionOrder[i]];reorderSections();saveDraft();renderSections()};
    controls.append(button);
   }
   row.append(jump,controls);sectionsPanel.append(row);
  }
  icons();
 }
 // Drafts are scoped to each URL and to the exact underlying HTML/CSS version.
 const draftKey='html-editor:draft:v1:'+location.href.split('#')[0];
 const pageSignature=()=>{
  const content=document.querySelectorAll('[data-edit]');
  const page=[document.title,...Array.from(document.querySelectorAll('style:not(#ue-style)')).map(el=>el.textContent),...Array.from(content).map(el=>el.outerHTML)].join('\u001f');
  let hash=2166136261;
  for(let i=0;i<page.length;i++)hash=Math.imul(hash^page.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
 };
 const originalSignature=pageSignature();
 const readDraft=()=>{try{const x=JSON.parse(localStorage.getItem(draftKey)||'null');return x?.signature===originalSignature&&Array.isArray(x.model)?x:null}catch{return null}};
 const clearDraft=()=>{try{localStorage.removeItem(draftKey)}catch{}};
 const saveDraft=()=>{
  try{
   if(hasChanges())localStorage.setItem(draftKey,JSON.stringify({signature:originalSignature,model,styleSettings,sectionOrder}));
   else clearDraft();
  }catch{} // file:// and privacy settings may block storage
 };
 const hasChanges=()=>draftActive&&(JSON.stringify(model)!==initialModel||JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder));
 function hideEditor(){if(!draftActive||screen.hidden)return;screen.hidden=true;pencil.hidden=false;pencil.title=hasChanges()?'Resume editing (unsaved changes)':'Resume editing'}

 const setText=(el,value)=>{el.textContent=value};
 const articleText=el=>Array.from(el.children).map(p=>p.textContent.trim()).join('\n\n');
 const isArticle=el=>/^(DIV|SECTION|ARTICLE|MAIN)$/.test(el.tagName)&&el.children.length>0&&Array.from(el.children).every(c=>c.tagName==='P');
 const setArticle=(el,value)=>{
  const doc=el.ownerDocument;
  const paragraphs=value.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/);
  el.replaceChildren(...paragraphs.map(text=>{const p=doc.createElement('p');p.textContent=text.trim().replace(/\n/g,' ');return p}));
 };
 function restoreLive(){
  liveRoots.forEach((root,i)=>{root.innerHTML=rootSnapshots[i]});
  liveSnapshots.forEach(({node,html,href,src,alt,srcset,sizes})=>{if(!node.isConnected)return;if(node.tagName==='IMG'){for(const [k,v] of [['src',src],['alt',alt],['srcset',srcset],['sizes',sizes]]){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}}else{node.innerHTML=html;if(href===null)node.removeAttribute('href');else node.setAttribute('href',href)}});
 }
 function syncLive(){
  for(const item of model){
   if(item.group!==null||item.added)continue;
   const node=liveSnapshots[item.index]?.node;
   if(!node?.isConnected)continue;
   if(item.image){if(item.src!==item.originalSrc&&validImageURL(item.src)){node.setAttribute('src',normalizeURL(item.src));node.removeAttribute('srcset');node.removeAttribute('sizes')}node.setAttribute('alt',item.alt);continue}
   if(item.article){if(item.text!==item.originalText)setArticle(node,item.text)}else setText(node,item.text);
   if(item.link&&validURL(item.url))node.setAttribute('href',normalizeURL(item.url));
  }
  liveRoots.forEach((root,gi)=>{
   root.innerHTML=rootSnapshots[gi];
   [...root.children].filter(el=>el.matches('a[data-edit]')).forEach(el=>el.remove());
   for(const item of model.filter(x=>x.group===gi)){
    if(!item.link)continue;
    const node=item.added?document.createElement('a'):liveSnapshots[item.index]?.clone.cloneNode(true);
    if(!node)continue;
    node.setAttribute('data-edit','');
    node.setAttribute('href',normalizeURL(item.url)||'#');
    setText(node,item.text);
    if(root.lastChild&&root.lastChild.nodeType!==3)root.append(document.createTextNode(' '));
    root.append(node);
   }
  });
  saveDraft();
 }
 const icons=()=>{
  // Bundled Lucide-style SVGs: no CDN or internet connection required.
  const paths={
   pencil:'<path d="M15 5 19 9"/><path d="M4 20h4l10.5-10.5a2.121 2.121 0 0 0-3-3L5 17v3Z"/>',
   maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
   minimize:'<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
   plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
   'arrow-up':'<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
   'arrow-down':'<path d="m5 12 7 7 7-7"/><path d="M12 5v14"/>',
   'trash-2':'<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>'
  };
  document.querySelectorAll('i[data-lucide]').forEach(el=>{
   const path=paths[el.getAttribute('data-lucide')];if(!path)return;
   el.outerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  });
 };
 const normalizeURL=value=>{
  const input=String(value||'').trim();
  if(!input||/\s/.test(input))return '';
  if(/^(mailto:|tel:|\/|#)/i.test(input))return input;
  const candidate=/^https?:\/\//i.test(input)?input:'https://'+input;
  try{const u=new URL(candidate);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))return '';return candidate}catch{return ''}
 };
 const validURL=v=>Boolean(normalizeURL(v));
 const validImageURL=v=>Boolean(normalizeURL(v)&&/^https?:\/\//i.test(normalizeURL(v)));
 const displayURL=v=>String(v||'').replace(/^https:\/\//i,'');
 function fitTextarea(input){
  const wasScrolled=input.scrollTop;
  input.style.height='auto';
  const limit=window.innerHeight*(screen.classList.contains('ue-fullscreen')?.8:.6);
  const min=input.classList.contains('ue-article')?200:110;
  input.style.height=Math.max(min,Math.min(input.scrollHeight,limit))+'px';
  input.style.overflowY=input.scrollHeight>limit?'auto':'hidden';
  input.scrollTop=wasScrolled;
 }
 function render(){
  fields.replaceChildren();
  for(const item of model){
   const box=document.createElement('div');box.className='ue-item';
   const label=document.createElement('label');label.textContent=item.label|| (item.image?'Image':item.link?'Link text':item.tag==='p'?'Paragraph':'Text');
   if(item.image){
    const preview=document.createElement('img');preview.className='ue-image-preview';preview.alt='Image preview';
    const updatePreview=()=>{if(validImageURL(item.src)){preview.src=normalizeURL(item.src)}else{preview.removeAttribute('src')}};
    updatePreview();box.append(preview);
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com/photo.jpg';url.value=displayURL(item.src);
    url.oninput=()=>{item.src=url.value;updatePreview();syncLive()};
    label.append(url);box.append(label);
    const altLabel=document.createElement('label');altLabel.textContent='Alt text';
    const altInput=document.createElement('input');altInput.type='text';altInput.value=item.alt;
    altInput.oninput=()=>{item.alt=altInput.value;syncLive()};
    altLabel.append(altInput);box.append(altLabel);
   }else{
    const input=document.createElement(item.article||item.tag==='p'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';if(item.article)input.classList.add('ue-article');input.value=item.text;input.oninput=()=>{item.text=input.value;if(input.tagName==='TEXTAREA')fitTextarea(input);syncLive()};label.append(input);box.append(label);
   }
   if(item.link){
    const lbl=document.createElement('label');lbl.textContent='URL';const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com';url.value=item.url.replace(/^https:\/\//i,'');url.oninput=()=>{item.url=url.value;syncLive()};lbl.append(url);box.append(lbl);
   }
   if(item.group!==null){
    const controls=document.createElement('div');controls.className='ue-controls';
    for(const [verb,ico] of [['up','arrow-up'],['down','arrow-down'],['delete','trash-2']]){
     const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',verb);b.title=verb;b.innerHTML='<i data-lucide="'+ico+'"></i>';
     b.onclick=()=>{const group=model.filter(x=>x.group===item.group),i=group.indexOf(item);if(verb==='delete')model.splice(model.indexOf(item),1);else if(verb==='up'&&i>0){const j=model.indexOf(group[i-1]),k=model.indexOf(item);[model[j],model[k]]=[model[k],model[j]]}else if(verb==='down'&&i<group.length-1){const j=model.indexOf(group[i+1]),k=model.indexOf(item);[model[j],model[k]]=[model[k],model[j]]}render()};controls.append(b)
    }box.append(controls);
   }
   fields.append(box);
  }fields.querySelectorAll('textarea').forEach(fitTextarea);icons();syncLive();
 }
 function close(restore=true){if(restore){restoreLive();restoreStyle();sectionOrder=[...initialSectionOrder];reorderSections()}clearDraft();draftActive=false;initialModel='';screen.hidden=true;pencil.hidden=false;pencil.title='Edit'}
 function copyHTML(){
  const parser=new DOMParser(),doc=parser.parseFromString(baseline,'text/html');
  const source=Array.from(doc.querySelectorAll('[data-edit]')).filter(el=>!el.querySelector('[data-edit]'));
  const originals=model.filter(x=>!x.added);
  if(source.length!==liveSnapshots.length)throw Error('Page structure changed. Reload and try again.');
  for(const item of originals){
   const element=source[item.index];if(!element)throw Error('Editable element missing.');
   if(item.image){if(!validImageURL(item.src))throw Error('Enter a valid image URL.');if(item.src!==item.originalSrc){element.setAttribute('src',normalizeURL(item.src));element.removeAttribute('srcset');element.removeAttribute('sizes')}element.setAttribute('alt',item.alt);continue}
   if(item.article){if(item.text!==item.originalText)setArticle(element,item.text)}else element.textContent=item.text;
   if(item.link){if(!validURL(item.url.trim()))throw Error('Invalid link URL.');element.setAttribute('href',normalizeURL(item.url))}
  }
  // Link collections are opt-in: <nav data-edit="links"><a data-edit ...>...</a></nav>
  const groups=Array.from(doc.querySelectorAll('[data-edit="links"]'));
  groups.forEach((g,gi)=>{
   const members=model.filter(x=>x.group===gi);
   const old=Array.from(g.children).filter(el=>el.matches('a[data-edit]'));
   old.forEach(el=>el.remove());
   for(const item of members){
    if(!item.link||!validURL(item.url.trim()))throw Error('Enter a valid link URL.');
    const node=item.added?doc.createElement('a'):source[item.index].cloneNode(true);
    node.setAttribute('data-edit','');node.setAttribute('href',normalizeURL(item.url));
    node.textContent=item.text;
    if(g.lastChild&&g.lastChild.nodeType!==3)g.append(doc.createTextNode(' '));
    g.append(node);
   }
  });
  const exportedSections=Array.from(doc.querySelectorAll('[data-section]'));
  const exportedById=new Map(exportedSections.map(el=>[el.getAttribute('data-section'),el]));
  for(const id of sectionOrder){
   const node=exportedById.get(id);if(!node||!node.parentElement)continue;
   const siblings=exportedSections.filter(el=>el.parentElement===node.parentElement);
   const ordered=sectionOrder.map(k=>exportedById.get(k)).filter(el=>el&&el.parentElement===node.parentElement&&siblings.includes(el));
   const after=siblings[siblings.length-1]?.nextSibling||null;
   for(const el of ordered)node.parentElement.insertBefore(el,after);
  }
  let pageStyle=doc.getElementById('editor-page-style');
  if(JSON.stringify(styleSettings)!==initialStyle){
   if(!pageStyle){pageStyle=doc.createElement('style');pageStyle.id='editor-page-style';doc.head.append(pageStyle)}
   pageStyle.textContent=styleSheetText(styleSettings);
  }
  doc.querySelector('#ue-pencil')?.remove();doc.querySelector('#ue-screen')?.remove();doc.querySelector('#ue-style')?.remove();doc.querySelector('#ue-script')?.remove();
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 }
 pencil.onclick=()=>{
  if(draftActive){screen.hidden=false;pencil.hidden=true;return}
  const sourceTag=document.getElementById('ends-nav-data');
  let sourceHTML;
  try{sourceHTML=JSON.parse(sourceTag?.textContent||'{}').source}catch{}
  if(typeof sourceHTML!=='string'||!sourceHTML.trim()){
   sourceHTML='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  }
  baseline=sourceHTML;
  const roots=Array.from(document.querySelectorAll('[data-edit="links"]')).filter(root=>root.querySelector('a[data-edit]'));
  liveRoots=roots;rootSnapshots=roots.map(root=>root.innerHTML);
  liveNodes=editable().filter(el=>el.getAttribute('data-edit')!=='links');
  liveSnapshots=liveNodes.map(node=>({node,html:node.innerHTML,href:node.getAttribute('href'),src:node.getAttribute('src'),alt:node.getAttribute('alt'),srcset:node.getAttribute('srcset'),sizes:node.getAttribute('sizes'),clone:node.cloneNode(true)}));
  model=liveNodes.map((el,i)=>{
   const group=el.closest('[data-edit="links"]');
   const article=isArticle(el),image=el.tagName==='IMG',text=article?articleText(el):el.textContent.trim();
   return {index:i,tag:el.tagName.toLowerCase(),article,image,src:el.getAttribute('src')||'',originalSrc:el.getAttribute('src')||'',alt:el.getAttribute('alt')||'',originalText:text,link:el.tagName==='A',label:(el.getAttribute('data-label')||el.getAttribute('aria-label')||'').trim(),text,url:el.getAttribute('href')||'',group:group?roots.indexOf(group):null};
  });
  draftActive=true;initialModel=JSON.stringify(model);
  styleSettings=readStyle();initialStyle=JSON.stringify(styleSettings);
  sectionNodes=findSections();sectionOrder=sectionNodes.map(n=>n.getAttribute('data-section'));
  initialSectionOrder=[...sectionOrder];
  const saved=readDraft();
  if(saved&&saved.model.length>=model.length&&saved.model.every((item,i)=>item.added||(model[i]&&item.index===model[i].index&&item.tag===model[i].tag))){
   model=saved.model;
   if(saved.styleSettings)styleSettings={...styleDefaults,...saved.styleSettings};
   if(Array.isArray(saved.sectionOrder)&&saved.sectionOrder.length===sectionOrder.length&&saved.sectionOrder.every(id=>sectionOrder.includes(id)))sectionOrder=[...saved.sectionOrder];
  }
  if(JSON.stringify(styleSettings)!==initialStyle)applyStyle();
  if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder))reorderSections();
  renderStyle();
  pencil.hidden=true;screen.hidden=false;message.textContent='';
  render();setTab(activeTab);
 };
 add.onclick=()=>{const group=model.find(x=>x.link&&x.group!==null)?.group;if(group===undefined)return;model.push({added:true,index:-1,tag:'a',link:true,text:'',url:'',group});render();fields.lastElementChild?.querySelector('input')?.focus()};
 screen.querySelector('#ue-cancel').textContent='Revert';
 screen.querySelector('#ue-cancel').onclick=()=>close(true);
 document.addEventListener('pointerdown',event=>{
  if(!draftActive||screen.hidden)return;
  if(screen.contains(event.target)||pencil.contains(event.target))return;
  hideEditor();
 });
 screen.querySelector('#ue-copy').onclick=async()=>{
  try{
   if(model.some(x=>x.link&&(!x.text.trim()||!validURL(x.url.trim()))))throw Error('Every link needs text and a valid URL.');
   const value=copyHTML();
   if(window.endsSharedCopyText)await window.endsSharedCopyText(value);else await navigator.clipboard.writeText(value);
   const sourceTag=document.getElementById('ends-nav-data');
   if(sourceTag){try{const data=JSON.parse(sourceTag.textContent||'{}');data.source=value;sourceTag.textContent=JSON.stringify(data).replace(/</g,'\\u003c')}catch{}}
   close(false);
  }catch(e){message.textContent=e.message||'Copy failed';}
 };
 // Recover a compatible local draft immediately, including its live preview.
 if(readDraft()){pencil.click();hideEditor()}
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!screen.hidden){hideEditor();return}
  if(e.key.toLowerCase()!=='e'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||!screen.hidden)return;
  const target=e.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'))return;
  e.preventDefault();pencil.click();
 });icons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
