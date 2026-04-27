"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

const keywords = new Set([
  "abstract", "and", "array", "as", "break", "callable", "case", "catch",
  "class", "clone", "const", "continue", "declare", "default", "die", "do",
  "echo", "else", "elseif", "empty", "enddeclare", "endfor", "endforeach",
  "endif", "endswitch", "endwhile", "eval", "exit", "extends", "final",
  "finally", "fn", "for", "foreach", "function", "global", "goto", "if",
  "implements", "include", "include_once", "instanceof", "insteadof",
  "interface", "isset", "list", "match", "namespace", "new", "or", "print",
  "private", "protected", "public", "readonly", "require", "require_once",
  "return", "static", "switch", "throw", "trait", "try", "unset", "use",
  "var", "while", "xor", "yield",
]);

// PHP uses $this, not this — match the dollar sign explicitly
const langVars = /\$this\b/g;

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "#")                { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["php"],
  keywords,
  langVars,
  scan,
};
