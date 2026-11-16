/* Optional page branding. No image is fetched until a valid URL is supplied. */
export const validBrandURL=value=>{
 if(value==='')return true;
 if(typeof value!=='string'||!value.trim())return false;
 // Favicons already on a page may use data URIs or site-relative paths.
 if(value.toLowerCase().startsWith('data:image/'))return ['png','jpeg','gif','webp','svg+xml','x-icon'].some(t=>{const type=value.slice(11).toLowerCase();return type.startsWith(t+';')||type.startsWith(t+',')});
 try{
  const url=new URL(value,'https://site.example/');
  return ['https:','http:'].includes(url.protocol)&&!!url.hostname;
 }catch{return false}
};
export const readBranding=doc=>({
 logoUrl:doc.querySelector('img[data-site-logo]')?.getAttribute('src')||'',
 faviconUrl:doc.querySelector('link[rel~="icon"]')?.getAttribute('href')||''
});
export function applyBranding(doc,meta,original={}){
 const logoUrl=validBrandURL(meta.logoUrl||'')?meta.logoUrl||'':'';
 let logo=doc.querySelector('img[data-site-logo]');
 const header=doc.querySelector('header:not(#ue-head),.topbar');
 if(!logo&&logoUrl&&header){
  logo=doc.createElement('img');
  logo.setAttribute('data-site-logo','');
  logo.setAttribute('alt','Site logo');
  logo.setAttribute('data-editor-generated-logo','');
  logo.style.cssText='height:44px;width:auto;max-width:160px;object-fit:contain;margin-right:12px';
  header.prepend(logo);
 }
 if(logo){
  if(logoUrl){
   if(logo.getAttribute('src')!==logoUrl)logo.setAttribute('src',logoUrl);
   logo.hidden=false;
  }else{
   logo.removeAttribute('src');
   logo.hidden=true;
   if(logo.hasAttribute('data-editor-generated-logo'))logo.remove();
  }
 }
 let icon=doc.querySelector('link[rel~="icon"]');
 const faviconUrl=validBrandURL(meta.faviconUrl||'')?meta.faviconUrl||'':'';
 if(faviconUrl){
  if(!icon){icon=doc.createElement('link');icon.rel='icon';doc.head.append(icon)}
  if(icon.getAttribute('href')!==faviconUrl)icon.setAttribute('href',faviconUrl);
 }else icon?.remove();
}
