"use strict";

const { scanLineComment, scanDoubleQuoted, scanSingleQuoted } = require("../scanner");

const keywords = new Set([
  "break", "else", "FALSE", "for", "function", "if", "in", "Inf",
  "NA", "NA_character_", "NA_complex_", "NA_integer_", "NA_real_",
  "NaN", "next", "NULL", "repeat", "return", "TRUE", "while",
]);

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
  ids: ["r"],
  keywords,
  scan,
};
