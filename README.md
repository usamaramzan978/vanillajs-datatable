# tailwind-datatable

A lightweight, customizable **DataTable** component built with **Vanilla JavaScript** and **Tailwind CSS 4** — no dependencies required!

---

✨ Features

- ⚡ **Zero dependencies** – pure Vanilla JS
- 🎨 **Tailwind CSS 4 ready** – easily themeable with utility classes
- 🔍 **Search & Filtering** – global search and column-wise filtering
- 📊 **Pagination** – client-side pagination with configurable page size
- 📁 **Export Support** – Excel, CSV, PDF (via optional peer dependencies)
- 🖨️ **Print-ready** – clean output for printing
- 🧠 **Keyboard navigation** – arrow-key row navigation
- 📌 **Row selection & bulk actions** – for admin UIs and dashboards
- ✨ **Search highlighting** – matched terms dynamically highlighted
- 🔧 **Extensible API** – add buttons, controls, and logic

---

## 📦 Installation

```bash
npm install tailwind-datatable
```

### 📎 Peer Dependencies (Optional)

To enable PDF/Excel export features, install the following:

```bash
npm install jspdf jspdf-autotable exceljs

```

### 🛠️ Development

```bash
npm install
npm run build
npm run size
```

The package is built with `Rollup` and uses `size-limit` to ensure lightweight output.

## 🔍 Comparison

| Feature          | tailwind-datatable  | DataTables | Tabulator |
| ---------------- | ------------------- | ---------- | --------- |
| Size (gzip)      | ~12 KB              | 35kb       | 45kb      |
| Dependencies     | None                | jQuery     | None      |
| Tailwind Support | Native (Tailwind 4) | Possible   | Possible  |
| React/Vue        | Via wrapper         | Yes        | Yes       |
| License          | MIT                 | MIT        | MIT       |

> 💡 tailwind-datatable is optimized for Tailwind-based projects and lightweight usage in modern frontend stacks.

### 🙌 Thanks

Built with love by `Usama` — contributions welcome!

⭐ Star the project if you like it or use it in your apps.
