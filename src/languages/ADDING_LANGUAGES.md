# Adding a language

Each language is a single file in `src/languages/`. The registry (`index.js`) picks it up automatically — no other file needs to change.

## Compatible languages

| Language | VS Code IDs | Maturity | Notes |
|---|---|---|---|
| JavaScript | `javascript`, `javascriptreact` | Full | Template literals, block/line comments |
| TypeScript | `typescript`, `typescriptreact` | Full | Same scanner as JS |
| Python | `python` | Full | Triple-quoted strings, `#` comments |
| Java | `java` | Full | Text blocks (`"""`), block/line comments |
| JSON / JSONC | `json`, `jsonc` | Full | Key highlighting (blue) |
| YAML | `yaml` | Full | Key highlighting (blue), `#` comments |
| Rust | `rust` | Good | Raw strings (`r"..."`, `r#"..."#`) not scanned |
| Go | `go` | Good | Raw string literals (backticks) included |
| C | `c` | Good | |
| C# | `csharp` | Good | Verbatim strings (`@"..."`) included; interpolated (`$"..."`) not scanned |
| C++ | `cpp` | Good | Raw strings (`R"(...)"`) not scanned |
| PHP | `php` | Good | Heredoc / nowdoc not scanned |
| Visual Basic | `vb` | Good | |
| SQL | `sql` | Good | Keywords matched case-insensitively |
| R | `r` | Good | |
| Markdown | `markdown` | Good | Headings, bold, links, blockquotes, code spans/blocks |

**Maturity levels**
- **Full** — all string types, all comment styles, and any language-specific features (key highlighting, etc.) are handled
- **Good** — standard strings and comments work correctly; uncommon constructs noted in the Notes column may not be highlighted

---

## 1. Create the language file

Create `src/languages/<language>.js`. A language module exports an object with these fields:

| Field | Type | Required | Purpose |
|---|---|---|---|
| `ids` | `string[]` | yes | VS Code `languageId` values this module handles |
| `scan` | `function(text): segment[]` | yes | Identifies string and comment spans |
| `keywords` | `Set<string>` | no | Highlighted purple |
| `keywordCaseInsensitive` | `boolean` | no | Match keywords case-insensitively (e.g. SQL) |
| `langVars` | `RegExp` (with `g` flag) | no | Instance/context variables highlighted orange (e.g. `this`, `self`) |
| `applyKeys` | `function(text, doc, excluded, ranges, span)` | no | Custom key highlighting (used by JSON, YAML) |

## 2. Write the `scan` function

Import whichever scan primitives you need from `../scanner` and compose them:

```js
const {
  scanBlockComment,    // /* … */
  scanLineComment,     // // … or # … or -- … (to end of line)
  scanDoubleQuoted,    // "…"
  scanSingleQuoted,    // '…'
  scanTripleDouble,    // """…"""
  scanTripleSingle,    // '''…'''
  scanTemplateLiteral, // `…` with ${…} nesting
} = require("../scanner");
```

Each primitive has the signature `(text, i, len) => [segment, nextIndex]` where `segment` is `{ start, end, type: "string" | "comment" }`.

```js
function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    // match opening characters and dispatch to the right primitive
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}
```

If your language has the exact same scanning rules as an existing one (e.g. TypeScript reuses JavaScript's scanner), just import and re-export:

```js
const { scan } = require("./javascript");
```

## 3. Register the module

Add `require("./<language>")` to the `defs` array in `src/languages/index.js`:

```js
const defs = [
  require("./javascript"),
  require("./typescript"),
  // ...
  require("./<language>"), // add here
];
```

## Example: adding Ruby

```js
// src/languages/ruby.js
"use strict";

const { scanLineComment, scanDoubleQuoted, scanSingleQuoted } = require("../scanner");

const keywords = new Set([
  "BEGIN", "END", "alias", "and", "begin", "break", "case", "class",
  "def", "defined?", "do", "else", "elsif", "end", "ensure", "false",
  "for", "if", "in", "module", "next", "nil", "not", "or", "redo",
  "rescue", "retry", "return", "self", "super", "then", "true", "undef",
  "unless", "until", "when", "while", "yield",
]);

const langVars = /\b(self)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i];
    if (ch === "#") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["ruby"],
  keywords,
  langVars,
  scan,
};
```

Then add `require("./ruby")` to the `defs` array in `index.js`.

## Color reference

| Color | Used for |
|---|---|
| Purple | Keywords |
| Green | Strings |
| Teal | Constants (`true`, `false`, `null`, …) and numbers |
| Orange | Language variables (`this`, `self`, …) |
| Blue | Object/map keys (JSON, YAML) |
