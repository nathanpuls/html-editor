/* Editable DOM text helpers. */
export const setText=(el,value)=>{
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
export const articleText=el=>Array.from(el.children).map(p=>p.textContent.trim()).join('\n\n');
export const isArticle=el=>/^(DIV|SECTION|ARTICLE|MAIN)$/.test(el.tagName)&&el.children.length>0&&Array.from(el.children).every(c=>c.tagName==='P');
export const setArticle=(el,value)=>{
  const paragraphs=value.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/);
  const existing=Array.from(el.children).filter(n=>n.tagName==='P');
  paragraphs.forEach((text,i)=>{
   const next=text.trim().replace(/\n/g,' ');
   if(existing[i])setText(existing[i],next);
   else{const p=el.ownerDocument.createElement('p');p.textContent=next;el.append(p)}
  });
  for(let i=paragraphs.length;i<existing.length;i++)existing[i].remove();
 };

export function drawSections(ctx){
 const {screen,sectionsPanel,sectionOrder,sectionNodes,sectionStates,checkpoint,syncSections,reorderSections,renderSections,saveDraft,hideEditor,icons}=ctx;
  sectionsPanel.replaceChildren();
  if(!sectionNodes.length){
   const hint=document.createElement('p');hint.textContent='No sections found. Add data-section="unique-id" to the page sections you want to reorder.';sectionsPanel.append(hint);return;
  }
  const visibleSections=sectionOrder.filter(id=>!sectionStates[id]?.deleted);
  for(const [i,id] of visibleSections.entries()){
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id);if(!node)continue;
   const row=document.createElement('div');row.className='ue-section-row';row.dataset.sectionId=id;
   const jump=document.createElement('input');jump.type='text';jump.className='ue-section-link';
   jump.value=sectionStates[id]?.label??node.getAttribute('aria-label')??node.querySelector('h1,h2,h3')?.textContent?.trim()??id;
   jump.setAttribute('aria-label','Section name');jump.title='Edit section name';
   jump.oninput=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),label:jump.value};syncSections();saveDraft()};
   const jumpButton=document.createElement('button');jumpButton.type='button';jumpButton.className='ue-section-jump';jumpButton.title='View section on page';jumpButton.setAttribute('aria-label','View '+jump.value+' on page');
   jumpButton.innerHTML='<i data-lucide="arrow-up-right"></i>';
   jumpButton.onclick=()=>{
    if(!node?.isConnected)return;
    if(sectionStates[id]?.hidden||sectionStates[id]?.deleted)return;
    if(screen.classList.contains('ue-fullscreen'))hideEditor();
    const offset=28;
    const top=Math.max(0,window.scrollY+node.getBoundingClientRect().top-offset);
    window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   };
   jump.addEventListener('click',()=>jumpButton.click());
   const controls=document.createElement('div');controls.className='ue-controls';
   for(const [dir,name] of [[-1,'arrow-up'],[1,'arrow-down']]){
    const button=document.createElement('button');button.type='button';button.title=dir<0?'Move up':'Move down';button.setAttribute('aria-label',button.title+' '+jump.value);
    button.disabled=(i+dir<0||i+dir>=visibleSections.length||sectionNodes.find(n=>n.getAttribute('data-section')===visibleSections[i+dir])?.parentElement!==node.parentElement);
    button.innerHTML='<i data-lucide="'+name+'"></i>';
    button.onclick=()=>{checkpoint();const nextId=visibleSections[i+dir];const a=sectionOrder.indexOf(id),b=sectionOrder.indexOf(nextId);[sectionOrder[a],sectionOrder[b]]=[sectionOrder[b],sectionOrder[a]];reorderSections();saveDraft();renderSections()};
    controls.append(button);
   }
   const state=sectionStates[id]||{};
   for(const [action,icon,field] of [[state.hidden?'Show':'Hide',state.hidden?'eye-off':'eye','hidden'],['Delete','trash-2','deleted']]){
    const button=document.createElement('button');button.type='button';button.title=action;button.setAttribute('aria-label',action+' '+jump.value);
    button.innerHTML='<i data-lucide="'+icon+'"></i>';
    button.onclick=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),[field]:!Boolean(sectionStates[id]?.[field])};syncSections();saveDraft();renderSections()};
    controls.append(button);
   }
   row.classList.toggle('ue-hidden',Boolean(state.hidden));
   row.append(jump,jumpButton,controls);sectionsPanel.append(row);
  }
  icons();
 }

export function drawContent(ctx){
 const {fields,add,settingsPanel,model,pageMeta,originalMeta,checkpoint,saveDraft,applyMeta,syncLive,icons,normalizeURL,validImageURL,displayURL,fitTextarea,internalDestinations,render}=ctx;
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
   if(item.deleted)continue; // Keep the model for Undo/Revert/export, not in the sidebar.
   const box=document.createElement('div');box.className='ue-item';
   const label=document.createElement('label');label.textContent=item.label|| (item.image?'Image':item.link?'Link text':item.tag==='p'?'Paragraph':'Text');
   box.dataset.editIndex=String(model.indexOf(item));
   if(item.hidden)box.classList.add('ue-hidden')
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
   addControl('Delete','trash-2',()=>{checkpoint();item.deleted=true;render()});
   if(item.group!==null){
    for(const [direction,icon] of [[-1,'arrow-up'],[1,'arrow-down']]){
     addControl(direction<0?'Move up':'Move down',icon,()=>{
      const group=model.filter(x=>x.group===item.group&&!x.deleted);const index=group.indexOf(item),other=group[index+direction];
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
