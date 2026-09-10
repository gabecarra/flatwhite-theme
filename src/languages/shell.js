"use strict";

const {
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

const keywords = new Set([
  "if", "then", "elif", "else", "fi", "case", "esac", "for", "select",
  "while", "until", "do", "done", "in", "function", "time", "coproc",
  "break", "continue", "return", "exit", "local", "export", "readonly",
  "declare", "unset", "shift", "trap", "set",
]);

const langVars = /\$(?:\{[^}]*\}|[A-Za-z_][A-Za-z0-9_]*|[0-9@*#?$!-])/g;

function scanHeredoc(text, i, len) {
  const start = i;
  i += 2;
  if (text[i] === "-") i++;
  while (i < len && (text[i] === " " || text[i] === "\t")) i++;
  let quoted = false;
  if (text[i] === '"' || text[i] === "'") { quoted = true; i++; }
  const tagStart = i;
  while (i < len && /[A-Za-z0-9_]/.test(text[i])) i++;
  const tag = text.slice(tagStart, i);
  if (quoted && (text[i] === '"' || text[i] === "'")) i++;
  while (i < len && text[i] !== "\n") i++;
  if (i < len) i++;
  if (!tag) return [{ start, end: i, type: "string" }, i];
  const lineRe = new RegExp("^[ \\t]*" + tag + "[ \\t]*$", "m");
  const rest = text.slice(i);
  const m = lineRe.exec(rest);
  const end = m ? i + m.index + m[0].length : len;
  return [{ start, end, type: "string" }, end];
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "#") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "<" && ch1 === "<") { const [s, n] = scanHeredoc(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["shellscript"],
  keywords,
  langVars,
  scan,
};
