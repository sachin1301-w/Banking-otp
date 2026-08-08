import { money } from "../utils/format";

export default function MoneyOperationCard({
  eyebrow, title, description, accounts, selected, onSelected, amount, onAmount,
  recipient, onRecipient, submitLabel, pendingLabel, pending, status, onSubmit, accent = "blue"
}) {
  const account = accounts.find((a) => String(a.accountNumber) === String(selected)) || accounts[0];
  const accentClass = accent === "red" ? "from-red-500 to-rose-600" : accent === "teal" ? "from-teal-500 to-emerald-600" : "from-blue-600 to-indigo-600";
  return (
    <div className="grid lg:grid-cols-[1fr_.72fr] gap-6 items-start">
      <form onSubmit={onSubmit} className="bank-surface p-6 sm:p-8">
        <div className="mb-7"><p className="text-xs uppercase tracking-[.16em] text-blue-600 font-extrabold">{eyebrow}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>
        <div className="space-y-5">
          <div><label className="form-label">Account</label><select className="form-input" value={selected || ""} onChange={(e)=>onSelected(e.target.value)} required>{accounts.map((a)=><option key={a.id} value={a.accountNumber}>{a.accountNumber} · {a.accountType}</option>)}</select></div>
          {recipient !== undefined && <div><label className="form-label">Recipient account number</label><input className="form-input font-mono" value={recipient} onChange={(e)=>onRecipient(e.target.value.toUpperCase())} required placeholder="ACC123456789012" /></div>}
          <div><label className="form-label">Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span><input className="form-input !pl-9 text-lg font-bold" type="number" min="0.01" step="0.01" value={amount} onChange={(e)=>onAmount(e.target.value)} required placeholder="0.00" /></div></div>
          {status?.message && <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${status.state === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{status.message}</div>}
          <button type="submit" disabled={pending} className={`w-full rounded-xl py-3.5 px-4 text-white font-extrabold bg-gradient-to-r ${accentClass} shadow-lg disabled:opacity-60`}>{pending ? pendingLabel : submitLabel}</button>
        </div>
      </form>

      <aside className="bank-card p-6 sm:p-7 min-h-[235px]">
        <div className="relative z-10">
          <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[.18em] text-blue-100 font-bold">Selected account</p><span className="text-xl">◈</span></div>
          <p className="mt-8 text-sm text-blue-100">Available balance</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{money(account?.balance)}</p>
          <div className="mt-8 flex justify-between gap-4 text-sm"><div><p className="text-blue-200 text-xs">Account number</p><p className="mt-1 font-mono font-semibold">{account?.accountNumber || "—"}</p></div><div className="text-right"><p className="text-blue-200 text-xs">Type</p><p className="mt-1 font-semibold">{account?.accountType || "—"}</p></div></div>
        </div>
      </aside>
    </div>
  );
}
