/* Snapshots keep node identities, listeners, every author attribute, and child order.
   This also restores deleted parents/children without reparsing HTML. */
export function createHistory(controls){
 const excluded=node=>controls().some(el=>el===node||el.contains(node))||node.nodeType===1&&node.matches('[data-built-at-editor-runtime]');
 const snapshot=()=>{
  const records=[];
  const visit=node=>{
   if(excluded(node))return;
   const children=[...node.childNodes].filter(child=>!excluded(child));
   records.push({node,children,attributes:node.nodeType===1?[...node.attributes].map(a=>[a.name,a.value]):null,text:node.nodeType===3||node.nodeType===8?node.data:null});
   children.forEach(visit);
  };
  visit(document.documentElement);return records;
 };
 const restore=records=>{
  for(const {node,children,attributes,text} of records){
   if(attributes){for(const attr of [...node.attributes])node.removeAttribute(attr.name);for(const [name,value] of attributes)node.setAttribute(name,value)}
   if(text!==null)node.data=text;
   for(const child of [...node.childNodes])if(!excluded(child)&&!children.includes(child))child.remove();
   // Insert in reverse so the exact sibling order is restored, preserving controls.
   let next=null;for(const child of [...children].reverse()){if(child.parentNode!==node||child.nextSibling!==next)node.insertBefore(child,next);next=child}
  }
  document.querySelectorAll('.ie-active-field').forEach(el=>{el.classList.remove('ie-active-field');el.style.removeProperty('--ie-selection-outline');if(el.hasAttribute('data-edit'))el.contentEditable='false'});
  document.body.classList.add('ie-enabled');document.body.classList.remove('ie-dragging');
 };
 return {snapshot,restore};
}
