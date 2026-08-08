import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// All exporters take the same shape: columns [{key,label}] + rows (plain objects).
// Amounts are formatted as currency strings at export time so files read like a statement.

function formatCell(row, col) {
  const raw = col.exportValue ? col.exportValue(row) : row[col.key];
  return raw === undefined || raw === null ? "" : String(raw);
}

export function exportToPDF({ title, columns, rows, filename }) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((col) => formatCell(row, col))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [27, 77, 62] }, // vault green
    alternateRowStyles: { fillColor: [246, 244, 236] }, // paper
  });

  doc.save(`${filename}.pdf`);
}

export function exportToCSV({ columns, rows, filename }) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => `"${formatCell(row, col).replace(/"/g, '""')}"`).join(",")
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

export function exportToExcel({ columns, rows, filename, sheetName = "Transactions" }) {
  const data = rows.map((row) => {
    const record = {};
    columns.forEach((col) => {
      record[col.label] = formatCell(row, col);
    });
    return record;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = columns.map((c) => ({ wch: Math.max(c.label.length + 2, 14) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function printTable({ title, columns, rows }) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td>${formatCell(row, col)}</td>`).join("")}</tr>`
    )
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 24px; color: #10190F; }
          h1 { font-family: Georgia, serif; font-size: 18px; margin-bottom: 4px; }
          p.meta { font-size: 11px; color: #5B6B63; margin-top: 0; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #DCD6C6; padding: 6px 8px; text-align: left; }
          th { background: #1B4D3E; color: #F6F4EC; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
          tr:nth-child(even) { background: #F6F4EC; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="meta">Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
