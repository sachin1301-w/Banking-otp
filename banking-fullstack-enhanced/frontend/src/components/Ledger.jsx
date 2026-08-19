import { useMemo, useState } from "react";

export function StatCard({ label, value, hint, icon, accent = "blue" }) {
  const accentMap = {
    blue: "from-blue-50 to-white text-blue-700 border-blue-100",
    teal: "from-teal-50 to-white text-teal-700 border-teal-100",
    amber: "from-amber-50 to-white text-amber-700 border-amber-100",
    violet: "from-violet-50 to-white text-violet-700 border-violet-100",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${accentMap[accent] || accentMap.blue} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[.12em] text-slate-500 font-bold">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
        </div>
        {icon && <div className="h-10 w-10 rounded-xl bg-white/80 border border-current/10 flex items-center justify-center">{icon}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ message, detail }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 px-5 text-center">
      <div className="mx-auto h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">⌁</div>
      <p className="text-slate-700 text-sm font-semibold">{message}</p>
      {detail && <p className="text-slate-400 text-xs mt-1">{detail}</p>}
    </div>
  );
}

export function LedgerTable({ columns, rows = [], keyField, pageSize = 10 }) {
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const getValue = col?.sortValue || ((row) => row[sort.key]);
    return [...rows].sort((a, b) => {
      const av = getValue(a); const bv = getValue(b);
      if (av === bv) return 0;
      return av > bv ? sort.dir : -sort.dir;
    });
  }, [rows, sort, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const clampedPage = Math.min(page, totalPages - 1);
  const pageRows = pageSize ? sorted.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize) : sorted;
  const toggleSort = (col) => {
    if (!col.key) return;
    setSort((s) => (s.key === col.key ? { key: col.key, dir: -s.dir } : { key: col.key, dir: 1 }));
    setPage(0);
  };

  if (!rows.length) return <EmptyState message="No transactions to show yet." detail="New activity will appear here automatically." />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm scrollbar-thin">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50/90 border-b border-slate-200">
            <tr>{columns.map((col) => (
              <th key={col.key} onClick={() => toggleSort(col)} className="text-left px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-[.08em] text-slate-500 cursor-pointer select-none whitespace-nowrap">
                {col.label}{sort.key === col.key && <span className="ml-1 text-blue-600">{sort.dir === 1 ? "↑" : "↓"}</span>}
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={row[keyField] ?? idx} className="border-b last:border-b-0 border-slate-100 hover:bg-blue-50/30 transition-colors">
                {columns.map((col) => <td key={col.key} className="px-5 py-4 text-slate-700 whitespace-nowrap">{col.render ? col.render(row) : row[col.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Page {clampedPage + 1} of {totalPages} · {sorted.length} records</span>
          <div className="flex gap-2">
            <button disabled={clampedPage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="secondary-btn !py-2 !px-3 disabled:opacity-40">Previous</button>
            <button disabled={clampedPage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} className="secondary-btn !py-2 !px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const s = (status || "").toUpperCase();
  const styles = s === "SUCCESS" || s === "ACTIVE" || s === "COMPLETED"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : s === "FAILED" || s === "REJECTED" || s === "INACTIVE" || s === "CLOSED"
    ? "bg-red-50 text-red-700 border-red-100"
    : "bg-amber-50 text-amber-700 border-amber-100";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles}`}>{status || "PENDING"}</span>;
}
