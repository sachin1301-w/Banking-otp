import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMyAccount } from "../../hooks/useMyAccount";
import { transactionsApi } from "../../api/services";
import { LedgerTable, StatusPill } from "../../components/Ledger";
import { Icon } from "../../components/PortalShell";
import { money, dateTime, transactionLabel, isCredit } from "../../utils/format";

export default function UserDashboard() {
  const { loading, error, profile, accounts } = useMyAccount();
  const [txns, setTxns] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!accounts.length) { setTxLoading(false); return; }
    setTxLoading(true);
    Promise.all(accounts.map((a) => transactionsApi.byAccount(a.accountNumber)))
      .then((groups) => setTxns(groups.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))))
      .finally(()=>setTxLoading(false));
  }, [accounts]);

  const totalBalance = useMemo(()=>accounts.reduce((s,a)=>s+Number(a.balance||0),0),[accounts]);
  const primary = accounts[0];
  const recent = txns.slice(0,6);
  const columns = [
    { key:"createdAt", label:"Date & time", render:(r)=><div><p className="font-semibold text-slate-800">{dateTime(r.createdAt)}</p><p className="text-xs text-slate-400 mt-0.5">{r.referenceId || `TX-${r.id}`}</p></div> },
    { key:"transactionType", label:"Activity", render:(r)=><div><p className="font-semibold">{transactionLabel(r.transactionType)}</p>{r.counterpartyAccountNumber && <p className="text-xs text-slate-400 mt-0.5">{r.transactionType==="TRANSFER_IN"?"From":"To"} {r.counterpartyAccountNumber}</p>}</div> },
    { key:"amount", label:"Amount", render:(r)=><span className={`font-extrabold ${isCredit(r.transactionType)?"text-emerald-600":"text-red-600"}`}>{isCredit(r.transactionType)?"+":"−"}{money(r.amount)}</span> },
    { key:"status", label:"Status", render:(r)=><StatusPill status={r.status}/> },
  ];

  const actions = [
    ["/deposit","Deposit","Add money","plus","bg-emerald-50 text-emerald-700"],
    ["/withdraw","Withdraw","Take out funds","minus","bg-rose-50 text-rose-700"],
    ["/transfer","Transfer","Send instantly","transfer","bg-blue-50 text-blue-700"],
  ];

  return (
    <div className="space-y-7">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      <div className="grid xl:grid-cols-[1.15fr_.85fr] gap-6">
        <section className="bank-card p-7 sm:p-8 min-h-[260px]">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-200">Total available balance</p><p className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">{loading?"…":money(totalBalance)}</p></div><div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">{accounts.length} account{accounts.length===1?"":"s"}</div></div>
            <div className="grid sm:grid-cols-2 gap-5 mt-10"><div><p className="text-xs text-blue-200">Primary account</p><p className="font-mono mt-1.5 font-semibold tracking-wide">{primary?.accountNumber || "Account pending"}</p></div><div className="sm:text-right"><p className="text-xs text-blue-200">Account holder</p><p className="mt-1.5 font-semibold">{profile?.fullName || "—"}</p></div></div>
          </div>
        </section>

        <section className="bank-surface p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.14em] text-slate-400 font-bold">Quick actions</p><h2 className="text-xl font-extrabold mt-1">What would you like to do?</h2></div><span className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">⌁</span></div>
          <div className="mt-5 space-y-3">{actions.map(([to,title,sub,icon,color])=><Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-3.5 hover:border-blue-200 hover:bg-blue-50/30 transition-all"><div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}><Icon name={icon}/></div><div className="flex-1"><p className="font-bold text-slate-800">{title}</p><p className="text-xs text-slate-400 mt-0.5">{sub}</p></div><span className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">→</span></Link>)}</div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4 mb-4"><div><h2 className="text-xl font-extrabold tracking-tight">Recent transactions</h2><p className="text-sm text-slate-500 mt-1">Latest activity across your accounts</p></div><Link to="/transactions" className="text-sm font-bold text-blue-600 hover:text-blue-700">View all →</Link></div>
        {txLoading ? <div className="bank-surface p-8 text-slate-400">Loading transactions…</div> : <LedgerTable columns={columns} rows={recent} keyField="id" pageSize={0}/>} 
      </section>
    </div>
  );
}
