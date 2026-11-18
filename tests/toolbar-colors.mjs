import assert from 'node:assert/strict';
import {hex,rgba,colorHex,rgbToHSV,hsvToRGB} from '../top-editor/design.js';
assert.equal(hex('rgba(10, 20, 30, 0.5)'),'#0a141e80');
assert.equal(hex('transparent'),'#00000000');
assert.equal(hex('#3698'),'#33669988');
assert.equal(hex('rgb(100% 0% 0% / 50%)'),'#ff000080');
for(const value of ['#ff0000','#00ff00','#0000ff','#ffffff','#000000','#6b9ac480']){
 const color=rgba(value);
 assert.equal(colorHex(hsvToRGB(rgbToHSV(color),color[3])),value);
}
console.log('PASS alpha, shorthand HEX, percentages, transparency and HSV round trips');
