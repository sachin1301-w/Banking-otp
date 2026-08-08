import { useState } from "react";
import { useToast } from "./ToastContext";

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" strokeLinecap="round" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="9" width="16" height="8" rx="1" />
      <path d="M6 17v4h12v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shared button: works for both "download" and "print" actions.
// `onRun` may be sync or async; loading/disabled/toast are all handled here
// so every export button in the app behaves identically per the UI spec.
export function ActionButton({ label, icon = "download", onRun, disabled, variant = "solid" }) {
  const [loading, setLoading] = useState(false);
  const pushToast = useToast();

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await onRun();
      pushToast(`${label} ready.`, "success");
    } catch (err) {
      pushToast(err?.message || `${label} failed.`, "error");
    } finally {
      setLoading(false);
    }
  };

  const base =
    "group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden";
  const solid =
    "bg-vault text-paper hover:shadow-[0_0_0_1px_rgba(184,134,59,0.4),0_0_14px_rgba(184,134,59,0.35)]";
  const outline =
    "border border-line text-ink bg-paper hover:border-brass hover:shadow-[0_0_10px_rgba(184,134,59,0.25)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${base} ${variant === "solid" ? solid : outline}`}
    >
      {variant === "solid" && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon === "print" ? (
        <PrintIcon />
      ) : (
        <DownloadIcon />
      )}
      <span className="relative">{loading ? "Generating…" : label}</span>
    </button>
  );
}
