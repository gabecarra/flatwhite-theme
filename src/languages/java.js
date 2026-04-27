"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  scanTripleDouble,
} = require("../scanner");

const keywords = new Set([
  "abstract", "assert", "break", "case", "catch", "class", "const",
  "continue", "default", "do", "else", "enum", "extends", "final",
  "finally", "for", "goto", "if", "implements", "import", "instanceof",
  "interface", "native", "new", "package", "permits", "private",
  "protected", "public", "record", "return", "sealed", "static",
  "strictfp", "switch", "synchronized", "throw", "throws", "transient",
  "try", "var", "void", "volatile", "while",
]);

const langVars = /\b(this|super)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"' && ch1 === '"' && text[i + 2] === '"') { const [s, n] = scanTripleDouble(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["java"],
  keywords,
  langVars,
  scan,
};
