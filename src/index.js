import DataTable from "./datatable.js";

export default DataTable;

// Optional: global binding for browser usage
if (typeof window !== "undefined") {
  window.TailwindDataTable = DataTable;
}

// import DataTable from 'tailwind-datatable';
