"use strict";

const { scanLineComment, scanDoubleQuoted, scanSingleQuoted } = require("../scanner");

// A plain (unquoted) scalar value with more than one word — e.g. a shell
// command — is free text, not a discrete number/constant/keyword. Mark it
// as excluded (but not "string", so it isn't painted green) so words like
// "20" inside `command: redis-server --port 6380 --save 20 1` don't get
// mistaken for numeric literals.
const keyStartPat = /^[ \t]*(?:- )?[a-zA-Z_$][\w$-]*:[ \t]+/mg;
const OPENERS = new Set(["'", '"', "{", "}", "[", "]", "|", ">", "&", "*", "#"]);

// Finds the end of the plain-scalar value starting at `valueStart`: up to
// end of line, or an inline `#` comment if one comes first, with trailing
// whitespace trimmed off.
function findPlainValueEnd(text, valueStart, len) {
  let lineEnd = text.indexOf("\n", valueStart);
  if (lineEnd === -1) lineEnd = len;
  const commentIdx = text.indexOf("#", valueStart);
  let valueEnd = commentIdx !== -1 && commentIdx < lineEnd ? commentIdx : lineEnd;
  while (valueEnd > valueStart && (text[valueEnd - 1] === " " || text[valueEnd - 1] === "\t")) valueEnd--;
  return valueEnd;
}

function pushPlainValueSegs(text, len, segs) {
  keyStartPat.lastIndex = 0;
  for (const m of text.matchAll(keyStartPat)) {
    const valueStart = m.index + m[0].length;
    if (OPENERS.has(text[valueStart])) continue;

    const valueEnd = findPlainValueEnd(text, valueStart, len);
    if (valueEnd <= valueStart) continue;
    if (!text.slice(valueStart, valueEnd).includes(" ")) continue;
    segs.push({ start: valueStart, end: valueEnd, type: "text" });
  }
}

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

  pushPlainValueSegs(text, len, segs);

  segs.sort((a, b) => a.start - b.start);
  return segs;
}

function applyKeys(text, doc, _excluded, ranges, span) {
  const keyPat = /^[ \t]*([a-zA-Z_$][\w$-]*)[ \t]*:/mg;
  for (const m of text.matchAll(keyPat)) {
    const keyStart = m.index + m[0].indexOf(m[1]);
    ranges.blue.push(span(doc, keyStart, keyStart + m[1].length));
  }
}

module.exports = {
  ids: ["yaml"],
  scan,
  applyKeys,
};
