import {syncGoogleFontLink} from './design.js';
import {exportVisual} from './visual-controls.js';
/* Generate clean standalone page HTML from current editor state. */
export function generateHTML(ctx){
 const {baseline,pageMeta,liveSnapshots,model,validImageURL,normalizeURL,setArticle,setText,validURL,validLinkTarget,groupChanged,sectionOrder,initialSectionOrder,sectionStates,styleSettings,initialStyle,variableSettings,initialVariables,buttonSettings,initialButtons,styleSheetText,visualValues,visualTargets}=ctx;
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
   if(item.image){if(!validImageURL(item.src))throw Error('Enter a valid image URL.');if(item.src!==item.originalSrc){element.setAttribute('src',normalizeURL(item.src));element.removeAttribute('srcset');element.removeAttribute('sizes')}if(item.alt!==item.originalAlt)element.setAttribute('alt',item.alt);continue}
   if(item.decorative)continue;
   if(item.text!==item.originalText){if(item.article)setArticle(element,item.text);else setText(element,item.text)}
   if(item.link){if(!validURL(item.url.trim())||!validLinkTarget(item.url))throw Error('Select an existing page section or enter a valid URL.');if(item.url!==item.originalURL)element.setAttribute('href',normalizeURL(item.url))}
  }
  // Link collections are opt-in: <nav data-edit="links"><a data-edit ...>...</a></nav>
  const groups=Array.from(doc.querySelectorAll('[data-edit="links"]'));
  groups.forEach((g,gi)=>{
   const members=model.filter(x=>x.group===gi);
   if(!groupChanged(members))return;
   const old=Array.from(g.children).filter(el=>el.matches('a[data-edit]'));
   old.forEach(el=>el.remove());
   for(const item of members){
    if(item.deleted)continue;
    if(!item.link||!validURL(item.url.trim())||!validLinkTarget(item.url))throw Error('Select an existing page section or enter a valid URL.');
    const node=item.added?doc.createElement('a'):source[item.index].cloneNode(true);
    if(item.added)node.setAttribute('data-edit',item.label||'Navigation link');
    const href=item.url===item.originalURL?item.originalURL:normalizeURL(item.url);
    if(node.getAttribute('href')!==href)node.setAttribute('href',href);
    if(item.added||item.text!==item.originalText)setText(node,item.text);
    if(item.hidden){node.hidden=true;node.style.display='none'}
    if(g.lastChild&&g.lastChild.nodeType!==3)g.append(doc.createTextNode(' '));
    g.append(node);
   }
  });
  const exportedSections=Array.from(doc.querySelectorAll('[data-section]'));
  const exportedById=new Map(exportedSections.map(el=>[el.getAttribute('data-section'),el]));
  if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder))for(const id of sectionOrder){
   const node=exportedById.get(id);if(!node||!node.parentElement)continue;
   const siblings=exportedSections.filter(el=>el.parentElement===node.parentElement);
   const ordered=sectionOrder.map(k=>exportedById.get(k)).filter(el=>el&&el.parentElement===node.parentElement&&siblings.includes(el));
   const after=siblings[siblings.length-1]?.nextSibling||null;
   for(const el of ordered)node.parentElement.insertBefore(el,after);
  }
  // Attach unique, targeted CSS selectors before removed fields alter indexes.
  exportVisual({doc,model,liveSnapshots,values:visualValues||{},sectionNodes:visualTargets.filter(t=>t.kind==='section').map(t=>t.node),liveRoots:[]});
  for(const item of originals.filter(item=>item.deleted)){
   const element=source[item.index];
   if(element?.isConnected)element.remove();
  }
  // Reflect section order and display labels in numbered template eyebrows.
  const visible=sectionOrder.filter(id=>!sectionStates[id]?.deleted);
  for(const id of visible){
   const node=exportedById.get(id);
   const eyebrow=node?.querySelector(':scope > .eyebrow');
   if(!eyebrow||!/^\s*\d{1,2}\s*\//.test(eyebrow.textContent||''))continue;
   const numbered=visible.filter(key=>exportedById.get(key)?.querySelector(':scope > .eyebrow')?.textContent?.match(/^\s*\d{1,2}\s*\//));
   const number=String(numbered.indexOf(id)+1).padStart(2,'0');
   const label=sectionStates[id]?.label??node.getAttribute('aria-label')??id;
   eyebrow.textContent=number+' / '+label;
  }
  for(const [id,state] of Object.entries(sectionStates)){
   const node=exportedById.get(id);if(!node)continue;
   if(state.deleted)node.remove();
   else if(state.hidden){node.hidden=true;node.style.display='none'}
   if(state.label!==undefined&&!state.deleted)node.setAttribute('aria-label',state.label);
  }
  let pageStyle=doc.getElementById('editor-page-style');
  if(JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(variableSettings)!==initialVariables||JSON.stringify(buttonSettings)!==initialButtons){
   if(!pageStyle){pageStyle=doc.createElement('style');pageStyle.id='editor-page-style';doc.head.append(pageStyle)}
   pageStyle.textContent=styleSheetText(styleSettings);
  }
  // Remove editor UI and host-injected runtime markup from the copied document.
  // Keep the site's own HTML, styling, and the edit.built.at installation script.
  for(const selector of ['#ue-pencil','#ue-screen','#ue-style','#ue-script','#ue-stylesheet','#ue-drop-preview'])
   doc.querySelectorAll(selector).forEach(node=>node.remove());
  // The Built.at editor route adds a base tag so its relative demo links work.
  // That routing detail is not part of the authored website.
  doc.querySelectorAll('base[href="/editor/"]').forEach(node=>node.remove());
  // Preserve the selected web font when the exported HTML is opened elsewhere.
  syncGoogleFontLink(doc,styleSettings.font);
  // Cloudflare injects Web Analytics into the response; exporting the website
  // should not silently carry the hosting account's analytics configuration.
  doc.querySelectorAll('script[data-cf-beacon],script[src*="static.cloudflareinsights.com/beacon.min.js"]').forEach(node=>node.remove());
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 }
