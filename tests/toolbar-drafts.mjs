import assert from 'node:assert/strict';
import {createDraftStore} from '../top-editor/history.js';
const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
globalThis.MutationObserver=class{observe(){}disconnect(){}};
globalThis.location={href:'https://example.com/page?edit'};
let output='original',restored=null;
const first=createDraftStore('original',()=>output,html=>restored=html);
assert.equal(first.restore(),false);
output='edited';first.save();assert.equal(values.size,1);
const refresh=createDraftStore('original',()=>'',html=>restored=html);
assert.equal(refresh.restore(),true);assert.equal(restored,'edited');
// Runtime or host source changes must not silently discard unfinished edits.
restored=null;const changed=createDraftStore('new original',()=>'',html=>restored=html);
assert.equal(changed.restore(),true);assert.equal(restored,'edited');assert.equal(values.size,1);
first.save(); // last saved value is unchanged; no redundant storage write.
assert.equal(values.size,1);
output='second edit';first.save();
globalThis.location.href='https://example.com/different-page';
assert.equal(createDraftStore('original',()=>'',()=>{}).restore(),false);
globalThis.location.href='https://example.com/page?preview=1';
assert.equal(createDraftStore('original',()=>'',()=>{}).restore(),true);
refresh.clear();assert.equal(values.size,0);
// Storage being blocked must not break editing.
globalThis.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
assert.doesNotThrow(()=>createDraftStore('original',()=>output,()=>{}).restore());
assert.doesNotThrow(()=>createDraftStore('original',()=>output,()=>{}).save());
console.log('PASS draft restoration, source changes, page isolation, clearing and blocked storage');
