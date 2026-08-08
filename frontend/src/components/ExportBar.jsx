import { ActionButton } from "./ActionButton";
import { exportToPDF, exportToCSV, exportToExcel, printTable } from "../utils/exporters";

export default function ExportBar({ title, filename, columns, rows }) {
  const empty = !rows?.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        label="PDF"
        disabled={empty}
        onRun={() => exportToPDF({ title, columns, rows, filename })}
      />
      <ActionButton
        label="Excel"
        variant="outline"
        disabled={empty}
        onRun={() => exportToExcel({ columns, rows, filename })}
      />
      <ActionButton
        label="CSV"
        variant="outline"
        disabled={empty}
        onRun={() => exportToCSV({ columns, rows, filename })}
      />
      <ActionButton
        label="Print"
        icon="print"
        variant="outline"
        disabled={empty}
        onRun={() => printTable({ title, columns, rows })}
      />
    </div>
  );
}
