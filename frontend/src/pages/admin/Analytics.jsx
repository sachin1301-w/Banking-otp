import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { usersApi, accountsApi, transactionsApi } from "../../api/services";
import { StatCard } from "../../components/Ledger";

const PIE_COLORS = ["#1B4D3E", "#B8863B", "#5B6B63", "#A93E36", "#2E6B57"];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: "short", year: "2-digit" });
}

export default function Analytics() {
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
      .catch((err) => setError(err.response?.data?.message || "Could not load analytics data."))
      .finally(() => setLoading(false));
  }, []);

  const revenueByMonth = useMemo(() => {
    const buckets = {};
    transactions.forEach((t) => {
      const key = monthKey(t.createdAt);
      buckets[key] = (buckets[key] || 0) + (t.amount || 0);
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-6)
      .map(([key, value]) => ({ month: monthLabel(key), value: Math.round(value) }));
  }, [transactions]);

  const txnTypeBreakdown = useMemo(() => {
    const buckets = {};
    transactions.forEach((t) => {
      const type = t.transactionType || "OTHER";
      buckets[type] = (buckets[type] || 0) + 1;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const userGrowth = useMemo(() => {
    const buckets = {};
    users.forEach((u) => {
      const key = monthKey(u.createdAt);
      buckets[key] = (buckets[key] || 0) + 1;
    });
    const sortedKeys = Object.keys(buckets).sort();
    let running = 0;
    return sortedKeys.slice(-6).map((key) => {
      running += buckets[key];
      return { month: monthLabel(key), users: running };
    });
  }, [users]);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) return <p className="text-slate text-sm">Loading analytics…</p>;

  return (
    <div className="space-y-10">
      {error && <p className="text-brick text-sm bg-brick/5 border border-brick/20 rounded-sm px-4 py-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Volume" value={totalRevenue.toLocaleString(undefined, { style: "currency", currency: "INR" })} />
        <StatCard label="Active Accounts" value={accounts.filter((a) => a.active).length} />
        <StatCard label="Registered Users" value={users.length} />
      </div>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Transaction Volume, Last 6 Months</h2>
        <div className="bank-surface p-5">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="vaultFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B4D3E" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1B4D3E" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCD6C6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5B6B63" }} />
              <YAxis tick={{ fontSize: 12, fill: "#5B6B63" }} />
              <Tooltip formatter={(v) => v.toLocaleString(undefined, { style: "currency", currency: "INR" })} />
              <Area type="monotone" dataKey="value" stroke="#1B4D3E" fill="url(#vaultFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Transactions by Type</h2>
          <div className="bank-surface p-5">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={txnTypeBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                  {txnTypeBreakdown.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">User Growth</h2>
          <div className="bank-surface p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCD6C6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5B6B63" }} />
                <YAxis tick={{ fontSize: 12, fill: "#5B6B63" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#B8863B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
