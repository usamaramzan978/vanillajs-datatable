# vanillajs-datatable

A lightweight, dependency-free, and themeable DataTable built with modern JavaScript — ideal for Tailwind CSS, Bootstrap, or custom UI setups.

## Bundle Size

VanillaJS DataTable is optimized for performance — all builds are well under the 50 kB limit (even compressed):

| File           | Brotli   | Gzip     |
| -------------- | -------- | -------- |
| `index.min.js` | 12.71 kB | 14.41 kB |
| `index.esm.js` | 21.95 kB | 25.63 kB |
| `index.cjs.js` | 21.98 kB | 25.64 kB |

- **Modern:** Uses Brotli for optimal compression in supported browsers.
- **Legacy:** Gzip size also stays comfortably under the limit.

Compression tested using `brotli-size` and `gzip-size`.

## Build System

| Tool                                                                                       | Purpose                                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`rollup`](https://rollupjs.org/)                                                          | Bundles ES modules into different formats (`esm`, `cjs`, `iife`) |
| [`@rollup/plugin-node-resolve`](https://www.npmjs.com/package/@rollup/plugin-node-resolve) | Resolves third-party dependencies in `node_modules`              |
| [`@rollup/plugin-terser`](https://www.npmjs.com/package/@rollup/plugin-terser)             | Minifies output for `index.min.js`                               |

## Size Measurement

| Tool                                                                                         | Purpose                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`size-limit`](https://www.npmjs.com/package/size-limit)                                     | Enforces strict file size limits via CLI    |
| [`@size-limit/preset-small-lib`](https://www.npmjs.com/package/@size-limit/preset-small-lib) | Configures `size-limit` for small libraries |
| [`brotli-size`](https://www.npmjs.com/package/brotli-size)                                   | Measures Brotli-compressed file size        |
| [`gzip-size`](https://www.npmjs.com/package/gzip-size)                                       | Measures Gzip-compressed file size          |

## Optional UI & Export Dependencies

| Package                                                            | Purpose                          |
| ------------------------------------------------------------------ | -------------------------------- |
| [`tailwindcss`](https://tailwindcss.com/)                          | Optional UI utility for theming  |
| [`bootstrap`](https://getbootstrap.com/)                           | Optional Bootstrap theme support |
| [`jspdf`](https://www.npmjs.com/package/jspdf)                     | Export data as PDF               |
| [`jspdf-autotable`](https://www.npmjs.com/package/jspdf-autotable) | Table formatting for jsPDF       |
| [`exceljs`](https://www.npmjs.com/package/exceljs)                 | Export table data as Excel       |

> These are optional and only loaded if you use export features.

## Performance Summary

VanillaJS DataTable is:

- 🪶 Lightweight (under 15 kB minified)
- 🧩 Framework-agnostic (Vanilla JS)
- 🎨 Easily themeable (Tailwind/Bootstrap)
- 🚀 Browser-ready and CDN-optimized

## Comparison

| Feature          | tailwind-datatable  | DataTables | Tabulator |
| ---------------- | ------------------- | ---------- | --------- |
| Size (gzip)      | ~14 KB              | 35kb       | 45kb      |
| Dependencies     | None                | jQuery     | None      |
| Tailwind Support | Native (Tailwind 4) | Possible   | Possible  |
| React/Vue        | Via wrapper         | Yes        | Yes       |
| License          | MIT                 | MIT        | MIT       |

### 🙌 Thanks

Built with ❤️ by `Usama`.
Contributions are welcome — feel free to open an issue or PR!

> 👉 If you find this useful, star the repo and share it!
