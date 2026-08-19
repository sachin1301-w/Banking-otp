import { useEffect, useState } from "react";
import { usersApi, accountsApi, transactionsApi } from "../../api/services";
import ExportBar from "../../components/ExportBar";
import { ActionButton } from "../../components/ActionButton";
import { exportToPDF, printTable } from "../../utils/exporters";

const userColumns = [
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "active", label: "Status", exportValue: (r) => (r.active ? "Active" : "Inactive") },
];

const accountColumns = [
  { key: "accountNumber", label: "Account #" },
  { key: "accountHolderName", label: "Holder" },
  { key: "accountType", label: "Type" },
  { key: "balance", label: "Balance", exportValue: (r) => (r.balance ?? 0).toFixed(2) },
  { key: "active", label: "Status", exportValue: (r) => (r.active ? "Active" : "Closed") },
];

const txnColumns = [
  { key: "id", label: "Txn ID" },
  { key: "referenceId", label: "Reference" },
  { key: "createdAt", label: "Date & Time", exportValue: (r) => new Date(r.createdAt).toLocaleString() },
  { key: "transactionType", label: "Type" },
  { key: "accountNumber", label: "Account" },
  { key: "counterpartyAccountNumber", label: "Counterparty" },
  { key: "amount", label: "Amount", exportValue: (r) => r.amount?.toFixed(2) },
  { key: "balanceAfter", label: "Balance After", exportValue: (r) => r.balanceAfter == null ? "" : r.balanceAfter.toFixed(2) },
  { key: "status", label: "Status" },
];

function withinRange(dateStr, start) {
  const d = new Date(dateStr);
  return d >= start;
}

export default function Reports() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([usersApi.listAll(), accountsApi.listAll(), transactionsApi.listAll()])
      .then(([u, a, t]) => {
        setUsers(u);
        setAccounts(a);
        setTransactions(t);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load report data."))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const dailyTxns = transactions.filter((t) => withinRange(t.createdAt, startOfDay));
  const monthlyTxns = transactions.filter((t) => withinRange(t.createdAt, startOfMonth));
  const yearlyTxns = transactions.filter((t) => withinRange(t.createdAt, startOfYear));

  const periodReports = [
    { title: "Daily Report", subtitle: startOfDay.toLocaleDateString(), rows: dailyTxns },
    { title: "Monthly Report", subtitle: now.toLocaleString(undefined, { month: "long", year: "numeric" }), rows: monthlyTxns },
    { title: "Yearly Report", subtitle: String(now.getFullYear()), rows: yearlyTxns },
  ];

  if (loading) return <p className="text-slate text-sm">Loading report data…</p>;

  return (
    <div className="space-y-10">
      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-sm px-4 py-3">{error}</p>}

      <section>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Period Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {periodReports.map((report) => (
            <div key={report.title} className="bank-surface p-5 space-y-3">
              <div>
                <p className="font-display text-ink">{report.title}</p>
                <p className="text-xs text-slate-light font-mono">{report.subtitle}</p>
                <p className="text-xs text-slate mt-1">{report.rows.length} transactions</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  label="PDF"
                  disabled={!report.rows.length}
                  onRun={() =>
                    exportToPDF({
                      title: `${report.title} — Banking System`,
                      columns: txnColumns,
                      rows: report.rows,
                      filename: report.title.toLowerCase().replace(" ", "-"),
                    })
                  }
                />
                <ActionButton
                  label="Print"
                  icon="print"
                  variant="outline"
                  disabled={!report.rows.length}
                  onRun={() => printTable({ title: report.title, columns: txnColumns, rows: report.rows })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Full Dataset Exports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bank-surface p-5 space-y-3">
            <p className="font-display text-ink">All Users</p>
            <p className="text-xs text-slate">{users.length} records</p>
            <ExportBar title="All Users — Banking System" filename="all-users" columns={userColumns} rows={users} />
          </div>
          <div className="bank-surface p-5 space-y-3">
            <p className="font-display text-ink">All Accounts</p>
            <p className="text-xs text-slate">{accounts.length} records</p>
            <ExportBar title="All Accounts — Banking System" filename="all-accounts" columns={accountColumns} rows={accounts} />
          </div>
          <div className="bank-surface p-5 space-y-3">
            <p className="font-display text-ink">All Transactions</p>
            <p className="text-xs text-slate">{transactions.length} records</p>
            <ExportBar title="All Transactions — Banking System" filename="all-transactions" columns={txnColumns} rows={transactions} />
          </div>
        </div>
      </section>
    </div>
  );
}
