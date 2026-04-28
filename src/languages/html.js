"use strict";

const {
  scanBlockComment,
  scanDoubleQuoted,
  scanSingleQuoted,
} = require("../scanner");

// HTML attribute names to highlight
const htmlAttributes = new Set([
  "id",
  "class",
  "style",
  "href",
  "src",
  "alt",
  "title",
  "name",
  "value",
  "placeholder",
  "type",
  "disabled",
  "readonly",
  "required",
  "checked",
  "selected",
  "data-*",
  "aria-*",
  "role",
  "tabindex",
  "onclick",
  "onchange",
  "onclick",
  "onload",
  "onerror",
  "onsubmit",
  "onkeydown",
  "onkeyup",
  "onmouseover",
  "onmouseout",
  "onfocus",
  "onblur",
]);

// HTML tag names to highlight as keywords
const htmlTags = new Set([
  "html",
  "head",
  "body",
  "title",
  "meta",
  "link",
  "script",
  "style",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "div",
  "span",
  "a",
  "button",
  "form",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "fieldset",
  "legend",
  "ul",
  "ol",
  "li",
  "table",
  "tr",
  "td",
  "th",
  "thead",
  "tbody",
  "tfoot",
  "img",
  "video",
  "audio",
  "source",
  "canvas",
  "svg",
  "article",
  "section",
  "nav",
  "header",
  "footer",
  "main",
  "aside",
  "figure",
  "figcaption",
  "time",
  "mark",
  "abbr",
  "em",
  "strong",
  "code",
  "pre",
  "blockquote",
  "br",
  "hr",
  "iframe",
  "embed",
  "object",
  "param",
]);

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9-]*)/g;

function applyKeys(text, doc, excluded, ranges, span) {
  TAG_RE.lastIndex = 0;
  for (const m of text.matchAll(TAG_RE)) {
    const nameStart = m.index + m[0].length - m[1].length;
    ranges.purple.push(span(doc, nameStart, nameStart + m[1].length));
  }
}

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;

  while (i < len) {
    const ch = text[i];
    const ch1 = text[i + 1];

    // HTML comments
    if (
      ch === "<" &&
      ch1 === "!" &&
      text[i + 2] === "-" &&
      text[i + 3] === "-"
    ) {
      const start = i;
      i += 4;
      while (i < len - 2) {
        if (text[i] === "-" && text[i + 1] === "-" && text[i + 2] === ">") {
          i += 3;
          break;
        }
        i++;
      }
      segs.push({ start, end: i, type: "comment" });
      continue;
    }

    // String literals
    if (ch === '"') {
      const [s, n] = scanDoubleQuoted(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    if (ch === "'") {
      const [s, n] = scanSingleQuoted(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    // Block comments (for embedded CSS/JS in HTML)
    if (ch === "/" && ch1 === "*") {
      const [s, n] = scanBlockComment(text, i, len);
      segs.push(s);
      i = n;
      continue;
    }

    i++;
  }

  return segs;
}

module.exports = {
  ids: ["html"],
  applyKeys,
  scan,
};
