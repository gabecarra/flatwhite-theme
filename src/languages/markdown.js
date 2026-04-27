"use strict";

const { buildExclusionChecker } = require("../scanner");

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;

  while (i < len) {
    // HTML comment <!-- ... -->
    if (text[i] === "<" && text[i + 1] === "!" && text[i + 2] === "-" && text[i + 3] === "-") {
      const start = i;
      i += 4;
      while (i < len - 2 && !(text[i] === "-" && text[i + 1] === "-" && text[i + 2] === ">")) i++;
      i += 3;
      segs.push({ start, end: i, type: "comment" });
      continue;
    }

    // Fenced code block: ``` or ~~~ at start of line
    if (
      (i === 0 || text[i - 1] === "\n") &&
      (text[i] === "`" || text[i] === "~") &&
      text[i + 1] === text[i] && text[i + 2] === text[i]
    ) {
      const fence = text[i];
      const start = i;
      i += 3;
      while (i < len && text[i] !== "\n") i++; // skip language tag
      if (i < len) i++;                         // skip newline
      while (i < len) {
        if (text[i - 1] === "\n" && text[i] === fence && text[i + 1] === fence && text[i + 2] === fence) {
          let j = i + 3;
          while (j < len && (text[j] === " " || text[j] === "\t")) j++;
          if (j >= len || text[j] === "\n") { i = j; break; }
        }
        i++;
      }
      segs.push({ start, end: i, type: "string" });
      continue;
    }

    // Double-backtick inline code: `` text ``
    if (text[i] === "`" && text[i + 1] === "`" && text[i + 2] !== "`") {
      const start = i;
      i += 2;
      while (i < len - 1 && !(text[i] === "`" && text[i + 1] === "`")) i++;
      i += 2;
      segs.push({ start, end: i, type: "string" });
      continue;
    }

    // Inline code: `text`
    if (text[i] === "`") {
      const start = i;
      i++;
      while (i < len && text[i] !== "`" && text[i] !== "\n") i++;
      if (i < len && text[i] === "`") i++;
      segs.push({ start, end: i, type: "string" });
      continue;
    }

    i++;
  }
  return segs;
}

function applyKeys(text, doc, excluded, ranges, span) {
  const isExcluded = buildExclusionChecker(excluded);

  // Headings: # through ###### (blue)
  const headingPat = /^(#{1,6}[ \t]+.+)/mg;
  for (const m of text.matchAll(headingPat)) {
    if (!isExcluded(m.index))
      ranges.blue.push(span(doc, m.index, m.index + m[0].length));
  }

  // Bold: **text** or __text__ (orange)
  const boldPat = /\*\*[^*\n]+\*\*|__[^_\n]+__/g;
  for (const m of text.matchAll(boldPat)) {
    if (!isExcluded(m.index))
      ranges.orange.push(span(doc, m.index, m.index + m[0].length));
  }

  // Links and images: [text](url) or ![alt](url)
  // bracket portion → blue, parenthesis portion → teal
  const linkPat = /(!?\[[^\]\n]*\])(\([^)\n]*\))/g;
  for (const m of text.matchAll(linkPat)) {
    if (!isExcluded(m.index)) {
      ranges.blue.push(span(doc, m.index, m.index + m[1].length));
      ranges.teal.push(span(doc, m.index + m[1].length, m.index + m[0].length));
    }
  }

  // Blockquotes: leading > marker (teal)
  const blockquotePat = /^[ \t]*>/mg;
  for (const m of text.matchAll(blockquotePat)) {
    if (!isExcluded(m.index))
      ranges.teal.push(span(doc, m.index, m.index + m[0].length));
  }
}

module.exports = {
  ids: ["markdown"],
  scan,
  applyKeys,
};
