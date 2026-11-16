/* HTML Editor v1 — standalone, dependency-free.
   Source: extracted from Dino → Shared!B22; this copy does not modify live.ends.at.
   Include with <script src="editor.js" defer></script> in any editable HTML page. */
(()=>{if(window.__universalEditReady)return;window.__universalEditReady=true;
const editorStyle=document.createElement('style');
editorStyle.id='ue-style';
editorStyle.textContent="#ue-pencil{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:2147483000;display:grid;place-items:center;width:44px;height:44px;border:1px solid #ddd;border-radius:50%;background:white;color:#111;box-shadow:0 3px 16px #0002;cursor:pointer}\n#ue-pencil svg,#ue-screen svg{width:18px;height:18px}\n#ue-screen{position:fixed;inset:0;z-index:2147483600;overflow:auto;height:100dvh;background:white;color:#171717;padding:calc(22px + env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));font:15px/1.5 Manrope,system-ui,sans-serif}\n#ue-screen[hidden],#ue-pencil[hidden]{display:none!important}\n#ue-screen *{box-sizing:border-box}\n#ue-wrap{max-width:560px;margin:auto}\n#ue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:24px}\n#ue-head strong{font-size:21px}\n#ue-screen button{font:inherit;cursor:pointer}\n#ue-head button,#ue-add{border:1px solid #ddd;background:#fff;color:#171717;border-radius:9px;padding:10px 13px}\n#ue-head #ue-copy{background:#171717;color:#fff;border-color:#171717}\n#ue-fields{display:grid;gap:18px}\n.ue-item{display:grid;gap:9px;padding-bottom:18px}\n.ue-item label{display:grid;gap:5px;font:700 12px/1.5 Manrope,system-ui,sans-serif;color:#666}\n.ue-item input,.ue-item textarea,.ue-item select{width:100%;border:1px solid #ddd;border-radius:8px;padding:11px;background:#fff;color:#171717;font:500 16px/1.5 Manrope,system-ui,sans-serif}\n.ue-item select{appearance:auto;min-height:47px;cursor:pointer}\n.ue-item input[hidden]{display:none!important}\n.ue-item textarea{min-height:110px;max-height:60dvh;resize:vertical;overflow-y:hidden}\n.ue-image-preview{display:block;max-width:100%;max-height:190px;object-fit:contain;object-position:left center;border-radius:8px;background:#f4f4f4}\n.ue-image-preview:not([src]){display:none}\n.ue-item textarea.ue-article{min-height:200px;line-height:1.7}\n#ue-screen.ue-fullscreen .ue-item textarea{max-height:80dvh}\n.ue-controls{display:flex;justify-content:flex-end;gap:5px}\n.ue-controls button{width:38px;height:36px;border:0;border-radius:7px;background:#f3f3f3;display:grid;place-items:center}\n.ue-controls button:disabled{opacity:.3}\n#ue-add{display:flex;align-items:center;gap:8px;margin-top:20px}\n#ue-add[hidden]{display:none!important}\n#ue-message{font-size:13px;color:#a22}\n#ue-screen{box-sizing:border-box;left:auto;right:0;top:0;bottom:0;width:min(430px,100%);height:100dvh;max-height:100dvh;border-left:1px solid #ddd;box-shadow:-12px 0 45px #0002;overflow:hidden;padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}\n#ue-wrap{display:flex;flex-direction:column;height:100%;min-height:0}\n#ue-head{flex:none;margin-bottom:16px;position:relative;justify-content:center;min-height:32px}\n#ue-undo{position:absolute;left:0;top:0;border:0!important;background:transparent!important;color:#555!important;padding:5px!important;width:32px;height:32px}#ue-undo:disabled{opacity:.25}#ue-fullscreen{position:absolute;right:0;top:0;display:grid;place-items:center;width:32px;height:32px;border:0!important;border-radius:7px;padding:0!important;background:transparent!important;color:#555!important}\n#ue-fullscreen:hover{background:#f2f2f2!important}\n#ue-body{scrollbar-width:none}\n#ue-body::-webkit-scrollbar{display:none}\n#ue-screen.ue-fullscreen{inset:0;width:100%;height:100dvh;max-height:100dvh;border:0;box-shadow:none;border-radius:0;padding:calc(22px + env(safe-area-inset-top)) 28px calc(16px + env(safe-area-inset-bottom))}\n#ue-screen.ue-fullscreen #ue-wrap{width:100%;max-width:880px;margin:0 auto}\n#ue-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 3px 24px}\n#ue-actions{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px 2px;background:white}\n#ue-actions button{min-width:104px;padding:11px 18px;border:1px solid #ddd;border-radius:9px;background:#fff;color:#171717}\n#ue-actions #ue-copy{background:#171717;color:white;border-color:#171717}\n@media(max-width:640px){#ue-screen:not(.ue-fullscreen){top:auto;bottom:0;left:0;right:0;width:100%;height:min(62dvh,620px);border-left:0;border-top:1px solid #ddd;border-radius:16px 16px 0 0;box-shadow:0 -12px 40px #0002}#ue-screen.ue-fullscreen{padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}}\n";
editorStyle.textContent+="\n#ue-tabs{display:flex;gap:4px;flex:none;margin:0 0 15px;border-bottom:1px solid #e8e8e8}\n#ue-tabs button{flex:1;border:0;background:transparent;color:#777;padding:10px 4px;font:600 13px Manrope,system-ui,sans-serif;border-bottom:2px solid transparent;cursor:pointer}\n#ue-tabs button[aria-selected=\"true\"]{color:#111;border-bottom-color:#111}\n#ue-content[hidden],#ue-fields[hidden],#ue-style-panel[hidden],#ue-sections[hidden],#ue-settings[hidden],#ue-results[hidden]{display:none!important}\n#ue-style-panel,#ue-sections,#ue-settings{display:grid;gap:13px}\n.ue-setting{position:relative;padding-right:35px!important}.ue-field-reset{position:absolute;right:0;top:2px;width:28px;height:28px;padding:5px!important;border:0!important;border-radius:6px;background:transparent!important;color:#666!important;cursor:pointer}.ue-field-reset:disabled{opacity:.25;cursor:default}.ue-field-reset svg{width:16px;height:16px}.ue-meta{display:grid;gap:12px;padding-bottom:16px;margin-bottom:18px;border-bottom:1px solid #eee}.ue-meta label{font:700 12px Manrope,system-ui,sans-serif;color:#666;display:grid;gap:6px}.ue-meta input,.ue-meta textarea{padding:10px;border:1px solid #ddd;border-radius:8px;font:14px Manrope,system-ui,sans-serif;width:100%;color:#171717;background:white}.ue-meta textarea{min-height:78px;resize:vertical}\n.ue-deleted{opacity:.45}.ue-hidden{opacity:.65}.ue-section-row .ue-controls{gap:3px}\n.ue-section-row{display:flex;gap:8px;align-items:center}.ue-section-row .ue-section-link{flex:1;min-width:0}.ue-section-row .ue-controls{flex:none}\n.ue-setting{display:grid;gap:7px;padding-bottom:12px;border-bottom:1px solid #eee}\n.ue-setting label{font:700 12px Manrope,system-ui,sans-serif;color:#555}\n.ue-setting input,.ue-setting select{min-height:40px;width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;background:white;color:#111;font:14px Manrope,system-ui,sans-serif}\n.ue-color-row{display:grid;grid-template-columns:45px minmax(0,1fr);gap:9px;align-items:center}\n.ue-color-row input[type=color]{padding:3px;width:45px;height:40px;cursor:pointer}\n.ue-section-link{display:block;width:100%;text-align:left;border:1px solid #ddd!important;border-radius:8px!important;background:#fff!important;padding:11px 12px!important;font:14px Manrope,system-ui,sans-serif}\n";
editorStyle.textContent+='\n#ue-pencil{border-radius:50%!important;aspect-ratio:1 / 1}\n#ue-searchbar{flex:none;position:relative;margin-bottom:10px}#ue-search{height:42px;width:100%;padding:9px 35px 9px 14px;border:1px solid #ddd;border-radius:9px;font:14px system-ui,sans-serif;color:#171717;background:#fafafa}#ue-search:focus{outline:1px solid #888;background:#fff}#ue-search-clear{position:absolute;right:5px;top:5px;width:32px;height:32px;border:0;background:transparent;color:#777}#ue-results{display:grid;gap:5px}#ue-results button{display:grid;gap:3px;text-align:left;width:100%;border:1px solid #eee;border-radius:9px;padding:11px;background:#fff;color:#222;font:14px system-ui,sans-serif}#ue-results button:hover{background:#f5f5f5}#ue-results small{font-size:12px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ue-sections-toggle{display:flex;justify-content:space-between;width:100%;border:0;border-bottom:1px solid #eee;background:white;padding:13px 2px;font:650 14px system-ui,sans-serif;text-align:left}#ue-sections-toggle span{font-weight:400;color:#777;font-size:12px}#ue-sections{padding:10px 0 23px}#ue-settings .ue-meta{margin:0;border:0}';
document.head.append(editorStyle);
function init(){
 const selector='[data-edit]';
 function editable(){return Array.from(document.querySelectorAll(selector)).filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!el.querySelector(selector));}
 if(!editable().length)return;
 const pencil=document.createElement('button');pencil.id='ue-pencil';pencil.type='button';pencil.title='Edit';pencil.setAttribute('aria-label','Edit page');pencil.innerHTML='<i data-lucide="pencil"></i>';
 const screen=document.createElement('section');screen.id='ue-screen';screen.hidden=true;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Edit page');
 screen.innerHTML='<div id="ue-wrap"><div id="ue-head"><button type="button" id="ue-undo" title="Undo" aria-label="Undo" disabled><i data-lucide="undo-2"></i></button><strong>Edit page</strong><button id="ue-fullscreen" type="button" aria-label="Expand editor" title="Fullscreen"><i data-lucide="maximize"></i></button></div><div id="ue-searchbar"><input id="ue-search" type="search" placeholder="Search anything..." aria-label="Search content, design, and settings"><button type="button" id="ue-search-clear" aria-label="Clear search" title="Clear search" hidden><i data-lucide="x"></i></button></div><div id="ue-tabs" role="tablist" aria-label="Editor tabs"><button type="button" data-tab="content" aria-selected="true">Content</button><button type="button" data-tab="design" aria-selected="false">Design</button><button type="button" data-tab="settings" aria-selected="false">Settings</button></div><div id="ue-body"><div id="ue-results" hidden></div><div id="ue-content"><button id="ue-sections-toggle" type="button" aria-expanded="false">Sections <span>Show</span></button><div id="ue-sections" hidden></div><div id="ue-fields"></div><button id="ue-add" type="button" hidden><i data-lucide="plus"></i> Add link</button></div><div id="ue-style-panel" hidden></div><div id="ue-settings" hidden></div><p id="ue-message" role="status"></p></div><div id="ue-actions"><button id="ue-cancel" type="button">Revert</button><button id="ue-copy" type="button">Copy</button></div></div>';
 document.body.append(pencil,screen);
 const fields=screen.querySelector('#ue-fields'),add=screen.querySelector('#ue-add'),message=screen.querySelector('#ue-message');
 const fullscreenButton=screen.querySelector('#ue-fullscreen');
 screen.querySelector('#ue-undo').onclick=undo;
 const scrollBody=screen.querySelector('#ue-body');
 const stylePanel=screen.querySelector('#ue-style-panel'),sectionsPanel=screen.querySelector('#ue-sections'),settingsPanel=screen.querySelector('#ue-settings'),contentPanel=screen.querySelector('#ue-content');
 const searchInput=screen.querySelector('#ue-search'),resultsPanel=screen.querySelector('#ue-results'),clearSearch=screen.querySelector('#ue-search-clear'),sectionsToggle=screen.querySelector('#ue-sections-toggle');
 let activeTab='content',sectionsOpen=false;
 const designLabels=['Page background','Text color','Accent color','Font family','Heading 1 size (px)','Heading 2 size (px)','Heading 3 size (px)','Paragraph size (px)','Corner roundness (px)','Button background','Button text color'];
 function setTab(tab){
  activeTab=tab;searchInput.value='';clearSearch.hidden=true;resultsPanel.hidden=true;
  screen.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  contentPanel.hidden=tab!=='content';stylePanel.hidden=tab!=='design';settingsPanel.hidden=tab!=='settings';
  add.hidden=tab!=='content'||!model.some(item=>item.link&&item.group!==null);
  scrollBody.scrollTop=0;
 }
 function setSectionsOpen(open){
  sectionsOpen=open;sectionsPanel.hidden=!open;
  sectionsToggle.setAttribute('aria-expanded',String(open));
  sectionsToggle.querySelector('span').textContent=open?'Hide':'Show';
  if(open)renderSections();
 }
 sectionsToggle.onclick=()=>setSectionsOpen(!sectionsOpen);
 screen.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
 function showSearchResults(){
  const q=searchInput.value.trim().toLocaleLowerCase();clearSearch.hidden=!q;
  if(!q){resultsPanel.hidden=true;contentPanel.hidden=activeTab!=='content';stylePanel.hidden=activeTab!=='design';settingsPanel.hidden=activeTab!=='settings';return}
  resultsPanel.hidden=false;contentPanel.hidden=true;stylePanel.hidden=true;settingsPanel.hidden=true;resultsPanel.replaceChildren();
  const matches=[];
  model.forEach((item,index)=>{
   if([item.label,item.text,item.url,item.alt,item.src].some(v=>String(v||'').toLocaleLowerCase().includes(q)))matches.push({tab:'content',label:item.label||item.text||'Content field',detail:(item.text||item.url||'').slice(0,120),index});
  });
  sectionOrder.forEach((id,index)=>{
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id),label=sectionStates[id]?.label||node?.getAttribute('aria-label')||id;
   if((label+' '+id+' section').toLocaleLowerCase().includes(q))matches.push({tab:'content',label:label+' section',detail:'Section controls',section:index});
  });
  designLabels.forEach((label,index)=>{if((label+' design style').toLocaleLowerCase().includes(q))matches.push({tab:'design',label,detail:'Design',design:index})});
  [['Page title',0],['Page description',1]].forEach(([label,index])=>{if((label+' '+String(index?pageMeta.description:pageMeta.title)+' SEO settings').toLocaleLowerCase().includes(q))matches.push({tab:'settings',label,detail:'Settings',setting:index})});
  for(const hit of matches){
   const button=document.createElement('button');button.type='button';
   const title=document.createElement('strong');title.textContent=hit.label;
   const detail=document.createElement('small');detail.textContent=hit.detail||hit.tab;button.append(title,detail);
   button.onclick=()=>{
    setTab(hit.tab);
    if(hit.section!==undefined){setSectionsOpen(true);const input=sectionsPanel.children[hit.section]?.querySelector('input');input?.scrollIntoView({block:'center',behavior:'instant'});input?.focus({preventScroll:true})}
    else if(hit.index!==undefined){const row=fields.querySelectorAll('.ue-item')[hit.index];row?.scrollIntoView({block:'center',behavior:'instant'});const input=row?.querySelector('input,textarea,select');input?.focus({preventScroll:true});input?.dispatchEvent(new Event('focusin',{bubbles:true}))}
    else if(hit.design!==undefined){const row=stylePanel.children[hit.design];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input,select')?.focus({preventScroll:true})}
    else if(hit.setting!==undefined){const row=settingsPanel.querySelectorAll('.ue-meta label')[hit.setting];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input,textarea')?.focus({preventScroll:true})}
   };
   resultsPanel.append(button);
  }
  if(!matches.length){const empty=document.createElement('p');empty.textContent='No matches';resultsPanel.append(empty)}
 }
 searchInput.addEventListener('input',showSearchResults);
 clearSearch.onclick=()=>{searchInput.value='';showSearchResults();searchInput.focus()};
 // Focus-based scrolling: only when selecting a field, never on typing or sidebar scroll.
 fields.addEventListener('focusin',event=>{
  if(screen.classList.contains('ue-fullscreen'))return;
  const box=event.target.closest('.ue-item');
  if(!box)return;
  const item=model[Number(box.dataset.editIndex)];
  if(!item||item.hidden||item.deleted)return;
  const node=item.group!==null?liveRoots[item.group]:liveSnapshots[item.index]?.node;
  if(!node?.isConnected)return;
  const rect=node.getBoundingClientRect();
  if(rect.height===0)return;
  const mobile=window.innerWidth<=640;
  const top=24;
  const bottom=mobile?window.innerHeight-Math.min(screen.getBoundingClientRect().height,window.innerHeight)-24:window.innerHeight-32;
  // Do not move the page when the element is already comfortably visible.
  if(rect.top>=top&&rect.bottom<=bottom)return;
  const desired=Math.max(0,window.scrollY+rect.top-Math.max(28,(bottom-top-Math.min(rect.height,360))/2));
  window.scrollTo({top:desired,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 });
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
 let sectionStates={},undoStack=[],pageMeta={},originalMeta={},revertAvailable=false;
 const sectionDisplays=new Map();
 const snapshot=()=>JSON.stringify({model,styleSettings,sectionOrder,sectionStates,pageMeta});
 const revertKey=()=>draftKey+':last-revert';
 const readRevert=()=>{try{const x=JSON.parse(localStorage.getItem(revertKey())||'null');return x?.signature===originalSignature&&typeof x.snapshot==='string'?x.snapshot:null}catch{return null}};
 const clearRevert=()=>{revertAvailable=false;try{localStorage.removeItem(revertKey())}catch{}};
 const saveRevert=()=>{
  if(!hasChanges())return;
  const state=snapshot();
  revertAvailable=true;
  try{localStorage.setItem(revertKey(),JSON.stringify({signature:originalSignature,snapshot:state}))}catch{}
 };

 const checkpoint=()=>{if(revertAvailable)clearRevert();const state=snapshot();if(undoStack.at(-1)!==state){undoStack.push(state);if(undoStack.length>80)undoStack.shift()}syncUndoButton()};
 const syncUndoButton=()=>{const b=screen.querySelector('#ue-undo');if(b)b.disabled=!undoStack.length};
 function undo(){if(!undoStack.length)return;const old=JSON.parse(undoStack.pop());if(revertAvailable)clearRevert();model=old.model;styleSettings=old.styleSettings;sectionOrder=old.sectionOrder;sectionStates=old.sectionStates||{};pageMeta=old.pageMeta||{...originalMeta};applyMeta();restoreLive();reorderSections();syncLive();applyStyle();renderStyle();renderSections();render();syncUndoButton()}
 function syncSections(){for(const node of sectionNodes){const state=sectionStates[node.getAttribute('data-section')]||{};if(state.hidden||state.deleted)node.style.display='none';else node.style.display=sectionDisplays.get(node)||'';if(state.label!==undefined)node.setAttribute('aria-label',state.label);else if(node.dataset.ueInitialLabel!==undefined){if(node.dataset.ueInitialLabel)node.setAttribute('aria-label',node.dataset.ueInitialLabel);else node.removeAttribute('aria-label')}}}

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
 // Preserve previously exported appearance overrides when editing an exported page again.
 const existingCSS=document.getElementById('editor-page-style')?.textContent||'';
 const originalOverrides=new Set(
  ['background','text','accent','buttonBackground','buttonText'].filter(k=>existingCSS.includes('--ue-'+k+':'))
 );
 for(const tag of ['h1','h2','h3','p']){
  if(new RegExp('html body '+tag+'[^\\{]*\\{').test(existingCSS))originalOverrides.add(tag);
 }
 if(existingCSS.includes('font-family:'))originalOverrides.add('font');
 if(existingCSS.includes('border-radius:'))originalOverrides.add('radius');
 const styleSheetText=a=>{
  // Store exact settings, but override only properties changed from the
  // original page, preserving responsive typography and existing CSS.
  const parts=['/* editor-style:'+encodeURIComponent(JSON.stringify(a))+' */'];
  const changed=k=>originalOverrides.has(k)||String(a[k])!==String(originalAppearance[k]);
  const colors=['background','text','accent','buttonBackground','buttonText'];
  const vars=colors.filter(changed).map(k=>'--ue-'+k+':'+safeColor(a[k],styleDefaults[k])+';');
  if(vars.length)parts.push(':root{'+vars.join('')+'}');
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
  icons();
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
   const jump=document.createElement('input');jump.type='text';jump.className='ue-section-link';
   jump.value=sectionStates[id]?.label??node.getAttribute('aria-label')??node.querySelector('h1,h2,h3')?.textContent?.trim()??id;
   jump.setAttribute('aria-label','Section name');jump.title='Edit section name';
   jump.oninput=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),label:jump.value};syncSections();saveDraft()};
   const controls=document.createElement('div');controls.className='ue-controls';
   for(const [dir,name] of [[-1,'arrow-up'],[1,'arrow-down']]){
    const button=document.createElement('button');button.type='button';button.title=dir<0?'Move up':'Move down';button.setAttribute('aria-label',button.title+' '+jump.value);
    button.disabled=(i+dir<0||i+dir>=sectionOrder.length||sectionNodes.find(n=>n.getAttribute('data-section')===sectionOrder[i+dir])?.parentElement!==node.parentElement);
    button.innerHTML='<i data-lucide="'+name+'"></i>';
    button.onclick=()=>{checkpoint();const next=i+dir;[sectionOrder[i],sectionOrder[next]]=[sectionOrder[next],sectionOrder[i]];reorderSections();saveDraft();renderSections()};
    controls.append(button);
   }
   const state=sectionStates[id]||{};
   for(const [action,icon,field] of [[state.hidden?'Show':'Hide',state.hidden?'eye-off':'eye','hidden'],[state.deleted?'Restore':'Delete',state.deleted?'undo-2':'trash-2','deleted']]){
    const button=document.createElement('button');button.type='button';button.title=action;button.setAttribute('aria-label',action+' '+jump.value);
    button.innerHTML='<i data-lucide="'+icon+'"></i>';
    button.onclick=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),[field]:!Boolean(sectionStates[id]?.[field])};syncSections();saveDraft();renderSections()};
    controls.append(button);
   }
   row.classList.toggle('ue-deleted',Boolean(state.deleted));row.classList.toggle('ue-hidden',Boolean(state.hidden));
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
   if(hasChanges())localStorage.setItem(draftKey,JSON.stringify({signature:originalSignature,model,styleSettings,sectionOrder,sectionStates,pageMeta,styleSchema:2}));
   else clearDraft();
  }catch{} // file:// and privacy settings may block storage
 };
 const readMeta=()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content')||''});
 const applyMeta=()=>{document.title=pageMeta.title||'';let meta=document.querySelector('meta[name="description"]');if(!meta&&pageMeta.description){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}if(meta)meta.setAttribute('content',pageMeta.description||'')};
 const restoreMeta=()=>{pageMeta={...originalMeta};applyMeta();if(!originalMeta.hadDescription)document.querySelector('meta[name="description"]')?.remove()};
 const hasChanges=()=>draftActive&&(JSON.stringify(model)!==initialModel||JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder)||Object.values(sectionStates).some(x=>x.hidden||x.deleted)||(pageMeta.title!==originalMeta.title||pageMeta.description!==originalMeta.description));
 function hideEditor(){if(!draftActive||screen.hidden)return;screen.hidden=true;pencil.hidden=false;pencil.title=hasChanges()?'Resume editing (unsaved changes)':'Resume editing'}

 // Change only the necessary text nodes. Never flatten formatted descendants.
 const setText=(el,value)=>{
  const old=el.textContent;
  if(old===value)return;
  const nodes=[],walker=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())nodes.push(walker.currentNode);
  if(!nodes.length){el.append(el.ownerDocument.createTextNode(value));return}
  let prefix=0;while(prefix<old.length&&prefix<value.length&&old[prefix]===value[prefix])prefix++;
  let suffix=0;while(suffix<old.length-prefix&&suffix<value.length-prefix&&old[old.length-1-suffix]===value[value.length-1-suffix])suffix++;
  const start=prefix,end=old.length-suffix;
  let offset=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
  for(const node of nodes){
   const next=offset+node.data.length;
   if(!startNode&&start<=next){startNode=node;startOffset=start-offset}
   if(!endNode&&end<=next){endNode=node;endOffset=end-offset}
   offset=next;
  }
  if(!startNode)startNode=nodes[nodes.length-1],startOffset=startNode.data.length;
  if(!endNode)endNode=nodes[nodes.length-1],endOffset=endNode.data.length;
  const replacement=value.slice(prefix,value.length-suffix);
  if(startNode===endNode){startNode.replaceData(startOffset,endOffset-startOffset,replacement);return}
  startNode.data=startNode.data.slice(0,startOffset)+replacement;
  endNode.data=endNode.data.slice(endOffset);
  let between=false;
  for(const node of nodes){if(node===startNode){between=true;continue}if(node===endNode)break;if(between)node.data=''}
 };
 const articleText=el=>Array.from(el.children).map(p=>p.textContent.trim()).join('\n\n');
 const isArticle=el=>/^(DIV|SECTION|ARTICLE|MAIN)$/.test(el.tagName)&&el.children.length>0&&Array.from(el.children).every(c=>c.tagName==='P');
 const setArticle=(el,value)=>{
  const doc=el.ownerDocument;
  const paragraphs=value.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/);
  el.replaceChildren(...paragraphs.map(text=>{const p=doc.createElement('p');p.textContent=text.trim().replace(/\n/g,' ');return p}));
 };
 function restoreLive(){
  liveRoots.forEach((root,i)=>{if(root.innerHTML!==rootSnapshots[i])root.innerHTML=rootSnapshots[i]});
  liveSnapshots.forEach(({node,html,href,src,alt,srcset,sizes,display,hadStyle})=>{
   if(!node.isConnected)return;
   if(node.style.display!==display){
    if(hadStyle){node.style.display=display}
    else{node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style')}
   }
   if(node.tagName==='IMG'){
    for(const [k,v] of [['src',src],['alt',alt],['srcset',srcset],['sizes',sizes]])if(node.getAttribute(k)!==v){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}
   }else{
    if(node.innerHTML!==html)node.innerHTML=html;
    if(node.getAttribute('href')!==href){if(href===null)node.removeAttribute('href');else node.setAttribute('href',href)}
   }
  });
 }
 function syncLive(){
  for(const item of model){
   if(item.group!==null||item.added)continue;
   const original=liveSnapshots[item.index],node=original?.node;
   if(!node?.isConnected)continue;
   const shouldHide=!!(item.hidden||item.deleted);
   if(shouldHide){if(node.style.display!=='none')node.style.display='none'}
   else if(node.style.display!==original.display){
    if(original.hadStyle)node.style.display=original.display;
    else{node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style')}
   }
   if(item.deleted)continue;
   if(item.image){
    if(item.src!==item.originalSrc&&validImageURL(item.src)){const url=normalizeURL(item.src);if(node.getAttribute('src')!==url)node.setAttribute('src',url);node.removeAttribute('srcset');node.removeAttribute('sizes')}
    else if(item.src===item.originalSrc){for(const k of ['src','srcset','sizes']){const v=original[k];if(node.getAttribute(k)!==v){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}}}
    if(node.getAttribute('alt')!==item.alt)node.setAttribute('alt',item.alt);
    continue;
   }
   if(item.decorative)continue;
   if(item.text!==item.originalText){
    if(item.article)setArticle(node,item.text);
    else setText(node,item.text);
   }else if(node.innerHTML!==original.html){
    node.innerHTML=original.html;
   }
   if(item.link&&validURL(item.url)){
    const href=normalizeURL(item.url);
    if(node.getAttribute('href')!==href)node.setAttribute('href',href);
   }
  }
  liveRoots.forEach((root,gi)=>{
   const members=model.filter(x=>x.group===gi);
   const baselineMembers=members.filter(x=>!x.added).sort((a,b)=>a.index-b.index);
   const dirty=members.length!==baselineMembers.length||members.some((x,i)=>x.added||x.deleted||x.hidden||x.text!==x.originalText||x.url!==x.originalURL||x.index!==baselineMembers[i]?.index);
   if(!dirty){if(root.innerHTML!==rootSnapshots[gi])root.innerHTML=rootSnapshots[gi];return}
   // Only rebuild this collection when it was actually edited.
   root.innerHTML=rootSnapshots[gi];
   [...root.children].filter(el=>el.matches('a[data-edit]')).forEach(el=>el.remove());
   for(const item of members){
    if(!item.link||item.deleted)continue;
    const node=item.added?document.createElement('a'):liveSnapshots[item.index]?.clone.cloneNode(true);
    if(!node)continue;
    if(item.added)node.setAttribute('data-edit',item.label||'Navigation link');
    if(node.getAttribute('href')!==normalizeURL(item.url))node.setAttribute('href',normalizeURL(item.url)||'#');
    if(item.added||item.text!==item.originalText)setText(node,item.text);
    if(item.hidden)node.style.display='none';
    else if(item.added)node.style.removeProperty('display');
    if(root.lastChild&&root.lastChild.nodeType!==3)root.append(document.createTextNode(' '));
    root.append(node);
   }
  });
  syncSections();saveDraft();
 }
 const icons=()=>{
  // Official Lucide icon artwork bundled locally for offline rendering.
  const paths={
   "pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>",
   "maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/> <path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/> <path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/> <path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/>",
   "minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3\"/> <path d=\"M21 8h-3a2 2 0 0 1-2-2V3\"/> <path d=\"M3 16h3a2 2 0 0 1 2 2v3\"/> <path d=\"M16 21v-3a2 2 0 0 1 2-2h3\"/>",
   "plus":"<path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>",
   "arrow-up":"<path d=\"m5 12 7-7 7 7\"/> <path d=\"M12 19V5\"/>",
   "arrow-down":"<path d=\"M12 5v14\"/> <path d=\"m19 12-7 7-7-7\"/>",
   "rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/> <path d=\"M3 3v5h5\"/>",
   "undo-2":"<path d=\"M9 14 4 9l5-5\"/> <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"/>",
   "eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
   "eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/> <path d=\"m2 2 20 20\"/>",
   "trash-2":"<path d=\"M10 11v6\"/> <path d=\"M14 11v6\"/> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/> <path d=\"M3 6h18\"/> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>"
   ,"x":"<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>"
  };
  document.querySelectorAll('i[data-lucide]').forEach(el=>{
   const path=paths[el.getAttribute('data-lucide')];if(!path)return;
   el.outerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  });
 }
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
 const internalDestinations=()=>Array.from(document.querySelectorAll('[id]'))
  .filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!/^ue-/.test(el.id))
  .map(el=>({id:el.id,label:(el.getAttribute('aria-label')||el.querySelector('h1,h2,h3,h4,h5,h6')?.textContent||el.getAttribute('data-edit')||el.id).trim()}));
 const validLinkTarget=url=>!String(url).trim().startsWith('#')||internalDestinations().some(x=>'#'+x.id===String(url).trim());
 function render(){
  fields.replaceChildren();
  const metaBox=document.createElement('div');metaBox.className='ue-meta';
  const heading=document.createElement('strong');heading.textContent='Page details';metaBox.append(heading);
  for(const [key,title] of [['title','Page title'],['description','Page description']]){
   const label=document.createElement('label');label.textContent=title;
   const input=document.createElement(key==='description'?'textarea':'input');if(key==='title')input.type='text';
   input.value=pageMeta[key]||'';input.setAttribute('aria-label',title);
   input.oninput=()=>{checkpoint();pageMeta[key]=input.value;applyMeta();saveDraft()};
   label.append(input);
   const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+title;reset.setAttribute('aria-label','Reset '+title);
   reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=pageMeta[key]===originalMeta[key];
   reset.onclick=event=>{event.preventDefault();event.stopPropagation();checkpoint();pageMeta[key]=originalMeta[key];applyMeta();render();saveDraft()};
   input.addEventListener('input',()=>{reset.disabled=pageMeta[key]===originalMeta[key]});
   label.style.position='relative';label.style.paddingRight='35px';label.append(reset);metaBox.append(label);
  }
  settingsPanel.replaceChildren(metaBox);
  for(const item of model){
   const box=document.createElement('div');box.className='ue-item';
   const label=document.createElement('label');label.textContent=item.label|| (item.image?'Image':item.link?'Link text':item.tag==='p'?'Paragraph':'Text');
   box.dataset.editIndex=String(model.indexOf(item));
   if(item.deleted){box.classList.add('ue-deleted')}else if(item.hidden){box.classList.add('ue-hidden')}
   if(item.decorative){
    const hint=document.createElement('span');hint.textContent='Divider';hint.style.color='#777';hint.style.fontSize='13px';box.append(hint);
   }else if(item.image){
    const preview=document.createElement('img');preview.className='ue-image-preview';preview.alt='Image preview';
    const updatePreview=()=>{if(validImageURL(item.src)){preview.src=normalizeURL(item.src)}else{preview.removeAttribute('src')}};
    updatePreview();box.append(preview);
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com/photo.jpg';url.value=displayURL(item.src);
    url.oninput=()=>{checkpoint();item.src=url.value;updatePreview();syncLive()};
    label.dataset.ueField='src';label.append(url);box.append(label);
    const altLabel=document.createElement('label');altLabel.textContent='Alt text';
    const altInput=document.createElement('input');altInput.type='text';altInput.value=item.alt;
    altInput.oninput=()=>{checkpoint();item.alt=altInput.value;syncLive()};
    altLabel.dataset.ueField='alt';altLabel.append(altInput);box.append(altLabel);
   }else{
    const input=document.createElement(item.article||item.tag==='p'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';if(item.article)input.classList.add('ue-article');input.value=item.text;input.oninput=()=>{checkpoint();item.text=input.value;if(input.tagName==='TEXTAREA')fitTextarea(input);syncLive()};label.dataset.ueField='text';label.append(input);box.append(label);
   }
   if(item.link){
    const lbl=document.createElement('label');lbl.textContent='Link destination';lbl.dataset.ueField='url';
    const destinations=internalDestinations();
    const selection=document.createElement('select');selection.setAttribute('aria-label','Link destination');
    for(const dest of destinations){
     const option=document.createElement('option');option.value='#'+dest.id;option.textContent=dest.label+' (#'+dest.id+')';selection.append(option);
    }
    const external=document.createElement('option');external.value='__custom__';external.textContent='External URL, email, or other link';selection.append(external);
    const isInternal=String(item.url||'').startsWith('#');
    const available=isInternal&&destinations.some(dest=>'#'+dest.id===item.url);
    if(isInternal&&!available){const option=document.createElement('option');option.value=item.url;option.textContent='Missing section ('+item.url+')';option.disabled=true;selection.prepend(option)}
    selection.value=isInternal?item.url:'__custom__';
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='https://example.com or mailto:name@example.com';url.value=isInternal?'':item.url.replace(/^https:\/\//i,'');
    url.hidden=isInternal;
    selection.onchange=()=>{
     checkpoint();
     if(selection.value==='__custom__'){item.url='';url.value='';url.hidden=false}
     else{item.url=selection.value;url.hidden=true}
     syncLive();render();
    };
    url.oninput=()=>{checkpoint();item.url=url.value;syncLive()};
    lbl.append(selection,url);box.append(lbl);
   }
   const controls=document.createElement('div');controls.className='ue-controls';
   const addControl=(action,icon,fn)=>{
    const button=document.createElement('button');button.type='button';button.title=action;button.setAttribute('aria-label',action+' '+(item.label||item.text||'element'));button.innerHTML='<i data-lucide="'+icon+'"></i>';button.onclick=fn;controls.append(button);
   };
   addControl(item.hidden?'Show':'Hide',item.hidden?'eye-off':'eye',()=>{checkpoint();item.hidden=!item.hidden;render()});
   addControl(item.deleted?'Restore':'Delete',item.deleted?'undo-2':'trash-2',()=>{checkpoint();item.deleted=!item.deleted;render()});
   if(item.group!==null){
    for(const [direction,icon] of [[-1,'arrow-up'],[1,'arrow-down']]){
     addControl(direction<0?'Move up':'Move down',icon,()=>{
      const group=model.filter(x=>x.group===item.group);const index=group.indexOf(item),other=group[index+direction];
      if(!other)return;checkpoint();const a=model.indexOf(item),b=model.indexOf(other);[model[a],model[b]]=[model[b],model[a]];render();
     });
    }
   }
   box.append(controls);
   const resetField=(key,name,original,fn)=>{
    const button=document.createElement('button');button.type='button';button.className='ue-field-reset';button.title='Reset '+name;button.setAttribute('aria-label','Reset '+name);
    button.innerHTML='<i data-lucide="rotate-ccw"></i>';button.disabled=String(item[key]??'')===String(original??'');
    button.onclick=event=>{event.preventDefault();event.stopPropagation();checkpoint();item[key]=original;fn?.();syncLive();render()};
    const target=box.querySelector('[data-ue-field="'+key+'"]');if(target){target.style.position='relative';target.style.paddingRight='35px';target.append(button);const input=target.querySelector('input,textarea,select');if(input)input.addEventListener('input',()=>{button.disabled=String(item[key]??'')===String(original??'')})}
   };
   if(item.image){resetField('src','image URL',item.originalSrc);resetField('alt','alt text',item.originalAlt)}
   else if(!item.decorative)resetField('text','text',item.originalText);
   if(item.link)resetField('url','link destination',item.originalURL);
   fields.append(box);
  }fields.querySelectorAll('textarea').forEach(fitTextarea);icons();syncLive();
 }
 function close(restore=true){if(restore){restoreLive();restoreStyle();restoreMeta();sectionOrder=[...initialSectionOrder];sectionStates={};reorderSections();syncSections()}clearDraft();undoStack=[];syncUndoButton();draftActive=false;initialModel='';screen.hidden=true;pencil.hidden=false;pencil.title='Edit'}
 function copyHTML(){
  const parser=new DOMParser(),doc=parser.parseFromString(baseline,'text/html');
  doc.title=pageMeta.title;
  let description=doc.querySelector('meta[name="description"]');
  if(!description&&pageMeta.description){description=doc.createElement('meta');description.name='description';doc.head.append(description)}
  if(description)description.setAttribute('content',pageMeta.description);
  const source=Array.from(doc.querySelectorAll('[data-edit]')).filter(el=>!el.querySelector('[data-edit]'));
  const originals=model.filter(x=>!x.added);
  if(source.length!==liveSnapshots.length)throw Error('Page structure changed. Reload and try again.');
  for(const item of originals){
   const element=source[item.index];if(!element)throw Error('Editable element missing.');
   if(item.deleted)continue;
   if(item.hidden){element.hidden=true;element.style.display='none'}
   if(item.image){if(!validImageURL(item.src))throw Error('Enter a valid image URL.');if(item.src!==item.originalSrc){element.setAttribute('src',normalizeURL(item.src));element.removeAttribute('srcset');element.removeAttribute('sizes')}element.setAttribute('alt',item.alt);continue}
   if(item.decorative)continue;
   if(item.text!==item.originalText){if(item.article)setArticle(element,item.text);else setText(element,item.text)}
   if(item.link){if(!validURL(item.url.trim())||!validLinkTarget(item.url))throw Error('Select an existing page section or enter a valid URL.');if(item.url!==item.originalURL)element.setAttribute('href',normalizeURL(item.url))}
  }
  // Link collections are opt-in: <nav data-edit="links"><a data-edit ...>...</a></nav>
  const groups=Array.from(doc.querySelectorAll('[data-edit="links"]'));
  groups.forEach((g,gi)=>{
   const members=model.filter(x=>x.group===gi);
   const old=Array.from(g.children).filter(el=>el.matches('a[data-edit]'));
   old.forEach(el=>el.remove());
   for(const item of members){
    if(item.deleted)continue;
    if(!item.link||!validURL(item.url.trim())||!validLinkTarget(item.url))throw Error('Select an existing page section or enter a valid URL.');
    const node=item.added?doc.createElement('a'):source[item.index].cloneNode(true);
    node.setAttribute('data-edit',item.label||'Navigation link');node.setAttribute('href',normalizeURL(item.url));
    node.textContent=item.text;if(item.hidden){node.hidden=true;node.style.display='none'}
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
  for(const item of originals.filter(item=>item.deleted)){
   const element=source[item.index];
   if(element?.isConnected)element.remove();
  }
  for(const [id,state] of Object.entries(sectionStates)){
   const node=exportedById.get(id);if(!node)continue;
   if(state.deleted)node.remove();
   else if(state.hidden){node.hidden=true;node.style.display='none'}
   if(state.label!==undefined&&!state.deleted)node.setAttribute('aria-label',state.label);
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
  liveSnapshots=liveNodes.map(node=>({node,html:node.innerHTML,href:node.getAttribute('href'),src:node.getAttribute('src'),alt:node.getAttribute('alt'),srcset:node.getAttribute('srcset'),sizes:node.getAttribute('sizes'),clone:node.cloneNode(true),display:node.style.display,hadStyle:node.hasAttribute('style')}));
  model=liveNodes.map((el,i)=>{
   const group=el.closest('[data-edit="links"]');
   const article=isArticle(el),image=el.tagName==='IMG',text=article?articleText(el):el.textContent.trim();
   return {index:i,tag:el.tagName.toLowerCase(),article,image,decorative:el.matches('hr'),src:el.getAttribute('src')||'',originalSrc:el.getAttribute('src')||'',alt:el.getAttribute('alt')||'',originalAlt:el.getAttribute('alt')||'',originalURL:el.getAttribute('href')||'',originalText:text,hidden:false,deleted:false,link:el.tagName==='A',label:(el.getAttribute('data-edit')==='links'?'':el.getAttribute('data-edit')||'').trim(),text,url:el.getAttribute('href')||'',group:group?roots.indexOf(group):null};
  });
  draftActive=true;initialModel=JSON.stringify(model);
  originalMeta={...readMeta(),hadDescription:!!document.querySelector('meta[name="description"]')};pageMeta={title:originalMeta.title,description:originalMeta.description};
  styleSettings=readStyle();initialStyle=JSON.stringify(styleSettings);
  sectionNodes=findSections();sectionOrder=sectionNodes.map(n=>n.getAttribute('data-section'));for(const node of sectionNodes)node.dataset.ueInitialLabel=node.getAttribute('aria-label')||'';sectionStates={};sectionDisplays.clear();for(const node of sectionNodes)sectionDisplays.set(node,node.style.display);undoStack=[];revertAvailable=false;syncUndoButton();
  initialSectionOrder=[...sectionOrder];
  const saved=readDraft();
  if(saved&&saved.model.length>=model.length&&saved.model.every((item,i)=>item.added||(model[i]&&item.index===model[i].index&&item.tag===model[i].tag))){
   model=saved.model;
   if(saved.styleSettings&&saved.styleSchema===2)styleSettings={...originalAppearance,...saved.styleSettings};
   if(saved.sectionStates&&typeof saved.sectionStates==='object')sectionStates=saved.sectionStates;
   if(saved.pageMeta&&typeof saved.pageMeta==='object')pageMeta={title:String(saved.pageMeta.title||''),description:String(saved.pageMeta.description||'')};
   if(Array.isArray(saved.sectionOrder)&&saved.sectionOrder.length===sectionOrder.length&&saved.sectionOrder.every(id=>sectionOrder.includes(id)))sectionOrder=[...saved.sectionOrder];
  }
  const lastRevert=readRevert();
  if(lastRevert&&!readDraft()){undoStack=[lastRevert];revertAvailable=true;syncUndoButton()}
  if(JSON.stringify(styleSettings)!==initialStyle)applyStyle();
  if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder))reorderSections();
  syncSections();applyMeta();
  renderStyle();
  pencil.hidden=true;screen.hidden=false;message.textContent='';
  render();setTab(activeTab);
 };
 add.onclick=()=>{checkpoint();const group=model.find(x=>x.link&&x.group!==null)?.group;if(group===undefined)return;model.push({added:true,index:-1,tag:'a',link:true,text:'',url:'',group});render();fields.lastElementChild?.querySelector('input')?.focus()};
 screen.querySelector('#ue-cancel').textContent='Revert';
 screen.querySelector('#ue-cancel').onclick=()=>{saveRevert();close(true)};
 document.addEventListener('pointerdown',event=>{
  if(!draftActive||screen.hidden)return;
  if(screen.contains(event.target)||pencil.contains(event.target))return;
  hideEditor();
 });
 screen.querySelector('#ue-copy').onclick=async()=>{
  try{
   if(model.some(x=>!x.deleted&&x.link&&(!x.text.trim()||!validURL(x.url.trim())||!validLinkTarget(x.url))))throw Error('Every link needs text and a valid destination on this page or a URL.');
   const value=copyHTML();
   if(window.endsSharedCopyText)await window.endsSharedCopyText(value);else await navigator.clipboard.writeText(value);
   const sourceTag=document.getElementById('ends-nav-data');
   if(sourceTag){try{const data=JSON.parse(sourceTag.textContent||'{}');data.source=value;sourceTag.textContent=JSON.stringify(data).replace(/</g,'\\u003c')}catch{}}
   clearRevert();close(false);
  }catch(e){message.textContent=e.message||'Copy failed';}
 };
 // Recover a compatible local draft immediately, including its live preview.
 if(readDraft()){pencil.click();hideEditor()}
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey&&draftActive&&!screen.hidden&&!e.target?.closest?.('input,textarea,[contenteditable]')){
   if(undoStack.length){e.preventDefault();undo()}return;
  }
  if(e.key==='Escape'&&!screen.hidden){hideEditor();return}
  if(e.key.toLowerCase()!=='e'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||!screen.hidden)return;
  const target=e.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'))return;
  e.preventDefault();pencil.click();
 });icons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
