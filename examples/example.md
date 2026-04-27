# Flatwhite Theme

A warm, minimal light theme for Visual Studio Code that highlights code with
**colored backgrounds** instead of colored text — like marking up a printed
page with a highlighter pen.

## How it works

Most syntax themes color code by changing the text color. Flatwhite does
something different: it applies **semi-transparent background highlights** so
the base text color stays constant at all times.

> The result is a calm, readable editor where structure jumps out without
> ever feeling aggressive or distracting.

## Color palette

| Role       | Color  | Used for                     |
| ---------- | ------ | ---------------------------- |
| Purple     | violet | Keywords (`if`, `return`, …) |
| Green      | sage   | Strings and code spans       |
| Teal       | mint   | Constants and numbers        |
| Blue       | sky    | Object keys, headings        |
| Orange     | amber  | Language variables (`this`)  |

## Supported languages

The extension ships with dedicated scanners for these languages:

- **JavaScript** and **TypeScript** — template literals, JSX
- **Python** — triple-quoted strings, decorators
- **Java** — text blocks, sealed interfaces
- **Rust** — enums, pattern matching
- **Go** — goroutines, channels
- **C**, **C++**, **C#** — structs, templates, LINQ
- **SQL** — keywords matched case-insensitively
- **PHP**, **R**, **Visual Basic**
- **JSON** and **YAML** — key highlighting in blue
- **Markdown** — headings, bold, links, code blocks

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com):

```sh
code --install-extension gabe.flatwhite-theme
```

Or open the Extensions panel (`Ctrl+Shift+X`), search for **Flatwhite**, and
click **Install**.

## Quick start

After installing, open the Command Palette (`Ctrl+Shift+P`) and run:

```
Preferences: Color Theme → Flatwhite
```

## Markdown highlighting

This file itself demonstrates what the theme highlights in Markdown:

- `# Headings` — highlighted in **blue**
- `` `inline code` `` and fenced code blocks — highlighted in **green**
- `**bold text**` — highlighted in **orange**
- `[link text](url)` — bracket in **blue**, URL in **teal**
- `> blockquotes` — leading marker in **teal**

<!-- HTML comments are treated as comments and excluded from highlighting -->

## Contributing

Bug reports and pull requests are welcome on
[GitHub](https://github.com/gabe/flatwhite-theme).

## License

[MIT](LICENSE) © Gabriel H. Carraretto
