/* Top toolbar adapter for the existing editor.
   It drives the original editor's controls rather than duplicating its storage/export engine. */
export function mountInlineEditor(){
 if(document.getElementById('ie-bar'))return;
 const $=s=>document.querySelector(s);
 const bar=document.createElement('div');bar.id='ie-bar';
 bar.innerHTML='<button class="ie-logo" id="ie-global" title="Global settings"><span class="ie-brand">b.</span><span class="ie-label">Built.at</span> ⌄</button><div class="ie-context" id="ie-context"><span class="ie-muted">Click anything editable on the page</span></div><button id="ie-undo" title="Undo">↶</button><button id="ie-preview">Preview</button><button id="ie-copy" class="ie-copy">Copy HTML</button>';
 document.body.prepend(bar);document.body.classList.add('ie-active');
 const ctx=$('#ie-context'),screen=$('#ue-screen'),pencil=$('#ue-pencil');
 let preview=false,selected=null,typing=null;
 const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;ctx.append(b);return b};
 function open(tab='elements'){
   if(screen.hidden)pencil.click();
   const tabButton=screen.querySelector('[data-tab="'+tab+'"]');
   if(tabButton)tabButton.click();
 }
 function focusField(el,focus=true){
   const items=[...document.querySelectorAll('[data-edit]')].filter(e=>!e.closest('#ue-screen,#ie-bar')&&!e.querySelector('[data-edit]'));
   const index=items.indexOf(el);
   if(index<0)return;
   open('elements');
   const field=screen.querySelector('[data-edit-index="'+index+'"]');
   if(field){field.scrollIntoView({block:'center'});const details=field.closest('details');if(details)details.open=true;if(focus)field.querySelector('input,textarea,select')?.focus({preventScroll:true})}
 }
 function endTyping(){
   if(!typing)return;
   const {el,field}=typing;
   const value=el.innerText.replace(/\\r/g,'').trim();
   el.contentEditable='false';
   el.removeAttribute('spellcheck');
   typing=null;
   if(field&&field.isConnected&&field.value!==value){
     field.value=value;
     field.dispatchEvent(new Event('input',{bubbles:true}));
     field.dispatchEvent(new Event('change',{bubbles:true}));
   }
 }
 function startTyping(el){
   if(!el)return;
   if(typing?.el===el)return;
   endTyping();
   const tag=el.tagName.toLowerCase();
   if(!['h1','h2','h3','h4','h5','h6','p','span','strong','em','small','label','blockquote','a','button','li'].includes(tag)){
     focusField(el);return;
   }
   // Use the original model's input handler for drafts, undo and HTML export.
   // Open the existing editor once, but keep its dropdown hidden during typing.
   focusField(el,false);
   const items=[...document.querySelectorAll('[data-edit]')].filter(e=>!e.closest('#ue-screen,#ie-bar')&&!e.querySelector('[data-edit]'));
   const index=items.indexOf(el);
   const field=screen.querySelector('[data-edit-index="'+index+'"] input, [data-edit-index="'+index+'"] textarea');
   if(!field){screen.hidden=true;return}
   screen.hidden=true;
   typing={el,field};
   el.contentEditable='plaintext-only';
   if(el.contentEditable!=='plaintext-only')el.contentEditable='true';
   el.spellcheck=true;
   el.focus();
 }
 function render(){
   ctx.replaceChildren();
   if(!selected){const s=document.createElement('span');s.className='ie-muted';s.textContent='Click anything editable on the page';ctx.append(s);return}
   const label=document.createElement('strong');label.textContent=selected.getAttribute('data-edit')||selected.tagName.toLowerCase();ctx.append(label);
   button('Edit text',()=>startTyping(selected));
   button('Style & spacing',()=>focusField(selected));
   button('Done',()=>{endTyping();selected.classList.remove('ie-selected');selected=null;screen.hidden=true;render()});
 }
 document.addEventListener('click',e=>{
   if(preview||e.target.closest('#ie-bar,#ue-screen'))return;
   const el=e.target.closest('[data-edit]');if(!el)return;
   e.preventDefault();
   if(selected&&selected!==el){endTyping();selected.classList.remove('ie-selected')}
   selected=el;selected.classList.add('ie-selected');render();
   if(['h1','h2','h3','h4','h5','h6','p','span','strong','em','small','label','blockquote','a','button','li'].includes(el.tagName.toLowerCase()))startTyping(el);
   else focusField(el);
 },true);
 $('#ie-global').onclick=()=>{endTyping();selected?.classList.remove('ie-selected');selected=null;render();open('page')};
 $('#ie-undo').onclick=()=>{endTyping();open();screen.querySelector('#ue-undo')?.click();screen.hidden=true};
 $('#ie-copy').onclick=()=>{endTyping();open();screen.querySelector('#ue-copy')?.click()};
 $('#ie-preview').onclick=()=>{
   endTyping();preview=!preview;$('#ie-preview').textContent=preview?'Edit':'Preview';
   screen.hidden=true;document.body.classList.toggle('ie-active',!preview);
   selected?.classList.remove('ie-selected');selected=null;render();
 };
 document.addEventListener('focusout',e=>{if(typing?.el===e.target)endTyping()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&typing){endTyping();selected?.blur();return}if(e.key==='Escape'&&!screen.hidden){screen.hidden=true;selected?.classList.remove('ie-selected');selected=null;render()}});
}
