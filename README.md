![Flatwhite Theme Banner](https://raw.githubusercontent.com/gabecarra/flatwhite-theme/main/assets/flatwhite.png)

# 🎨 Flatwhite — A warm, minimal light theme for VS Code

Most syntax themes color your code by changing text color. Flatwhite does something different: it highlights keywords, strings, and constants with **colored backgrounds** — the way you'd mark up a printed page with a highlighter pen. 🖊️

The result is a calm, readable editor where structure jumps out without ever feeling aggressive, while keeping a constant 6:1 contrast between text and background colors 🤓 (easy on the eyes).

> Ported from one of my fav ❤️ themes for Atom — [flatwhite-syntax](https://github.com/biletskyy/flatwhite-syntax) by Dmytro Biletskyy.

---

## 📸 Preview

### JavaScript

![JavaScript](https://raw.githubusercontent.com/gabecarra/flatwhite-theme/main/screenshots/js.png)

### Python

![Python](https://raw.githubusercontent.com/gabecarra/flatwhite-theme/main/screenshots/python.png)

### Java

![Java](https://raw.githubusercontent.com/gabecarra/flatwhite-theme/main/screenshots/java.png)

---

## 🚀 Installation

### From the VS Code Marketplace

1. Open the Extensions panel (`Ctrl+Shift+X`)
2. Search for **Flatwhite**
3. Click **Install**
4. Open the Command Palette (`Ctrl+Shift+P`) → **Preferences: Color Theme** → **Flatwhite**

### From source

```sh
git clone https://github.com/gabecarra/flatwhite-theme
```

Open the cloned folder in VS Code and press **F5** — this launches an Extension Development Host window with the theme already active.

---

## 🎨 Color palette

All colors are derived from the original `flatwhite-syntax` palette.

| Role                 | Hex                         |
| -------------------- | --------------------------- |
| 🟫 Editor background | `#F7F3EE`                   |
| ⬛ Base text         | `#605A52`                   |
| 🩶 Comments          | `#B9A992`                   |
| 🟣 Purple marker     | `rgba(206, 92, 255, 0.15)`  |
| 🟢 Green marker      | `rgba(132, 189, 0, 0.19)`   |
| 🩵 Teal marker       | `rgba(0, 189, 163, 0.15)`   |
| 🔵 Blue marker       | `rgba(117, 163, 255, 0.20)` |
| 🟠 Orange marker     | `rgba(240, 140, 0, 0.18)`   |
| 🔷 UI accent         | `#7A4E8A`                   |

---

## 🌐 Language support

Flatwhite applies marker highlighting to the following languages. **Full** means all string types, comment styles, and language-specific features (e.g. key coloring) are handled. **Good** means standard strings and comments work; uncommon constructs noted below may not be highlighted.

| Language         | Maturity | Notes                                                                     |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| JavaScript / JSX | ✅ Full  | Template literals, block/line comments                                    |
| TypeScript / TSX | ✅ Full  | Same scanner as JS                                                        |
| Python           | ✅ Full  | Triple-quoted strings, `#` comments                                       |
| Java             | ✅ Full  | Text blocks (`"""`), block/line comments                                  |
| JSON / JSONC     | ✅ Full  | Key highlighting (blue)                                                   |
| YAML             | ✅ Full  | Key highlighting (blue), `#` comments                                     |
| Rust             | 🟡 Good  | Raw strings (`r"..."`, `r#"..."#`) not scanned                            |
| Go               | 🟡 Good  | Raw string literals (backticks) included                                  |
| C                | 🟡 Good  |                                                                           |
| C#               | 🟡 Good  | Verbatim strings (`@"..."`) included; interpolated (`$"..."`) not scanned |
| C++              | 🟡 Good  | Raw strings (`R"(...)"`) not scanned                                      |
| PHP              | 🟡 Good  | Heredoc / nowdoc not scanned                                              |
| Visual Basic     | 🟡 Good  |                                                                           |
| SQL              | 🟡 Good  | Keywords matched case-insensitively                                       |
| R                | 🟡 Good  |                                                                           |

Want to add a language? See [src/languages/ADDING_LANGUAGES.md](src/languages/ADDING_LANGUAGES.md). 🙌

---

## 🙏 Credits

Original design and color palette by **Dmytro Biletskyy** — [flatwhite-syntax](https://github.com/biletskyy/flatwhite-syntax) for Atom.

This port recreates the marker-highlight concept in VS Code using the `TextEditorDecorationType` API (since VS Code's theme engine does not render `background` in `tokenColors`).

---

## 📄 License

MIT
