"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  scanTemplateLiteral,
} = require("../scanner");

const keywords = new Set([
  "async", "await", "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "export", "extends",
  "finally", "for", "from", "function", "get", "if", "import", "in",
  "instanceof", "let", "new", "of", "return", "set", "static", "switch",
  "throw", "try", "typeof", "var", "void", "while", "with", "yield",
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
    if (ch === "`")                { const [s, n] = scanTemplateLiteral(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["javascript", "javascriptreact"],
  keywords,
  langVars,
  scan,
};
