# Built.at top toolbar

Install `<script src="https://edit.built.at" defer></script>`. No framework or build tools.

## Shared HTML convention

| Markup | Meaning |
| --- | --- |
| `data-edit="Design card"` | Unique, human-readable selection name |
| `data-edit-group="service-cards"` | Optional explicit group for Select similar |
| `data-lucide="mail"` | Replaceable identity of an inline Lucide SVG |
| Semantic nesting | Parent/child selection and valid sibling reordering |
| Root CSS variables | Explicit page-wide colors; derived shades use var()/color-mix() |

No reserved link labels, collection attributes or data-section are required. A card and its children can all be selectable; editable text belongs on leaf elements. Use ordinary semantic lists for link collections. Generic Duplicate works on links, cards and whole sections, preserves their children, and remaps internal ID references.

Groups affect styling only. Unrelated items are never grouped by class, tag or approximate hue. Element formatting creates local overrides; Page settings edits independent root color variables. Derived variables follow their source through CSS, and are not presented as independent colors.

## Editing

Click text to edit at the clicked position. Escape returns to selection; Left/Right enter at the beginning/end; Enter enters at the end. Delete removes a selected element outside text editing. Duplicate selects the copy for immediate editing or deletion. Select parents through the element search or Shift-click. Select similar is available only for explicit groups.

Drag the selected element's grip to reorder siblings without reparenting. The page scrolls near viewport edges. Formatting controls overflow individually into Actions as actual space decreases; Copy and Close remain available.

Image/link URLs, alt text, placeholders, page title/favicon and Lucide names apply automatically. Images preload before replacement. Local drafts restore unfinished edits. Revert restores authored originals and supports Undo. Copy exports the current document without editor runtime/UI, preserving authored markup, styles and the installation script.

## Source and shared reference

- `../new-page/prompt.txt`: canonical prompt used by built.at/editor; keep {{WEBSITE_BRIEF}}.
- `demo.html`: comprehensive, authored fixture following that prompt.
- `interface.js`: selection, editing and orchestration.
- `toolbar.js`: toolbar, menus and inspectors.
- `design.js`: formatting helpers, overflow, drag and root colors.
- `history.js`, `export.js`: drafts/history and clean export.

Change the prompt, editor, demo and contract tests together when conventions change. Avoid compatibility branches for obsolete experimental markup.

## Demo verification

Use https://edit.built.at/demo.html as the shared reference:
1. Edit typography, including inline emphasis; select a parent card separately from its text.
2. Select similar card headings and change formatting without changing their individual text.
3. Change Accent in Page settings: solid, soft and transparent variants follow; Secondary remains independent. A local override remains local.
4. Replace outlined/filled icon colors, Lucide identity and size independently from adjacent labels.
5. Duplicate/delete links, cards and sections; undo/redo; drag siblings and check ID references.
6. Edit image URL/alt, link URLs, input/search/textarea placeholders; failed image loads preserve the image.
7. Test tables, lists, nested containers, details and forms without invalid nesting.
8. Refresh to restore a draft, revert selected/page, then undo the revert.
9. Resize/zoom: menus stay on screen and Copy/Close remain accessible.
10. Copy HTML and reopen it: authored changes remain, editor controls and temporary editing state do not.

Automated structural checks: `python3 tests/markup-contract.py`. Existing Node tests cover duplication/movement, drafts and formatting helpers.
