"use strict";

const {
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  scanTripleDouble,
  scanTripleSingle,
} = require("../scanner");

const keywords = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
  "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const langVars = /\b(self|cls)\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "#") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"' && ch1 === '"' && text[i + 2] === '"') { const [s, n] = scanTripleDouble(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'" && ch1 === "'" && text[i + 2] === "'") { const [s, n] = scanTripleSingle(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["python"],
  keywords,
  langVars,
  scan,
};
