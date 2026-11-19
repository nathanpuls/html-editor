import assert from 'node:assert/strict';
import {contrastingInk,rgba,hex,outlineName} from '../top-editor/design.js';
for(const color of ['#fff','#ffffee','#00000000'])assert.equal(contrastingInk(color),'#000000');
for(const color of ['#000','#001122'])assert.equal(contrastingInk(color),'#ffffff');
assert.equal(hex('rgba(10,20,30,0.5)'),'#0a141e80');
assert.equal(rgba('#ff880080')[3],128/255);
const link={tagName:'A',children:[],textContent:'Email',getAttribute:name=>name==='data-edit'?'Email link item':null,querySelector:()=>null,matches:selector=>selector==='a'};
assert.equal(outlineName(link),'Email');
console.log('PASS circular color contrast, alpha preservation and concise link naming');
