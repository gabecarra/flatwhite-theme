"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  buildExclusionChecker,
} = require("../scanner");

const keywords = new Set([
  "auto", "break", "case", "char", "const", "continue", "default", "do",
  "double", "else", "enum", "extern", "float", "for", "goto", "if",
  "inline", "int", "long", "register", "restrict", "return", "short",
  "signed", "sizeof", "static", "struct", "switch", "typedef", "union",
  "unsigned", "void", "volatile", "while",
  // standard types
  "size_t", "ssize_t", "ptrdiff_t", "uintptr_t", "intptr_t",
  "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  "int8_t", "int16_t", "int32_t", "int64_t",
  "bool", "FILE", "NULL", "true", "false",
]);

// PascalCase identifiers are user-defined types (Arena, Entry, Intern, ...)
const PASCAL_RE = /\b([A-Z][a-zA-Z0-9]*[a-z][a-zA-Z0-9]*)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

function applyKeys(text, doc, excluded, ranges, span) {
  const isExcluded = buildExclusionChecker(excluded);
  PASCAL_RE.lastIndex = 0;
  for (const m of text.matchAll(PASCAL_RE)) {
    if (!isExcluded(m.index))
      ranges.teal.push(span(doc, m.index, m.index + m[0].length));
  }
}

module.exports = {
  ids: ["c"],
  keywords,
  scan,
  applyKeys,
};
