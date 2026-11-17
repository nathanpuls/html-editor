# Built.at top-toolbar editor

Extracted directly from `Pages!B4` (page `ai edit`) in spreadsheet `1gLz_ysFKbUUSq6TciH6YEFqQAOEJICjI31E7mCnnWvY` on November 17, 2026. The Sheet was read only; neither it nor ends.at configuration was changed.

```html
<script src="https://edit.built.at" defer></script>
```

Use descriptive attributes such as `<h1 data-edit="Main heading">Hello</h1>` and unique `data-section` values for sections. The toolbar starts open. Click to select an item, click it again to edit text. Shift-click, marquee selection, and select-all remain available. Close previews the page; the Edit button or E reopens it.

The original B4 toolbar, selectors, image popup, appearance controls, multiselection and interaction code are retained. Demo-specific selection and export restrictions have been removed. Icons are bundled SVG, and text sessions now participate in undo. Snapshots preserve node identities and structural changes, including nested deletions, every author attribute, and document-head design changes.

| File | Responsibility |
| --- | --- |
| editor.js | Single-tag loader; waits for CSS and imports the editor |
| interface.js | Selection, content editing, images, design control wiring, preview |
| toolbar.js | Toolbar markup and SVG icons extracted from B4 |
| design.js | Color conversion and optional Google Font loading |
| history.js | DOM snapshots and restoration |
| export.js | Complete current document export and clipboard |
| editor.css | Original toolbar styling and host layout adjustments |
| demo.html | Original B4 example webpage with the external loader |
| sample.html | Separate generic page with multiple stylesheets and author script |

Copy HTML clones the entire current document. It retains author metadata, stylesheets, scripts, document/body attributes, text, images and structural changes. It removes editor UI, loading scripts/styles, selection state, temporary layout variables, and runtime editing attributes. Exported HTML is a finished page; reinstall the one-tag editor when further editing is wanted. Referenced fonts, images and author stylesheets retain their existing resource URLs.

## Hosting

Cloudflare Worker `built-at-editors` serves both editor hosts with correct JavaScript/CSS MIME types, CORS, and no-store headers. Its source is in `../cloudflare/`. Like the existing deployment, it reads allowlisted source files from this GitHub repository. The top-toolbar source is `main/top-editor/`; the side panel is pinned independently to commit `4feade71c37eb8c3a66a8e44bc9c1aa159fb3d70`, with `classic-editor.js` as its entry point. Update that release deliberately when maintaining the side panel. Both editors remain independent; neither imports the other.

The exact hostname routes take precedence over Built.at's existing `*.built.at/*` route. Removing only `edit.built.at/*` restores the previous Built.at route without touching ends.at. The side-panel host was verified before adding the toolbar route.

Samples: https://edit.built.at/demo.html, https://edit.built.at/sample.html, https://side-edit.built.at/demo.html. The staging sample at https://built-at-editors.natepuls.workers.dev/top/sample.html loads the production toolbar across origins.

Verified in Chrome: both loaders initialize independently; top-toolbar text edit/undo/redo; section delete and undo with nested paragraphs/image; full document export keeps all author styles/script/footer and strips editor code; side-panel content edit, undo, and Copy HTML. No frameworks, package installation or build pipeline required.

## Search, menu and drafts

Click the magnifying glass to open **Search**. It matches visible text, descriptive `data-edit` names, section names, element tags, IDs, accessible labels and image alt text, including text outside marked fields. Choosing a result scrolls to and selects its element. Arrow keys/Enter choose a result; Escape closes the popover.

The ellipsis menu contains **Page settings**, **New page**, and **Revert changes…**. Page settings edits the HTML title and favicon as one undoable action. New page opens the existing website creation flow at `https://built.at/editor#website-description` in another tab. A hosting system may override that destination with `data-new-page-url="https://your-host/new"` on the installation script.

Drafts save automatically to localStorage and restore on refresh. They are isolated by page URL, ignore editor/preview query flags, and require the original source fingerprint to match. Changed originals discard stale drafts. Revert confirms, restores the original loaded page, clears undo/redo and removes that page's saved draft. A blocked/full localStorage does not break editing or Copy HTML.

Image details include alt text; selecting a link or linked image exposes its destination URL. Page settings, image/link attributes, text, styles and section changes are included in history, drafts and clean HTML export. Search/menu/settings controls are always excluded from export.

Run `node tests/toolbar-drafts.mjs` to verify source matching, refresh restoration, page isolation, clearing and blocked storage.
