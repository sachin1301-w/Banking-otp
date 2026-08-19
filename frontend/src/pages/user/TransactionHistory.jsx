import { useEffect, useMemo, useState } from "react";
import { useMyAccount } from "../../hooks/useMyAccount";
import { transactionsApi } from "../../api/services";
import { LedgerTable, StatusPill } from "../../components/Ledger";
import ExportBar from "../../components/ExportBar";
import DateRangeFilter from "../../components/DateRangeFilter";
import { money, dateTime, transactionLabel, isCredit } from "../../utils/format";

export default function TransactionHistory() {
  const { accounts, loading: accountLoading } = useMyAccount();
  const [txns,setTxns]=useState([]); const [loading,setLoading]=useState(true); const [account,setAccount]=useState("ALL");
  const [search,setSearch]=useState(""); const [from,setFrom]=useState(""); const [to,setTo]=useState(""); const [error,setError]=useState("");
  useEffect(()=>{ if(!accounts.length){setLoading(false);return;} setLoading(true); Promise.all(accounts.map(a=>transactionsApi.byAccount(a.accountNumber))).then(gs=>setTxns(gs.flat().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)))).catch(e=>setError(e.response?.data?.message||"Could not load transactions.")).finally(()=>setLoading(false)); },[accounts]);
  const filtered=useMemo(()=>txns.filter(t=>{
    if(account!=="ALL" && t.accountNumber!==account) return false;
    const q=search.trim().toLowerCase(); if(q && ![t.transactionType,t.status,t.counterpartyAccountNumber,t.referenceId,t.accountNumber].some(v=>v?.toLowerCase().includes(q))) return false;
    if(from && new Date(t.createdAt)<new Date(from)) return false;
    if(to){const d=new Date(to);d.setHours(23,59,59,999);if(new Date(t.createdAt)>d)return false;} return true;
  }),[txns,account,search,from,to]);
  const columns=[
    {key:"createdAt",label:"Date & time",render:r=><div><p className="font-semibold">{dateTime(r.createdAt)}</p><p className="text-xs text-slate-400 mt-1">{r.referenceId||`TX-${r.id}`}</p></div>,exportValue:r=>dateTime(r.createdAt)},
    {key:"accountNumber",label:"Account"},
    {key:"transactionType",label:"Type",render:r=><div><p className="font-semibold">{transactionLabel(r.transactionType)}</p>{r.counterpartyAccountNumber&&<p className="text-xs text-slate-400 mt-1">{r.transactionType==="TRANSFER_IN"?"From":"To"}: {r.counterpartyAccountNumber}</p>}</div>},
    {key:"amount",label:"Amount",render:r=><span className={`font-extrabold ${isCredit(r.transactionType)?"text-emerald-600":"text-red-600"}`}>{isCredit(r.transactionType)?"+":"−"}{money(r.amount)}</span>,exportValue:r=>r.amount},
    {key:"balanceAfter",label:"Balance after",render:r=>money(r.balanceAfter)},
    {key:"status",label:"Status",render:r=><StatusPill status={r.status}/>,exportValue:r=>r.status},
  ];
  if(accountLoading||loading) return <div className="bank-surface p-8 text-slate-500">Loading transaction history…</div>;
  return <div className="space-y-5">
    {error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-semibold">{error}</div>}
    <div className="bank-surface p-4 sm:p-5 flex flex-wrap items-center gap-3">
      <select className="form-input !w-auto min-w-56" value={account} onChange={e=>setAccount(e.target.value)}><option value="ALL">All my accounts</option>{accounts.map(a=><option key={a.id} value={a.accountNumber}>{a.accountNumber}</option>)}</select>
      <input className="form-input !w-auto min-w-64 flex-1" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search type, reference or account…"/>
      <DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo} onClear={()=>{setFrom("");setTo("")}}/>
      <ExportBar title="My Transaction Statement" filename="transaction-statement" columns={columns} rows={filtered}/>
    </div>
    <LedgerTable columns={columns} rows={filtered} keyField="id"/>
  </div>;
}
