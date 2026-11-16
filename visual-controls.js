/* Targeted, responsive visual adjustments. Layout stays in the page HTML. */
import {stableFieldIds,groupId} from './json-schema.js';

const textTags=new Set(['h1','h2','h3','h4','h5','h6','p','span','div','li','strong','small','a','button','label']);
const safeId=id=>String(id).replace(/[^a-zA-Z0-9_.-]/g,'-');
export const visualRanges={
 fontSize:{label:'Font size',unit:'px',min:8,max:120,property:'font-size'},
 opacity:{label:'Opacity',unit:'%',min:0,max:100,property:'opacity'},
 radius:{label:'Roundness',unit:'px',min:0,max:100,property:'border-radius'},
 padding:{label:'Padding',unit:'px',min:0,max:120,property:'padding'},
 gap:{label:'Gap',unit:'px',min:0,max:120,property:'gap'}
};
export const withinRange=(key,value)=>Object.hasOwn(visualRanges,key)&&typeof value==='number'&&Number.isFinite(value)&&value>=visualRanges[key].min&&value<=visualRanges[key].max;
export function visualTargets({model,liveSnapshots,sectionNodes,liveRoots,root=document}){
 const ids=stableFieldIds(model,liveSnapshots);
 const targets=[];
 for(const item of model.filter(x=>!x.added&&!x.deleted)){
  const node=liveSnapshots[item.index]?.node;
  if(!node)continue;
  const button=node.matches('button,a.button,a.btn,a[role="button"],[data-button-role],.site-links a,.contact-links a');
  const text=textTags.has(item.tag)||item.article;
  const controls=[
   ...(text?['fontSize']:[]),
   ...((item.image||button)?['opacity','radius']:[]),
   ...(button?['padding']:[])
  ];
  if(controls.length)targets.push({id:ids.get(item.index),node,kind:'field',label:item.label||item.tag,controls});
 }
 for(const node of sectionNodes){
  const id=node.getAttribute('data-section');
  if(id)targets.push({id:'section.'+safeId(id),node,kind:'section',label:'Section: '+(node.getAttribute('aria-label')||id),controls:['opacity','radius','padding']});
 }
 // Flex/grid collections and visual containers are the only extra targets.
 const nodes=[...root.querySelectorAll('main *,body > header *,body > footer *')].filter(node=>!node.closest('#ue-screen')&&!node.closest('#ue-pencil'));
 const seen=new Map();
 for(const node of nodes){
  if((node.hasAttribute('data-edit')&&node.getAttribute('data-edit')!=='links')||node.hasAttribute('data-section'))continue;
  const css=getComputedStyle(node);
  const isGroup=/(?:flex|grid)/.test(css.display)&&node.children.length>=2;
  const isContainer=node.matches('.card,.photo,.hero-visual,[data-editor-container]');
  if(!isGroup&&!isContainer)continue;
  const section=node.closest('[data-section]')?.getAttribute('data-section')||'page';
  const name=(node.getAttribute('data-editor-container')||[...node.classList].find(x=>!x.startsWith('ue-'))||node.tagName.toLowerCase()).toLowerCase().replace(/[^a-z0-9-]+/g,'-');
  const base='group.'+safeId(section)+'.'+safeId(name);
  const count=(seen.get(base)||0)+1;seen.set(base,count);
  targets.push({id:base+(count>1?'.'+count:''),node,kind:'group',label:(isGroup?'Group: ':'Container: ')+name,controls:isGroup?['gap','opacity']:['radius','opacity','padding']});
 }
 return targets;
}
export function initialVisualValue(node,key){
 const css=getComputedStyle(node);
 if(key==='opacity')return Math.round((Number(css.opacity)||0)*100);
 const prop=key==='fontSize'?'fontSize':key==='radius'?'borderTopLeftRadius':key==='padding'?'paddingTop':'columnGap';
 const value=parseFloat(css[prop]);
 return Number.isFinite(value)?Math.max(visualRanges[key].min,Math.min(visualRanges[key].max,Math.round(value))):visualRanges[key].min;
}
function valueCSS(key,value){
 return key==='opacity'?String(value/100):String(value)+'px';
}
export function visualStylesheet(values,targets){
 const byId=new Map(targets.map(t=>[t.id,t]));
 const rules=[];
 for(const [id,settings] of Object.entries(values||{})){
  const t=byId.get(id);if(!t)continue;
  const declarations=[];
  for(const [key,value] of Object.entries(settings)){
   if(!t.controls.includes(key)||!withinRange(key,value))continue;
   declarations.push(visualRanges[key].property+':'+valueCSS(key,value)+'!important');
  }
  if(declarations.length)rules.push('[data-ue-visual-id="'+id+'"]{'+declarations.join(';')+'}');
 }
 return rules.join('\n');
}
export function applyVisual({values,targets,doc=document}){
 const byId=new Map(targets.map(t=>[t.id,t]));
 doc.querySelectorAll('[data-ue-visual-id]').forEach(node=>{
  const target=byId.get(node.getAttribute('data-ue-visual-id'));
  if(!target||target.node!==node||!Object.keys(values?.[target.id]||{}).length)node.removeAttribute('data-ue-visual-id');
 });
 for(const t of targets){
  if(doc===document&&Object.keys(values?.[t.id]||{}).length)t.node.setAttribute('data-ue-visual-id',t.id);
 }
 let el=doc.getElementById('editor-visual-style');
 const css=visualStylesheet(values,targets);
 if(!css){el?.remove();return}
 if(!el){el=doc.createElement('style');el.id='editor-visual-style';doc.head.append(el)}
 el.textContent=css;
}
export function exportVisual({doc,model,liveSnapshots,liveRoots,sectionNodes,values}){
 const parserSources=[...doc.querySelectorAll('[data-edit]')].filter(el=>!el.querySelector('[data-edit]')&&el.getAttribute('data-edit')!=='links');
 const idByIndex=stableFieldIds(model,liveSnapshots);
 const existing=new Map();
 for(const item of model.filter(x=>!x.added)){
  const src=parserSources[item.index];
  if(src&&src.isConnected)existing.set(idByIndex.get(item.index),src);
 }
 const targets=visualTargets({model,liveSnapshots,liveRoots,sectionNodes,root:document});
 for(const t of targets){
  let node;
  if(t.kind==='field')node=existing.get(t.id);
  if(t.kind==='section')node=doc.querySelector('[data-section="'+t.id.slice(8)+'"]');
  if(t.kind==='group'){
   const liveMatches=targets.filter(x=>x.kind==='group');
   const docNodes=[...doc.querySelectorAll('main *,body > header *,body > footer *')].filter(n=>!n.hasAttribute('data-edit')&&!n.hasAttribute('data-section'));
   const liveIndex=liveMatches.findIndex(x=>x.id===t.id);
   const liveNode=t.node;
   // Find the matching structural path, preserving the exact authored grouping.
   const segments=[];let cursor=liveNode;
   while(cursor&&cursor!==document.body){
    const parent=cursor.parentElement;if(!parent)break;
    segments.unshift([...parent.children].indexOf(cursor));cursor=parent;
   }
   node=doc.body;
   for(const i of segments)node=node?.children[i];
   if(!node?.tagName||node.tagName!==liveNode.tagName)node=null;
  }
  if(node&&Object.keys(values?.[t.id]||{}).length)node.setAttribute('data-ue-visual-id',t.id);
 }
 const style=doc.getElementById('editor-visual-style')||doc.createElement('style');
 const css=visualStylesheet(values,targets);
 if(css){style.id='editor-visual-style';style.textContent=css;if(!style.isConnected)doc.head.append(style)}
 else style.remove();
}
export function drawVisualControls({host,targets,values,selected,onSelect,onChange,onStart}){
 const section=document.createElement('div');section.className='ue-visual-controls';
 const heading=document.createElement('div');heading.className='ue-visual-heading';heading.textContent='Adjust element';
 section.append(heading);
 const select=document.createElement('select');select.id='ue-visual-target';select.setAttribute('aria-label','Element to adjust');
 const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose an element';select.append(placeholder);
 for(const target of targets){const option=document.createElement('option');option.value=target.id;option.textContent=target.label;select.append(option)}
 select.value=targets.some(t=>t.id===selected)?selected:'';
 section.append(select);
 const controls=document.createElement('div');controls.id='ue-visual-sliders';section.append(controls);
 const render=()=>{
  controls.replaceChildren();
  const target=targets.find(t=>t.id===select.value);if(!target)return;
  for(const key of target.controls){
   const spec=visualRanges[key],row=document.createElement('div');row.className='ue-slider-setting';
   const title=document.createElement('label');title.textContent=spec.label;title.htmlFor='ue-slider-'+key;
   const number=document.createElement('input');number.type='number';number.min=spec.min;number.max=spec.max;number.step=1;number.setAttribute('aria-label',spec.label+' exact value');
   const unit=document.createElement('span');unit.textContent=spec.unit;
   const top=document.createElement('div');top.className='ue-slider-top';const right=document.createElement('div');right.className='ue-slider-value';right.append(number,unit);top.append(title,right);
   const slider=document.createElement('input');slider.type='range';slider.id='ue-slider-'+key;slider.min=spec.min;slider.max=spec.max;slider.step=1;slider.setAttribute('aria-label',spec.label);
   const value=values[target.id]?.[key]??initialVisualValue(target.node,key);
   slider.value=value;number.value=value;
   let started=false;
   const update=value=>{
    const n=Number(value);
    if(!Number.isFinite(n))return;
    const exact=Math.round(Math.max(spec.min,Math.min(spec.max,n)));
    if(!started){onStart();started=true}
    slider.value=exact;number.value=exact;
    onChange(target.id,key,exact);
   };
   slider.addEventListener('pointerdown',()=>{started=false});
   slider.addEventListener('input',()=>update(slider.value));
   slider.addEventListener('change',()=>{started=false});
   number.addEventListener('change',()=>{started=false;update(number.value);started=false});
   row.append(top,slider);controls.append(row);
  }
 };
 select.onchange=()=>{onSelect(select.value);render()};
 render();host.prepend(section);
}

export function drawInlineVisualControls({host,target,values,onChange,onStart}){
 if(!target?.controls?.length)return;
 const wrap=document.createElement('div');wrap.className='ue-visual-controls ue-inline-visual';
 const heading=document.createElement('div');heading.className='ue-visual-heading';heading.textContent='Appearance';wrap.append(heading);
 const controls=document.createElement('div');controls.className='ue-visual-sliders';wrap.append(controls);
 for(const key of target.controls){
  const spec=visualRanges[key];if(!spec)continue;
  const row=document.createElement('div');row.className='ue-slider-setting';
  const top=document.createElement('div');top.className='ue-slider-top';
  const label=document.createElement('label');label.textContent=spec.label;
  const right=document.createElement('div');right.className='ue-slider-value';
  const number=document.createElement('input');number.type='number';number.min=spec.min;number.max=spec.max;number.step=1;number.setAttribute('aria-label',spec.label+' exact value');
  const unit=document.createElement('span');unit.textContent=spec.unit;right.append(number,unit);top.append(label,right);
  const range=document.createElement('input');range.type='range';range.min=spec.min;range.max=spec.max;range.step=1;range.setAttribute('aria-label',spec.label);
  const initial=values[target.id]?.[key]??initialVisualValue(target.node,key);
  number.value=range.value=String(initial);
  let dragging=false;
  const update=raw=>{
   if(raw===''||!Number.isFinite(Number(raw)))return;
   const value=Math.round(Math.max(spec.min,Math.min(spec.max,Number(raw))));
   if(!dragging){onStart();dragging=true}
   number.value=range.value=String(value);
   onChange(target.id,key,value);
  };
  range.onpointerdown=()=>{dragging=false};
  range.oninput=()=>update(range.value);
  range.onchange=()=>{dragging=false};
  number.onchange=()=>{dragging=false;update(number.value);dragging=false};
  row.append(top,range);controls.append(row);
 }
 host.append(wrap);
}
