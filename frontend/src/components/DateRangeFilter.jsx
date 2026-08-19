export default function DateRangeFilter({ from, to, onFrom, onTo, onClear }) {
  return (
    <div className="flex items-center gap-2 text-sm font-body">
      <label className="text-xs uppercase tracking-widest text-slate">From</label>
      <input
        type="date"
        value={from}
        onChange={(e) => onFrom(e.target.value)}
        className="border border-line bg-paper px-2.5 py-1.5 rounded-sm font-mono text-xs focus:border-vault outline-none"
      />
      <label className="text-xs uppercase tracking-widest text-slate">To</label>
      <input
        type="date"
        value={to}
        onChange={(e) => onTo(e.target.value)}
        className="border border-line bg-paper px-2.5 py-1.5 rounded-sm font-mono text-xs focus:border-vault outline-none"
      />
      {(from || to) && (
        <button onClick={onClear} className="text-xs text-brass font-semibold hover:underline">
          Clear
        </button>
      )}
    </div>
  );
}
