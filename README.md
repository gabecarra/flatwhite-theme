# Flatwhite Theme

> A warm, minimal light theme for Visual Studio Code — with **marker-style syntax highlighting**.

Most syntax themes color your code by changing text color. Flatwhite does something different: it highlights keywords, strings, and constants with **colored backgrounds**, the way you'd mark up a printed page with a highlighter pen. The result is a calm, readable editor where structure jumps out without ever feeling aggressive.

Ported from the beloved [flatwhite-syntax](https://github.com/biletskyy/flatwhite-syntax) Atom theme by Dmytro Biletskyy.

---

## Preview

> _Add a screenshot here — open `examples/example.py` or `examples/example.js` with the theme active and take a screenshot._

---

## What makes it different

Standard themes tell you _what something is_ by color alone — you have to learn that blue means keyword, green means string, and so on. Flatwhite instead draws a faint colored band behind the token, like a physical highlighter. The base text stays a warm neutral gray throughout, so the markers read as emphasis, not decoration.

| Token type | Marker color |
|---|---|
| Keywords, storage types (`def`, `class`, `const`…) | soft purple |
| Strings | yellow-green |
| Language constants (`true`, `false`, `null`…) and numbers | teal |
| Symbols and dictionary keys | periwinkle blue |
| Built-in functions, `this` / `self` / `super` | warm amber |

---

## Features

- **Marker-style highlights** — colored backgrounds on tokens, not just colored text, implemented via VS Code's decoration API so they actually render
- **Warm neutral palette** — the editor background is a warm off-white (`hsl(35, 36%, 95%)`); every color in the theme is derived from the same warm base, nothing feels out of place
- **Full UI theming** — activity bar, tabs, status bar, panels, debug toolbar, peek views, diff editor, and more are all styled to match
- **Bracket pair colors** tuned to the five flatwhite hues (amber, green, teal, blue, purple) — visible but not loud
- **Debug bar** — distinct teal status bar during debugging, with proper contrast instead of VS Code's default orange
- **Language support** — Python (including triple-quoted strings), JavaScript/TypeScript (including template literals), Java (including text blocks), JSON, YAML, and anything else VS Code tokenizes

---

## Installation

### From the VS Code Marketplace

1. Open the Extensions panel (`Ctrl+Shift+X`)
2. Search for **Flatwhite**
3. Click **Install**
4. Open the Command Palette (`Ctrl+Shift+P`) → **Preferences: Color Theme** → **Flatwhite**

### From source

```sh
git clone https://github.com/<your-username>/flatwhite-theme
```

Open the cloned folder in VS Code and press **F5** — this launches an Extension Development Host window with the theme already active.

---

## Color palette

All colors are derived from the original `flatwhite-syntax` palette.

| Role | Hex |
|---|---|
| Editor background | `#F7F3EE` |
| Base text | `#605A52` |
| Comments | `#B9A992` |
| Purple marker | `rgba(206, 92, 255, 0.15)` |
| Green marker | `rgba(132, 189, 0, 0.19)` |
| Teal marker | `rgba(0, 189, 163, 0.15)` |
| Blue marker | `rgba(117, 163, 255, 0.20)` |
| Orange marker | `rgba(240, 140, 0, 0.18)` |
| UI accent | `#7A4E8A` |

---

## Credits

Original design and color palette by **Dmytro Biletskyy** — [flatwhite-syntax](https://github.com/biletskyy/flatwhite-syntax) for Atom.

This port recreates the marker-highlight concept in VS Code using the `TextEditorDecorationType` API (since VS Code's theme engine does not render `background` in `tokenColors`).

---

## License

MIT
