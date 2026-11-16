/* Dependency-free Chrome DevTools Protocol integration smoke test. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {once} from 'node:events';

const root=resolve(import.meta.dirname,'..');
const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html'};
const server=createServer(async(req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!/^\/(editor\.js|interface\.js|content\.js|design\.js|storage\.js|export\.js|json-schema\.js|visual-controls\.js|editor\.css|tests\/fixture\.html)$/.test(path)){res.writeHead(404).end();return}
 try{const data=await readFile(resolve(root,path.slice(1)));res.writeHead(200,{'content-type':mime[extname(path)]||'text/plain','cache-control':'no-store'});res.end(data)}
 catch{res.writeHead(404).end()}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const origin='http://127.0.0.1:'+server.address().port;
const profile=await mkdtemp(join(tmpdir(),'ue-chrome-'));
const chromePath=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser','/opt/google/chrome/chrome'].find(path=>path&&existsSync(path))||'google-chrome';
console.log('Using browser:',chromePath);
const chrome=spawn(chromePath,[
 '--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check',
 '--disable-dev-shm-usage','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
 '--user-data-dir='+profile,'about:blank'
],{stdio:['ignore','pipe','pipe']});
let chromeError='';
chrome.stderr?.on('data',chunk=>{chromeError=(chromeError+chunk.toString()).slice(-4000)});
chrome.on('error',error=>{chromeError=String(error)});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(fn,ms=30000){const until=Date.now()+ms;let err;while(Date.now()<until){try{const result=await fn();if(result)return result}catch(e){err=e}await sleep(100)}throw err||Error('Timed out')}
let ws;
let seq=0;
const pending=new Map();
function send(method,params={}){
 const id=++seq;return new Promise((resolve,reject)=>{
 pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
 });
}
async function js(expression){
 const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(result.exceptionDetails)throw Error('Page exception: '+JSON.stringify(result.exceptionDetails));
 return result.result?.value;
}
async function waitJS(expression){return waitFor(async()=>await js(expression))}
function check(name,value){assert.ok(value,name);console.log('PASS',name)}
try{
 const debugPort=await waitFor(async()=>{try{const p=await readFile(join(profile,'DevToolsActivePort'),'utf8');return Number(p.split('\n')[0])||false}catch{return false}});
 const debuggerUrl='http://127.0.0.1:'+debugPort;
 await waitFor(async()=>{const r=await fetch(debuggerUrl+'/json/version');return r.ok});
 const page=await (await fetch(debuggerUrl+'/json/new?'+encodeURIComponent(origin+'/tests/fixture.html'),{method:'PUT'})).json();
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 ws.addEventListener('message',event=>{
  const msg=JSON.parse(event.data);if(!msg.id)return;
  const item=pending.get(msg.id);if(!item)return;pending.delete(msg.id);
  if(msg.error)item.reject(Error(JSON.stringify(msg.error)));else item.resolve(msg.result);
 });
 await send('Runtime.enable');await send('Page.enable');
 await waitJS("Boolean(document.querySelector('#ue-pencil'))");
 check('pencil available',await js("Boolean(document.querySelector('#ue-pencil'))"));
 await js("document.querySelector('#ue-pencil').click()");
 check('panel opens',await js("!document.querySelector('#ue-screen').hidden"));
 check('opening editor adds bare ?edit',await js("location.search==='?edit'"));
 await send('Page.reload',{ignoreCache:true});
 await waitJS("Boolean(document.querySelector('#ue-screen')) && !document.querySelector('#ue-screen').hidden");
 check('editor stays open after refresh with ?edit',await js("!document.querySelector('#ue-screen').hidden && location.search==='?edit'"));
 await js("document.querySelector('#ue-cancel').click()");
 check('closing editor removes ?edit',await js("location.search==='' && document.querySelector('#ue-screen').hidden"));
 await js("document.querySelector('#ue-pencil').click()");

 check('ellipsis menu exists',await js("Boolean(document.querySelector('#ue-more'))"));
 check('horizontal ellipsis stays in header',await js("(()=>{const circles=[...document.querySelectorAll('#ue-more svg circle')];return circles.length===3&&circles.every(c=>c.getAttribute('cy')==='12')&&circles.map(c=>c.getAttribute('cx')).join(',')==='5,12,19'})()"));
 check('docking controls live only inside ellipsis menu',await js("Boolean(document.querySelector('#ue-more-menu #ue-dock-left')&&document.querySelector('#ue-more-menu #ue-dock-right'))"));
 check('left and right menu icons render as arrows',await js("Boolean(document.querySelector('#ue-dock-left svg path')&&document.querySelector('#ue-dock-right svg path'))"));
 check('copy split button exists',await js("Boolean(document.querySelector('#ue-copy')&&document.querySelector('#ue-copy-toggle')&&document.querySelector('#ue-copy-json'))"));
 check('Page tab and named JSON actions',await js("Boolean(document.querySelector('[data-tab=page]'))&&!document.querySelector('[data-tab=settings]')&&document.querySelector('#ue-copy-json').textContent==='Copy editable data (JSON)'&&document.querySelector('#ue-import-json').textContent==='Import editable data (JSON)'"));
 check('New page is first ellipsis action',await js("document.querySelector('#ue-more-menu').firstElementChild?.id==='ue-new-page'"));
 check('Undo is a text action',await js("document.querySelector('#ue-undo').textContent.trim()==='Undo'"));

 await js("document.querySelector('#ue-more').click();document.querySelector('#ue-dock-left').click()");
 check('menu docking moves editor left',await js("document.querySelector('#ue-screen').classList.contains('ue-dock-left')"));
 await js("document.querySelector('#ue-more').click();document.querySelector('#ue-dock-right').click()");
 check('menu docking moves editor right',await js("document.querySelector('#ue-screen').classList.contains('ue-dock-right')"));
 check('heading drag previews and docks panel on left',await js("(()=>{const el=document.querySelector('#ue-heading');const original=el.setPointerCapture;el.setPointerCapture=()=>{};el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,button:0,clientX:window.innerWidth-100,clientY:30}));el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:1,button:0,clientX:25,clientY:30}));const preview=!document.querySelector('#ue-drop-preview').hidden&&document.querySelector('#ue-drop-preview').dataset.side==='left'&&document.querySelector('#ue-screen').classList.contains('ue-dragging');el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1,button:0,clientX:25,clientY:30}));el.setPointerCapture=original;return preview&&document.querySelector('#ue-drop-preview').hidden&&document.querySelector('#ue-screen').classList.contains('ue-dock-left')})()"));
 await js("document.querySelector('#ue-more').click();document.querySelector('#ue-dock-right').click()");

 check('CSS loaded',await js("Boolean(document.querySelector('#ue-stylesheet')?.sheet)"));
 const edit="(()=>{const label=[...document.querySelectorAll('#ue-fields label')].find(el=>el.textContent.includes('Hero heading'));const input=label?.querySelector('input,textarea');if(!input)return false;input.value='Changed heading';input.dispatchEvent(new Event('input',{bubbles:true}));return true})()";
 check('editable field works',await js(edit));
 check('live preview updates',await js("document.querySelector('h1').textContent==='Changed heading'"));
 await js("document.querySelector('#ue-undo').click()");
 check('undo restores text',await js("document.querySelector('h1').textContent==='Original heading'"));
 await js(edit);
 await js("document.querySelector('#ue-search').value='hero';document.querySelector('#ue-search').dispatchEvent(new Event('input',{bubbles:true}))");
 check('search results appear',await js("!document.querySelector('#ue-results').hidden"));
 await js("document.querySelector('#ue-search').value='';document.querySelector('#ue-search').dispatchEvent(new Event('input',{bubbles:true}))");
 await js("document.querySelector('[data-tab=page]').click()");
 check('Page tab contains global appearance and SEO',await js("!document.querySelector('#ue-settings').hidden&&Boolean(document.querySelector('#ue-page-design [data-ue-style-key=background]'))&&Boolean(document.querySelector('#ue-settings .ue-meta'))&&!document.querySelector('#ue-style-panel [data-ue-style-key=background]')"));
 await js("document.querySelector('#ue-page-design input[type=color]').value='#123456';document.querySelector('#ue-page-design input[type=color]').dispatchEvent(new Event('input',{bubbles:true}))");
 check('page color edits apply',await js("document.querySelector('#editor-page-style').textContent.includes('#123456')"));
 await js("document.querySelector('#ue-undo').click()");
 check('undo page color edit',await js("!document.querySelector('#editor-page-style')?.textContent.includes('#123456')"));

 await js("document.querySelector('#ue-cancel').click()");
 check('close preserves preview',await js("document.querySelector('h1').textContent==='Changed heading'"));
 await send('Page.reload',{ignoreCache:true});
 await waitJS("Boolean(document.querySelector('#ue-pencil')) && document.querySelector('h1')?.textContent==='Changed heading'");
 check('draft restored on refresh',await js("document.querySelector('h1').textContent==='Changed heading'"));
 await js("document.querySelector('#ue-pencil').click()");
 await js("document.querySelector('#ue-more').click()");
 check('overflow menu opens',await js("!document.querySelector('#ue-more-menu').hidden"));
 await js("document.querySelector('#ue-revert').click()");
 check('revert restores original',await js("document.querySelector('h1').textContent==='Original heading'"));
 await js("document.querySelector('#ue-pencil').click()");
 await js("document.querySelector('[data-tab=content]').click()");
 await js("document.querySelector('#ue-sections-toggle').click()");
 check('sections panel opens',await js("!document.querySelector('#ue-sections').hidden"));
 await js("document.querySelector('#ue-sections button[title=\"Move down\"]').click()");
 check('section reorder updates live page',await js("document.querySelector('main section')?.dataset.section==='links'"));
 await js("document.querySelector('#ue-undo').click()");
 check('undo section reorder',await js("document.querySelector('main section')?.dataset.section==='intro'"));
 await js("(()=>{const label=[...document.querySelectorAll('#ue-fields label')].find(el=>el.textContent.includes('Hero image'));const input=label?.querySelector('input');if(input){input.value='https://example.com/new.jpg';input.dispatchEvent(new Event('input',{bubbles:true}))}})()");
 check('image source live editing',await js("document.querySelector('img[data-edit=\"Hero image\"]')?.getAttribute('src')==='https://example.com/new.jpg'"));
 await js("document.querySelector('#ue-undo').click()");
 check('image undo',await js("document.querySelector('img[data-edit=\"Hero image\"]')?.getAttribute('src')==='https://example.com/old.jpg?w=1000'"));

 await js("document.querySelector('#ue-pencil').click()");
 await js(edit);
 await js("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__exportedHTML=text}}})");
 await js("document.querySelector('#ue-copy-toggle').click()");
 check('Copy JSON menu opens from caret',await js("!document.querySelector('#ue-copy-menu').hidden"));
 await js("document.querySelector('#ue-copy-json').click()");
 await waitJS("typeof window.__exportedHTML==='string'");
 check('Copy JSON exports editable data without HTML',await js("(()=>{const d=JSON.parse(window.__exportedHTML);return d.version===2&&d.fields.some(f=>f.id==='intro.hero-heading'&&f.text==='Changed heading')&&d._schema&&d.design.typography.h1FontSizePx>0&&d.fields.every(f=>typeof f.group==='string'||f.group===null)&&d.fields.every(f=>!('index' in f))&&Boolean(d.sections)&&Boolean(d.design)&&Boolean(d.page)&&!('html' in d)&&!window.__exportedHTML.includes('<!DOCTYPE html>')})()"));
 check('duplicate data-edit labels get distinct stable IDs',await js("(()=>{const ids=JSON.parse(window.__exportedHTML).fields.map(f=>f.id);return ids.includes('intro.intro-paragraph')&&ids.includes('intro.intro-paragraph-2')&&new Set(ids).size===ids.length})()"));
 check('Copy JSON leaves editor open',await js("!document.querySelector('#ue-screen').hidden"));
 check('Copy feedback shows Copied',await js("document.querySelector('#ue-copy').textContent==='Copied!'"));

 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-import-json').click()");
 check('Import JSON dialog opens',await js("!document.querySelector('#ue-json-dialog').hidden"));
 await js("document.querySelector('#ue-json-input').value='{broken';document.querySelector('#ue-json-apply').click()");
 check('invalid JSON does not change page',await js("!document.querySelector('#ue-json-error').hidden&&document.querySelector('h1').textContent==='Changed heading'"));
 await js("(()=>{const d=JSON.parse(window.__exportedHTML);d.fields.find(f=>f.id==='intro.hero-heading').text='Bulk changed heading';d.page.title='Bulk title';d.design.typography.fontFamily='Inter, -apple-system, BlinkMacSystemFont, sans-serif';d.design.elements['intro.hero-heading']={fontSize:58};d.fields.find(f=>f.id==='page.hero-image').alt='Updated alt without changing image';d.sections.order=['links','intro'];d.sections.items.links.label='Programs';d.design.colors.accent='#38bdf8';d.design.buttons.primary.background='#38bdf8';d.design.buttons.primary.text='#0f172a';d.design.buttons.secondary.background='#e8e7e0';d.design.buttons.secondary.text='#25302d';document.querySelector('#ue-json-input').value=JSON.stringify(d)})()");
 await js("document.querySelector('#ue-json-apply').click()");
 check('Import JSON applies bulk content and settings',await js("document.querySelector('h1').textContent==='Bulk changed heading'&&document.title==='Bulk title'&&document.querySelector('#ue-json-dialog').hidden"));
 check('image alt-only change preserves original src, srcset and loading',await js("(()=>{const img=document.querySelector('img[data-edit=\\\"Hero image\\\"]');return img.alt==='Updated alt without changing image'&&img.getAttribute('src')==='https://example.com/old.jpg?w=1000'&&img.getAttribute('srcset')==='https://example.com/old.jpg?w=400 400w'&&img.getAttribute('loading')==='lazy'})()"));
 check('reordered section updates its numbered eyebrow',await js("document.querySelector('main section')?.dataset.section==='links'&&document.querySelector('[data-section=links] .eyebrow')?.textContent==='01 / Programs'"));
 check('primary, secondary and navigation button text stay distinct',await js("(()=>{const primary=getComputedStyle(document.querySelector('a.button:not(.secondary)'));const secondary=getComputedStyle(document.querySelector('a.button.secondary'));const nav=getComputedStyle(document.querySelector('.site-links a'));return primary.backgroundColor==='rgb(56, 189, 248)'&&primary.color==='rgb(15, 23, 42)'&&secondary.backgroundColor==='rgb(232, 231, 224)'&&secondary.color==='rgb(37, 48, 45)'&&nav.backgroundColor==='rgb(56, 189, 248)'&&nav.color==='rgb(15, 23, 42)'})()"));

 check('JSON import applies targeted font slider values',await js("getComputedStyle(document.querySelector('h1')).fontSize==='58px'"));
 check('imported Inter CSS stack loads Google Fonts',await js("document.querySelector('#editor-google-font')?.href.includes('family=Inter')&&document.querySelector('#editor-page-style')?.textContent.includes('BlinkMacSystemFont')"));
 check('custom font stack appears in Page controls',await js("(()=>{document.querySelector('[data-tab=page]').click();return Boolean([...document.querySelectorAll('#ue-settings input')].find(el=>el.getAttribute('aria-label')==='Custom font family'&&el.value.includes('Inter')&&!el.hidden))})()"));
 await js("window.__exportedJSON=window.__exportedHTML;document.querySelector('#ue-copy').click()");
 await waitJS("window.__exportedHTML!==window.__exportedJSON");
 check('HTML copy preserves imported section labels and image alt',await js("window.__exportedHTML.includes('01 / Programs')&&window.__exportedHTML.includes('Updated alt without changing image')&&window.__exportedHTML.includes('srcset=')"));
 check('Copy HTML keeps editor open',await js("!document.querySelector('#ue-screen').hidden&&location.search==='?edit'"));

 await js("document.querySelector('#ue-pencil').click();window.__exportedHTML=window.__exportedJSON");

 await js("document.querySelector('#ue-undo').click()");
 check('undo restores pre-import page content and settings',await js("document.querySelector('h1').textContent==='Changed heading'&&document.title!=='Bulk title'&&getComputedStyle(document.querySelector('h1')).fontSize!=='58px'"));
 check('undo restores original image alt and section order',await js("document.querySelector('img[data-edit=\\\"Hero image\\\"]').alt==='A placeholder image'&&document.querySelector('main section')?.dataset.section==='intro'"));

 check('undo removes imported Google Fonts stylesheet',await js("!document.querySelector('#editor-google-font')"));
 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-import-json').click()");
 await js("(()=>{const d=JSON.parse(window.__exportedHTML);d.design.typography.fontFamily='Unlisted Experimental Font, sans-serif';document.querySelector('#ue-json-input').value=JSON.stringify(d);document.querySelector('#ue-json-apply').click()})()");
 check('unknown valid font stack imports with fallback',await js("document.querySelector('#ue-json-dialog').hidden&&document.querySelector('#editor-page-style')?.textContent.includes('Unlisted Experimental Font')&&!document.querySelector('#editor-google-font')"));
 await js("document.querySelector('#ue-undo').click()");
 // Simulate infrastructure-injected markup present in the live document.
 await js("(()=>{const base=document.createElement('base');base.href='/editor/';document.head.prepend(base);const beacon=document.createElement('script');beacon.src='https://static.cloudflareinsights.com/beacon.min.js/example';beacon.setAttribute('data-cf-beacon','{}');document.body.append(beacon)})()");
 await js("document.querySelector('#ue-copy').click()");
 await waitJS("typeof window.__exportedHTML==='string'");
 check('HTML export reflects edits',await js("window.__exportedHTML.includes('Changed heading') && !window.__exportedHTML.includes('id=\"ue-stylesheet\"')"));
 check('HTML export omits runtime base tag, analytics, and drag preview',await js("!window.__exportedHTML.includes('<base href=')&&!window.__exportedHTML.includes('static.cloudflareinsights.com')&&!window.__exportedHTML.includes('data-cf-beacon')&&!window.__exportedHTML.includes('ue-drop-preview')"));
 check('HTML export retains original editor installation script',await js("window.__exportedHTML.includes('src=\"../editor.js\"')"));
 check('HTML export retains editable attributes',await js("window.__exportedHTML.includes('data-edit=')"));
 check('HTML export retains section identifiers',await js("window.__exportedHTML.includes('data-section=')"));
 await send('Emulation.setDeviceMetricsOverride',{width:375,height:700,deviceScaleFactor:1,mobile:true});
 await js("document.querySelector('#ue-pencil').click()");
 check('mobile editor fills viewport',await js("Math.abs(document.querySelector('#ue-screen').getBoundingClientRect().width-375)<2"));
 check('mobile hides docking and fullscreen menu options',await js("['ue-dock-left','ue-dock-right','ue-fullscreen'].every(id=>getComputedStyle(document.getElementById(id)).display==='none')"));
 check('mobile input typography prevents iOS zoom',await js("parseFloat(getComputedStyle(document.querySelector('#ue-search')).fontSize)>=16&&parseFloat(getComputedStyle(document.querySelector('#ue-json-input')).fontSize)>=16"));
 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-import-json').click()");
 check('mobile JSON import dialog scrolls independently',await js("(()=>{const modal=document.querySelector('#ue-json-dialog'),area=document.querySelector('#ue-json-input'),card=document.querySelector('#ue-json-dialog .ue-json-card');return !modal.hidden&&getComputedStyle(area).overflowY==='auto'&&card.getBoundingClientRect().height<=innerHeight&&getComputedStyle(area).touchAction.includes('pan-y')})()"));
 await js("document.querySelector('#ue-json-cancel').click()");


 await send('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
 await js("document.querySelector('[data-tab=design]').click()");
 check('contextual element selector is available',await js("Boolean(document.querySelector('#ue-visual-target'))"));
 await js("document.querySelector('#ue-visual-target').value='intro.hero-heading';document.querySelector('#ue-visual-target').dispatchEvent(new Event('change',{bubbles:true}))");
 check('text selection only shows font size',await js("Boolean(document.querySelector('#ue-slider-fontSize'))&&!document.querySelector('#ue-slider-opacity')&&!document.querySelector('#ue-slider-gap')"));
 await js("document.querySelector('#ue-slider-fontSize').value='54';document.querySelector('#ue-slider-fontSize').dispatchEvent(new Event('input',{bubbles:true}))");
 check('font slider updates preview immediately',await js("getComputedStyle(document.querySelector('h1')).fontSize==='54px'&&document.querySelector('input[aria-label=\"Font size exact value\"]').value==='54'"));
 await js("document.querySelector('#ue-visual-target').value='page.hero-image';document.querySelector('#ue-visual-target').dispatchEvent(new Event('change',{bubbles:true}))");
 check('image selection shows opacity and roundness',await js("Boolean(document.querySelector('#ue-slider-opacity')&&document.querySelector('#ue-slider-radius'))&&!document.querySelector('#ue-slider-fontSize')"));
 await js("document.querySelector('input[aria-label=\"Opacity exact value\"]').value='65';document.querySelector('input[aria-label=\"Opacity exact value\"]').dispatchEvent(new Event('change',{bubbles:true}))");
 check('exact opacity updates selected image only',await js("getComputedStyle(document.querySelector('img[data-edit=\"Hero image\"]')).opacity==='0.65'&&getComputedStyle(document.querySelector('h1')).opacity==='1'"));
 await js("document.querySelector('#ue-visual-target').value='page.secondary-action';document.querySelector('#ue-visual-target').dispatchEvent(new Event('change',{bubbles:true}))");
 check('button selection shows padding and roundness',await js("Boolean(document.querySelector('#ue-slider-padding')&&document.querySelector('#ue-slider-radius'))"));
 await js("document.querySelector('#ue-slider-padding').value='24';document.querySelector('#ue-slider-padding').dispatchEvent(new Event('input',{bubbles:true}))");
 await js("document.querySelector('#ue-visual-target').value='group.links.site-links';document.querySelector('#ue-visual-target').dispatchEvent(new Event('change',{bubbles:true}))");
 check('group selection has a gap slider',await js("Boolean(document.querySelector('#ue-slider-gap'))&&!document.querySelector('#ue-slider-fontSize')"));
 await js("document.querySelector('#ue-slider-gap').value='18';document.querySelector('#ue-slider-gap').dispatchEvent(new Event('input',{bubbles:true}))");
 check('group gap updates immediately',await js("getComputedStyle(document.querySelector('nav.site-links')).columnGap==='18px'"));
 await js("document.querySelector('#ue-visual-target').value='section.intro';document.querySelector('#ue-visual-target').dispatchEvent(new Event('change',{bubbles:true}))");
 check('section selection has padding and opacity',await js("Boolean(document.querySelector('#ue-slider-padding')&&document.querySelector('#ue-slider-opacity'))&&!document.querySelector('#ue-slider-fontSize')"));
 await js("document.querySelector('#ue-slider-padding').value='36';document.querySelector('#ue-slider-padding').dispatchEvent(new Event('input',{bubbles:true}))");
 check('section padding updates immediately',await js("getComputedStyle(document.querySelector('[data-section=intro]')).paddingTop==='36px'"));
 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-copy-json').click()");
 await waitJS("window.__exportedHTML.includes('\"elements\"')");
 check('JSON v2 contains contextual settings',await js("(()=>{const d=JSON.parse(window.__exportedHTML);return d.design.elements['intro.hero-heading'].fontSize===54&&d.design.elements['page.hero-image'].opacity===65&&d.design.elements['page.secondary-action'].padding===24&&d.design.elements['group.links.site-links'].gap===18&&d.design.elements['section.intro'].padding===36})()"));
 await send('Page.reload',{ignoreCache:true});
 await waitJS("Boolean(document.querySelector('#ue-screen'))&&!document.querySelector('#ue-screen').hidden");
 check('slider values restore from local draft',await js("getComputedStyle(document.querySelector('h1')).fontSize==='54px'&&getComputedStyle(document.querySelector('img[data-edit=\"Hero image\"]')).opacity==='0.65'"));
 await js("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__exportedHTML=text}}})");
 await js("document.querySelector('#ue-copy').click()");
 await waitJS("typeof window.__exportedHTML==='string'&&window.__exportedHTML.includes('editor-visual-style')");
 check('HTML export contains targeted visual CSS',await js("window.__exportedHTML.includes('font-size:54px!important')&&window.__exportedHTML.includes('opacity:0.65!important')&&window.__exportedHTML.includes('padding:24px!important')&&window.__exportedHTML.includes('gap:18px!important')&&window.__exportedHTML.includes('padding:36px!important')"));
 console.log('All browser smoke checks passed');
}catch(error){console.error(error,chromeError);process.exitCode=1}
finally{try{ws?.close()}catch{}chrome.kill('SIGKILL');server.close();await rm(profile,{recursive:true,force:true})}
