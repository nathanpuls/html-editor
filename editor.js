/* HTML Editor v1 — standalone, dependency-free.
   Source: extracted from Dino → Shared!B22; this copy does not modify live.ends.at.
   Include with <script src="editor.js" defer></script> in any editable HTML page. */
(()=>{if(window.__universalEditReady)return;window.__universalEditReady=true;
const editorStyle=document.createElement('style');
editorStyle.id='ue-style';
editorStyle.textContent="#ue-pencil{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:2147483000;display:grid;place-items:center;width:44px;height:44px;border:1px solid #ddd;border-radius:50%;background:white;color:#111;box-shadow:0 3px 16px #0002;cursor:pointer}\n#ue-pencil svg,#ue-screen svg{width:18px;height:18px}\n#ue-screen{position:fixed;inset:0;z-index:2147483600;overflow:auto;height:100dvh;background:white;color:#171717;padding:calc(22px + env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));font:15px/1.5 Manrope,system-ui,sans-serif}\n#ue-screen[hidden],#ue-pencil[hidden]{display:none!important}\n#ue-screen *{box-sizing:border-box}\n#ue-wrap{max-width:560px;margin:auto}\n#ue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:24px}\n#ue-head strong{font-size:21px}\n#ue-screen button{font:inherit;cursor:pointer}\n#ue-head button,#ue-add{border:1px solid #ddd;background:#fff;color:#171717;border-radius:9px;padding:10px 13px}\n#ue-head #ue-copy{background:#171717;color:#fff;border-color:#171717}\n#ue-fields{display:grid;gap:18px}\n.ue-item{display:grid;gap:9px;padding-bottom:18px}\n.ue-item label{display:grid;gap:5px;font:700 12px/1.5 Manrope,system-ui,sans-serif;color:#666}\n.ue-item input,.ue-item textarea,.ue-item select{width:100%;border:1px solid #ddd;border-radius:8px;padding:11px;background:#fff;color:#171717;font:500 16px/1.5 Manrope,system-ui,sans-serif}\n.ue-item select{appearance:auto;min-height:47px;cursor:pointer}\n.ue-item input[hidden]{display:none!important}\n.ue-item textarea{min-height:110px;max-height:60dvh;resize:vertical;overflow-y:hidden}\n.ue-image-preview{display:block;max-width:100%;max-height:190px;object-fit:contain;object-position:left center;border-radius:8px;background:#f4f4f4}\n.ue-image-preview:not([src]){display:none}\n.ue-item textarea.ue-article{min-height:200px;line-height:1.7}\n#ue-screen.ue-fullscreen .ue-item textarea{max-height:80dvh}\n.ue-controls{display:flex;justify-content:flex-end;gap:5px}\n.ue-controls button{width:38px;height:36px;border:0;border-radius:7px;background:#f3f3f3;display:grid;place-items:center}\n.ue-controls button:disabled{opacity:.3}\n#ue-add{display:flex;align-items:center;gap:8px;margin-top:20px}\n#ue-add[hidden]{display:none!important}\n#ue-message{font-size:13px;color:#a22}\n#ue-screen{box-sizing:border-box;left:auto;right:0;top:0;bottom:0;width:min(430px,100%);height:100dvh;max-height:100dvh;border-left:1px solid #ddd;box-shadow:-12px 0 45px #0002;overflow:hidden;padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}\n#ue-wrap{display:flex;flex-direction:column;height:100%;min-height:0}\n#ue-head{flex:none;margin-bottom:16px;position:relative;justify-content:center;min-height:32px}\n#ue-undo{position:absolute;left:0;top:0;border:0!important;background:transparent!important;color:#555!important;padding:5px!important;width:32px;height:32px}#ue-undo:disabled{opacity:.25}#ue-fullscreen{position:absolute;right:0;top:0;display:grid;place-items:center;width:32px;height:32px;border:0!important;border-radius:7px;padding:0!important;background:transparent!important;color:#555!important}\n#ue-fullscreen:hover{background:#f2f2f2!important}\n#ue-body{scrollbar-width:none}\n#ue-body::-webkit-scrollbar{display:none}\n#ue-screen.ue-fullscreen{inset:0;width:100%;height:100dvh;max-height:100dvh;border:0;box-shadow:none;border-radius:0;padding:calc(22px + env(safe-area-inset-top)) 28px calc(16px + env(safe-area-inset-bottom))}\n#ue-screen.ue-fullscreen #ue-wrap{width:100%;max-width:880px;margin:0 auto}\n#ue-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 3px 24px}\n#ue-actions{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px 2px;background:white}\n#ue-actions button{min-width:104px;padding:11px 18px;border:1px solid #ddd;border-radius:9px;background:#fff;color:#171717}\n#ue-actions #ue-copy{background:#171717;color:white;border-color:#171717}\n@media(max-width:640px){#ue-screen:not(.ue-fullscreen){top:auto;bottom:0;left:0;right:0;width:100%;height:min(62dvh,620px);border-left:0;border-top:1px solid #ddd;border-radius:16px 16px 0 0;box-shadow:0 -12px 40px #0002}#ue-screen.ue-fullscreen{padding:calc(22px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))}}\n";
editorStyle.textContent+="\n#ue-tabs{display:flex;gap:4px;flex:none;margin:0 0 15px;border-bottom:1px solid #e8e8e8}\n#ue-tabs button{flex:1;border:0;background:transparent;color:#777;padding:10px 4px;font:600 13px Manrope,system-ui,sans-serif;border-bottom:2px solid transparent;cursor:pointer}\n#ue-tabs button[aria-selected=\"true\"]{color:#111;border-bottom-color:#111}\n#ue-content[hidden],#ue-fields[hidden],#ue-style-panel[hidden],#ue-sections[hidden],#ue-settings[hidden],#ue-results[hidden]{display:none!important}\n#ue-style-panel,#ue-sections,#ue-settings{display:grid;gap:13px}\n.ue-setting{position:relative;padding-right:35px!important}.ue-field-reset{position:absolute;right:0;top:2px;width:28px;height:28px;padding:5px!important;border:0!important;border-radius:6px;background:transparent!important;color:#666!important;cursor:pointer}.ue-field-reset:disabled{opacity:.25;cursor:default}.ue-field-reset svg{width:16px;height:16px}.ue-meta{display:grid;gap:12px;padding-bottom:16px;margin-bottom:18px;border-bottom:1px solid #eee}.ue-meta label{font:700 12px Manrope,system-ui,sans-serif;color:#666;display:grid;gap:6px}.ue-meta input,.ue-meta textarea{padding:10px;border:1px solid #ddd;border-radius:8px;font:14px Manrope,system-ui,sans-serif;width:100%;color:#171717;background:white}.ue-meta textarea{min-height:78px;resize:vertical}\n.ue-deleted{opacity:.45}.ue-hidden{opacity:.65}.ue-section-row .ue-controls{gap:3px}\n.ue-section-row{display:flex;gap:8px;align-items:center}.ue-section-row .ue-section-link{flex:1;min-width:0}.ue-section-row .ue-controls{flex:none}\n.ue-setting{display:grid;gap:7px;padding-bottom:12px;border-bottom:1px solid #eee}\n.ue-setting label{font:700 12px Manrope,system-ui,sans-serif;color:#555}\n.ue-setting input,.ue-setting select{min-height:40px;width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;background:white;color:#111;font:14px Manrope,system-ui,sans-serif}\n.ue-color-row{display:grid;grid-template-columns:45px minmax(0,1fr);gap:9px;align-items:center}\n.ue-color-row input[type=color]{padding:3px;width:45px;height:40px;cursor:pointer}\n.ue-section-link{display:block;width:100%;text-align:left;border:1px solid #ddd!important;border-radius:8px!important;background:#fff!important;padding:11px 12px!important;font:14px Manrope,system-ui,sans-serif}\n";
editorStyle.textContent+='\n#ue-pencil{border-radius:50%!important;aspect-ratio:1 / 1}\n#ue-searchbar{flex:none;position:relative;margin-bottom:10px}#ue-search{height:42px;width:100%;padding:9px 35px 9px 14px;border:1px solid #ddd;border-radius:9px;font:14px system-ui,sans-serif;color:#171717;background:#fafafa}#ue-search:focus{outline:1px solid #888;background:#fff}#ue-search-clear{position:absolute;right:5px;top:5px;width:32px;height:32px;border:0;background:transparent;color:#777}#ue-results{display:grid;gap:5px}#ue-results button{display:grid;gap:3px;text-align:left;width:100%;border:1px solid #eee;border-radius:9px;padding:11px;background:#fff;color:#222;font:14px system-ui,sans-serif}#ue-results button:hover{background:#f5f5f5}#ue-results small{font-size:12px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ue-sections-toggle{display:flex;justify-content:space-between;width:100%;border:0;border-bottom:1px solid #eee;background:white;padding:13px 2px;font:650 14px system-ui,sans-serif;text-align:left}#ue-sections-toggle span{font-weight:400;color:#777;font-size:12px}#ue-sections{padding:10px 0 23px}#ue-settings .ue-meta{margin:0;border:0}';
editorStyle.textContent+="\n#ue-screen:not(.ue-fullscreen){width:min(var(--ue-panel-width,430px),100%)}\n#ue-resize{position:absolute;z-index:4;left:0;top:0;bottom:0;width:16px;cursor:ew-resize;touch-action:none;border:0;padding:0;background:transparent;color:#9da3a0;outline-offset:-2px}\n#ue-resize:before{content:\"\";position:absolute;left:0;top:calc(30% - 19px);width:15px;height:38px;border:1px solid #e1e3e2;border-left:0;border-radius:0 8px 8px 0;background:#f7f8f7;transition:background .15s,border-color .15s}\n#ue-resize svg{position:absolute;top:calc(30% - 10px);left:0;width:15px!important;height:20px!important;pointer-events:none;stroke-width:1.7}\n#ue-resize:hover:before,#ue-resize:focus-visible:before{background:#e9edeb;border-color:#c1c9c4}\n#ue-resize:hover,#ue-resize:focus-visible{color:#56635d}\n#ue-screen.ue-fullscreen #ue-resize{display:none}\n#ue-head{padding:0 40px}\n#ue-tabs button{display:flex;align-items:center;justify-content:center;gap:7px}\n#ue-tabs button svg{width:16px;height:16px}\n#ue-screen :is(input,textarea,select,button):focus-visible{outline:2px solid #93a6a0!important;outline-offset:1px!important;box-shadow:none!important}\n#ue-screen :is(input,textarea,select):focus{border-color:#9eaaa4!important;box-shadow:none!important}\n#ue-sections-toggle{border:1px solid #e3e3e3!important;border-radius:999px!important;background:#f9f9f9!important;padding:10px 15px!important;margin:3px 0 14px;align-items:center}\n#ue-sections-toggle span{display:flex;align-items:center;gap:5px;font-weight:600;color:#555}\n#ue-sections-toggle[aria-expanded=true]{background:#f1f3f2!important}\n#ue-sections-toggle svg{width:15px;height:15px}\n#ue-section-jump{display:inline-flex}\n.ue-section-row .ue-section-jump{flex:none;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:8px;background:#f4f5f4;color:#53625b}\n.ue-section-row .ue-section-jump:hover{background:#e6ebe7}\n.ue-section-row .ue-section-jump svg{width:16px;height:16px}\n@media(max-width:640px){#ue-screen:not(.ue-fullscreen){width:100%!important}#ue-resize{display:none}}\n";
editorStyle.textContent+="\n#ue-actions{display:flex;align-items:center;justify-content:flex-start;gap:5px}\n#ue-actions button{min-width:0;width:auto;flex:none;padding:10px 12px}\n#ue-actions #ue-cancel,#ue-actions #ue-revert{border-color:transparent;background:transparent;color:#686868;font-weight:500}\n#ue-actions #ue-cancel:hover,#ue-actions #ue-revert:hover{background:#f5f5f5;color:#222}\n#ue-actions #ue-copy{margin-left:auto;min-width:110px;padding:11px 20px;font-weight:650}\n#ue-head{padding:0 36px 0 36px}\n@media(max-width:390px){#ue-actions{gap:0}#ue-actions button{font-size:13px;padding:10px 8px}#ue-actions #ue-copy{min-width:90px;padding:10px 13px}}\n";
editorStyle.textContent+="\n#ue-style-panel .ue-custom-heading{font-weight:700;font-size:14px;border-top:1px solid #e7e7e7;padding-top:17px;margin-top:7px;color:#242424}\n";
editorStyle.textContent+="\n#ue-style-panel .ue-button-title{font-size:13px;font-weight:650;color:#555;padding-top:10px}\n";
editorStyle.textContent+="\n#ue-style-panel .ue-button-block{display:grid;gap:11px;padding:2px 0 20px;border-bottom:1px solid #e9e9e9}\n#ue-style-panel .ue-button-title{padding-top:8px}\n#ue-style-panel .ue-button-preview{display:block;box-sizing:border-box;min-height:48px;padding:13px 16px;border:1px solid #0002;overflow-wrap:anywhere;line-height:1.4;pointer-events:none}\n#ue-style-panel .ue-button-block .ue-setting{padding-bottom:8px}\n#ue-style-panel .ue-button-block .ue-setting:last-child{border-bottom:0}\n";
editorStyle.textContent+="\n/* Horizontal, full-height dock: both edges resize; header drags sideways. */\n@media(min-width:641px){\n #ue-screen:not(.ue-fullscreen){top:0!important;bottom:0!important;height:100dvh!important;max-height:100dvh!important;border:1px solid #dedede;border-top:0;border-bottom:0;box-shadow:0 0 38px #00000016}\n #ue-head{cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}\n #ue-head:active{cursor:grabbing}\n #ue-head button{cursor:pointer}\n #ue-resize,#ue-resize-right{position:absolute;z-index:4;top:0;bottom:0;width:15px;padding:0;border:0;background:transparent;cursor:ew-resize;touch-action:none;color:#9da3a0}\n #ue-resize{left:0}\n #ue-resize-right{right:0;left:auto}\n #ue-resize-right:before{content:\"\";position:absolute;right:0;top:calc(30% - 19px);width:15px;height:38px;border:1px solid #e1e3e2;border-right:0;border-radius:8px 0 0 8px;background:#f7f8f7;transition:background .15s,border-color .15s}\n #ue-resize-right svg{position:absolute;top:calc(30% - 10px);right:0;width:15px!important;height:20px!important;pointer-events:none;stroke-width:1.7}\n #ue-resize-right:hover:before,#ue-resize-right:focus-visible:before{background:#e9edeb;border-color:#c1c9c4}\n #ue-resize-right:hover,#ue-resize-right:focus-visible{color:#56635d}\n #ue-screen.ue-fullscreen{left:0!important;right:0!important}\n #ue-screen.ue-fullscreen #ue-resize-right{display:none}\n}\n@media(max-width:640px){#ue-resize-right{display:none!important}}\n";
editorStyle.textContent+="\n/* Compact contextual design previews: expand only the button being edited. */\n#ue-style-panel details.ue-button-block{display:block;position:relative;padding:1px 0 18px}\n#ue-style-panel .ue-button-summary{display:block;cursor:pointer;list-style:none;padding:0 38px 0 0}\n#ue-style-panel .ue-button-summary::-webkit-details-marker{display:none}\n#ue-style-panel .ue-button-summary:focus-visible{outline:2px solid #777;outline-offset:4px;border-radius:4px}\n#ue-style-panel .ue-button-summary .ue-button-preview{margin-top:9px}\n#ue-style-panel .ue-button-hint{font-size:11px;color:#888;margin-top:8px}\n#ue-style-panel details[open] .ue-button-hint{display:none}\n#ue-style-panel .ue-button-jump{position:absolute;right:2px;top:39px;display:grid;place-items:center;width:31px;height:31px;padding:0;border:0;border-radius:7px;background:#f4f4f4;color:#666;cursor:pointer}\n#ue-style-panel .ue-button-jump:hover{background:#e9e9e9;color:#111}\n#ue-style-panel .ue-button-jump svg{width:15px;height:15px}\n#ue-style-panel details.ue-button-block .ue-setting:first-of-type{margin-top:13px}\n";
editorStyle.textContent+="\n/* The editor owns its search clear control; suppress native WebKit/Chrome clear glyph. */\n#ue-search::-webkit-search-cancel-button,\n#ue-search::-webkit-search-decoration,\n#ue-search::-webkit-search-results-button,\n#ue-search::-webkit-search-results-decoration{-webkit-appearance:none;appearance:none;display:none}\n#ue-search-clear{top:50%;right:5px;transform:translateY(-50%);display:grid;place-items:center;width:32px;height:32px;padding:0;border-radius:6px;line-height:1}\n#ue-search-clear svg{display:block;width:16px!important;height:16px!important}\n#ue-search-clear:hover{background:#ededed;color:#333}\n#ue-search-clear[hidden]{display:none!important}\n";
editorStyle.textContent+="\n@media(min-width:641px){\n #ue-screen:not(.ue-fullscreen) #ue-head{min-height:55px;padding-top:21px;margin-top:-7px;cursor:grab}\n #ue-screen:not(.ue-fullscreen) #ue-head:active{cursor:grabbing}\n #ue-screen:not(.ue-fullscreen) #ue-head #ue-undo,\n #ue-screen:not(.ue-fullscreen) #ue-head #ue-fullscreen{top:21px}\n #ue-move-grip{position:absolute;top:0;left:50%;transform:translateX(-50%);width:48px;height:17px;border:1px solid #e5e5e5;border-radius:0 0 9px 9px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;color:#aaa;pointer-events:none}\n #ue-move-grip svg{width:19px!important;height:14px!important;transform:rotate(90deg);stroke-width:1.5;pointer-events:none}\n #ue-head:hover #ue-move-grip{background:#ececec;border-color:#d1d1d1;color:#777}\n}\n@media(max-width:640px){#ue-move-grip{display:none}}\n#ue-screen.ue-fullscreen #ue-move-grip{display:none}\n";
editorStyle.textContent+="\n/* Align all three window grips along the top edge. Resizing still works anywhere along either edge. */\n@media(min-width:641px){\n #ue-screen:not(.ue-fullscreen) #ue-resize:before,\n #ue-screen:not(.ue-fullscreen) #ue-resize-right:before{top:3px!important}\n #ue-screen:not(.ue-fullscreen) #ue-resize svg,\n #ue-screen:not(.ue-fullscreen) #ue-resize-right svg{top:12px!important}\n #ue-screen:not(.ue-fullscreen) #ue-head #ue-fullscreen{top:21px}\n}\n#ue-actions #ue-undo{position:static!important;left:auto!important;top:auto!important;display:inline-grid;place-items:center;width:34px;min-width:34px;height:36px;padding:0!important;border:0!important;border-radius:8px;background:transparent!important;color:#686868!important;flex:none}\n#ue-actions #ue-undo svg{width:17px;height:17px}\n#ue-actions #ue-undo:not(:disabled):hover{background:#f5f5f5;color:#222}\n#ue-actions #ue-undo:disabled{opacity:.3;cursor:default}\n@media(max-width:390px){#ue-actions #ue-undo{width:30px;min-width:30px}}\n";
editorStyle.textContent+="\n/* Keep the centered move grip flush with the very top of the panel. */\n@media(min-width:641px){#ue-screen:not(.ue-fullscreen) #ue-move-grip{top:calc(-15px - env(safe-area-inset-top))!important}}\n";
editorStyle.textContent+="\n/* Phones: editor is a full-screen, stationary workspace (not a bottom sheet). */\n@media(max-width:640px){\n #ue-screen,#ue-screen:not(.ue-fullscreen),#ue-screen.ue-fullscreen{\n  position:fixed!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;\n  width:100%!important;height:100dvh!important;max-height:100dvh!important;\n  border:0!important;border-radius:0!important;box-shadow:none!important;\n  padding:calc(18px + env(safe-area-inset-top)) 20px calc(12px + env(safe-area-inset-bottom))!important;\n }\n #ue-screen #ue-wrap,#ue-screen.ue-fullscreen #ue-wrap{width:100%!important;max-width:none!important;margin:0!important}\n #ue-screen #ue-head{cursor:default!important;touch-action:auto!important}\n #ue-screen #ue-fullscreen,#ue-screen #ue-resize,#ue-screen #ue-resize-right,#ue-screen #ue-move-grip{display:none!important}\n}\n";
document.head.append(editorStyle);
function init(){
 const selector='[data-edit]';
 function editable(){return Array.from(document.querySelectorAll(selector)).filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!el.querySelector(selector));}
 if(!editable().length)return;
 const pencil=document.createElement('button');pencil.id='ue-pencil';pencil.type='button';pencil.title='Edit';pencil.setAttribute('aria-label','Edit page');pencil.innerHTML='<i data-lucide="pencil"></i>';
 const screen=document.createElement('section');screen.id='ue-screen';screen.hidden=true;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label','Edit page');
 screen.innerHTML='<button type="button" id="ue-resize" aria-label="Drag left edge to resize editor" title="Drag left edge to resize"><i data-lucide="grip-vertical"></i></button><button type="button" id="ue-resize-right" aria-label="Drag right edge to resize editor" title="Drag right edge to resize"><i data-lucide="grip-vertical"></i></button><div id="ue-wrap"><div id="ue-head" title="Drag to move editor left or right"><span id="ue-move-grip" aria-hidden="true"><i data-lucide="grip-horizontal"></i></span><strong>Edit page</strong><button id="ue-fullscreen" type="button" aria-label="Expand editor" title="Fullscreen"><i data-lucide="maximize"></i></button></div><div id="ue-searchbar"><input id="ue-search" type="search" placeholder="Search" aria-label="Search content, design, and settings"><button type="button" id="ue-search-clear" aria-label="Clear search" title="Clear search" hidden><i data-lucide="x"></i></button></div><div id="ue-tabs" role="tablist" aria-label="Editor tabs"><button type="button" data-tab="content" aria-selected="true"><i data-lucide="square-text"></i>Content</button><button type="button" data-tab="design" aria-selected="false"><i data-lucide="palette"></i>Design</button><button type="button" data-tab="settings" aria-selected="false"><i data-lucide="settings-2"></i>Settings</button></div><div id="ue-body"><div id="ue-results" hidden></div><div id="ue-content"><button id="ue-sections-toggle" type="button" aria-expanded="false">Sections <span><i data-lucide="chevron-down"></i> Show</span></button><div id="ue-sections" hidden></div><div id="ue-fields"></div><button id="ue-add" type="button" hidden><i data-lucide="plus"></i> Add link</button></div><div id="ue-style-panel" hidden></div><div id="ue-settings" hidden></div><p id="ue-message" role="status"></p></div><div id="ue-actions"><button id="ue-cancel" type="button">Cancel</button><button type="button" id="ue-undo" title="Undo last change" aria-label="Undo last change" disabled><i data-lucide="undo-2"></i></button><button id="ue-revert" type="button">Revert</button><button id="ue-copy" type="button">Copy</button></div></div>';
 document.body.append(pencil,screen);
 const fields=screen.querySelector('#ue-fields'),add=screen.querySelector('#ue-add'),message=screen.querySelector('#ue-message');
 const fullscreenButton=screen.querySelector('#ue-fullscreen');
 const resizeHandle=screen.querySelector('#ue-resize');
 const rightResizeHandle=screen.querySelector('#ue-resize-right');
 const dragHeader=screen.querySelector('#ue-head');
 const widthKey='html-editor:panel-width:v1',positionKey='html-editor:panel-x:v1';
 const desktop=()=>window.innerWidth>640;
 const widthClamp=value=>Math.round(Math.max(320,Math.min(Number(value)||430,Math.min(850,window.innerWidth-24))));
 let panelWidth=430, panelX=null;
 try{
  const saved=Number(localStorage.getItem(widthKey));
  if(saved>=320)panelWidth=saved;
  const x=localStorage.getItem(positionKey);
  if(x!==null&&Number.isFinite(Number(x)))panelX=Number(x);
 }catch{}
 const clampX=(x,width=panelWidth)=>Math.round(Math.max(0,Math.min(window.innerWidth-width,Number(x)||0)));
 const setGeometry=()=>{
  if(!desktop()||screen.classList.contains('ue-fullscreen'))return;
  panelWidth=widthClamp(panelWidth);
  if(panelX===null)panelX=window.innerWidth-panelWidth;
  panelX=clampX(panelX);
  screen.style.setProperty('--ue-panel-width',panelWidth+'px');
  screen.style.left=panelX+'px';
  screen.style.right='auto';
 };
 const rememberGeometry=()=>{
  try{localStorage.setItem(widthKey,String(panelWidth));localStorage.setItem(positionKey,String(panelX))}catch{}
 };
 setGeometry();
 // Pointer capture keeps resizing and dragging smooth even when crossing the page.
 const beginResize=(handle,edge)=>{
  let start=null;
  handle.addEventListener('pointerdown',event=>{
   if(event.button!==0||!desktop()||screen.classList.contains('ue-fullscreen'))return;
   start={x:event.clientX,width:screen.getBoundingClientRect().width,left:screen.getBoundingClientRect().left};
   handle.setPointerCapture(event.pointerId);event.preventDefault();
  });
  handle.addEventListener('pointermove',event=>{
   if(!start)return;
   const dx=event.clientX-start.x;
   const right=start.left+start.width;
   if(edge==='left'){
    const proposed=widthClamp(start.width-dx);
    const x=clampX(right-proposed,proposed);
    panelX=x;panelWidth=proposed;
   }else{
    panelX=start.left;panelWidth=widthClamp(start.width+dx);
    panelWidth=Math.min(panelWidth,window.innerWidth-panelX);
   }
   setGeometry();
  });
  const finish=()=>{if(!start)return;start=null;rememberGeometry()};
  handle.addEventListener('pointerup',finish);
  handle.addEventListener('pointercancel',finish);
 };
 beginResize(resizeHandle,'left');
 beginResize(rightResizeHandle,'right');
 let moving=null;
 dragHeader.addEventListener('pointerdown',event=>{
  if(event.button!==0||!desktop()||screen.classList.contains('ue-fullscreen'))return;
  if(event.target.closest('button,input,textarea,select,a,[contenteditable]'))return;
  moving={x:event.clientX,left:screen.getBoundingClientRect().left};
  dragHeader.setPointerCapture(event.pointerId);event.preventDefault();
 });
 dragHeader.addEventListener('pointermove',event=>{
  if(!moving)return;
  panelX=clampX(moving.left+event.clientX-moving.x);
  setGeometry();
 });
 const finishMove=()=>{if(!moving)return;moving=null;rememberGeometry()};
 dragHeader.addEventListener('pointerup',finishMove);
 dragHeader.addEventListener('pointercancel',finishMove);
 window.addEventListener('resize',()=>{
  if(desktop())setGeometry();
  else{screen.style.removeProperty('left');screen.style.removeProperty('right')}
 });
 screen.querySelector('#ue-undo').onclick=undo;
 const scrollBody=screen.querySelector('#ue-body');
 const stylePanel=screen.querySelector('#ue-style-panel'),sectionsPanel=screen.querySelector('#ue-sections'),settingsPanel=screen.querySelector('#ue-settings'),contentPanel=screen.querySelector('#ue-content');
 const searchInput=screen.querySelector('#ue-search'),resultsPanel=screen.querySelector('#ue-results'),clearSearch=screen.querySelector('#ue-search-clear'),sectionsToggle=screen.querySelector('#ue-sections-toggle');
 let activeTab='content',sectionsOpen=false;
 const designLabels=['Page background','Text color','Accent color','Font family','Heading 1 size (px)','Heading 2 size (px)','Heading 3 size (px)','Paragraph size (px)','Corner roundness (px)','Button background','Button text color'];
 function setTab(tab){
  activeTab=tab;searchInput.value='';clearSearch.hidden=true;resultsPanel.hidden=true;
  screen.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
  contentPanel.hidden=tab!=='content';stylePanel.hidden=tab!=='design';settingsPanel.hidden=tab!=='settings';
  add.hidden=tab!=='content'||!model.some(item=>item.link&&item.group!==null);
  scrollBody.scrollTop=0;
 }
 function setSectionsOpen(open){
  sectionsOpen=open;sectionsPanel.hidden=!open;
  sectionsToggle.setAttribute('aria-expanded',String(open));
  const label=sectionsToggle.querySelector('span');
  label.textContent=open?'Hide':'Show';
  const chevron=document.createElement('i');chevron.dataset.lucide='chevron-down';label.prepend(chevron);
  icons();
  if(open)renderSections();
 }
 sectionsToggle.onclick=()=>setSectionsOpen(!sectionsOpen);
 screen.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
 function showSearchResults(){
  const q=searchInput.value.trim().toLocaleLowerCase();clearSearch.hidden=!q;
  if(!q){resultsPanel.hidden=true;contentPanel.hidden=activeTab!=='content';stylePanel.hidden=activeTab!=='design';settingsPanel.hidden=activeTab!=='settings';return}
  resultsPanel.hidden=false;contentPanel.hidden=true;stylePanel.hidden=true;settingsPanel.hidden=true;resultsPanel.replaceChildren();
  const matches=[];
  model.forEach((item,index)=>{
   if(item.deleted)return;
   if([item.label,item.text,item.url,item.alt,item.src].some(v=>String(v||'').toLocaleLowerCase().includes(q)))matches.push({tab:'content',label:item.label||item.text||'Content field',detail:(item.text||item.url||'').slice(0,120),index});
  });
  sectionOrder.forEach((id,index)=>{
   if(sectionStates[id]?.deleted)return;
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id),label=sectionStates[id]?.label||node?.getAttribute('aria-label')||id;
   if((label+' '+id+' section').toLocaleLowerCase().includes(q))matches.push({tab:'content',label:label+' section',detail:'Section controls',sectionId:id});
  });
  const genericLabels=designLabels.filter((_,index)=>!Object.keys(originalVariables).length||![0,1,2,8,9,10].includes(index));
  genericLabels.forEach((label,index)=>{if((label+' design style').toLocaleLowerCase().includes(q))matches.push({tab:'design',label,detail:'Design',design:index})});
  Object.entries(buttonAppearance).forEach(([index,info])=>{
   const item=model.find(x=>!x.added&&x.index===Number(index));
   if(!item||item.deleted)return;
   const visibleText=(item.text||'').replace(/\s+/g,' ').trim();
   if((info.label+' '+visibleText+' button background text color').toLocaleLowerCase().includes(q))matches.push({tab:'design',label:visibleText||info.label,detail:info.label,buttonDesign:index});
  });
  Object.keys(originalVariables).forEach((name,index)=>{const label=varLabel(name);if((label+' '+name+' design color size').toLocaleLowerCase().includes(q))matches.push({tab:'design',label,detail:'Website color or size',customDesign:name})});
  [['Page title',0],['Page description',1]].forEach(([label,index])=>{if((label+' '+String(index?pageMeta.description:pageMeta.title)+' SEO settings').toLocaleLowerCase().includes(q))matches.push({tab:'settings',label,detail:'Settings',setting:index})});
  for(const hit of matches){
   const button=document.createElement('button');button.type='button';
   const title=document.createElement('strong');title.textContent=hit.label;
   const detail=document.createElement('small');detail.textContent=hit.detail||hit.tab;button.append(title,detail);
   button.onclick=()=>{
    setTab(hit.tab);
    if(hit.sectionId!==undefined){setSectionsOpen(true);const input=Array.from(sectionsPanel.querySelectorAll('.ue-section-row')).find(row=>row.dataset.sectionId===hit.sectionId)?.querySelector('input');input?.scrollIntoView({block:'center',behavior:'instant'});input?.focus({preventScroll:true})}
    else if(hit.index!==undefined){const row=fields.querySelector('.ue-item[data-edit-index="'+hit.index+'"]');row?.scrollIntoView({block:'center',behavior:'instant'});const input=row?.querySelector('input,textarea,select');input?.focus({preventScroll:true});input?.dispatchEvent(new Event('focusin',{bubbles:true}))}
    else if(hit.design!==undefined){const row=stylePanel.children[hit.design];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input,select')?.focus({preventScroll:true})}
    else if(hit.customDesign!==undefined){const keys=Object.keys(originalVariables);const row=stylePanel.querySelectorAll('.ue-setting')[genericLabels.length+keys.indexOf(hit.customDesign)];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input')?.focus({preventScroll:true})}
    else if(hit.buttonDesign!==undefined){const block=stylePanel.querySelector('[data-ue-button-block="'+hit.buttonDesign+'"]');if(block){block.open=true;expandedButtonControls.add(String(hit.buttonDesign));block.scrollIntoView({block:'center',behavior:'instant'});block.querySelector('.ue-setting input')?.focus({preventScroll:true})}}
    else if(hit.setting!==undefined){const row=settingsPanel.querySelectorAll('.ue-meta label')[hit.setting];row?.scrollIntoView({block:'center',behavior:'instant'});row?.querySelector('input,textarea')?.focus({preventScroll:true})}
   };
   resultsPanel.append(button);
  }
  if(!matches.length){const empty=document.createElement('p');empty.textContent='No matches';resultsPanel.append(empty)}
 }
 searchInput.addEventListener('input',showSearchResults);
 clearSearch.onclick=()=>{searchInput.value='';showSearchResults();searchInput.focus()};
 // Focus-based scrolling: only when selecting a field, never on typing or sidebar scroll.
 fields.addEventListener('focusin',event=>{
  if(screen.classList.contains('ue-fullscreen'))return;
  const box=event.target.closest('.ue-item');
  if(!box)return;
  const item=model[Number(box.dataset.editIndex)];
  if(!item||item.hidden||item.deleted)return;
  const node=item.group!==null?liveRoots[item.group]:liveSnapshots[item.index]?.node;
  if(!node?.isConnected)return;
  const rect=node.getBoundingClientRect();
  if(rect.height===0)return;
  const mobile=window.innerWidth<=640;
  const top=24;
  const bottom=mobile?window.innerHeight-Math.min(screen.getBoundingClientRect().height,window.innerHeight)-24:window.innerHeight-32;
  // Do not move the page when the element is already comfortably visible.
  if(rect.top>=top&&rect.bottom<=bottom)return;
  const desired=Math.max(0,window.scrollY+rect.top-Math.max(28,(bottom-top-Math.min(rect.height,360))/2));
  window.scrollTo({top:desired,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 });
 screen.addEventListener('wheel',event=>{
  if(scrollBody.contains(event.target)||event.ctrlKey)return;
  if(scrollBody.scrollHeight<=scrollBody.clientHeight)return;
  event.preventDefault();
  const factor=event.deltaMode===1?16:event.deltaMode===2?scrollBody.clientHeight:1;
  scrollBody.scrollBy({top:event.deltaY*factor,left:event.deltaX*factor,behavior:'instant'});
 },{passive:false});
 function setFullscreen(on){
  screen.classList.toggle('ue-fullscreen',on);
  if(!on)setGeometry();
  fullscreenButton.setAttribute('aria-label',on?'Exit fullscreen':'Expand editor');
  fullscreenButton.title=on?'Exit fullscreen':'Fullscreen';
  fullscreenButton.innerHTML='<i data-lucide="'+(on?'minimize':'maximize')+'"></i>';
  icons();
 }
 fullscreenButton.onclick=()=>{setFullscreen(!screen.classList.contains('ue-fullscreen'));requestAnimationFrame(()=>fields.querySelectorAll('textarea').forEach(fitTextarea))};
 let model=[],baseline='',liveNodes=[],liveSnapshots=[],liveRoots=[],rootSnapshots=[];
 let draftActive=false,initialModel='',styleSettings={},initialStyle='',variableSettings={},initialVariables='',buttonSettings={},buttonAppearance={},initialButtons='',sectionOrder=[],initialSectionOrder=[],sectionNodes=[];
 let sectionStates={},undoStack=[],pageMeta={},originalMeta={},revertAvailable=false;
 const sectionDisplays=new Map(),sectionLabels=new Map(),sectionStyleAttrs=new Map();
 const touchedNodes=new Set(),touchedRoots=new Set();
 const expandedButtonControls=new Set();
 const snapshot=()=>JSON.stringify({model,styleSettings,variableSettings,buttonSettings,sectionOrder,sectionStates,pageMeta});
 const revertKey=()=>draftKey+':last-revert';
 const readRevert=()=>{try{const x=JSON.parse(localStorage.getItem(revertKey())||'null');return x?.signature===originalSignature&&typeof x.snapshot==='string'?x.snapshot:null}catch{return null}};
 const clearRevert=()=>{revertAvailable=false;try{localStorage.removeItem(revertKey())}catch{}};
 const saveRevert=()=>{
  if(!hasChanges())return;
  const state=snapshot();
  revertAvailable=true;
  try{localStorage.setItem(revertKey(),JSON.stringify({signature:originalSignature,snapshot:state}))}catch{}
 };

 const checkpoint=()=>{if(revertAvailable)clearRevert();const state=snapshot();if(undoStack.at(-1)!==state){undoStack.push(state);if(undoStack.length>80)undoStack.shift()}syncUndoButton()};
 const syncUndoButton=()=>{const b=screen.querySelector('#ue-undo');if(b)b.disabled=!undoStack.length};
 function undo(){if(!undoStack.length)return;const old=JSON.parse(undoStack.pop());if(revertAvailable)clearRevert();model=old.model;styleSettings=old.styleSettings;variableSettings=old.variableSettings||Object.fromEntries(Object.entries(originalVariables).map(([name,config])=>[name,config.value]));buttonSettings=old.buttonSettings||{};sectionOrder=old.sectionOrder;sectionStates=old.sectionStates||{};pageMeta=old.pageMeta||{...originalMeta};applyMeta();restoreLive();reorderSections();syncLive();applyStyle();renderStyle();renderSections();render();syncUndoButton()}
 function syncSections(){
  for(const node of sectionNodes){
   const state=sectionStates[node.getAttribute('data-section')]||{};
   const originalDisplay=sectionDisplays.get(node)||'';
   const targetDisplay=state.hidden||state.deleted?'none':originalDisplay;
   if(node.style.display!==targetDisplay){
    if(targetDisplay==='none')node.style.display='none';
    else if(sectionStyleAttrs.get(node)===null){
     node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style');
    }else node.style.display=originalDisplay;
   }
   const originalLabel=sectionLabels.get(node);
   const targetLabel=state.label!==undefined?state.label:originalLabel;
   if(node.getAttribute('aria-label')!==targetLabel){
    if(targetLabel===null)node.removeAttribute('aria-label');
    else node.setAttribute('aria-label',targetLabel);
   }
  }
 }

 const styleDefaults={background:'#ffffff',text:'#171717',accent:'#2563eb',font:'system-ui',h1:40,h2:30,h3:24,p:16,radius:8,buttonBackground:'#171717',buttonText:'#ffffff'};
 const styleFonts={'system-ui':'system-ui, sans-serif','Arial':'Arial, sans-serif','Georgia':'Georgia, serif','Times New Roman':'"Times New Roman", serif','Verdana':'Verdana, sans-serif','Trebuchet MS':'"Trebuchet MS", sans-serif','Courier New':'"Courier New", monospace','Manrope':'Manrope, system-ui, sans-serif','Inter':'Inter, system-ui, sans-serif'};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
 const safeColor=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
 const rgbToHex=value=>{
  const v=String(value||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  const m=v.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return m?'#'+[m[1],m[2],m[3]].map(n=>Math.min(255,Number(n)).toString(16).padStart(2,'0')).join(''):null;
 };
 const pageColor=(el,prop,fallback)=>rgbToHex(el?getComputedStyle(el)[prop]:'')||fallback;
 const pageButton=()=>document.querySelector('main .button,main .btn,main button,main [role="button"],main nav[data-edit="links"] a')||document.querySelector('body .button,body .btn');
 function readStyle(){
  const raw=document.getElementById('editor-page-style')?.textContent||'';
  const match=raw.match(/\/\* editor-style:(.*?) \*\//);
  if(match){try{return {...styleDefaults,...JSON.parse(decodeURIComponent(match[1]))}}catch{}}
  const body=getComputedStyle(document.body),button=pageButton();
  const heading=tag=>document.querySelector('main '+tag+',body '+tag);
  const size=tag=>{const el=heading(tag);return el?Math.round(parseFloat(getComputedStyle(el).fontSize))||styleDefaults[tag]:styleDefaults[tag]};
  const cards=document.querySelector('.card,.hero-visual,.photo');
  const initialFont=body.fontFamily.toLowerCase();
  const font=Object.keys(styleFonts).find(k=>initialFont.includes(k.toLowerCase()))||'system-ui';
  return {...styleDefaults,
   background:pageColor(document.body,'backgroundColor',styleDefaults.background),
   text:pageColor(document.body,'color',styleDefaults.text),
   accent:pageColor(document.querySelector('.site-nav a,a:not(.button):not(.btn)'), 'color',styleDefaults.accent),
   buttonBackground:pageColor(button,'backgroundColor',styleDefaults.buttonBackground),
   buttonText:pageColor(button,'color',styleDefaults.buttonText),
   font,h1:size('h1'),h2:size('h2'),h3:size('h3'),p:size('p'),
   radius:Math.round(parseFloat(cards?getComputedStyle(cards).borderTopLeftRadius:(button?getComputedStyle(button).borderTopLeftRadius:'8px')))||0
  };
 }
 // Discover author-defined :root variables without touching the website stylesheet.
 const hexColor=value=>{
  const v=String(value).trim();
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  if(/^#[0-9a-f]{3}$/i.test(v))return '#'+[...v.slice(1)].map(c=>c+c).join('').toLowerCase();
  return rgbToHex(v);
 };
 const discoverVariables=()=>{
  const found=new Map();
  const scan=rules=>{
   for(const rule of rules){
    if(rule.type===1&&rule.selectorText?.split(',').some(t=>t.trim()===':root')){
     for(const name of rule.style){
      if(!/^--(?!ue-)[a-z0-9_-]+$/i.test(name))continue;
      const value=rule.style.getPropertyValue(name).trim();
      if(value&&!found.has(name))found.set(name,value);
     }
    }else if(rule.cssRules){try{scan(rule.cssRules)}catch{}}
   }
  };
  for(const sheet of document.styleSheets){
   const node=sheet.ownerNode;
   if(!node||node.id==='ue-style'||node.id==='editor-page-style'||node.tagName!=='STYLE')continue;
   try{scan(sheet.cssRules)}catch{}
  }
  const computed=getComputedStyle(document.documentElement);
  const result={};
  for(const [name,fallback] of found){
   const value=computed.getPropertyValue(name).trim()||fallback;
   if(hexColor(value))result[name]={kind:'color',value};
   else if(/^-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(value))result[name]={kind:'size',value};
  }
  return result;
 };
 const originalVariables=discoverVariables();
 const originalVariableOverrides=new Set();
 try{
  const previous=document.getElementById('editor-page-style')?.sheet?.cssRules;
  if(previous)for(const rule of previous){
   if(rule.selectorText!==':root')continue;
   for(const name of rule.style)if(Object.hasOwn(originalVariables,name))originalVariableOverrides.add(name);
  }
 }catch{}
 const varLabel=name=>name.slice(2).split(/[-_]+/).filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
 const originalAppearance=readStyle();
 // Preserve previously exported appearance overrides when editing an exported page again.
 const existingCSS=document.getElementById('editor-page-style')?.textContent||'';
 const originalOverrides=new Set(
  ['background','text','accent','buttonBackground','buttonText'].filter(k=>existingCSS.includes('--ue-'+k+':'))
 );
 for(const tag of ['h1','h2','h3','p']){
  if(new RegExp('html body '+tag+'[^\\{]*\\{').test(existingCSS))originalOverrides.add(tag);
 }
 if(existingCSS.includes('font-family:'))originalOverrides.add('font');
 if(existingCSS.includes('border-radius:'))originalOverrides.add('radius');
 const editableButtonSelector=node=>{
  const tag=node.tagName.toLowerCase(),label=node.getAttribute('data-edit');
  if(!label)return '';
  const escape=window.CSS?.escape;
  if(typeof escape!=='function')return '';
  const own=tag+'[data-edit='+escape(label)+']';
  if(document.querySelectorAll(own).length===1)return own;
  const section=node.closest('[data-section]');
  if(section){
   const scoped='[data-section='+escape(section.getAttribute('data-section'))+'] '+own;
   if(document.querySelectorAll(scoped).length===1)return scoped;
  }
  return '';
 };
 const getButtonAppearance=()=>{
  const result={};
  liveSnapshots.forEach((item,index)=>{
   const node=item.node;
   if(!node?.matches?.('a[data-edit],button[data-edit],input[type="button"][data-edit]'))return;
   const css=getComputedStyle(node);
   const isButton=node.matches('button,input[type="button"],a.button,a.btn,a[role="button"]');
   // Discover button-like links with custom class names, without including plain links.
   const padding=Math.max(parseFloat(css.paddingTop)||0,parseFloat(css.paddingLeft)||0);
   const painted=css.backgroundColor.startsWith('rgb')&&!css.backgroundColor.endsWith(', 0)')&&!css.backgroundColor.endsWith(' 0)');
   if(!isButton&&!(painted&&padding>=6))return;
   const selector=editableButtonSelector(node);
   if(!selector)return;
   const background=rgbToHex(css.backgroundColor),color=rgbToHex(css.color);
   if(!background||!color)return;
   result[index]={selector,background,color,label:node.getAttribute('data-edit')||'Button '+(index+1)};
  });
  return result;
 };
 const refreshButtonSample=(sample,index)=>{
  if(!sample)return;
  const node=liveSnapshots[Number(index)]?.node;
  const item=model.find(x=>!x.added&&x.index===Number(index));
  if(!node?.isConnected||!item||item.deleted)return;
  const css=getComputedStyle(node);
  sample.textContent=item.text||buttonAppearance[index]?.label||'';
  sample.style.backgroundColor=css.backgroundColor;
  sample.style.backgroundImage=css.backgroundImage;
  sample.style.color=css.color;
  sample.style.border=css.border;
  sample.style.borderRadius=css.borderRadius;
  sample.style.boxShadow=css.boxShadow;
  sample.style.fontFamily=css.fontFamily;
  sample.style.fontWeight=css.fontWeight;
  sample.style.fontSize=css.fontSize;
  sample.style.letterSpacing=css.letterSpacing;
  sample.style.textAlign=css.textAlign==='left'?'left':'center';
 };
 const refreshButtonSamples=()=>{
  for(const sample of stylePanel.querySelectorAll('[data-ue-button-preview]')){
   const index=sample.dataset.ueButtonPreview;
   const item=model.find(x=>!x.added&&x.index===Number(index));
   if(!item||item.deleted){sample.closest('.ue-button-block')?.remove();continue}
   refreshButtonSample(sample,index);
  }
 };
 const styleSheetText=a=>{
  // Store exact settings, but override only properties changed from the
  // original page, preserving responsive typography and existing CSS.
  const parts=['/* editor-style:'+encodeURIComponent(JSON.stringify(a))+' */'];
  const changed=k=>originalOverrides.has(k)||String(a[k])!==String(originalAppearance[k]);
  const colors=['background','text','accent','buttonBackground','buttonText'];
  const vars=colors.filter(changed).map(k=>'--ue-'+k+':'+safeColor(a[k],styleDefaults[k])+';');
  const customVars=Object.keys(originalVariables).filter(name=>originalVariableOverrides.has(name)||variableSettings[name]!==originalVariables[name].value).map(name=>name+':'+variableSettings[name]+';');
  if(vars.length||customVars.length)parts.push(':root{'+[...vars,...customVars].join('')+'}');
  const rule=(selector,declaration)=>parts.push(selector+'{'+declaration+'}');
  if(changed('background'))rule('html body','background-color:var(--ue-background)!important');
  if(changed('text'))rule('html body,html body :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,small,span):not(#ue-screen *)','color:var(--ue-text)!important');
  if(changed('accent'))rule('html body a:not(.button):not(.btn):not([role=button]):not(#ue-screen a)','color:var(--ue-accent)!important');
  if(changed('font'))rule('html body','font-family:'+(styleFonts[a.font]||styleFonts['system-ui'])+'!important');
  for(const tag of ['h1','h2','h3','p'])if(changed(tag))rule('html body '+tag+':not(#ue-screen '+tag+')','font-size:'+clamp(a[tag],8,120)+'px!important');
  if(changed('radius'))rule('html body :is(button,.button,.btn,[role=button],.card,.hero-visual,.photo,img,input,textarea):not(#ue-screen *):not(#ue-pencil),html body nav[data-edit=links] a','border-radius:'+clamp(a.radius,0,64)+'px!important');
  const buttonSelectors='html body :is(button,.button,.btn,[role=button]):not(#ue-screen *):not(#ue-pencil),html body nav[data-edit=links] a';
  if(changed('buttonBackground'))rule(buttonSelectors,'background-color:var(--ue-buttonBackground)!important');
  if(changed('buttonText'))rule(buttonSelectors,'color:var(--ue-buttonText)!important');
  for(const [index,settings] of Object.entries(buttonSettings)){
   const original=buttonAppearance[index];
   if(!original)continue;
   for(const key of ['background','color']){
    const value=settings[key];
    if(value&&hexColor(value)&&value!==original[key])rule('html body '+original.selector,key==='background'?'background-color:'+value+'!important':'color:'+value+'!important');
   }
  }
  return parts.join('\n');
 };
 const applyStyle=()=>{
  let el=document.getElementById('editor-page-style');
  if(!el){el=document.createElement('style');el.id='editor-page-style';document.head.append(el)}
  el.textContent=styleSheetText(styleSettings);
  refreshButtonSamples();
 };
 const restoreStyle=()=>{
  const el=document.getElementById('editor-page-style');
  if(originalPageStyle===null)el?.remove();
  else if(el){if(el.textContent!==originalPageStyle)el.textContent=originalPageStyle}
  else{const node=document.createElement('style');node.id='editor-page-style';node.textContent=originalPageStyle;document.head.append(node)}
 };
 const originalPageStyle=document.getElementById('editor-page-style')?.textContent??null;
 function renderStyle(){
  stylePanel.replaceChildren();
  const controls=[
   ['Page background','background','color'],['Text color','text','color'],['Accent color','accent','color'],
   ['Font family','font','font'],['Heading 1 size (px)','h1','number'],['Heading 2 size (px)','h2','number'],
   ['Heading 3 size (px)','h3','number'],['Paragraph size (px)','p','number'],
   ['Corner roundness (px)','radius','radius'],
   ['All buttons background','buttonBackground','color'],['All buttons text','buttonText','color']
  ].filter(([,key])=>!Object.keys(originalVariables).length||!['background','text','accent','buttonBackground','buttonText','radius'].includes(key));
  const update=()=>{applyStyle();saveDraft()};
  for(const [title,key,kind] of controls){
   const row=document.createElement('div');row.className='ue-setting';
   const label=document.createElement('label');label.textContent=title;row.append(label);
   if(kind==='color'){
    const pair=document.createElement('div');pair.className='ue-color-row';
    const swatch=document.createElement('input');swatch.type='color';swatch.value=styleSettings[key];
    const text=document.createElement('input');text.type='text';text.value=styleSettings[key];text.setAttribute('aria-label',title+' hex');
    swatch.oninput=()=>{checkpoint();styleSettings[key]=swatch.value;text.value=swatch.value;update()};
    text.onchange=()=>{const v=text.value.trim();if(/^#[0-9a-f]{6}$/i.test(v)){checkpoint();styleSettings[key]=v;swatch.value=v;update()}else text.value=styleSettings[key]};
    pair.append(swatch,text);row.append(pair);
   }else if(kind==='font'){
    const select=document.createElement('select');for(const font of Object.keys(styleFonts)){const option=document.createElement('option');option.value=font;option.textContent=font;select.append(option)}
    select.value=styleSettings[key];select.onchange=()=>{checkpoint();styleSettings[key]=select.value;update()};row.append(select);
   }else{
    const input=document.createElement('input');input.type='number';input.min=kind==='radius'?'0':'8';input.max=kind==='radius'?'64':'120';input.step='1';input.value=styleSettings[key];
    input.oninput=()=>{if(input.value==='')return;checkpoint();styleSettings[key]=clamp(input.value,kind==='radius'?0:8,kind==='radius'?64:120);update()};row.append(input);
   }
   const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+title;reset.setAttribute('aria-label','Reset '+title);
   reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=String(styleSettings[key])===String(originalAppearance[key]);
   reset.onclick=event=>{event.preventDefault();checkpoint();styleSettings[key]=originalAppearance[key];applyStyle();saveDraft();renderStyle()};
   const refreshReset=()=>{reset.disabled=String(styleSettings[key])===String(originalAppearance[key])};
   row.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',refreshReset));
   row.append(reset);stylePanel.append(row);
  }
  const custom=Object.entries(originalVariables);
  if(custom.length){
   const heading=document.createElement('div');heading.className='ue-custom-heading';heading.textContent='Website colors & sizes';stylePanel.append(heading);
   for(const [name,config] of custom){
    const row=document.createElement('div');row.className='ue-setting';
    const label=document.createElement('label');label.textContent=varLabel(name);row.append(label);
    const value=variableSettings[name];
    let input;
    if(config.kind==='color'){
     const pair=document.createElement('div');pair.className='ue-color-row';
     const swatch=document.createElement('input');swatch.type='color';swatch.value=hexColor(value)||'#000000';
     input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',varLabel(name)+' color');
     swatch.oninput=()=>{checkpoint();variableSettings[name]=swatch.value;input.value=swatch.value;applyStyle();saveDraft();reset.disabled=false};
     input.onchange=()=>{const color=hexColor(input.value);if(!color){input.value=variableSettings[name];return}checkpoint();variableSettings[name]=input.value.trim();swatch.value=color;applyStyle();saveDraft();reset.disabled=variableSettings[name]===config.value};
     pair.append(swatch,input);row.append(pair);
    }else{
     input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',varLabel(name)+' size');
     input.onchange=()=>{const val=input.value.trim();if(!/^-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(val)){input.value=variableSettings[name];return}checkpoint();variableSettings[name]=val;applyStyle();saveDraft();reset.disabled=val===config.value};
     row.append(input);
    }
    const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+varLabel(name);reset.setAttribute('aria-label',reset.title);reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=value===config.value;
    reset.onclick=()=>{checkpoint();variableSettings[name]=config.value;applyStyle();saveDraft();renderStyle()};
    row.append(reset);stylePanel.append(row);
   }
  }
  const buttons=Object.entries(buttonAppearance);
  if(buttons.length){
   const heading=document.createElement('div');heading.className='ue-custom-heading';heading.textContent='Individual buttons';stylePanel.append(heading);
   for(const [index,info] of buttons){
    const item=model.find(x=>!x.added&&x.index===Number(index));
    if(!item||item.deleted)continue;
    const block=document.createElement('details');block.className='ue-button-block';block.dataset.ueButtonBlock=index;
    block.open=expandedButtonControls.has(index);
    block.addEventListener('toggle',()=>{if(block.open)expandedButtonControls.add(index);else expandedButtonControls.delete(index)});
    const summary=document.createElement('summary');summary.className='ue-button-summary';
    const name=document.createElement('div');name.className='ue-button-title';name.textContent=info.label;summary.append(name);
    // Preview only: read the source element's appearance; never clone its markup
    // or insert an interactive duplicate into the website.
    const preview=document.createElement('div');preview.className='ue-button-preview';
    preview.dataset.ueButtonPreview=index;
    preview.setAttribute('aria-label','Preview of '+info.label);
    summary.append(preview);
    const hint=document.createElement('div');hint.className='ue-button-hint';hint.textContent='Click to edit colors';
    summary.append(hint);block.append(summary);
    const jump=document.createElement('span');jump.className='ue-button-jump';jump.setAttribute('role','button');jump.setAttribute('tabindex','0');
    jump.title='Find '+info.label+' on the website';jump.setAttribute('aria-label',jump.title);
    jump.innerHTML='<i data-lucide="arrow-up-right"></i>';
    jump.onclick=event=>{
     event?.preventDefault();event?.stopPropagation();
     const node=liveSnapshots[Number(index)]?.node;
     if(!node?.isConnected)return;
     if(screen.classList.contains('ue-fullscreen'))hideEditor();
     const top=Math.max(0,window.scrollY+node.getBoundingClientRect().top-32);
     window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    };
    // A secondary action within the always-visible summary.
    jump.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();jump.click()}});
    summary.append(jump);
    const updatePreview=()=>refreshButtonSample(preview,index);
    updatePreview();
    for(const [key,label] of [['background','Background'],['color','Text color']]){
     const row=document.createElement('div');row.className='ue-setting';
     const lbl=document.createElement('label');lbl.textContent=label;row.append(lbl);
     const pair=document.createElement('div');pair.className='ue-color-row';
     const value=buttonSettings[index]?.[key]||info[key];
     const swatch=document.createElement('input');swatch.type='color';swatch.value=hexColor(value)||'#000000';
     const input=document.createElement('input');input.type='text';input.value=value;input.setAttribute('aria-label',info.label+' '+label);
     const setValue=v=>{checkpoint();buttonSettings[index]={...buttonSettings[index],[key]:v};applyStyle();updatePreview();saveDraft();reset.disabled=v===info[key]};
     swatch.oninput=()=>{input.value=swatch.value;setValue(swatch.value)};
     input.onchange=()=>{const color=hexColor(input.value);if(!color){input.value=buttonSettings[index]?.[key]||info[key];return}swatch.value=color;setValue(input.value.trim())};
     pair.append(swatch,input);row.append(pair);
     const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+info.label+' '+label;reset.setAttribute('aria-label',reset.title);reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=value===info[key];
     reset.onclick=()=>{checkpoint();if(buttonSettings[index]){delete buttonSettings[index][key];if(!Object.keys(buttonSettings[index]).length)delete buttonSettings[index]}applyStyle();saveDraft();renderStyle()};
     row.append(reset);block.append(row);
    }
    stylePanel.append(block);
   }
  }
  icons();
 }
 function findSections(root=document){
  return Array.from(root.querySelectorAll('[data-section]')).filter(el=>!el.parentElement?.closest('[data-section]')&&!el.closest('#ue-screen'));
 }
 function reorderSections(order=sectionOrder){
  if(!sectionNodes.length)return;
  const byId=new Map(sectionNodes.map(n=>[n.getAttribute('data-section'),n]));
  const parents=[...new Set(sectionNodes.map(n=>n.parentElement).filter(Boolean))];
  for(const parent of parents){
   const actual=Array.from(parent.children).filter(n=>sectionNodes.includes(n));
   const desired=order.map(id=>byId.get(id)).filter(n=>n?.parentElement===parent);
   // Avoid moving existing DOM nodes unless their order genuinely changed.
   if(actual.length!==desired.length||actual.every((n,i)=>n===desired[i]))continue;
   const after=actual[actual.length-1]?.nextSibling||null;
   for(const node of desired)parent.insertBefore(node,after);
  }
 }
 function renderSections(){
  sectionsPanel.replaceChildren();
  if(!sectionNodes.length){
   const hint=document.createElement('p');hint.textContent='No sections found. Add data-section="unique-id" to the page sections you want to reorder.';sectionsPanel.append(hint);return;
  }
  const visibleSections=sectionOrder.filter(id=>!sectionStates[id]?.deleted);
  for(const [i,id] of visibleSections.entries()){
   const node=sectionNodes.find(n=>n.getAttribute('data-section')===id);if(!node)continue;
   const row=document.createElement('div');row.className='ue-section-row';row.dataset.sectionId=id;
   const jump=document.createElement('input');jump.type='text';jump.className='ue-section-link';
   jump.value=sectionStates[id]?.label??node.getAttribute('aria-label')??node.querySelector('h1,h2,h3')?.textContent?.trim()??id;
   jump.setAttribute('aria-label','Section name');jump.title='Edit section name';
   jump.oninput=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),label:jump.value};syncSections();saveDraft()};
   const jumpButton=document.createElement('button');jumpButton.type='button';jumpButton.className='ue-section-jump';jumpButton.title='View section on page';jumpButton.setAttribute('aria-label','View '+jump.value+' on page');
   jumpButton.innerHTML='<i data-lucide="arrow-up-right"></i>';
   jumpButton.onclick=()=>{
    if(!node?.isConnected)return;
    if(sectionStates[id]?.hidden||sectionStates[id]?.deleted)return;
    if(screen.classList.contains('ue-fullscreen'))hideEditor();
    const offset=28;
    const top=Math.max(0,window.scrollY+node.getBoundingClientRect().top-offset);
    window.scrollTo({top,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   };
   jump.addEventListener('click',()=>jumpButton.click());
   const controls=document.createElement('div');controls.className='ue-controls';
   for(const [dir,name] of [[-1,'arrow-up'],[1,'arrow-down']]){
    const button=document.createElement('button');button.type='button';button.title=dir<0?'Move up':'Move down';button.setAttribute('aria-label',button.title+' '+jump.value);
    button.disabled=(i+dir<0||i+dir>=visibleSections.length||sectionNodes.find(n=>n.getAttribute('data-section')===visibleSections[i+dir])?.parentElement!==node.parentElement);
    button.innerHTML='<i data-lucide="'+name+'"></i>';
    button.onclick=()=>{checkpoint();const nextId=visibleSections[i+dir];const a=sectionOrder.indexOf(id),b=sectionOrder.indexOf(nextId);[sectionOrder[a],sectionOrder[b]]=[sectionOrder[b],sectionOrder[a]];reorderSections();saveDraft();renderSections()};
    controls.append(button);
   }
   const state=sectionStates[id]||{};
   for(const [action,icon,field] of [[state.hidden?'Show':'Hide',state.hidden?'eye-off':'eye','hidden'],['Delete','trash-2','deleted']]){
    const button=document.createElement('button');button.type='button';button.title=action;button.setAttribute('aria-label',action+' '+jump.value);
    button.innerHTML='<i data-lucide="'+icon+'"></i>';
    button.onclick=()=>{checkpoint();sectionStates[id]={...(sectionStates[id]||{}),[field]:!Boolean(sectionStates[id]?.[field])};syncSections();saveDraft();renderSections()};
    controls.append(button);
   }
   row.classList.toggle('ue-hidden',Boolean(state.hidden));
   row.append(jump,jumpButton,controls);sectionsPanel.append(row);
  }
  icons();
 }
 // Drafts are scoped to each URL and to the exact underlying HTML/CSS version.
 const draftKey='html-editor:draft:v1:'+location.href.split('#')[0];
 const pageSignature=()=>{
  const content=document.querySelectorAll('[data-edit]');
  const page=[document.title,...Array.from(document.querySelectorAll('style:not(#ue-style)')).map(el=>el.textContent),...Array.from(content).map(el=>el.outerHTML)].join('\u001f');
  let hash=2166136261;
  for(let i=0;i<page.length;i++)hash=Math.imul(hash^page.charCodeAt(i),16777619);
  return (hash>>>0).toString(36);
 };
 const originalSignature=pageSignature();
 const readDraft=()=>{try{const x=JSON.parse(localStorage.getItem(draftKey)||'null');return x?.signature===originalSignature&&Array.isArray(x.model)?x:null}catch{return null}};
 const clearDraft=()=>{try{localStorage.removeItem(draftKey)}catch{}};
 const saveDraft=()=>{
  try{
   if(hasChanges())localStorage.setItem(draftKey,JSON.stringify({signature:originalSignature,model,styleSettings,variableSettings,buttonSettings,sectionOrder,sectionStates,pageMeta,styleSchema:2}));
   else clearDraft();
  }catch{} // file:// and privacy settings may block storage
 };
 const readMeta=()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.getAttribute('content')||''});
 const applyMeta=()=>{
  const title=pageMeta.title||'';
  if(document.title!==title)document.title=title;
  let meta=document.querySelector('meta[name="description"]');
  if(!meta&&pageMeta.description){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}
  if(meta&&meta.getAttribute('content')!==(pageMeta.description||''))meta.setAttribute('content',pageMeta.description||'');
 };
 const restoreMeta=()=>{pageMeta={...originalMeta};applyMeta();if(!originalMeta.hadDescription)document.querySelector('meta[name="description"]')?.remove()};
 const hasChanges=()=>draftActive&&(JSON.stringify(model)!==initialModel||JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(variableSettings)!==initialVariables||JSON.stringify(buttonSettings)!==initialButtons||JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder)||Object.values(sectionStates).some(x=>x.hidden||x.deleted)||(pageMeta.title!==originalMeta.title||pageMeta.description!==originalMeta.description));
 function hideEditor(){if(!draftActive||screen.hidden)return;screen.hidden=true;pencil.hidden=false;pencil.title=hasChanges()?'Resume editing (unsaved changes)':'Resume editing'}

 // Change only the necessary text nodes. Never flatten formatted descendants.
 const setText=(el,value)=>{
  const old=el.textContent;
  if(old===value)return;
  const nodes=[],walker=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())nodes.push(walker.currentNode);
  if(!nodes.length){el.append(el.ownerDocument.createTextNode(value));return}
  let prefix=0;while(prefix<old.length&&prefix<value.length&&old[prefix]===value[prefix])prefix++;
  let suffix=0;while(suffix<old.length-prefix&&suffix<value.length-prefix&&old[old.length-1-suffix]===value[value.length-1-suffix])suffix++;
  const start=prefix,end=old.length-suffix;
  let offset=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
  for(const node of nodes){
   const next=offset+node.data.length;
   if(!startNode&&start<=next){startNode=node;startOffset=start-offset}
   if(!endNode&&end<=next){endNode=node;endOffset=end-offset}
   offset=next;
  }
  if(!startNode)startNode=nodes[nodes.length-1],startOffset=startNode.data.length;
  if(!endNode)endNode=nodes[nodes.length-1],endOffset=endNode.data.length;
  const replacement=value.slice(prefix,value.length-suffix);
  if(startNode===endNode){startNode.replaceData(startOffset,endOffset-startOffset,replacement);return}
  startNode.data=startNode.data.slice(0,startOffset)+replacement;
  endNode.data=endNode.data.slice(endOffset);
  let between=false;
  for(const node of nodes){if(node===startNode){between=true;continue}if(node===endNode)break;if(between)node.data=''}
 };
 const articleText=el=>Array.from(el.children).map(p=>p.textContent.trim()).join('\n\n');
 const isArticle=el=>/^(DIV|SECTION|ARTICLE|MAIN)$/.test(el.tagName)&&el.children.length>0&&Array.from(el.children).every(c=>c.tagName==='P');
 const setArticle=(el,value)=>{
  const paragraphs=value.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/);
  const existing=Array.from(el.children).filter(n=>n.tagName==='P');
  paragraphs.forEach((text,i)=>{
   const next=text.trim().replace(/\n/g,' ');
   if(existing[i])setText(existing[i],next);
   else{const p=el.ownerDocument.createElement('p');p.textContent=next;el.append(p)}
  });
  for(let i=paragraphs.length;i<existing.length;i++)existing[i].remove();
 };
 function restoreLive(){
  liveRoots.forEach((root,i)=>{if(touchedRoots.has(i)&&root.innerHTML!==rootSnapshots[i])root.innerHTML=rootSnapshots[i]});
  liveSnapshots.forEach(({node,html,href,src,alt,srcset,sizes,display,hadStyle},i)=>{
   if(!touchedNodes.has(i)||!node.isConnected)return;
   if(node.style.display!==display){
    if(hadStyle){node.style.display=display}
    else{node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style')}
   }
   if(node.tagName==='IMG'){
    for(const [k,v] of [['src',src],['alt',alt],['srcset',srcset],['sizes',sizes]])if(node.getAttribute(k)!==v){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}
   }else{
    if(node.innerHTML!==html)node.innerHTML=html;
    if(node.getAttribute('href')!==href){if(href===null)node.removeAttribute('href');else node.setAttribute('href',href)}
   }
  });
  touchedNodes.clear();touchedRoots.clear();
 }
 const groupChanged=members=>{
  const originals=members.filter(x=>!x.added).slice().sort((a,b)=>a.index-b.index);
  return members.length!==originals.length||members.some((x,i)=>x.added||x.deleted||x.hidden||x.text!==x.originalText||x.url!==x.originalURL||x.index!==originals[i]?.index);
 };
 function syncLive(){
  for(const item of model){
   if(item.group!==null||item.added)continue;
   const original=liveSnapshots[item.index],node=original?.node;
   if(!node?.isConnected)continue;
   const shouldHide=!!(item.hidden||item.deleted);
   if(shouldHide){if(node.style.display!=='none'){touchedNodes.add(item.index);node.style.display='none'}}
   else if(touchedNodes.has(item.index)&&node.style.display!==original.display){
    if(original.hadStyle)node.style.display=original.display;
    else{node.style.removeProperty('display');if(!node.getAttribute('style'))node.removeAttribute('style')}
   }
   if(item.deleted)continue;
   if(item.image){
    if(item.src!==item.originalSrc&&validImageURL(item.src)){
     touchedNodes.add(item.index);
     const url=normalizeURL(item.src);if(node.getAttribute('src')!==url)node.setAttribute('src',url);
     node.removeAttribute('srcset');node.removeAttribute('sizes');
    }else if(item.src===item.originalSrc&&touchedNodes.has(item.index)){
     for(const k of ['src','srcset','sizes']){const v=original[k];if(node.getAttribute(k)!==v){if(v===null)node.removeAttribute(k);else node.setAttribute(k,v)}}
    }
    if(item.alt!==item.originalAlt)touchedNodes.add(item.index);
    if(touchedNodes.has(item.index)&&node.getAttribute('alt')!==item.alt)node.setAttribute('alt',item.alt);
    continue;
   }
   if(item.decorative)continue;
   if(item.text!==item.originalText){
    touchedNodes.add(item.index);
    if(item.article)setArticle(node,item.text);
    else setText(node,item.text);
   }else if(touchedNodes.has(item.index)&&node.innerHTML!==original.html){
    node.innerHTML=original.html;
   }
   if(item.link){
    const href=item.url===item.originalURL?item.originalURL:normalizeURL(item.url);
    if(item.url!==item.originalURL)touchedNodes.add(item.index);
    if(touchedNodes.has(item.index)&&href&&node.getAttribute('href')!==href)node.setAttribute('href',href);
   }
  }
  liveRoots.forEach((root,gi)=>{
   const members=model.filter(x=>x.group===gi);
   const dirty=groupChanged(members);
   if(!dirty){
    if(touchedRoots.has(gi)){if(root.innerHTML!==rootSnapshots[gi])root.innerHTML=rootSnapshots[gi];touchedRoots.delete(gi)}
    return;
   }
   // Only rebuild this collection when it was actually edited.
   touchedRoots.add(gi);
   root.innerHTML=rootSnapshots[gi];
   [...root.children].filter(el=>el.matches('a[data-edit]')).forEach(el=>el.remove());
   for(const item of members){
    if(!item.link||item.deleted)continue;
    const node=item.added?document.createElement('a'):liveSnapshots[item.index]?.clone.cloneNode(true);
    if(!node)continue;
    if(item.added)node.setAttribute('data-edit',item.label||'Navigation link');
    const href=item.url===item.originalURL?item.originalURL:normalizeURL(item.url);
    if(node.getAttribute('href')!==href)node.setAttribute('href',href||'#');
    if(item.added||item.text!==item.originalText)setText(node,item.text);
    if(item.hidden)node.style.display='none';
    else if(item.added)node.style.removeProperty('display');
    if(root.lastChild&&root.lastChild.nodeType!==3)root.append(document.createTextNode(' '));
    root.append(node);
   }
  });
  syncSections();
  refreshButtonSamples();
  saveDraft();
 }
 const icons=()=>{
  // Official Lucide icon artwork bundled locally for offline rendering.
  const paths={
   "pencil":"<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>",
   "maximize":"<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/> <path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/> <path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/> <path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/>",
   "minimize":"<path d=\"M8 3v3a2 2 0 0 1-2 2H3\"/> <path d=\"M21 8h-3a2 2 0 0 1-2-2V3\"/> <path d=\"M3 16h3a2 2 0 0 1 2 2v3\"/> <path d=\"M16 21v-3a2 2 0 0 1 2-2h3\"/>",
   "plus":"<path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>",
   "arrow-up":"<path d=\"m5 12 7-7 7 7\"/> <path d=\"M12 19V5\"/>",
   "arrow-down":"<path d=\"M12 5v14\"/> <path d=\"m19 12-7 7-7-7\"/>",
   "rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/> <path d=\"M3 3v5h5\"/>",
   "undo-2":"<path d=\"M9 14 4 9l5-5\"/> <path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"/>",
   "eye":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
   "eye-off":"<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/> <path d=\"m2 2 20 20\"/>",
   "trash-2":"<path d=\"M10 11v6\"/> <path d=\"M14 11v6\"/> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/> <path d=\"M3 6h18\"/> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>"
   ,"x":"<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>"
   ,"square-text":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/> <path d=\"M7 8h8\"/> <path d=\"M7 12h10\"/> <path d=\"M7 16h6\"/>"
   ,"file-text":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/> <path d=\"M14 2v5a1 1 0 0 0 1 1h5\"/> <path d=\"M10 9H8\"/> <path d=\"M16 13H8\"/> <path d=\"M16 17H8\"/>"
   ,"palette":"<path d=\"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z\"/> <circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/> <circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>"
   ,"settings-2":"<path d=\"M14 17H5\"/> <path d=\"M19 7h-9\"/> <circle cx=\"17\" cy=\"17\" r=\"3\"/> <circle cx=\"7\" cy=\"7\" r=\"3\"/>"
   ,"arrow-up-right":"<path d=\"M7 7h10v10\"/> <path d=\"M7 17 17 7\"/>"
   ,"chevron-down":"<path d=\"m6 9 6 6 6-6\"/>"
   ,"grip-horizontal":"<circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"
   ,"grip-vertical":"<circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>"
  };
  [...screen.querySelectorAll('i[data-lucide]'),...pencil.querySelectorAll('i[data-lucide]')].forEach(el=>{
   const path=paths[el.getAttribute('data-lucide')];if(!path)return;
   el.outerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  });
 }
 const normalizeURL=value=>{
  const input=String(value||'').trim();
  if(!input||/\s/.test(input))return '';
  if(/^(mailto:|tel:|\/|#)/i.test(input))return input;
  const candidate=/^https?:\/\//i.test(input)?input:'https://'+input;
  try{const u=new URL(candidate);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))return '';return candidate}catch{return ''}
 };
 const validURL=v=>Boolean(normalizeURL(v));
 const validImageURL=v=>Boolean(normalizeURL(v)&&/^https?:\/\//i.test(normalizeURL(v)));
 const displayURL=v=>String(v||'').replace(/^https:\/\//i,'');
 function fitTextarea(input){
  const wasScrolled=input.scrollTop;
  input.style.height='auto';
  const limit=window.innerHeight*(screen.classList.contains('ue-fullscreen')?.8:.6);
  const min=input.classList.contains('ue-article')?200:110;
  input.style.height=Math.max(min,Math.min(input.scrollHeight,limit))+'px';
  input.style.overflowY=input.scrollHeight>limit?'auto':'hidden';
  input.scrollTop=wasScrolled;
 }
 const internalDestinations=()=>Array.from(document.querySelectorAll('[id]'))
  .filter(el=>!el.closest('#ue-screen,#ue-pencil')&&!/^ue-/.test(el.id))
  .map(el=>({id:el.id,label:(el.getAttribute('aria-label')||el.querySelector('h1,h2,h3,h4,h5,h6')?.textContent||el.getAttribute('data-edit')||el.id).trim()}));
 const validLinkTarget=url=>!String(url).trim().startsWith('#')||internalDestinations().some(x=>'#'+x.id===String(url).trim());
 function render(){
  fields.replaceChildren();
  const metaBox=document.createElement('div');metaBox.className='ue-meta';
  const heading=document.createElement('strong');heading.textContent='Page details';metaBox.append(heading);
  for(const [key,title] of [['title','Page title'],['description','Page description']]){
   const label=document.createElement('label');label.textContent=title;
   const input=document.createElement(key==='description'?'textarea':'input');if(key==='title')input.type='text';
   input.value=pageMeta[key]||'';input.setAttribute('aria-label',title);
   input.oninput=()=>{checkpoint();pageMeta[key]=input.value;applyMeta();saveDraft()};
   label.append(input);
   const reset=document.createElement('button');reset.type='button';reset.className='ue-field-reset';reset.title='Reset '+title;reset.setAttribute('aria-label','Reset '+title);
   reset.innerHTML='<i data-lucide="rotate-ccw"></i>';reset.disabled=pageMeta[key]===originalMeta[key];
   reset.onclick=event=>{event.preventDefault();event.stopPropagation();checkpoint();pageMeta[key]=originalMeta[key];applyMeta();render();saveDraft()};
   input.addEventListener('input',()=>{reset.disabled=pageMeta[key]===originalMeta[key]});
   label.style.position='relative';label.style.paddingRight='35px';label.append(reset);metaBox.append(label);
  }
  settingsPanel.replaceChildren(metaBox);
  for(const item of model){
   if(item.deleted)continue; // Keep the model for Undo/Revert/export, not in the sidebar.
   const box=document.createElement('div');box.className='ue-item';
   const label=document.createElement('label');label.textContent=item.label|| (item.image?'Image':item.link?'Link text':item.tag==='p'?'Paragraph':'Text');
   box.dataset.editIndex=String(model.indexOf(item));
   if(item.hidden)box.classList.add('ue-hidden')
   if(item.decorative){
    const hint=document.createElement('span');hint.textContent='Divider';hint.style.color='#777';hint.style.fontSize='13px';box.append(hint);
   }else if(item.image){
    const preview=document.createElement('img');preview.className='ue-image-preview';preview.alt='Image preview';
    const updatePreview=()=>{if(validImageURL(item.src)){preview.src=normalizeURL(item.src)}else{preview.removeAttribute('src')}};
    updatePreview();box.append(preview);
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='example.com/photo.jpg';url.value=displayURL(item.src);
    url.oninput=()=>{checkpoint();item.src=url.value;updatePreview();syncLive()};
    label.dataset.ueField='src';label.append(url);box.append(label);
    const altLabel=document.createElement('label');altLabel.textContent='Alt text';
    const altInput=document.createElement('input');altInput.type='text';altInput.value=item.alt;
    altInput.oninput=()=>{checkpoint();item.alt=altInput.value;syncLive()};
    altLabel.dataset.ueField='alt';altLabel.append(altInput);box.append(altLabel);
   }else{
    const input=document.createElement(item.article||item.tag==='p'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';if(item.article)input.classList.add('ue-article');input.value=item.text;input.oninput=()=>{checkpoint();item.text=input.value;if(input.tagName==='TEXTAREA')fitTextarea(input);syncLive()};label.dataset.ueField='text';label.append(input);box.append(label);
   }
   if(item.link){
    const lbl=document.createElement('label');lbl.textContent='Link destination';lbl.dataset.ueField='url';
    const destinations=internalDestinations();
    const selection=document.createElement('select');selection.setAttribute('aria-label','Link destination');
    for(const dest of destinations){
     const option=document.createElement('option');option.value='#'+dest.id;option.textContent=dest.label+' (#'+dest.id+')';selection.append(option);
    }
    const external=document.createElement('option');external.value='__custom__';external.textContent='External URL, email, or other link';selection.append(external);
    const isInternal=String(item.url||'').startsWith('#');
    const available=isInternal&&destinations.some(dest=>'#'+dest.id===item.url);
    if(isInternal&&!available){const option=document.createElement('option');option.value=item.url;option.textContent='Missing section ('+item.url+')';option.disabled=true;selection.prepend(option)}
    selection.value=isInternal?item.url:'__custom__';
    const url=document.createElement('input');url.type='text';url.inputMode='url';url.placeholder='https://example.com or mailto:name@example.com';url.value=isInternal?'':item.url.replace(/^https:\/\//i,'');
    url.hidden=isInternal;
    selection.onchange=()=>{
     checkpoint();
     if(selection.value==='__custom__'){item.url='';url.value='';url.hidden=false}
     else{item.url=selection.value;url.hidden=true}
     syncLive();render();
    };
    url.oninput=()=>{checkpoint();item.url=url.value;syncLive()};
    lbl.append(selection,url);box.append(lbl);
   }
   const controls=document.createElement('div');controls.className='ue-controls';
   const addControl=(action,icon,fn)=>{
    const button=document.createElement('button');button.type='button';button.title=action;button.setAttribute('aria-label',action+' '+(item.label||item.text||'element'));button.innerHTML='<i data-lucide="'+icon+'"></i>';button.onclick=fn;controls.append(button);
   };
   addControl(item.hidden?'Show':'Hide',item.hidden?'eye-off':'eye',()=>{checkpoint();item.hidden=!item.hidden;render()});
   addControl('Delete','trash-2',()=>{checkpoint();item.deleted=true;render()});
   if(item.group!==null){
    for(const [direction,icon] of [[-1,'arrow-up'],[1,'arrow-down']]){
     addControl(direction<0?'Move up':'Move down',icon,()=>{
      const group=model.filter(x=>x.group===item.group&&!x.deleted);const index=group.indexOf(item),other=group[index+direction];
      if(!other)return;checkpoint();const a=model.indexOf(item),b=model.indexOf(other);[model[a],model[b]]=[model[b],model[a]];render();
     });
    }
   }
   box.append(controls);
   const resetField=(key,name,original,fn)=>{
    const button=document.createElement('button');button.type='button';button.className='ue-field-reset';button.title='Reset '+name;button.setAttribute('aria-label','Reset '+name);
    button.innerHTML='<i data-lucide="rotate-ccw"></i>';button.disabled=String(item[key]??'')===String(original??'');
    button.onclick=event=>{event.preventDefault();event.stopPropagation();checkpoint();item[key]=original;fn?.();syncLive();render()};
    const target=box.querySelector('[data-ue-field="'+key+'"]');if(target){target.style.position='relative';target.style.paddingRight='35px';target.append(button);const input=target.querySelector('input,textarea,select');if(input)input.addEventListener('input',()=>{button.disabled=String(item[key]??'')===String(original??'')})}
   };
   if(item.image){resetField('src','image URL',item.originalSrc);resetField('alt','alt text',item.originalAlt)}
   else if(!item.decorative)resetField('text','text',item.originalText);
   if(item.link)resetField('url','link destination',item.originalURL);
   fields.append(box);
  }fields.querySelectorAll('textarea').forEach(fitTextarea);icons();syncLive();
 }
 function close(restore=true){if(restore){if(hasChanges()){restoreLive();restoreStyle();restoreMeta();if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder)){sectionOrder=[...initialSectionOrder];reorderSections()}sectionStates={};syncSections()}}clearDraft();undoStack=[];syncUndoButton();draftActive=false;initialModel='';screen.hidden=true;pencil.hidden=false;pencil.title='Edit'}
 function copyHTML(){
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
  for(const item of originals.filter(item=>item.deleted)){
   const element=source[item.index];
   if(element?.isConnected)element.remove();
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
  doc.querySelector('#ue-pencil')?.remove();doc.querySelector('#ue-screen')?.remove();doc.querySelector('#ue-style')?.remove();doc.querySelector('#ue-script')?.remove();
  return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 }
 pencil.onclick=()=>{
  if(draftActive){screen.hidden=false;pencil.hidden=true;return}
  const sourceTag=document.getElementById('ends-nav-data');
  let sourceHTML;
  try{sourceHTML=JSON.parse(sourceTag?.textContent||'{}').source}catch{}
  if(typeof sourceHTML!=='string'||!sourceHTML.trim()){
   sourceHTML='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
  }
  baseline=sourceHTML;
  touchedNodes.clear();touchedRoots.clear();
  const roots=Array.from(document.querySelectorAll('[data-edit="links"]')).filter(root=>root.querySelector('a[data-edit]'));
  liveRoots=roots;rootSnapshots=roots.map(root=>root.innerHTML);
  liveNodes=editable().filter(el=>el.getAttribute('data-edit')!=='links');
  liveSnapshots=liveNodes.map(node=>({node,html:node.innerHTML,href:node.getAttribute('href'),src:node.getAttribute('src'),alt:node.getAttribute('alt'),srcset:node.getAttribute('srcset'),sizes:node.getAttribute('sizes'),clone:node.cloneNode(true),display:node.style.display,hadStyle:node.hasAttribute('style')}));
  model=liveNodes.map((el,i)=>{
   const group=el.closest('[data-edit="links"]');
   const article=isArticle(el),image=el.tagName==='IMG',text=article?articleText(el):el.textContent.trim();
   return {index:i,tag:el.tagName.toLowerCase(),article,image,decorative:el.matches('hr'),src:el.getAttribute('src')||'',originalSrc:el.getAttribute('src')||'',alt:el.getAttribute('alt')||'',originalAlt:el.getAttribute('alt')||'',originalURL:el.getAttribute('href')||'',originalText:text,hidden:false,deleted:false,link:el.tagName==='A',label:(el.getAttribute('data-edit')==='links'?'':el.getAttribute('data-edit')||'').trim(),text,url:el.getAttribute('href')||'',group:group?roots.indexOf(group):null};
  });
  draftActive=true;initialModel=JSON.stringify(model);
  originalMeta={...readMeta(),hadDescription:!!document.querySelector('meta[name="description"]')};pageMeta={title:originalMeta.title,description:originalMeta.description};
  styleSettings=readStyle();initialStyle=JSON.stringify(styleSettings);
  variableSettings=Object.fromEntries(Object.entries(originalVariables).map(([name,config])=>[name,config.value]));initialVariables=JSON.stringify(variableSettings);
  buttonAppearance=getButtonAppearance();buttonSettings={};initialButtons=JSON.stringify(buttonSettings);
  sectionNodes=findSections();sectionOrder=sectionNodes.map(n=>n.getAttribute('data-section'));
  sectionStates={};sectionDisplays.clear();sectionLabels.clear();sectionStyleAttrs.clear();
  for(const node of sectionNodes){
   sectionDisplays.set(node,node.style.display);
   sectionLabels.set(node,node.getAttribute('aria-label'));
   sectionStyleAttrs.set(node,node.getAttribute('style'));
  }
  undoStack=[];revertAvailable=false;syncUndoButton();
  initialSectionOrder=[...sectionOrder];
  const saved=readDraft();
  if(saved&&saved.model.length>=model.length&&saved.model.every((item,i)=>item.added||(model[i]&&item.index===model[i].index&&item.tag===model[i].tag))){
   model=saved.model;
   if(saved.styleSettings&&saved.styleSchema===2)styleSettings={...originalAppearance,...saved.styleSettings};
   if(saved.buttonSettings&&typeof saved.buttonSettings==='object')for(const [index,settings] of Object.entries(saved.buttonSettings)){
    if(!Object.hasOwn(buttonAppearance,index)||!settings||typeof settings!=='object')continue;
    for(const key of ['background','color']){
     if(hexColor(settings[key]))buttonSettings[index]={...(buttonSettings[index]||{}),[key]:settings[key]};
    }
   }
   if(saved.variableSettings&&typeof saved.variableSettings==='object')for(const name of Object.keys(originalVariables)){
    const val=saved.variableSettings[name];if(typeof val==='string'&&(originalVariables[name].kind==='color'?!!hexColor(val):/^-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|em|%|vw|vh|vmin|vmax)$/.test(val)))variableSettings[name]=val;
   }
   if(saved.sectionStates&&typeof saved.sectionStates==='object')sectionStates=saved.sectionStates;
   if(saved.pageMeta&&typeof saved.pageMeta==='object')pageMeta={title:String(saved.pageMeta.title||''),description:String(saved.pageMeta.description||'')};
   if(Array.isArray(saved.sectionOrder)&&saved.sectionOrder.length===sectionOrder.length&&saved.sectionOrder.every(id=>sectionOrder.includes(id)))sectionOrder=[...saved.sectionOrder];
  }
  const lastRevert=readRevert();
  if(lastRevert&&!readDraft()){undoStack=[lastRevert];revertAvailable=true;syncUndoButton()}
  if(JSON.stringify(styleSettings)!==initialStyle||JSON.stringify(variableSettings)!==initialVariables||JSON.stringify(buttonSettings)!==initialButtons)applyStyle();
  if(JSON.stringify(sectionOrder)!==JSON.stringify(initialSectionOrder))reorderSections();
  syncSections();applyMeta();
  renderStyle();
  pencil.hidden=true;screen.hidden=false;message.textContent='';
  render();setTab(activeTab);
 };
 add.onclick=()=>{checkpoint();const group=model.find(x=>x.link&&x.group!==null)?.group;if(group===undefined)return;model.push({added:true,index:-1,tag:'a',link:true,text:'',url:'',group});render();fields.lastElementChild?.querySelector('input')?.focus()};
 screen.querySelector('#ue-cancel').onclick=()=>hideEditor();
 screen.querySelector('#ue-revert').onclick=()=>{saveRevert();close(true)};
 document.addEventListener('pointerdown',event=>{
  if(!draftActive||screen.hidden)return;
  if(screen.contains(event.target)||pencil.contains(event.target))return;
  hideEditor();
 });
 screen.querySelector('#ue-copy').onclick=async()=>{
  try{
   if(model.some(x=>!x.deleted&&x.link&&(!x.text.trim()||!validURL(x.url.trim())||!validLinkTarget(x.url))))throw Error('Every link needs text and a valid destination on this page or a URL.');
   const value=copyHTML();
   if(window.endsSharedCopyText)await window.endsSharedCopyText(value);else await navigator.clipboard.writeText(value);
   const sourceTag=document.getElementById('ends-nav-data');
   if(sourceTag){try{const data=JSON.parse(sourceTag.textContent||'{}');data.source=value;sourceTag.textContent=JSON.stringify(data).replace(/</g,'\\u003c')}catch{}}
   clearRevert();close(false);
  }catch(e){message.textContent=e.message||'Copy failed';}
 };
 // Recover a compatible local draft immediately, including its live preview.
 if(readDraft()){pencil.click();hideEditor()}
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey&&draftActive&&!screen.hidden&&!e.target?.closest?.('input,textarea,[contenteditable]')){
   if(undoStack.length){e.preventDefault();undo()}return;
  }
  if(e.key==='Escape'&&!screen.hidden){hideEditor();return}
  const typing=e.target?.isContentEditable||e.target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]');
  if(e.key==='/'&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!typing&&!screen.hidden){
   e.preventDefault();searchInput.focus();searchInput.select();return;
  }
  if(e.key.toLowerCase()!=='e'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||!screen.hidden)return;
  const target=e.target;
  if(target?.isContentEditable||target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'))return;
  e.preventDefault();pencil.click();
 });icons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
