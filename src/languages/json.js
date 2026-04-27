"use strict";

const { scanDoubleQuoted } = require("../scanner");

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    if (text[i] === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

function applyKeys(text, doc, excluded, ranges, span) {
  const stringSegs = excluded.filter((s) => s.type === "string");

  for (const seg of stringSegs) {
    if (text[seg.start] !== '"') continue;

    let j = seg.end;
    while (j < text.length && (text[j] === " " || text[j] === "\t")) j++;

    if (text[j] === ":") {
      const r = span(doc, seg.start, seg.end);
      const idx = ranges.green.findIndex(
        (g) => g.start.isEqual(r.start) && g.end.isEqual(r.end)
      );
      if (idx !== -1) ranges.green.splice(idx, 1);
      ranges.blue.push(r);
    }
  }
}

module.exports = {
  ids: ["json", "jsonc"],
  scan,
  applyKeys,
};
