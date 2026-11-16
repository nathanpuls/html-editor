/* Version 2: readable content contract, independent of DOM positions. */
const isRecord=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const slug=v=>String(v||'').trim().replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item';
const string=(v,name)=>{if(typeof v!=='string')throw Error(name+' must be text');return v};
const boolean=(v,name)=>{if(typeof v!=='boolean')throw Error(name+' must be true or false');return v};
export const fieldId=(item,sectionId)=>{
 const name=slug(item.label||item.tag);
 return [sectionId||'page',name].join('.');
};
export const groupId=(root,index)=>{
 const section=root.closest('[data-section]')?.getAttribute('data-section');
 return section?section+'Links':'links'+(index+1);
};
export const styleToJSON=s=>({
 colors:{background:s.background,text:s.text,accent:s.accent},
 typography:{fontFamily:s.font,h1FontSizePx:s.h1,h2FontSizePx:s.h2,h3FontSizePx:s.h3,bodyFontSizePx:s.p},
 borderRadiusPx:s.radius,
 buttons:{
  primary:{background:s.buttonBackground,text:s.buttonText},
  secondary:{background:s.secondaryButtonBackground,text:s.secondaryButtonText}
 }
});
export function exportEditableJSON(ctx){
 const {model,liveSnapshots,liveRoots,sectionOrder,sectionNodes,sectionStates,pageMeta,styleSettings,variableSettings,buttonSettings,buttonAppearance}=ctx;
 const groups=liveRoots.map(groupId);
 const ids=new Map(),used=new Set();
 for(const item of model.filter(x=>!x.added)){
  const sectionId=liveSnapshots[item.index]?.node?.closest('[data-section]')?.getAttribute('data-section')||'page';
  const id=fieldId(item,sectionId);
  if(used.has(id))throw Error('Duplicate editable field identity: '+id+'. Give each data-edit a unique label within its section.');
  used.add(id);ids.set(item.index,id);
 }
 const addedCount=new Map();
 const fields=model.map(item=>{
  const gid=item.group===null?null:groups[item.group];
  const index=item.index;
  const id=item.added?(()=>{
   const n=(addedCount.get(gid)||0)+1;addedCount.set(gid,n);
   return gid+'.new-link-'+n;
  })():ids.get(index);
  const field={id,label:item.label,tag:item.tag,group:gid,hidden:!!item.hidden,deleted:!!item.deleted};
  if(item.added)field.added=true;
  if(item.image){field.src=item.src;field.alt=item.alt}
  else if(!item.decorative){field.text=item.text;if(item.link)field.url=item.url}
  return field;
 });
 const buttons={};
 for(const [index,info] of Object.entries(buttonAppearance)){
  const id=ids.get(Number(index));
  if(!id)continue;
  const override=buttonSettings[index]||{};
  buttons[id]={background:override.background||info.background,text:override.color||info.color};
 }
 return {
  version:2,
  _schema:{
   purpose:'Edit only values; the original HTML layout and elements remain unchanged.',
   fields:'Preserve id and tag. You may edit text, URLs, image src/alt, hidden and deleted. Only new links may be added to an existing group.',
   groups:groups,
   fonts:'Google Font names or safe CSS font-family stacks. Unknown installed font names use browser fallback.',
   colors:'Hex colors (#RRGGBB). Font sizes and border radius are in pixels.',
   buttons:'primary and secondary are independent roles. design.elementButtons targets one specific editable button by field id.',
   sections:'order contains existing section ids; changing section labels updates visible numbered eyebrow labels where present.'
  },
  page:{title:pageMeta.title,description:pageMeta.description},
  fields,
  sections:{order:[...sectionOrder],items:Object.fromEntries(sectionOrder.map(id=>[id,{
   label:sectionStates[id]?.label??sectionNodes.find(n=>n.getAttribute('data-section')===id)?.getAttribute('aria-label')??id,
   hidden:!!sectionStates[id]?.hidden,deleted:!!sectionStates[id]?.deleted
  }]))},
  design:{...styleToJSON(styleSettings),variables:{...variableSettings},elementButtons:buttons}
 };
}
export function importEditableJSON(data,ctx){
 const {model,liveSnapshots,liveRoots,sectionOrder,sectionNodes,styleSettings,styleDefaults,styleFonts,originalVariables,buttonAppearance,validImageURL,validURL,validLinkTarget,validFontStack,hexColor}=ctx;
 if(!isRecord(data)||data.version!==2||!Array.isArray(data.fields)||!isRecord(data.page)||!isRecord(data.sections)||!isRecord(data.design))
  throw Error('Expected version 2 editable JSON with page, fields, sections, and design.');
 const groups=liveRoots.map(groupId),byId=new Map(),buttonById=new Map();
 for(const item of model.filter(x=>!x.added)){
  const sectionId=liveSnapshots[item.index]?.node?.closest('[data-section]')?.getAttribute('data-section')||'page';
  const id=fieldId(item,sectionId);
  if(byId.has(id))throw Error('Duplicate editable field identity: '+id);
  byId.set(id,item);
  if(Object.hasOwn(buttonAppearance,item.index))buttonById.set(id,item.index);
 }
 const next=[],seen=new Set();
 for(const field of data.fields){
  if(!isRecord(field)||typeof field.id!=='string'||typeof field.tag!=='string')throw Error('Every field needs an id and tag.');
  if(seen.has(field.id))throw Error('Duplicate field id: '+field.id);
  seen.add(field.id);
  let item;
  if(field.added===true){
   const groupIndex=groups.indexOf(field.group);
   if(field.tag!=='a'||groupIndex<0||!field.id.startsWith(field.group+'.new-link-'))
    throw Error('Only new links in an existing named group are supported.');
   item={added:true,index:-1,tag:'a',link:true,article:false,image:false,decorative:false,group:groupIndex,label:'Navigation link',originalText:'',originalURL:'',text:'',url:'',hidden:false,deleted:false};
  }else{
   const original=byId.get(field.id);
   if(!original||original.tag!==field.tag||field.group!==(original.group===null?null:groups[original.group]))
    throw Error('Unknown or mismatched field: '+field.id);
   item={...original};
  }
  item.hidden=boolean(field.hidden,'Field hidden');item.deleted=boolean(field.deleted,'Field deleted');
  if(item.image){
   item.src=string(field.src,'Image URL');item.alt=string(field.alt,'Image description');
   if(!item.deleted&&!validImageURL(item.src))throw Error('Invalid image URL: '+field.id);
  }else if(!item.decorative){
   item.text=string(field.text,'Field text');
   if(item.link){
    item.url=string(field.url,'Link destination');
    if(!item.deleted&&(!item.text.trim()||!validURL(item.url.trim())||!validLinkTarget(item.url)))
     throw Error('Invalid link: '+field.id);
   }
  }
  next.push(item);
 }
 for(const id of byId.keys())if(!seen.has(id))throw Error('Missing existing field: '+id);
 const order=data.sections.order;
 if(!Array.isArray(order)||order.length!==sectionOrder.length||new Set(order).size!==sectionOrder.length||!order.every(id=>sectionOrder.includes(id)))
  throw Error('Section order must contain exactly the existing section ids.');
 if(!isRecord(data.sections.items))throw Error('Section items must be an object.');
 const states={};
 for(const id of order){
  const x=data.sections.items[id];
  if(!isRecord(x))throw Error('Missing section: '+id);
  states[id]={label:string(x.label,'Section label'),hidden:boolean(x.hidden,'Section hidden'),deleted:boolean(x.deleted,'Section deleted')};
 }
 const design=data.design;
 if(!isRecord(design.colors)||!isRecord(design.typography)||!isRecord(design.buttons)||!isRecord(design.buttons.primary)||!isRecord(design.buttons.secondary)||!isRecord(design.variables)||!isRecord(design.elementButtons))
  throw Error('Design requires colors, typography, buttons, variables, and elementButtons.');
 const style={...styleSettings};
 const color=(v,name)=>{if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw Error('Invalid color: '+name);return v};
 const size=(v,name)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>120)throw Error('Invalid pixel size: '+name);return v};
 for(const [k,internal] of [['background','background'],['text','text'],['accent','accent']])style[internal]=color(design.colors[k],k);
 const typ=design.typography;
 style.font=string(typ.fontFamily,'Font family');
 if(!validFontStack(style.font))throw Error('Invalid font family: '+style.font);
 for(const [key,internal] of [['h1FontSizePx','h1'],['h2FontSizePx','h2'],['h3FontSizePx','h3'],['bodyFontSizePx','p']])style[internal]=size(typ[key],key);
 style.radius=size(design.borderRadiusPx,'borderRadiusPx');
 style.buttonBackground=color(design.buttons.primary.background,'Primary background');
 style.buttonText=color(design.buttons.primary.text,'Primary text');
 style.secondaryButtonBackground=color(design.buttons.secondary.background,'Secondary background');
 style.secondaryButtonText=color(design.buttons.secondary.text,'Secondary text');
 const variables={};
 for(const [name,config] of Object.entries(originalVariables)){
  const val=design.variables[name];
  if(typeof val!=='string')throw Error('Missing CSS variable: '+name);
  if(config.kind==='color'?!hexColor(val):!/^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(val))
   throw Error('Invalid CSS variable: '+name);
  variables[name]=val;
 }
 for(const name of Object.keys(design.variables))if(!Object.hasOwn(originalVariables,name))throw Error('Unknown CSS variable: '+name);
 const buttons={};
 for(const [id,colors] of Object.entries(design.elementButtons)){
  if(!buttonById.has(id)||!isRecord(colors))throw Error('Unknown button: '+id);
  buttons[buttonById.get(id)]={background:color(colors.background,'Button background'),color:color(colors.text,'Button text')};
 }
 for(const id of buttonById.keys())if(!Object.hasOwn(design.elementButtons,id))throw Error('Missing button: '+id);
 return {model:next,pageMeta:{title:string(data.page.title,'Page title'),description:string(data.page.description,'Description')},sectionOrder:[...order],sectionStates:states,styleSettings:style,variableSettings:variables,buttonSettings:buttons};
}
