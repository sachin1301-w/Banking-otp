import { useMyAccount } from "../../hooks/useMyAccount";
import { StatusPill } from "../../components/Ledger";
import { money } from "../../utils/format";

export default function MyAccount(){
 const {loading,error,accounts}=useMyAccount();
 if(loading)return <div className="bank-surface p-8 text-slate-500">Loading accounts…</div>;
 if(error)return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
 return <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{accounts.map((a,i)=><div key={a.id} className="bank-surface overflow-hidden"><div className={`p-6 text-white ${i%2?"bg-gradient-to-br from-teal-600 to-emerald-700":"bg-gradient-to-br from-slate-900 to-blue-700"}`}><div className="flex justify-between"><span className="text-xs uppercase tracking-[.16em] text-white/65">{a.accountType} account</span><span>◈</span></div><p className="mt-8 text-3xl font-extrabold">{money(a.balance)}</p><p className="mt-4 font-mono text-sm tracking-wide">{a.accountNumber}</p></div><div className="p-5 space-y-4"><div className="flex justify-between gap-4"><span className="text-sm text-slate-500">Account holder</span><span className="text-sm font-bold text-right">{a.accountHolderName}</span></div><div className="flex justify-between gap-4 items-center"><span className="text-sm text-slate-500">Status</span><StatusPill status={a.active?"ACTIVE":"CLOSED"}/></div><div className="flex justify-between gap-4"><span className="text-sm text-slate-500">Account ID</span><span className="text-sm font-mono">#{a.id}</span></div></div></div>)}</div>;
}
