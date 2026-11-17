# Built.at Inline Editor

An experimental **top-bar version of the existing HTML editor**, isolated in this folder. No existing editor files are changed.

## Try it

Use the same editable HTML markup as the original editor, but replace its script URL with:

```html
<script src="./inline editor/editor.js" defer></script>
```

For a page in this folder, use `<script src="./editor.js" defer></script>`. Serve over HTTP(S), not `file://`.

This variant imports the existing editor's modules and retains its content, design, draft, undo, and HTML-export behavior. The top bar selects editable elements and opens their corresponding controls in a dropdown. Global settings open from the Built.at menu. Preview hides editing controls.

**Experimental limitation:** This is a top-bar UI adapter, not true contenteditable typing directly into the live page. Selecting a field opens the existing field editor in a dropdown. This avoids duplicating the original editor's data model and export logic. A later iteration can wire true inline typing to the model.
