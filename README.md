# vanillajs-datatable

A lightweight, dependency-free, and theme-friendly DataTable alternative to jQuery DataTables built with modern JavaScript — works great with Tailwind CSS, DaisyUI, and Bootstrap.

[![npm version](https://img.shields.io/npm/v/vanillajs-datatable)](https://www.npmjs.com/package/vanillajs-datatable)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vanillajs-datatable)](https://bundlephobia.com/package/vanillajs-datatable)

![vanillajs-datatable](https://raw.githubusercontent.com/usamaramzan978/vanillajs-datatable/master/.github/preview.gif)

## Features

✅ No dependencies – works without jQuery or any heavy libraries  
✅ Modern UI – works out of the box with Tailwind CSS, DaisyUI, and Bootstrap  
✅ Smart search – global + column-wise filters with match highlighting  
✅ Sortable columns – sort any column client-side  
✅ Column grouping – group related fields under headers (e.g., "Personal")  
✅ Custom renderers – use JS to render rich content in cells  
✅ Responsive pagination – detailed or simple, with per-page selector  
✅ Export options – export to CSV, Excel, PDF, or Print  
✅ Custom export settings – title, filename, chunk size, orientation, watermark  
✅ Infinite scroll – load more records while scrolling, optional  
✅ Range filtering – filter by min/max for dates or numbers (e.g., age, created_at)  
✅ Selection support – single or multiple row selection with class toggling  
✅ Loading state control – customize spinner element and delay  
✅ Keyboard navigation – move between rows using arrow keys  
✅ Toggle column visibility – hide/show columns easily in config  
✅ Custom themes – override any class via theme config  
✅ Save state (optional) – persist filters/pagination in memory  
✅ Tiny footprint – only ~18 kB Gzipped, fast and CDN-friendly
✅ Inline editing - edit any cell client-side without page refresh

> 💡 vanillajs-datatable is built for modern projects using Tailwind, DaisyUI, or Bootstrap without bloat.

## Installation

### Using NPM

```bash
npm install vanillajs-datatable
```

```bash
import DataTable from "vanillajs-datatable";

const table = new DataTable({
  // config options
});
```

## Using CDN

```
<script src="https://unpkg.com/vanillajs-datatable@1.0.7/dist/index.min.js"></script>
<script>
  const table = new DataTable({
    // config options
  });
</script>
```

---

## Documentation

Full guides, config options, and code examples available at:

[**Full Docs**](https://docs.elegantlaravel.com/)

## Export Options

Export your table data effortlessly:
| Format | Library Used |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| CSV | Native JS |
| Excel | [`exceljs`](https://npmjs.com/package/exceljs) |
| PDF | [`jspdf`](https://npmjs.com/package/jspdf), [`jspdf-autotable`](https://npmjs.com/package/jspdf-autotable) |
| Print | Clean print preview |

## Bundle Size

| File           | Brotli   | Gzip     |
| -------------- | -------- | -------- |
| `index.min.js` | 16.81 kB | 18.82 kB |
| `index.esm.js` | 16.86 kB | 18.79 kB |

> Built with `rollup` and compressed using `terser`, `brotli`, and `gzip`. Fast to load, even on slow networks.

## Theme Support

| Package                                   | Purpose                                         |
| ----------------------------------------- | ----------------------------------------------- |
| [`tailwindcss`](https://tailwindcss.com/) | Native Tailwind CSS v4+ support                 |
| [`bootstrap`](https://getbootstrap.com/)  | Bootstrap styling compatibility (optional)      |
| [`daisyui`](https://daisyui.com/)         | Theme support for DaisyUI components (optional) |

### Thanks

Built with ❤️ by [Usama](https://github.com/usamaramzan978).  
Contributions are welcome — feel free to [open an issue](https://github.com/usamaramzan978/vanillajs-datatable/issues) or [submit a PR](https://github.com/usamaramzan978/vanillajs-datatable/pulls)!

[![GitHub issues](https://img.shields.io/github/issues/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/issues)
[![GitHub stars](https://img.shields.io/github/stars/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/usamaramzan978/vanillajs-datatable)](https://github.com/usamaramzan978/vanillajs-datatable/network)

> If you find this useful, **please star the repo** and share it!

### License

vanillajs-datatable is open-sourced software licensed under the [MIT license](LICENSE.md).
