import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm",
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
        exceljs: "ExcelJS",
      },
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
        exceljs: "ExcelJS",
      },
    },
    {
      file: "dist/index.min.js",
      format: "iife",
      name: "VanillaJsDatatable", // IIFE global variable name
      plugins: [terser()],
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
        exceljs: "ExcelJS",
      },
    },
  ],
  external: ["jspdf", "jspdf-autotable", "exceljs"],
  plugins: [resolve()],
};
