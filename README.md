# vanillajs-datatable

A lightweight, dependency-free, and theme-friendly DataTable built with modern JavaScript — works great with Tailwind CSS or Bootstrap.

[![npm version](https://img.shields.io/npm/v/vanillajs-datatable)](https://www.npmjs.com/package/vanillajs-datatable)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vanillajs-datatable)](https://bundlephobia.com/package/vanillajs-datatable)

## Installation

### Using NPM

```bash
npm install vanillajs-datatable

import DataTable from "vanillajs-datatable";

const table = new DataTable({
  // config options
});
```

## Using CDN

```
<script src="https://unpkg.com/vanillajs-datatable@1.0.3/dist/index.min.js"></script>
<script>
  const table = new DataTable({
    // config options
  });
</script>
```

---

## Documentation

[**Full Docs**](https://docs.elegantlaravel.com/)

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

| Tool                                                                           | Purpose                                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`rollup`](https://rollupjs.org/)                                              | Bundles ES modules into different formats (`esm`, `cjs`, `iife`) |
| [`@rollup/plugin-terser`](https://www.npmjs.com/package/@rollup/plugin-terser) | Minifies the output for CDN usage `index.min.js`                 |

## Size Measurement

| Tool                                                                                         | Purpose                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`size-limit`](https://www.npmjs.com/package/size-limit)                                     | Enforces strict file size limits via CLI    |
| [`@size-limit/preset-small-lib`](https://www.npmjs.com/package/@size-limit/preset-small-lib) | Configures `size-limit` for small libraries |
| [`brotli-size`](https://www.npmjs.com/package/brotli-size)                                   | Measures Brotli-compressed file size        |
| [`gzip-size`](https://www.npmjs.com/package/gzip-size)                                       | Measures Gzip-compressed file size          |

## Optional Export Dependencies

| Package                                                            | Purpose                    |
| ------------------------------------------------------------------ | -------------------------- |
| [`jspdf`](https://www.npmjs.com/package/jspdf)                     | Export data as PDF         |
| [`jspdf-autotable`](https://www.npmjs.com/package/jspdf-autotable) | Table formatting for jsPDF |
| [`exceljs`](https://www.npmjs.com/package/exceljs)                 | Export table data as Excel |

> These are optional and only loaded if you use export features.

## Theme Support

| Package                                   | Purpose                                          |
| ----------------------------------------- | ------------------------------------------------ |
| [`tailwindcss`](https://tailwindcss.com/) | Native Tailwind CSS v4+ support                  |
| [`bootstrap`](https://getbootstrap.com/)  | Basic Bootstrap styling compatibility (optional) |
| [`daisyui`](https://daisyui.com/)         | Theme support for DaisyUI components (optional)  |

## Performance Summary

VanillaJS DataTable is:

- 🪶 Lightweight (under 15 kB minified)
- 🧩 Framework-agnostic (Vanilla JS)
- 🎨 Easily themeable (Tailwind/Bootstrap)
- 🚀 Browser-ready and CDN-optimized

## Comparison

| Feature          | vanillajs-datatable | DataTables | Tabulator |
| ---------------- | ------------------- | ---------- | --------- |
| Size (gzip)      | ~14 KB              | 35kb       | 45kb      |
| Dependencies     | None                | jQuery     | None      |
| Tailwind Support | Native (Tailwind 4) | Possible   | Possible  |
| License          | MIT                 | MIT        | MIT       |

> ✅ `vanillajs-datatable` includes native Tailwind v4 support with theme-friendly styling out of the box — including DaisyUI and custom themes.

### 🙌 Thanks

Built with ❤️ by [Usama](https://github.com/usamaramzan978).  
Contributions are welcome — feel free to [open an issue](https://github.com/usamaramzan978/vanillajs-datatable/issues) or [submit a PR](https://github.com/usamaramzan978/vanillajs-datatable/pulls)!

[![GitHub issues](https://img.shields.io/github/issues/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/issues)
[![GitHub stars](https://img.shields.io/github/stars/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/network)

> 👉 If you find this useful, **please star the repo** and share it!

### License

vanillajs-datatable is open-sourced software licensed under the [MIT license](LICENSE.md).
