"use strict";

const {
  scanBlockComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  buildExclusionChecker,
} = require("../scanner");

// Matches any CSS property: an identifier (with optional vendor prefix) followed by ':',
// preceded by a line start or block delimiter. Excludes custom properties (--)
// and pseudo-selectors (e.g. :hover, ::before).
// Group 1 = leading whitespace, group 2 = property name.
const PROP_RE = /(?:^|[\n;{])(\s*)(-?[a-zA-Z][a-zA-Z0-9-]*)\s*:/gm;

function applyKeys(text, doc, excluded, ranges, span) {
  const isExcluded = buildExclusionChecker(excluded);
  PROP_RE.lastIndex = 0;
  for (const m of text.matchAll(PROP_RE)) {
    const prop = m[2];
    // Skip CSS custom properties and things that look like selectors (contain no letters after a colon)
    if (prop.startsWith("--")) continue;
    const delimLen = m[0][0] === "\n" || m[0][0] === ";" || m[0][0] === "{" ? 1 : 0;
    const nameStart = m.index + delimLen + m[1].length;
    if (!isExcluded(nameStart))
      ranges.purple.push(span(doc, nameStart, nameStart + prop.length));
  }
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;

  while (i < len) {
    const ch = text[i];
    const ch1 = text[i + 1];

    // Block comments
    if (ch === "/" && ch1 === "*") {
      const [s, n] = scanBlockComment(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    // Double-quoted strings
    if (ch === '"') {
      const [s, n] = scanDoubleQuoted(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    // Single-quoted strings
    if (ch === "'") {
      const [s, n] = scanSingleQuoted(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    i++;
  }

  return segs;
}

module.exports = {
  ids: ["css"],
  applyKeys,
  scan,
};
