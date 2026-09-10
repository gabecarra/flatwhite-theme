"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

const keywords = new Set([
  "as", "async", "await", "break", "const", "continue", "crate", "dyn",
  "else", "enum", "extern", "false", "fn", "for", "if", "impl", "in",
  "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return",
  "self", "Self", "static", "struct", "super", "trait", "true", "type",
  "union", "unsafe", "use", "where", "while",
]);

const langVars = /\b(self|Self)\b/g;

// Raw string literals: r"...", r#"..."#, r##"..."## (also b-prefixed byte strings)
function tryScanRawString(text, i, len) {
  const prev = text[i - 1];
  if (prev && /\w/.test(prev)) return null;
  let j = i;
  if (text[j] === "b") j++;
  if (text[j] !== "r") return null;
  j++;
  let hashes = 0;
  while (text[j] === "#") { hashes++; j++; }
  if (text[j] !== '"') return null;
  const start = i;
  j++;
  while (j < len) {
    if (text[j] === '"') {
      let k = j + 1, h = 0;
      while (h < hashes && text[k] === "#") { k++; h++; }
      if (h === hashes) { j = k; break; }
    }
    j++;
  }
  return [{ start, end: j, type: "string" }, j];
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "r" || (ch === "b" && ch1 === "r")) {
      const raw = tryScanRawString(text, i, len);
      if (raw) { segs.push(raw[0]); i = raw[1]; continue; }
    }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["rust"],
  keywords,
  langVars,
  scan,
};
