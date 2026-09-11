"use strict";

const { scanLineComment, scanDoubleQuoted, scanSingleQuoted } = require("../scanner");

// A plain (unquoted) scalar value with more than one word — e.g. a shell
// command — is free text, not a discrete number/constant/keyword. Mark it
// as excluded (but not "string", so it isn't painted green) so words like
// "20" inside `command: redis-server --port 6380 --save 20 1` don't get
// mistaken for numeric literals.
const keyStartPat = /^[ \t]*(?:- )?[a-zA-Z_$][\w$-]*:[ \t]+/mg;
const OPENERS = new Set(["'", '"', "{", "}", "[", "]", "|", ">", "&", "*", "#"]);

// `key: |` / `key: >` (with optional chomping/indentation indicators) starts
// a block scalar whose body is the following more-indented lines. That body
// is free-form text — e.g. prose in a `description: |` block — not code, so
// it must not be scanned for keywords/numbers/constants.
const blockScalarPat = /^([ \t]*)(?:- )?[a-zA-Z_$][\w$-]*:[ \t]+[|>][+-]?\d?[ \t]*(?:#.*)?$/mg;

// A hyphenated alphanumeric token containing a digit — e.g. an ISO code
// (`HR-18`) or a version-like id (`3166-1`) — is a single opaque value, not
// a numeric literal with a stray hyphen next to it. Exclude these wherever
// they appear (including inside flow collections like `[Istria, HR-18]`,
// which aren't otherwise parsed) so the embedded digits aren't mistaken for
// numbers.
const hyphenTokenPat = /\b[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\b/g;

// A URI (`scheme://...`) is a single opaque address, not a numeric literal —
// e.g. the `2024`/`01`/`02` path segments in `http://tems.org/2024/temscore#`
// aren't numbers. Exclude these wherever they appear, same as hyphenTokenPat.
const urlTokenPat = /\b[a-zA-Z][a-zA-Z0-9+.-]*:\/\/\S+/g;

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

function pushBlockScalarSegs(text, len, segs) {
  blockScalarPat.lastIndex = 0;
  for (const m of text.matchAll(blockScalarPat)) {
    const indent = m[1].length;
    let pos = m.index + m[0].length;
    if (text[pos] === "\n") pos++;
    const start = pos;
    let end = start;
    while (pos < len) {
      let lineEnd = text.indexOf("\n", pos);
      if (lineEnd === -1) lineEnd = len;
      const line = text.slice(pos, lineEnd);
      if (line.trim().length > 0) {
        const lineIndent = line.match(/^[ \t]*/)[0].length;
        if (lineIndent <= indent) break;
      }
      end = lineEnd;
      pos = lineEnd + 1;
    }
    if (end > start) segs.push({ start, end, type: "text" });
  }
}

function pushHyphenTokenSegs(text, segs) {
  hyphenTokenPat.lastIndex = 0;
  for (const m of text.matchAll(hyphenTokenPat)) {
    if (!/\d/.test(m[0])) continue;
    segs.push({ start: m.index, end: m.index + m[0].length, type: "text" });
  }
}

function pushUrlTokenSegs(text, segs) {
  urlTokenPat.lastIndex = 0;
  for (const m of text.matchAll(urlTokenPat)) {
    segs.push({ start: m.index, end: m.index + m[0].length, type: "text" });
  }
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

  pushBlockScalarSegs(text, len, segs);
  pushHyphenTokenSegs(text, segs);
  pushUrlTokenSegs(text, segs);
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
  ids: ["yaml", "dockercompose"],
  scan,
  applyKeys,
};
