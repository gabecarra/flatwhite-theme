"use strict";

const { scan } = require("./javascript");
const { applyKeys: applyJsxTags } = require("./html");
const { buildExclusionChecker, span } = require("../scanner");

const keywords = new Set([
  "async", "await", "abstract", "as", "break", "case", "catch", "class",
  "const", "continue", "debugger", "declare", "default", "delete", "do",
  "else", "enum", "export", "extends", "finally", "for", "from", "function",
  "get", "if", "implements", "import", "in", "infer", "instanceof",
  "interface", "is", "keyof", "let", "module", "namespace", "never",
  "new", "of", "override", "package", "private", "protected", "public",
  "readonly", "return", "set", "static", "switch", "throw", "try",
  "typeof", "unique", "var", "void", "while", "with", "yield",
]);

// Matches `type` only when used as a declaration keyword: `type Foo = ...`
const TYPE_DECL_RE = /\btype\s+(?=[A-Za-z_$])/g;

const langVars = /\b(this|super)\b/g;

function applyKeys(text, doc, excluded, ranges, spanFn) {
  applyJsxTags(text, doc, excluded, ranges, spanFn);

  const isExcluded = buildExclusionChecker(excluded);
  TYPE_DECL_RE.lastIndex = 0;
  for (const m of text.matchAll(TYPE_DECL_RE)) {
    if (!isExcluded(m.index))
      ranges.purple.push(spanFn(doc, m.index, m.index + 4)); // length of "type"
  }
}

module.exports = {
  ids: ["typescript", "typescriptreact"],
  keywords,
  langVars,
  scan,
  applyKeys,
};
