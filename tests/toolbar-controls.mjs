import assert from 'node:assert/strict';
import {mountNumber,mountOverflow} from '../top-editor/design.js';
// Popup visibility must not schedule overflow reparenting (which destroys focus).
const saved=Object.fromEntries(['document','window','MutationObserver','ResizeObserver','requestAnimationFrame'].map(k=>[k,globalThis[k]]));
let watch,frames=[];
globalThis.document={body:{},getElementById:id=>id==='ie-format-row'?{children:[]}:{}};
globalThis.window={addEventListener(){}};
globalThis.MutationObserver=class{constructor(fn){watch=fn}observe(){}};
globalThis.ResizeObserver=class{observe(){}};
globalThis.requestAnimationFrame=fn=>frames.push(fn);
mountOverflow({getClientRects:()=>[]},{});
frames.shift()();
watch([{type:'attributes',attributeName:'hidden',target:{matches:()=>false}}]);
assert.equal(frames.length,0,'Opening a popup must preserve focus');
watch([{type:'attributes',attributeName:'hidden',target:{matches:()=>true}}]);
assert.equal(frames.length,1,'Applicable formatting changes must still update overflow');

// Exercise real numeric event handlers: typing stays free until committed;
// one captured pointer gesture changes the value continuously.
class Element extends EventTarget{
 constructor(){super();this.value='';this.style={setProperty(){}};this.attrs={};this.dataset={};this.hidden=false;this.children=[];this.capture=null}
 set value(v){this.rawValue=String(v)}
 get value(){return this.rawValue}
 setAttribute(k,v){this.attrs[k]=String(v)}
 getAttribute(k){return this.attrs[k]}
 append(child){this.children.push(child)}
 getBoundingClientRect(){return {left:100,right:125,bottom:40,width:160}}
 contains(el){return el===this||this.children.includes(el)}
 setPointerCapture(id){this.capture=id}
 hasPointerCapture(id){return this.capture===id}
 releasePointerCapture(){this.capture=null}
 select(){}
 blur(){this.dispatchEvent(new Event('blur'))}
}
const input=new Element(),handle=new Element(),control=new Element(),body=new Element();
input.id='size';input.value='16';input.setAttribute('aria-label','Size');
input.closest=()=>control;control.querySelector=()=>handle;control.children=[input,handle];
globalThis.document=new Element();document.body=body;document.createElement=()=>new Element();
globalThis.innerWidth=1000;globalThis.innerHeight=800;
let applied=[];input.addEventListener('ie-number-input',()=>applied.push(Number(input.value)));
mountNumber(input,1,500,72);
input.dispatchEvent(new Event('focus'));input.value='';input.dispatchEvent(new Event('input'));
assert.equal(input.value,'');assert.deepEqual(applied,[]);
input.value='2';input.dispatchEvent(new Event('input'));
assert.equal(input.value,'2');assert.deepEqual(applied,[]);
input.value='28';input.blur();assert.deepEqual(applied,[28]);
input.dispatchEvent(new Event('focus'));input.value='';input.blur();
assert.equal(input.value,'28');assert.deepEqual(applied,[28],'Empty blur must not change the page');
const key=new Event('keydown',{cancelable:true});Object.defineProperty(key,'key',{value:'Escape'});
input.dispatchEvent(new Event('focus'));input.value='99';input.dispatchEvent(key);
assert.equal(input.value,'28');
const pointer=(type,x)=>{const e=new Event(type,{cancelable:true});Object.assign(e,{button:0,pointerId:1,clientX:x});handle.dispatchEvent(e)};
pointer('pointerdown',100);assert.equal(body.children[0].hidden,false,'Slider appears before pointer release');
pointer('pointermove',140);assert.equal(Number(input.value),46);assert.equal(handle.capture,1);
pointer('pointerup',140);assert.equal(body.children[0].hidden,true);assert.equal(handle.capture,null);
for(const [k,v] of Object.entries(saved))if(v===undefined)delete globalThis[k];else globalThis[k]=v;
console.log('PASS popup focus stability, free numeric typing, empty/cancel handling, and one-motion drag');
