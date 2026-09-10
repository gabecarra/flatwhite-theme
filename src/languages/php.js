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

const HEREDOC_OPEN_RE = /^<<<[ \t]*(?:(['"])([a-zA-Z_]\w*)\1|([a-zA-Z_]\w*))/;

// heredoc <<<EOT...EOT; and nowdoc <<<'EOT'...EOT;
function tryScanHeredoc(text, i, len) {
  const m = HEREDOC_OPEN_RE.exec(text.slice(i, i + 200));
  if (!m) return null;
  const id = m[2] || m[3];
  const start = i;
  let j = i + m[0].length;
  while (j < len && text[j] !== "\n") j++;
  j++; // past newline
  const closeRe = new RegExp(String.raw`^[ \t]*` + id + String.raw`\b`, "m");
  const cm = closeRe.exec(text.slice(j));
  const end = cm ? j + cm.index + cm[0].length : len;
  return [{ start, end, type: "string" }, end];
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1], ch2 = text[i + 2];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "/" && ch1 === "/") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "#")                { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "<" && ch1 === "<" && ch2 === "<") {
      const doc = tryScanHeredoc(text, i, len);
      if (doc) { segs.push(doc[0]); i = doc[1]; continue; }
    }
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
