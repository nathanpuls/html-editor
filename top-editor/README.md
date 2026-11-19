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

Groups affect styling only. Unrelated items are never grouped by class, tag or approximate hue. Element formatting creates local overrides; Page settings edits independent root color variables: click a swatch for the shared area/hue/opacity/HEX picker, or enter HEX directly. Picker drags form one undoable change. Derived variables follow their source through CSS, and are not presented as independent colors.

## Editing

Click text to edit at the clicked position. Escape returns to selection; Left/Right enter at the beginning/end; Enter enters at the end. Delete removes a selected element outside text editing. Duplicate selects the copy for immediate editing or deletion. Select parents through the element search or Shift-click. Select similar appears beside the element selector when an explicit group has multiple members; it is also available in the search dropdown.

Drag an element's border with the grab cursor to reorder siblings without reparenting. There is no separate grip icon; the interior remains available for text editing. The page scrolls near viewport edges. Click a numeric value to type freely, then press Enter or leave the field to commit. Press the move-horizontal handle on Size or Radius to open its slider over the label, then drag in the same gesture for live adjustments. Hover does not open it. The slider stays open after release so its Reset action remains accessible. Font opens a visible, keyboard-accessible menu with the current font selected. Formatting controls overflow individually into Actions as actual space decreases; Copy and Close remain available.

Image/link URLs, alt text, placeholders, page title/favicon and Lucide names apply automatically. Images preload before replacement. Local drafts restore unfinished edits. Revert restores authored originals and supports Undo. Copy exports the current document without editor runtime/UI, preserving authored markup and styles. The editor installation script is omitted from exported HTML.

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
1. Edit typography, including inline emphasis; select a parent card separately from its text. Choose fonts through the visible menu, including keyboard navigation and overflow. Type multi-digit Size/Radius values without early clamping; test empty input, Escape, arrows, click-only sliders, captured drag and Undo.
2. Select similar card headings and change formatting without changing their individual text.
3. Change Accent in Page settings: solid, soft and transparent variants follow; Secondary remains independent. A local override remains local.
4. Replace outlined/filled icon colors, Lucide identity and size independently from adjacent labels.
5. Duplicate/delete links, cards and sections; undo/redo; drag siblings and check ID references.
6. Edit image URL/alt, link URLs, input/search/textarea placeholders; failed image loads preserve the image.
7. Test tables, lists, nested containers, details and forms without invalid nesting.
8. Refresh to restore a draft, revert selected/page, then undo the revert.
9. Reset Font, Size, Text Color, Background, Border and Radius from their own panels for both Page and selected elements. Other property changes must survive; Undo must restore the reset property. Verify solid colors chosen from transparent backgrounds become visible, and explicit alpha stays intact.\n10. Resize/zoom: menus stay on screen and Copy/Close remain accessible.
11. Copy HTML and reopen it: authored changes remain, editor controls and temporary editing state do not.

Automated structural checks: `python3 tests/markup-contract.py`. Existing Node tests cover duplication/movement, drafts and formatting helpers.
