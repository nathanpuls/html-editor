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
