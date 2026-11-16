# HTML Editor

A tiny, reusable visual editor for AI-generated **single-page HTML websites**. Plain HTML and CSS stay in the page; the editor is one external script.

## Try it

Open `demo.html` in a browser. Press **E** or click the pencil to edit. Changes appear immediately. Use **Copy** to copy the updated complete HTML, then paste into an HTML file to save or publish. **Revert** restores the original HTML and clears the saved draft; **Esc** hides the panel without losing your edits.

## Make your own page

Add this just before `</head>` (or before `</body>`):

```html
<script src="./editor.js" defer></script>
```

Mark editable elements with a label:

```html
<h1 data-edit data-label="Headline">Hello</h1>
<div data-edit data-label="Article Body">
  <p>First paragraph.</p>
  <p>Second paragraph.</p>
</div>
<img data-edit data-label="Hero Image" src="https://example.com/photo.jpg" alt="Description">
<nav data-edit="links">
  <a data-edit data-label="Contact Link" href="https://example.com">Contact</a>
</nav>
```

Avoid nested editable elements. Article containers with direct paragraph children become one large text area. Editable links must already exist in a `data-edit="links"` group before the editor offers “Add link.”

## What this version supports

Text and article-body editing; URLs, images and alt text; named fields; link groups; instant preview; compact/fullscreen editing; auto-expanding text areas; **E** shortcut; hide/resume; Cancel/Copy; and a browser navigation warning for uncopied edits.

Edits are automatically saved as a local browser draft and restored after refresh when the underlying page has not changed. A changed original page will not load an older draft. Browser storage may be unavailable for some `file://` pages or private browsing settings, so use **Copy** to keep a permanent version. Editor control icons use bundled Lucide SVGs and work offline.

This standalone version works from a local HTML page or a hosted page. It was extracted from the editor in **Dino → Shared!B22**. It does **not** replace that production editor.

## Important notes

- The editor is **client-side**. Copy does not write to the original file or publish a website.
- The clipboard output intentionally retains `<script src="./editor.js" defer></script>` so the page remains editable after copying. If you publish elsewhere, use an appropriate editor script URL.
- This repository is **private**, so it is not a public CDN. To load the editor on an unrelated hosted website, deploy the script to a publicly accessible static URL.
- The editor has no authentication. Anyone with access to an HTML page containing the script can edit their local browser view and copy HTML, **not** change the hosted site without file/deploy access.
- The demo uses externally hosted images; those require internet access.
