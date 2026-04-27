"use strict";

const {
  scanBlockComment,
  scanLineComment,
  scanSingleQuoted,
  scanDoubleQuoted,
} = require("../scanner");

const keywords = new Set([
  "ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "BETWEEN", "BY",
  "CASE", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "CROSS", "DATABASE",
  "DEFAULT", "DELETE", "DESC", "DISTINCT", "DROP", "ELSE", "END",
  "EXISTS", "FOREIGN", "FROM", "FULL", "GROUP", "HAVING", "IN", "INDEX",
  "INNER", "INSERT", "INTO", "IS", "JOIN", "KEY", "LEFT", "LIKE",
  "LIMIT", "NOT", "NULL", "ON", "OR", "ORDER", "OUTER", "PRIMARY",
  "REFERENCES", "RIGHT", "ROWNUM", "SELECT", "SET", "TABLE", "THEN",
  "TOP", "TRUNCATE", "UNION", "UNIQUE", "UPDATE", "VALUES", "VIEW",
  "WHERE", "WITH",
]);

function scan(text) {
  const segs = [];
  const len = text.length;
  let i = 0;
  while (i < len) {
    const ch = text[i], ch1 = text[i + 1];
    if (ch === "/" && ch1 === "*") { const [s, n] = scanBlockComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "-" && ch1 === "-") { const [s, n] = scanLineComment(text, i, len); segs.push(s); i = n; continue; }
    if (ch === "'")                { const [s, n] = scanSingleQuoted(text, i, len); segs.push(s); i = n; continue; }
    if (ch === '"')                { const [s, n] = scanDoubleQuoted(text, i, len); segs.push(s); i = n; continue; }
    i++;
  }
  return segs;
}

module.exports = {
  ids: ["sql"],
  keywords,
  // SQL keywords are case-insensitive; the decorator will use the 'gi' flag
  keywordCaseInsensitive: true,
  scan,
};
