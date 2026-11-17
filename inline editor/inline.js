/* Top toolbar adapter for the existing editor.
   It drives the original editor's controls rather than duplicating its storage/export engine. */
export function mountInlineEditor(){
 if(document.getElementById('ie-bar'))return;
 const $=s=>document.querySelector(s);
 const bar=document.createElement('div');bar.id='ie-bar';
 bar.innerHTML='<button class="ie-logo" id="ie-global" title="Global settings"><span class="ie-brand">b.</span><span class="ie-label">Built.at</span> ⌄</button><div class="ie-context" id="ie-context"><span class="ie-muted">Click anything editable on the page</span></div><button id="ie-undo" title="Undo">↶</button><button id="ie-preview">Preview</button><button id="ie-copy" class="ie-copy">Copy HTML</button>';
 document.body.prepend(bar);document.body.classList.add('ie-active');
 const ctx=$('#ie-context'),screen=$('#ue-screen'),pencil=$('#ue-pencil');
 let preview=false,selected=null;
 const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;ctx.append(b);return b};
 function open(tab='elements'){
   if(screen.hidden)pencil.click();
   const tabButton=screen.querySelector('[data-tab="'+tab+'"]');
   if(tabButton)tabButton.click();
 }
 function focusField(el){
   const items=[...document.querySelectorAll('[data-edit]')].filter(e=>!e.closest('#ue-screen,#ie-bar')&&!e.querySelector('[data-edit]'));
   const index=items.indexOf(el);
   if(index<0)return;
   open('elements');
   const field=screen.querySelector('[data-edit-index="'+index+'"]');
   if(field){field.scrollIntoView({block:'center'});const details=field.closest('details');if(details)details.open=true;field.querySelector('input,textarea,select')?.focus({preventScroll:true})}
 }
 function render(){
   ctx.replaceChildren();
   if(!selected){const s=document.createElement('span');s.className='ie-muted';s.textContent='Click anything editable on the page';ctx.append(s);return}
   const label=document.createElement('strong');label.textContent=selected.getAttribute('data-edit')||selected.tagName.toLowerCase();ctx.append(label);
   button('Edit content',()=>focusField(selected));
   button('Style & spacing',()=>focusField(selected));
   button('Done',()=>{selected.classList.remove('ie-selected');selected=null;screen.hidden=true;render()});
 }
 document.addEventListener('click',e=>{
   if(preview||e.target.closest('#ie-bar,#ue-screen'))return;
   const el=e.target.closest('[data-edit]');if(!el)return;
   e.preventDefault();
   if(selected)selected.classList.remove('ie-selected');
   selected=el;selected.classList.add('ie-selected');render();focusField(el);
 },true);
 $('#ie-global').onclick=()=>{selected?.classList.remove('ie-selected');selected=null;render();open('page')};
 $('#ie-undo').onclick=()=>{open();screen.querySelector('#ue-undo')?.click();screen.hidden=true};
 $('#ie-copy').onclick=()=>{open();screen.querySelector('#ue-copy')?.click()};
 $('#ie-preview').onclick=()=>{
   preview=!preview;$('#ie-preview').textContent=preview?'Edit':'Preview';
   screen.hidden=true;document.body.classList.toggle('ie-active',!preview);
   selected?.classList.remove('ie-selected');selected=null;render();
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!screen.hidden){screen.hidden=true;selected?.classList.remove('ie-selected');selected=null;render()}});
}
