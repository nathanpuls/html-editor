# Built.at

A lightweight visual HTML editor: vanilla JavaScript and CSS, no build step.

Install the top toolbar with one script:

```html
<script src="https://edit.built.at" defer></script>
```

- [Create a page](https://built.at/editor)
- [Comprehensive demo / shared test case](https://edit.built.at/demo.html)
- [Editor and HTML conventions](top-editor/README.md)
- [Canonical generation prompt](new-page/prompt.txt)

The prompt, editor, demo and contract tests evolve together. A markup convention change is incomplete until all four agree. The demo is the reference generated document, not a separate editor implementation.

The independent side-panel alternative remains available with `<script src="https://side-edit.built.at" defer></script>`. Its preserved deployment is separate from the top toolbar.

## Checks

Run `python3 tests/markup-contract.py` and the Node tests in `tests/`. The demo also provides the manual interaction checklist documented in the editor README.
