"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

const keywords = new Set([
  "abstract", "as", "base", "bool", "break", "byte", "case", "catch",
  "char", "checked", "class", "const", "continue", "decimal", "default",
  "delegate", "do", "double", "else", "enum", "event", "explicit",
  "extern", "false", "finally", "fixed", "float", "for", "foreach",
  "goto", "if", "implicit", "in", "int", "interface", "internal", "is",
  "lock", "long", "namespace", "new", "null", "object", "operator", "out",
  "override", "params", "private", "protected", "public", "readonly",
  "ref", "return", "sbyte", "sealed", "short", "sizeof", "stackalloc",
  "static", "string", "struct", "switch", "this", "throw", "true", "try",
  "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using",
  "virtual", "void", "volatile", "while",
]);

const langVars = /\b(this|base)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    // verbatim string @"..." — only "" escapes, no backslash
    if (ch === "@" && ch1 === '"') {
      const start = i; i += 2;
      while (i < len) {
        if (text[i] === '"' && text[i + 1] === '"') { i += 2; continue; }
        if (text[i] === '"') { i++; break; }
        i++;
      }
      segs.push({ start, end: i, type: "string" }); continue;
    }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["csharp"],
  keywords,
  langVars,
  scan,
};
