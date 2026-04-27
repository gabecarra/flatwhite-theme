"use strict";

const { scanLineComment, scanDoubleQuoted, scanSingleQuoted } = require("../scanner");

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
