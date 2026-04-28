"use strict";

const COLORS = {
  purple: "rgba(206,  92, 255, 0.15)",
  green: "rgba(132, 189,   0, 0.19)",
  teal: "rgba(  0, 189, 163, 0.15)",
  blue: "rgba(117, 163, 255, 0.20)",
  orange: "rgba(240, 140,   0, 0.18)",
};

const CONSTANTS =
  /\b(true|false|null|undefined|None|True|False|nil|NULL|NaN|Infinity)\b/g;
const NUMBERS =
  /\b(0[xX][0-9a-fA-F]+[lLuU]?|0[bB][01]+[lLuU]?|0[oO][0-7]+[lLuU]?|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?[fFdDlLuU]?)(?![\w.])/g;

module.exports = { COLORS, CONSTANTS, NUMBERS };
