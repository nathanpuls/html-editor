# HTML Editor

A lightweight visual editor for standalone HTML websites. Edit text, images, links, sections, and design settings directly on the page—without a framework, build step, or CMS.

**One script tag installs the editor.** Behind the scenes, that script loads native JavaScript modules and a separate stylesheet.

## Get started

Add this to your page's `<head>`:

```html
<script src="https://edit.built.at" defer></script>
```

Then label anything you want to edit:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My website</title>
  <style>
    :root { --page-bg: #fff; --main-text: #222; --accent: #b75d35; }
    body { background: var(--page-bg); color: var(--main-text); font-family: system-ui, sans-serif; }
    .button { background: var(--accent); color: white; padding: .75rem 1rem; }
  </style>
  <script src="https://edit.built.at" defer></script>
</head>
<body>
  <main>
    <section data-section="welcome" aria-label="Welcome">
      <h1 data-edit="Hero heading">Hello, world.</h1>
      <p data-edit="Introduction">This text is editable.</p>
      <img data-edit="Hero image" src="https://example.com/photo.jpg" alt="Example photo">
    </section>

    <section data-section="about" aria-label="About">
      <div data-edit="About copy">
        <p>This is the first paragraph.</p>
        <p>This is the second paragraph.</p>
      </div>
    </section>

    <nav data-edit="links" aria-label="Useful links">
      <a data-edit="Contact link" href="mailto:hello@example.com">Contact</a>
    </nav>
  </main>
</body>
</html>
```

Open the page and click the **Edit** pencil (or press **E** while not typing in a field). Make your changes, then click **Copy** to copy the updated HTML.

**Important:** Copy exports HTML to your clipboard; it does not edit the original file or publish the page. Paste the result into your file, site editor, or publishing workflow.

[Try the demo](https://github.com/nathanpuls/html-editor/blob/main/demo.html) · [Browse the source](https://github.com/nathanpuls/html-editor)

## Markup conventions

| Markup | What it does |
| --- | --- |
| `data-edit="Hero heading"` | Makes one text element editable and names its field |
| `data-edit="Hero image"` on `<img>` | Exposes image URL and alt text |
| `<div data-edit="About copy"><p>…</p></div>` | Edits direct child paragraphs as an article-style block |
| `<nav data-edit="links">…</nav>` | Enables add, remove, and reorder for editable links inside |
| `data-section="about" aria-label="About"` | Makes a uniquely identified section manageable and reorderable |
| `:root { --accent: … }` | Exposes supported CSS custom properties to the Design controls |

Use a **descriptive value directly in `data-edit`**, not a separate `data-label` attribute. Avoid nesting editable elements inside other editable fields, except for the reserved `data-edit="links"` collection. Give each manageable section a unique `data-section` value; sibling sections under the same parent can be reordered.

## What you can edit

- **Content:** headings, paragraphs, article copy, image sources and alt text, link labels and destinations, and editable link collections.
- **Sections:** show, hide, reorder, and manage labeled `data-section` blocks.
- **Design:** page appearance, supported CSS variables, typography, colors, and button styles.
- **Page settings:** title and meta description.
- **Workflow:** search across editor controls, dock or resize the panel, use full screen, undo changes, revert to the original page, and copy the resulting HTML.

Edits preview on the page immediately. Browser drafts are saved locally and can be restored after a refresh when compatible with the original page. Use **Copy** for a durable result: local storage can be cleared, blocked, or scoped to a different origin.

**Revert changes** discards the working edits and restores the original state. Closing the panel is not the same as reverting.

## How the files fit together

| File | Responsibility |
| --- | --- |
| `editor.js` | Small classic-script entry point; loads the CSS and imports the editor |
| `interface.js` | Initialization, panel, tabs, search, docking, resizing, navigation, and coordination |
| `content.js` | Text, images, links, and section editing |
| `design.js` | Appearance, CSS variables, typography, and buttons |
| `storage.js` | Browser draft compatibility, localStorage helpers, and undo history |
| `export.js` | Generates clean, complete HTML for copying |
| `editor.css` | Editor interface styles |

The loader resolves modules relative to its own URL, so installations only need to reference `editor.js`. No JavaScript framework, bundler, or runtime package is required.

The hosted installation uses **`https://edit.built.at`** as its entry point (no `.js` suffix needed). The editor's modules and stylesheet are served at paths such as `https://edit.built.at/interface.js` and `https://edit.built.at/editor.css`. Cloudflare serves these files from this repository via Built.at's Worker routing, so the script URL stays the same across releases. The existing `https://built.at/_editor/editor.js` URL also remains available.

### Running your own copy

Place the seven files together in the same directory and reference the local entry point:

```html
<script src="./editor.js" defer></script>
```

Serve the directory over HTTP(S), including when developing locally. Native ES module imports may be blocked on `file://` URLs. For example, if you have Python installed:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/demo.html`. Keep `editor.js`, its imported modules, and `editor.css` reachable at their relative paths.

## Testing

The repository includes headless Chrome smoke checks under `tests/` for core editing, design, search, drafts, undo/revert, layout, and HTML export. GitHub Actions runs these checks on pull requests. For a local run with the necessary browser available:

```bash
node --experimental-default-type=module tests/smoke.mjs
```

## Scope and security

The editor is **client-side only**. It does not provide authentication, server-side saving, or publishing. Anyone who can open a page containing the script can make edits to their **own browser view** and copy the resulting HTML; changing the hosted website still requires access to its publishing process.

The editor does not require external UI libraries. Images and other resources referenced by your website may still need an internet connection.
