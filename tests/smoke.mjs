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
 if(!/^\/(editor\.js|interface\.js|content\.js|design\.js|storage\.js|export\.js|editor\.css|tests\/fixture\.html)$/.test(path)){res.writeHead(404).end();return}
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
 await js("document.querySelector('[data-tab=design]').click()");
 check('design controls display',await js("!document.querySelector('#ue-style-panel').hidden && Boolean(document.querySelector('#ue-style-panel input'))"));
 check('design color edits apply',await js("(()=>{const swatch=document.querySelector('#ue-style-panel input[type=color]');if(!swatch)return false;swatch.value='#123456';swatch.dispatchEvent(new Event('input',{bubbles:true}));return document.querySelector('#editor-page-style')?.textContent.includes('#123456')})()"));
 await js("document.querySelector('#ue-undo').click()");
 check('undo design edit',await js("!document.querySelector('#editor-page-style')?.textContent.includes('#123456')"));

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
 check('image undo',await js("document.querySelector('img[data-edit=\"Hero image\"]')?.getAttribute('src')==='https://example.com/old.jpg'"));

 await js("document.querySelector('#ue-pencil').click()");
 await js(edit);
 await js("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__exportedHTML=text}}})");
 await js("document.querySelector('#ue-copy-toggle').click()");
 check('Copy JSON menu opens from caret',await js("!document.querySelector('#ue-copy-menu').hidden"));
 await js("document.querySelector('#ue-copy-json').click()");
 await waitJS("typeof window.__exportedHTML==='string'");
 check('Copy JSON exports editable data without HTML',await js("(()=>{const d=JSON.parse(window.__exportedHTML);return d.version===1&&d.fields.some(f=>f.label==='Hero heading'&&f.text==='Changed heading')&&Boolean(d.sections)&&Boolean(d.design)&&Boolean(d.page)&&!('html' in d)&&!window.__exportedHTML.includes('<!DOCTYPE html>')})()"));
 check('Copy JSON leaves editor open',await js("!document.querySelector('#ue-screen').hidden"));
 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-import-json').click()");
 check('Import JSON dialog opens',await js("!document.querySelector('#ue-json-dialog').hidden"));
 await js("document.querySelector('#ue-json-input').value='{broken';document.querySelector('#ue-json-apply').click()");
 check('invalid JSON does not change page',await js("!document.querySelector('#ue-json-error').hidden&&document.querySelector('h1').textContent==='Changed heading'"));
 await js("(()=>{const d=JSON.parse(window.__exportedHTML);d.fields.find(f=>f.label==='Hero heading').text='Bulk changed heading';d.page.title='Bulk title';d.design.style.font='Inter, -apple-system, BlinkMacSystemFont, sans-serif';document.querySelector('#ue-json-input').value=JSON.stringify(d)})()");
 await js("document.querySelector('#ue-json-apply').click()");
 check('Import JSON applies bulk content and settings',await js("document.querySelector('h1').textContent==='Bulk changed heading'&&document.title==='Bulk title'&&document.querySelector('#ue-json-dialog').hidden"));
 check('imported Inter CSS stack loads Google Fonts',await js("document.querySelector('#editor-google-font')?.href.includes('family=Inter')&&document.querySelector('#editor-page-style')?.textContent.includes('BlinkMacSystemFont')"));
 check('custom font stack appears in Design controls',await js("(()=>{document.querySelector('[data-tab=design]').click();return Boolean([...document.querySelectorAll('#ue-style-panel input')].find(el=>el.getAttribute('aria-label')==='Custom font family'&&el.value.includes('Inter')&&!el.hidden))})()"));
 await js("document.querySelector('#ue-undo').click()");
 check('undo restores pre-import page content and settings',await js("document.querySelector('h1').textContent==='Changed heading'&&document.title!=='Bulk title'"));
 check('undo removes imported Google Fonts stylesheet',await js("!document.querySelector('#editor-google-font')"));
 await js("document.querySelector('#ue-copy-toggle').click();document.querySelector('#ue-import-json').click()");
 await js("(()=>{const d=JSON.parse(window.__exportedHTML);d.design.style.font='Unlisted Experimental Font, sans-serif';document.querySelector('#ue-json-input').value=JSON.stringify(d);document.querySelector('#ue-json-apply').click()})()");
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
 console.log('All browser smoke checks passed');
}catch(error){console.error(error,chromeError);process.exitCode=1}
finally{try{ws?.close()}catch{}chrome.kill('SIGKILL');server.close();await rm(profile,{recursive:true,force:true})}
