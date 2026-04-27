"use strict";

const vscode = require("vscode");

function span(doc, start, end) {
  return new vscode.Range(doc.positionAt(start), doc.positionAt(end));
}

function buildExclusionChecker(segs) {
  if (segs.length === 0) return () => false;
  return (offset) => {
    for (const s of segs) {
      if (offset >= s.start && offset < s.end) return true;
      if (s.start > offset) return false; // segs are in order
    }
    return false;
  };
}

// ---------------------------------------------------------------------------
// Scan primitives — each returns [segment, nextIndex]
// ---------------------------------------------------------------------------

function scanBlockComment(text, i, len) {
  const start = i;
  i += 2;
  while (i < len - 1 && !(text[i] === "*" && text[i + 1] === "/")) i++;
  i += 2;
  return [{ start, end: i, type: "comment" }, i];
}

function scanLineComment(text, i, len) {
  const start = i;
  while (i < len && text[i] !== "\n") i++;
  return [{ start, end: i, type: "comment" }, i];
}

function scanDoubleQuoted(text, i, len) {
  const start = i;
  i++;
  while (i < len && text[i] !== '"' && text[i] !== "\n") {
    if (text[i] === "\\") i++;
    i++;
  }
  if (i < len && text[i] === '"') i++;
  return [{ start, end: i, type: "string" }, i];
}

function scanSingleQuoted(text, i, len) {
  const start = i;
  i++;
  while (i < len && text[i] !== "'" && text[i] !== "\n") {
    if (text[i] === "\\") i++;
    i++;
  }
  if (i < len && text[i] === "'") i++;
  return [{ start, end: i, type: "string" }, i];
}

function scanTripleDouble(text, i, len) {
  const start = i;
  i += 3;
  while (i < len - 2) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === '"' && text[i + 1] === '"' && text[i + 2] === '"') { i += 3; break; }
    i++;
  }
  return [{ start, end: i, type: "string" }, i];
}

function scanTripleSingle(text, i, len) {
  const start = i;
  i += 3;
  while (i < len - 2) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === "'" && text[i + 1] === "'" && text[i + 2] === "'") { i += 3; break; }
    i++;
  }
  return [{ start, end: i, type: "string" }, i];
}

function scanTemplateLiteral(text, i, len) {
  const start = i;
  i++;
  let depth = 0;
  while (i < len) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === "$" && text[i + 1] === "{") { depth++; i += 2; continue; }
    if (c === "}" && depth > 0) { depth--; i++; continue; }
    if (c === "`" && depth === 0) { i++; break; }
    i++;
  }
  return [{ start, end: i, type: "string" }, i];
}

// Fallback for languages without a dedicated scanner.
function defaultScan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i];
    if (ch === '"') { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'") { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  span,
  buildExclusionChecker,
  scanBlockComment,
  scanLineComment,
  scanDoubleQuoted,
  scanSingleQuoted,
  scanTripleDouble,
  scanTripleSingle,
  scanTemplateLiteral,
  defaultScan,
};
