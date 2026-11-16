import {setText,articleText,isArticle,setArticle,drawSections,drawContent,restoreEditedDOM,syncEditedDOM} from './content.js';
import {clamp,safeColor,rgbToHex,hexColor,varLabel,drawDesign,buildStyleSheet,inspectStyle,findStyleVariables,inspectButtons,drawButtonPreview,drawButtonPreviews} from './design.js';
import {pageSignature,draftCompatible,readJSON,writeJSON,removeStorage,pushHistory,popHistory} from './storage.js';
import {generateHTML} from './export.js';
/* Main editor orchestration. Feature modules are extracted incrementally below. */
/* HTML Editor v1 — standalone, dependency-free.
   Source: extracted from Dino → Shared!B22; this copy does not modify live.ends.at.
   Include with <script src="editor.js" defer></script> in any editable HTML page. */
export function startEditor(){
 if(window.__universalEditReady)return;
 window.__universalEditReady=true;

function init(){
 const selector='[data-edit]';
 function editable(){return Array.from(document.querySelectorAll(selector)).filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!el.querySelector(selector));}
 if(!editable().length)return;
 const pencil=document.createElement('button');pencil.id='ue-pencil';pencil.type='button';pencil.title='Edit';pencil.setAttribute('aria-label','Edit page');pencil.innerHTML='<i data-lucide="pencil"></i>';
 const screen=document.createElement('section');screen.id='ue-screen';screen.hidden=true;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Edit page');
 screen.innerHTML='<div id="ue-resize" aria-hidden="true"></div><div id="ue-resize-right" aria-hidden="true"></div><div id="ue-wrap"><div id="ue-head"><span id="ue-heading"><strong>Edit page</strong></span><div id="ue-more-wrap"><button id="ue-more" type="button" aria-label="More options" title="More options" aria-haspopup="true" aria-expanded="false"><i data-lucide="ellipsis"></i></button><div id="ue-more-menu" role="menu" hidden><button id="ue-dock-left" type="button" role="menuitem" title="Dock left (Shift + Left Arrow)"><i data-lucide="arrow-left"></i><span>Move left</span></button><button id="ue-dock-right" type="button" role="menuitem" title="Dock right (Shift + Right Arrow)"><i data-lucide="arrow-right"></i><span>Move right</span></button><a id="ue-new-page" role="menuitem" href="https://built.at/editor" target="_blank" rel="noopener noreferrer"><i data-lucide="file-plus-2"></i><span>New page</span></a><button id="ue-fullscreen" type="button" role="menuitem"><i data-lucide="maximize"></i><span>Full screen</span></button><button id="ue-revert" type="button" role="menuitem"><i data-lucide="rotate-ccw"></i><span>Revert changes</span></button></div></div></div><div id="ue-searchbar"><input id="ue-search" type="search" placeholder="Search" aria-label="Search content, design, and settings"><button type="button" id="ue-search-clear" aria-label="Clear search" title="Clear search" hidden><i data-lucide="x"></i></button></div><div id="ue-tabs" role="tablist" aria-label="Editor tabs"><button type="button" data-tab="content" aria-selected="true"><i data-lucide="square-text"></i>Content</button><button type="button" data-tab="design" aria-selected="false"><i data-lucide="palette"></i>Design</button><button type="button" data-tab="settings" aria-selected="false"><i data-lucide="settings-2"></i>Settings</button></div><div id="ue-body"><div id="ue-results" hidden></div><div id="ue-content"><button id="ue-sections-toggle" type="button" aria-expanded="false">Sections <span><i data-lucide="chevron-down"></i> Show</span></button><div id="ue-sections" hidden></div><div id="ue-fields"></div><button id="ue-add" type="button" hidden><i data-lucide="plus"></i> Add link</button></div><div id="ue-style-panel" hidden></div><div id="ue-settings" hidden></div><p id="ue-message" role="status"></p></div><div id="ue-actions"><button id="ue-cancel" type="button">Close</button><button type="button" id="ue-undo" title="Undo last change" aria-label="Undo last change" disabled><i data-lucide="undo-2"></i></button><div id="ue-copy-wrap"><button id="ue-copy" type="button">Copy</button><button id="ue-copy-toggle" type="button" aria-label="Copy options" title="Copy options" aria-haspopup="true" aria-expanded="false"><i data-lucide="chevron-down"></i></button><div id="ue-copy-menu" role="menu" hidden><button id="ue-copy-json" type="button" role="menuitem">Copy JSON</button></div></div></div></div>';
 document.body.append(pencil,screen);
 const fields=screen.querySelector('#ue-fields'),add=screen.querySelector('#ue-add'),message=screen.querySelector('#ue-message');
 const fullscreenButton=screen.querySelector('#ue-fullscreen');
 const moreButton=screen.querySelector('#ue-more'),moreMenu=screen.querySelector('#ue-more-menu');
 const toggleMore=show=>{moreMenu.hidden=!show;moreButton.setAttribute('aria-expanded',String(show))};
 moreButton.onclick=()=>toggleMore(moreMenu.hidden);
 screen.querySelector("#ue-new-page").onclick=()=>toggleMore(false);
 document.addEventListener('pointerdown',event=>{if(!moreMenu.hidden&&!event.target.closest('#ue-more-wrap'))toggleMore(false)});
 const resizeHandle=screen.querySelector('#ue-resize');
 const rightResizeHandle=screen.querySelector('#ue-resize-right');
 const dockLeftButton=screen.querySelector('#ue-dock-left'),dockRightButton=screen.querySelector('#ue-dock-right');
 const widthKey='html-editor:panel-width:v1',sideKey='html-editor:panel-side:v1';
 const desktop=()=>window.innerWidth>640;
 const widthClamp=value=>Math.round(Math.max(320,Math.min(Number(value)||430,Math.min(850,window.innerWidth-24))));
 let panelWidth=430,dockSide='right';
 try{
  const saved=Number(localStorage.getItem(widthKey));
  if(saved>=320)panelWidth=saved;
  const side=localStorage.getItem(sideKey);
  if(side==='left'||side==='right')dockSide=side;
 }catch{}
 const setGeometry=()=>{
  screen.classList.toggle('ue-dock-left',dockSide==='left');
  screen.classList.toggle('ue-dock-right',dockSide==='right');
  dockLeftButton.disabled=dockSide==='left';
  dockRightButton.disabled=dockSide==='right';
  if(!desktop()||screen.classList.contains('ue-fullscreen'))return;
  panelWidth=widthClamp(panelWidth);
  screen.style.setProperty('--ue-panel-width',panelWidth+'px');
  screen.style.left=dockSide==='left'?'0px':(window.innerWidth-panelWidth)+'px';
  screen.style.right='auto';
 };
 const rememberGeometry=()=>{
  try{localStorage.setItem(widthKey,String(panelWidth));localStorage.setItem(sideKey,dockSide)}catch{}
 };
 const dock=side=>{
  if(side!==dockSide&&desktop()&&!screen.classList.contains('ue-fullscreen')){
   dockSide=side;setGeometry();rememberGeometry();
  }
 };
 dockLeftButton.onclick=()=>{dock('left');toggleMore(false)};
 dockRightButton.onclick=()=>{dock('right');toggleMore(false)};
 setGeometry();
 // Drag the heading toward either side to dock the panel there.
 const dragHandle=screen.querySelector('#ue-heading');
 let dragStart=null;
 dragHandle.addEventListener('pointerdown',event=>{
  if(event.button!==0||!desktop()||screen.classList.contains('ue-fullscreen'))return;
  dragStart={id:event.pointerId,x:event.clientX,y:event.clientY};
  dragHandle.setPointerCapture(event.pointerId);
 });
 dragHandle.addEventListener('pointerup',event=>{
  if(!dragStart||event.pointerId!==dragStart.id)return;
  const moved=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y)>35;
  if(moved)dock(event.clientX<window.innerWidth/2?'left':'right');
  dragStart=null;
 });
 dragHandle.addEventListener('pointercancel',()=>{dragStart=null});
 // Only the edge facing the website is resizable.
 const beginResize=(handle,edge)=>{
  let start=null;
  handle.addEventListener('pointerdown',event=>{
   if(event.button!==0||!desktop()||screen.classList.contains('ue-fullscreen')||dockSide!==edge)return;
   start={x:event.clientX,width:screen.getBoundingClientRect().width};
   handle.setPointerCapture(event.pointerId);event.preventDefault();
  });
  handle.addEventListener('pointermove',event=>{
   if(!start)return;
   const dx=event.clientX-start.x;
   panelWidth=widthClamp(start.width+(edge==='left'?dx:-dx));
   setGeometry();
  });
  const finish=()=>{if(!start)return;start=null;rememberGeometry()};
  handle.addEventListener('pointerup',finish);
  handle.addEventListener('pointercancel',finish);
 };
 beginResize(resizeHandle,'right');
 beginResize(rightResizeHandle,'left');
 window.addEventListener('resize',()=>{
  if(desktop())setGeometry();
  else{screen.style.removeProperty('left');screen.style.removeProperty('right')}
 });
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
  const label=sectionsToggle.querySelector('span');
  label.textContent=open?'Hide':'Show';
  const chevron=document.createElement('i');chevron.dataset.lucide='chevron-down';label.prepend(chevron);
  icons();
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
   if(item.deleted)return;
   if([item.label,item.text,item.url,item.alt,item.src].some(v=>String(v||'').toLocaleLowerCase().includes(q)))matches.push({tab:'content',label:item.label||item.text||'Content field',detail:(item.text||item.url||'').slice(0,120),index});
  });
  sectionOrder.forEach((id,index)=>{
   if(sectionStates[id]?.deleted)return;
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id),label=sectionStates[id]?.label||node?.getAttribute('aria-label')||id;
   if((label+' '+id+' section').toLocaleLowerCase().includes(q))matches.push({tab:'content',label:label+' section',detail:'Section controls',sectionId:id});
  });
  const genericLabels=designLabels.filter((_,index)=>!Object.keys(originalVariables).length||![0,1,2,8,9,10].includes(index));
  genericLabels.forEach((label,index)=>{if((label+' design style').toLocaleLowerCase().includes(q))matches.push({tab:'design',label,detail:'Design',design:index})});
  Object.entries(buttonAppearance).forEach(([index,info])=>{
   const item=model.find(x=>!x.added&&x.index===Number(index));
   if(!item||item.deleted)return;
   const visibleText=(item.text||'').replace(/\s+/g,' ').trim();
   if((info.label+' '+visibleText+' button background text color').toLocaleLowerCase().includes(q))matches.push({tab:'design',label:visibleText||info.label,detail:info.label,buttonDesign:index});
  });
  Object.keys(originalVariables).forEach((name,index)=>{const label=varLabel(name);if((label+' '+name+' design color size').toLocaleLowerCase().includes(q))matches.push({tab:'design',label,detail:'Website color or size',customDesign:name})});
  [['Page title',0],['Page description',1]].forEach(([label,index])=>{if((label+' '+String(index?pageMeta.description:pageMeta.title)+' SEO settings').toLocaleLowerCase().includes(q))matches.push({tab:'settings',label,detail:'Settings',setting:index})});
  for(const hit of matches){
   const button=document.createElement('button');button.type='button';
   const title=document.createElement('strong');title.textContent=hit.label;
   const detail=document.createElement('small');detail.textContent=hit.detail||hit.tab;button.append(title,detail);
   button.onclick=()=>{
    setTab(hit.tab);
    if(hit.sectionId!==undefined){setSectionsOpen(true);const input=Array.from(sectionsPanel.querySelectorAll('.ue-section-row')).find(row=>row.dataset.sectionId===hit.sectionId)?.querySelector('input');input?.scrollIntoView({block:'center',behavior:'instant'});input?.focus({preventScroll:true})}
    else if(hit.index!==undefined){const row=fields.querySelector('.ue-item[data-edit-index="'+hit.index+'"]');row?.scrollIntoView({block:'center',behavior:'instant'});const input=row?.querySelector('input,textarea,select');input?.focus({preventScroll:true});input?.dispatchEvent(new Event('focusin',{bubbles:true}))}
    else if(hit.design!==undefined){const row=stylePanel.children[hit.design];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input,select')?.focus({preventScroll:true})}
    else if(hit.customDesign!==undefined){const keys=Object.keys(originalVariables);const row=stylePanel.querySelectorAll('.ue-setting')[genericLabels.length+keys.indexOf(hit.customDesign)];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input')?.focus({preventScroll:true})}
    else if(hit.buttonDesign!==undefined){const block=stylePanel.querySelector('[data-ue-button-block="'+hit.buttonDesign+'"]');if(block){block.open=true;expandedButtonControls.add(String(hit.buttonDesign));block.scrollIntoView({block:'center',behavior:'instant'});block.querySelector('.ue-setting input')?.focus({preventScroll:true})}}
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
  if(!on)setGeometry();
  fullscreenButton.setAttribute('aria-label',on?'Exit fullscreen':'Expand editor');
  fullscreenButton.title=on?'Exit full screen':'Full screen';
  fullscreenButton.innerHTML='<i data-lucide="'+(on?'minimize':'maximize')+'"></i><span>'+(on?'Exit full screen':'Full screen')+'</span>';
  icons();
 }
 fullscreenButton.onclick=()=>{toggleMore(false);setFullscreen(!screen.classList.contains('ue-fullscreen'));requestAnimationFrame(()=>fields.querySelectorAll('textarea').forEach(fitTextarea))};
 let model=[],baseline='',liveNodes=[],liveSnapshots=[],liveRoots=[],rootSnapshots=[];
 let draftActive=false,initialModel='',styleSettings={},initialStyle='',variableSettings={},initialVariables='',buttonSettings={},buttonAppearance={},initialButtons='',sectionOrder=[],initialSectionOrder=[],sectionNodes=[];
 let sectionStates={},undoStack=[],pageMeta={},originalMeta={},revertAvailable=false;
 const sectionDisplays=new Map(),sectionLabels=new Map(),sectionStyleAttrs=new Map();
 const touchedNodes=new Set(),touchedRoots=new Set();
 const expandedButtonControls=new Set();
 const snapshot=()=>JSON.stringify({model,styleSettings,variableSettings,buttonSettings,sectionOrder,sectionStates,pageMeta});
 const revertKey=()=>draftKey+':last-revert';
 const readRevert=()=>{const x=readJSON(revertKey());return x?.signature===originalSignature&&typeof x.snapshot==='string'?x.snapshot:null};
 const clearRevert=()=>{revertAvailable=false;removeStorage(revertKey())};
 const saveRevert=()=>{
  if(!hasChanges())return;
  const state=snapshot();
  revertAvailable=true;
  writeJSON(revertKey(),{signature:originalSignature,snapshot:state});
 };

 const checkpoint=()=>{if(revertAvailable)clearRevert();pushHistory(undoStack,snapshot());syncUndoButton()};
 const syncUndoButton=()=>{const b=screen.querySelector('#ue-undo');if(b)b.disabled=!undoStack.length};
 function undo(){if(!undoStack.length)return;const old=popHistory(undoStack);if(revertAvailable)clearRevert();model=old.model;styleSettings=old.styleSettings;variableSettings=old.variableSettings||Object.fromEntries(Object.entries(originalVariables).map(([name,config])=>[name,config.value]));buttonSettings=old.buttonSettings||{};sectionOrder=old.sectionOrder;sectionStates=old.sectionStates||{};pageMeta=old.pageMeta||{...originalMeta};applyMeta();restoreLive();reorderSections();syncLive();applyStyle();renderStyle();renderSections();render();syncUndoButton()}
 function syncSections(){
  for(const node of sectionNodes){
   const state=sectionStates[node.getAttribute('data-section')]||{};
   const originalDisplay=sectionDisplays.get(node)||'';
   const targetDisplay=state.hidden||state.deleted?'none':originalDisplay;
   if(node.style.display!==targetDisplay){
    if(targetDisplay==='none')node.style.display='none';
    else if(sectionStyleAttrs.get(node)===null){
     node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style');
    }else node.style.display=originalDisplay;
   }
   const originalLabel=sectionLabels.get(node);
   const targetLabel=state.label!==undefined?state.label:originalLabel;
   if(node.getAttribute('aria-label')!==targetLabel){
    if(targetLabel===null)node.removeAttribute('aria-label');
    else node.setAttribute('aria-label',targetLabel);
   }
  }
 }

 const styleDefaults={background:'#ffffff',text:'#171717',accent:'#2563eb',font:'system-ui',h1:40,h2:30,h3:24,p:16,radius:8,buttonBackground:'#171717',buttonText:'#ffffff'};
 const styleFonts={'system-ui':'system-ui, sans-serif','Arial':'Arial, sans-serif','Georgia':'Georgia, serif','Times New Roman':'"Times New Roman", serif','Verdana':'Verdana, sans-serif','Trebuchet MS':'"Trebuchet MS", sans-serif','Courier New':'"Courier New", monospace','Manrope':'Manrope, system-ui, sans-serif','Inter':'Inter, system-ui, sans-serif'};
 const pageColor=(el,prop,fallback)=>rgbToHex(el?getComputedStyle(el)[prop]:'')||fallback;
 const pageButton=()=>document.querySelector('main .button,main .btn,main button,main [role="button"],main nav[data-edit="links"] a')||document.querySelector('body .button,body .btn');
 function readStyle(){return inspectStyle({styleDefaults,styleFonts,pageColor,pageButton,readStyle})}
 // Discover author-defined :root variables without touching the website stylesheet.
 const discoverVariables=()=>findStyleVariables({discoverVariables,hexColor});
 const originalVariables=discoverVariables();
 const originalVariableOverrides=new Set();
 try{
  const previous=document.getElementById('editor-page-style')?.sheet?.cssRules;
  if(previous)for(const rule of previous){
   if(rule.selectorText!==':root')continue;
   for(const name of rule.style)if(Object.hasOwn(originalVariables,name))originalVariableOverrides.add(name);
  }
 }catch{}
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
 const editableButtonSelector=node=>{
  const tag=node.tagName.toLowerCase(),label=node.getAttribute('data-edit');
  if(!label)return '';
  const escape=window.CSS?.escape;
  if(typeof escape!=='function')return '';
  const own=tag+'[data-edit='+escape(label)+']';
  if(document.querySelectorAll(own).length===1)return own;
  const section=node.closest('[data-section]');
  if(section){
   const scoped='[data-section='+escape(section.getAttribute('data-section'))+'] '+own;
   if(document.querySelectorAll(scoped).length===1)return scoped;
  }
  return '';
 };
 const getButtonAppearance=()=>inspectButtons({selector,liveSnapshots,editableButtonSelector,getButtonAppearance,rgbToHex});
 const refreshButtonSample=(sample,index)=>drawButtonPreview({model,liveSnapshots,buttonAppearance,refreshButtonSample,sample,index});
 const refreshButtonSamples=()=>drawButtonPreviews({stylePanel,model,refreshButtonSample,refreshButtonSamples});
 const styleSheetText=a=>buildStyleSheet({selector,pencil,screen,variableSettings,buttonSettings,buttonAppearance,styleDefaults,styleFonts,originalVariables,originalVariableOverrides,originalAppearance,originalOverrides,styleSheetText,clamp,safeColor,hexColor,a});
 const applyStyle=()=>{
  let el=document.getElementById('editor-page-style');
  if(!el){el=document.createElement('style');el.id='editor-page-style';document.head.append(el)}
  el.textContent=styleSheetText(styleSettings);
  refreshButtonSamples();
 };
 const restoreStyle=()=>{
  const el=document.getElementById('editor-page-style');
  if(originalPageStyle===null)el?.remove();
  else if(el){if(el.textContent!==originalPageStyle)el.textContent=originalPageStyle}
  else{const node=document.createElement('style');node.id='editor-page-style';node.textContent=originalPageStyle;document.head.append(node)}
 };
 const originalPageStyle=document.getElementById('editor-page-style')?.textContent??null;
 function renderStyle(){return drawDesign({screen,add,stylePanel,model,liveSnapshots,styleSettings,variableSettings,buttonSettings,buttonAppearance,expandedButtonControls,checkpoint,styleFonts,originalVariables,originalAppearance,refreshButtonSample,applyStyle,renderStyle,saveDraft,hideEditor,icons,clamp,hexColor,varLabel})}
 function findSections(root=document){
  return Array.from(root.querySelectorAll('[data-section]')).filter(el=>!el.parentElement?.closest('[data-section]')&&!el.closest('#ue-screen'));
 }
 function reorderSections(order=sectionOrder){
  if(!sectionNodes.length)return;
  const byId=new Map(sectionNodes.map(n=>[n.getAttribute('data-section'),n]));
  const parents=[...new Set(sectionNodes.map(n=>n.parentElement).filter(Boolean))];
  for(const parent of parents){
   const actual=Array.from(parent.children).filter(n=>sectionNodes.includes(n));
   const desired=order.map(id=>byId.get(id)).filter(n=>n?.parentElement===parent);
   // Avoid moving existing DOM nodes unless their order genuinely changed.
   if(actual.length!==desired.length||actual.every((n,i)=>n===desired[i]))continue;
   const after=actual[actual.length-1]?.nextSibling||null;
   for(const node of desired)parent.insertBefore(node,after);
  }
 }
 function renderSections(){return drawSections({screen,sectionsPanel,sectionOrder,sectionNodes,sectionStates,checkpoint,syncSections,reorderSections,renderSections,saveDraft,hideEditor,icons})}
 // Drafts are scoped to each URL and to the exact underlying HTML/CSS version.
 const draftKey='html-editor:draft:v1:'+location.href.split('#')[0];
 const originalSignature=pageSignature();
 // Match drafts by editable element identity, not volatile rendered CSS or document title.
 // Preserve older drafts whose original signature changed but whose fields still match.
 const readDraft=()=>{const x=readJSON(draftKey);return x&&Array.isArray(x.model)?x:null};
 const clearDraft=()=>removeStorage(draftKey);
 const saveDraft=()=>{
  if(hasChanges())writeJSON(draftKey,{signature:originalSignature,model,styleSettings,variableSettings,buttonSettings,sectionOrder,sectionStates,pageMeta,styleSchema:2});
  else clearDraft();
 };
 const readMeta=()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content')||''});
 const applyMeta=()=>{
  const title=pageMeta.title||'';
  if(document.title!==title)document.title=title;
  let meta=document.querySelector('meta[name="description"]');
  if(!meta&&pageMeta.description){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}
  if(meta&&meta.getAttribute('content')!==(pageMeta.description||''))meta.setAttribute('content',pageMeta.description||'');
 };
 const restoreMeta=()=>{pageMeta={...originalMeta};applyMeta();if(!originalMeta.hadDescription)document.querySelector('meta[name="description"]')?.remove()};
 const hasChanges=()=>draftActive&&(JSON.stringify(model)!==initialModel||JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(variableSettings)!==initialVariables||JSON.stringify(buttonSettings)!==initialButtons||JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder)||Object.values(sectionStates).some(x=>x.hidden||x.deleted)||(pageMeta.title!==originalMeta.title||pageMeta.description!==originalMeta.description));
 function hideEditor(){if(!draftActive||screen.hidden)return;screen.hidden=true;pencil.hidden=false;pencil.title=hasChanges()?'Resume editing (unsaved changes)':'Resume editing'}

 // Change only the necessary text nodes. Never flatten formatted descendants.
 function restoreLive(){return restoreEditedDOM({liveSnapshots,liveRoots,rootSnapshots,touchedNodes,touchedRoots,restoreLive})}
 const groupChanged=members=>{
  const originals=members.filter(x=>!x.added).slice().sort((a,b)=>a.index-b.index);
  return members.length!==originals.length||members.some((x,i)=>x.added||x.deleted||x.hidden||x.text!==x.originalText||x.url!==x.originalURL||x.index!==originals[i]?.index);
 };
 function syncLive(){return syncEditedDOM({add,model,liveSnapshots,liveRoots,rootSnapshots,touchedNodes,touchedRoots,syncSections,refreshButtonSamples,saveDraft,groupChanged,syncLive,normalizeURL,validImageURL,setText,setArticle})}
 const icons=()=>{
  // Official Lucide icon artwork bundled locally for offline rendering.
  const paths={
   "ellipsis":"<circle cx=\"5\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/>",
   "file-plus-2":"<path d=\"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4\"/><path d=\"M14 2v6h6\"/><path d=\"M3 15h6\"/><path d=\"M6 12v6\"/>",
   "pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>",
   "maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/> <path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/> <path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/> <path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/>",
   "minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3\"/> <path d=\"M21 8h-3a2 2 0 0 1-2-2V3\"/> <path d=\"M3 16h3a2 2 0 0 1 2 2v3\"/> <path d=\"M16 21v-3a2 2 0 0 1 2-2h3\"/>",
   "plus":"<path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>",
   "arrow-left":"<path d=\"m12 19-7-7 7-7\"/> <path d=\"M19 12H5\"/>",
   "arrow-right":"<path d=\"M5 12h14\"/> <path d=\"m12 5 7 7-7 7\"/>",
   "arrow-up":"<path d=\"m5 12 7-7 7 7\"/> <path d=\"M12 19V5\"/>",
   "arrow-down":"<path d=\"M12 5v14\"/> <path d=\"m19 12-7 7-7-7\"/>",
   "rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/> <path d=\"M3 3v5h5\"/>",
   "undo-2":"<path d=\"M9 14 4 9l5-5\"/> <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"/>",
   "eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
   "eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/> <path d=\"m2 2 20 20\"/>",
   "trash-2":"<path d=\"M10 11v6\"/> <path d=\"M14 11v6\"/> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/> <path d=\"M3 6h18\"/> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>"
   ,"x":"<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>"
   ,"square-text":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/> <path d=\"M7 8h8\"/> <path d=\"M7 12h10\"/> <path d=\"M7 16h6\"/>"
   ,"file-text":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/> <path d=\"M14 2v5a1 1 0 0 0 1 1h5\"/> <path d=\"M10 9H8\"/> <path d=\"M16 13H8\"/> <path d=\"M16 17H8\"/>"
   ,"palette":"<path d=\"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z\"/> <circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>"
   ,"settings-2":"<path d=\"M14 17H5\"/> <path d=\"M19 7h-9\"/> <circle cx=\"17\" cy=\"17\" r=\"3\"/> <circle cx=\"7\" cy=\"7\" r=\"3\"/>"
   ,"arrow-up-right":"<path d=\"M7 7h10v10\"/> <path d=\"M7 17 17 7\"/>"
   ,"chevron-down":"<path d=\"m6 9 6 6 6-6\"/>"
   ,"grip-horizontal":"<circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"
   ,"grip-vertical":"<circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"
  };
  [...screen.querySelectorAll('i[data-lucide]'),...pencil.querySelectorAll('i[data-lucide]')].forEach(el=>{
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
 function render(){return drawContent({fields,add,settingsPanel,model,pageMeta,originalMeta,checkpoint,saveDraft,applyMeta,syncLive,icons,normalizeURL,validImageURL,displayURL,fitTextarea,internalDestinations,render})}
 function close(restore=true){if(restore){if(hasChanges()){restoreLive();restoreStyle();restoreMeta();if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder)){sectionOrder=[...initialSectionOrder];reorderSections()}sectionStates={};syncSections()}}clearDraft();undoStack=[];syncUndoButton();draftActive=false;initialModel='';screen.hidden=true;pencil.hidden=false;pencil.title='Edit'}
 function copyHTML(){return generateHTML({baseline,pageMeta,liveSnapshots,model,validImageURL,normalizeURL,setArticle,setText,validURL,validLinkTarget,groupChanged,sectionOrder,initialSectionOrder,sectionStates,styleSettings,initialStyle,variableSettings,initialVariables,buttonSettings,initialButtons,styleSheetText})}
 pencil.onclick=()=>{
  if(draftActive){screen.hidden=false;pencil.hidden=true;return}
  const sourceTag=document.getElementById('ends-nav-data');
  let sourceHTML;
  try{sourceHTML=JSON.parse(sourceTag?.textContent||'{}').source}catch{}
  if(typeof sourceHTML!=='string'||!sourceHTML.trim()){
   sourceHTML='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  }
  baseline=sourceHTML;
  touchedNodes.clear();touchedRoots.clear();
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
  variableSettings=Object.fromEntries(Object.entries(originalVariables).map(([name,config])=>[name,config.value]));initialVariables=JSON.stringify(variableSettings);
  buttonAppearance=getButtonAppearance();buttonSettings={};initialButtons=JSON.stringify(buttonSettings);
  sectionNodes=findSections();sectionOrder=sectionNodes.map(n=>n.getAttribute('data-section'));
  sectionStates={};sectionDisplays.clear();sectionLabels.clear();sectionStyleAttrs.clear();
  for(const node of sectionNodes){
   sectionDisplays.set(node,node.style.display);
   sectionLabels.set(node,node.getAttribute('aria-label'));
   sectionStyleAttrs.set(node,node.getAttribute('style'));
  }
  undoStack=[];revertAvailable=false;syncUndoButton();
  initialSectionOrder=[...sectionOrder];
  const saved=readDraft();
  if(draftCompatible(saved,model)){
   model=saved.model;
   if(saved.styleSettings&&saved.styleSchema===2)styleSettings={...originalAppearance,...saved.styleSettings};
   if(saved.buttonSettings&&typeof saved.buttonSettings==='object')for(const [index,settings] of Object.entries(saved.buttonSettings)){
    if(!Object.hasOwn(buttonAppearance,index)||!settings||typeof settings!=='object')continue;
    for(const key of ['background','color']){
     if(hexColor(settings[key]))buttonSettings[index]={...(buttonSettings[index]||{}),[key]:settings[key]};
    }
   }
   if(saved.variableSettings&&typeof saved.variableSettings==='object')for(const name of Object.keys(originalVariables)){
    const val=saved.variableSettings[name];if(typeof val==='string'&&(originalVariables[name].kind==='color'?!!hexColor(val):/^-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(val)))variableSettings[name]=val;
   }
   if(saved.sectionStates&&typeof saved.sectionStates==='object')sectionStates=saved.sectionStates;
   if(saved.pageMeta&&typeof saved.pageMeta==='object')pageMeta={title:String(saved.pageMeta.title||''),description:String(saved.pageMeta.description||'')};
   if(Array.isArray(saved.sectionOrder)&&saved.sectionOrder.length===sectionOrder.length&&saved.sectionOrder.every(id=>sectionOrder.includes(id)))sectionOrder=[...saved.sectionOrder];
  }
  const lastRevert=readRevert();
  if(lastRevert&&!readDraft()){undoStack=[lastRevert];revertAvailable=true;syncUndoButton()}
  if(JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(variableSettings)!==initialVariables||JSON.stringify(buttonSettings)!==initialButtons)applyStyle();
  if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder))reorderSections();
  syncSections();applyMeta();
  renderStyle();
  pencil.hidden=true;screen.hidden=false;message.textContent='';
  render();setTab(activeTab);
 };
 add.onclick=()=>{checkpoint();const group=model.find(x=>x.link&&x.group!==null)?.group;if(group===undefined)return;model.push({added:true,index:-1,tag:'a',link:true,text:'',url:'',group});render();fields.lastElementChild?.querySelector('input')?.focus()};
 screen.querySelector('#ue-cancel').onclick=()=>hideEditor();
 screen.querySelector('#ue-revert').onclick=()=>{toggleMore(false);close(true);clearRevert()};
 document.addEventListener('pointerdown',event=>{
  if(!draftActive||screen.hidden)return;
  if(screen.contains(event.target)||pencil.contains(event.target))return;
  hideEditor();
 });
 const copyToggle=screen.querySelector('#ue-copy-toggle'),copyMenu=screen.querySelector('#ue-copy-menu');
 const toggleCopyMenu=show=>{copyMenu.hidden=!show;copyToggle.setAttribute('aria-expanded',String(show))};
 copyToggle.onclick=()=>toggleCopyMenu(copyMenu.hidden);
 document.addEventListener('pointerdown',event=>{if(!copyMenu.hidden&&!event.target.closest('#ue-copy-wrap'))toggleCopyMenu(false)});
 const copyPage=async(format)=>{
  toggleCopyMenu(false);
  try{
   if(model.some(x=>!x.deleted&&x.link&&(!x.text.trim()||!validURL(x.url.trim())||!validLinkTarget(x.url))))throw Error('Every link needs text and a valid destination on this page or a URL.');
   const html=copyHTML();
   const value=format==='json'?JSON.stringify({html},null,2):html;
   if(window.endsSharedCopyText)await window.endsSharedCopyText(value);else await navigator.clipboard.writeText(value);
   if(format==='html'){
    const sourceTag=document.getElementById('ends-nav-data');
    if(sourceTag){try{const data=JSON.parse(sourceTag.textContent||'{}');data.source=html;sourceTag.textContent=JSON.stringify(data).replace(/</g,'\\u003c')}catch{}}
   }
   saveDraft();hideEditor();
  }catch(e){message.textContent=e.message||'Copy failed';}
 };
 screen.querySelector('#ue-copy').onclick=()=>copyPage('html');
 screen.querySelector('#ue-copy-json').onclick=()=>copyPage('json');
 // Recover a compatible local draft immediately, including its live preview.
 if(readDraft()){
  // Initialize from the unedited document first, then apply the saved model to
  // the live page. Do not discard a draft merely because its style changed.
  pencil.click();hideEditor();
 }
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey&&draftActive&&!screen.hidden&&!e.target?.closest?.('input,textarea,[contenteditable]')){
   if(undoStack.length){e.preventDefault();undo()}return;
  }
  if(e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!screen.hidden&&desktop()&&!screen.classList.contains('ue-fullscreen')&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){
   const typing=e.target?.isContentEditable||e.target?.closest?.('input,textarea,select,[contenteditable],[role="textbox"]');
   if(!typing){e.preventDefault();dock(e.key==='ArrowLeft'?'left':'right');return}
  }
  if(e.key==='Escape'&&!screen.hidden){if(!moreMenu.hidden){toggleMore(false);moreButton.focus()}else hideEditor();return}
  const typing=e.target?.isContentEditable||e.target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]');
  if(e.key==='/'&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!typing&&!screen.hidden){
   e.preventDefault();searchInput.focus();searchInput.select();return;
  }
  if(e.key.toLowerCase()!=='e'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||!screen.hidden)return;
  const target=e.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'))return;
  e.preventDefault();pencil.click();
 });icons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
