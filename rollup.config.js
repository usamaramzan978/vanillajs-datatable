export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm",
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
      },
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
      },
    },
    {
      file: "dist/index.min.js",
      format: "iife",
      name: "TailwindDataTable",
      globals: {
        jspdf: "jsPDF",
        "jspdf-autotable": "autoTable",
      },
    },
  ],
  external: ["jspdf", "jspdf-autotable"], // mark them external so Rollup doesn't bundle
};
