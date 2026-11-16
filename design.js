/* Common design transformations. */
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
export const safeColor=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
export const rgbToHex=value=>{
  const v=String(value||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  const m=v.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return m?'#'+[m[1],m[2],m[3]].map(n=>Math.min(255,Number(n)).toString(16).padStart(2,'0')).join(''):null;
 };

export const hexColor=value=>{
  const v=String(value).trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  if(/^#[0-9a-f]{3}$/i.test(v))return '#'+[...v.slice(1)].map(c=>c+c).join('').toLowerCase();
  return rgbToHex(v);
 };

export const varLabel=name=>name.slice(2).split(/[-_]+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
