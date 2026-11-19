import assert from 'node:assert/strict';
import {canArrange,outlineName} from '../top-editor/design.js';
const parent={},otherParent={};
const node=(parentElement,runtime=false)=>({parentElement,closest:()=>runtime?{}:null,matches:()=>false,contains:()=>false});
const first=node(parent),second=node(parent),nested=node(otherParent),runtime=node(parent,true);
assert.equal(canArrange(first,second),true);
assert.equal(canArrange(first,nested),false);
assert.equal(canArrange(first,first),false);
assert.equal(canArrange(first,runtime),false);
assert.equal(canArrange(null,second),false);
console.log('PASS sibling reordering, hierarchy protection and runtime exclusion');

const element=(tag,text='',attributes={})=>({tagName:tag,textContent:text,children:[],getAttribute:name=>attributes[name]||null,querySelector:()=>null});
assert.equal(outlineName(element('DIV','',{id:'4051417d-3b56-4a07-b0cb-5d3a4a53'})),'Container');
assert.equal(outlineName(element('SECTION','',{'data-edit':'site-footer'})),'Site footer');
assert.equal(outlineName(element('A','Read more')),'Link · Read more');
console.log('PASS readable outline labels without raw IDs');
