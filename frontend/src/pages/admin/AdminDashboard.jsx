import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi, accountsApi, transactionsApi } from "../../api/services";
import { StatCard, LedgerTable, StatusPill } from "../../components/Ledger";
import { Icon } from "../../components/PortalShell";
import { money, dateTime, transactionLabel, isCredit } from "../../utils/format";

export default function AdminDashboard() {
  const [state,setState]=useState({loading:true,error:"",users:[],accounts:[],transactions:[]});
  useEffect(()=>{Promise.all([usersApi.listAll(),accountsApi.listAll(),transactionsApi.listAll()]).then(([users,accounts,transactions])=>setState({loading:false,error:"",users,accounts,transactions})).catch(e=>setState(s=>({...s,loading:false,error:e.response?.data?.message||"Could not load admin dashboard."})));},[]);
  const totalBalance=useMemo(()=>state.accounts.reduce((s,a)=>s+Number(a.balance||0),0),[state.accounts]);
  const activeUsers=state.users.filter(u=>u.active).length; const activeAccounts=state.accounts.filter(a=>a.active).length;
  const recent=state.transactions.slice(0,7);
  const columns=[
    {key:"createdAt",label:"Date",render:r=><div><p className="font-semibold">{dateTime(r.createdAt)}</p><p className="text-xs text-slate-400 mt-1">{r.referenceId||`TX-${r.id}`}</p></div>},
    {key:"accountNumber",label:"Account"},
    {key:"transactionType",label:"Activity",render:r=><div><p className="font-semibold">{transactionLabel(r.transactionType)}</p>{r.counterpartyAccountNumber&&<p className="text-xs text-slate-400 mt-1">Counterparty: {r.counterpartyAccountNumber}</p>}</div>},
    {key:"amount",label:"Amount",render:r=><span className={`font-extrabold ${isCredit(r.transactionType)?"text-emerald-600":"text-slate-900"}`}>{money(r.amount)}</span>},
    {key:"status",label:"Status",render:r=><StatusPill status={r.status}/>},
  ];
  return <div className="space-y-7">
    {state.error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-semibold">{state.error}</div>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Registered customers" value={state.loading?"…":state.users.filter(u=>u.role!=="ADMIN").length} hint={`${activeUsers} active profiles`} accent="blue" icon={<Icon name="users"/>}/>
      <StatCard label="Active accounts" value={state.loading?"…":activeAccounts} hint={`${state.accounts.length} total accounts`} accent="teal" icon={<Icon name="wallet"/>}/>
      <StatCard label="Bank balance" value={state.loading?"…":money(totalBalance)} hint="Across all customer accounts" accent="violet" icon={<Icon name="chart"/>}/>
      <StatCard label="Transactions" value={state.loading?"…":state.transactions.length} hint="Recorded ledger entries" accent="amber" icon={<Icon name="history"/>}/>
    </div>

    <div className="grid xl:grid-cols-[1.45fr_.55fr] gap-6">
      <section><div className="flex items-center justify-between mb-4"><div><h2 className="text-xl font-extrabold">Latest banking activity</h2><p className="text-sm text-slate-500 mt-1">Newest transactions across the bank</p></div><Link to="/admin/transactions" className="text-sm font-bold text-blue-600">View ledger →</Link></div><LedgerTable rows={recent} columns={columns} keyField="id" pageSize={0}/></section>
      <aside className="bank-surface p-6"><p className="text-xs uppercase tracking-[.15em] text-slate-400 font-bold">Admin shortcuts</p><h2 className="text-xl font-extrabold mt-1">Operations</h2><div className="mt-5 space-y-3">{[["/admin/accounts","Open an account","wallet","bg-blue-50 text-blue-700"],["/admin/users","Manage customers","users","bg-teal-50 text-teal-700"],["/admin/reports","Export reports","report","bg-amber-50 text-amber-700"]].map(([to,label,icon,c])=><Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"><div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c}`}><Icon name={icon}/></div><span className="text-sm font-bold flex-1">{label}</span><span className="text-slate-300">→</span></Link>)}</div></aside>
    </div>
  </div>;
}
