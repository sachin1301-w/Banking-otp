import { useEffect, useRef, useState } from "react";

export default function OtpVerificationModal({
  open,
  challengeId,
  maskedEmail,
  expiresInSeconds = 300,
  operationLabel = "transaction",
  amountLabel,
  verifying,
  resending,
  error,
  onVerify,
  onResend,
  onClose,
}) {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  const [resendWait, setResendWait] = useState(30);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setOtp("");
    setSecondsLeft(expiresInSeconds || 300);
    setResendWait(30);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, challengeId, expiresInSeconds]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
      setResendWait((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, challengeId]);

  if (!open) return null;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;
  const canSubmit = /^\d{6}$/.test(otp) && !verifying && !expired;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) onVerify(otp);
  };

  const handleOtp = (e) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-200">Email verification</p>
              <h3 className="mt-2 text-2xl font-extrabold">Confirm {operationLabel}</h3>
              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                No money moves until the OTP is verified.
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl">✉</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">OTP sent to</p>
            <p className="mt-1 font-extrabold text-slate-950">{maskedEmail || "your registered email"}</p>
            {amountLabel && <p className="mt-2 text-sm text-slate-600">Transaction amount: <strong>{amountLabel}</strong></p>}
          </div>

          <label className="mt-6 block text-sm font-extrabold text-slate-800">6-digit OTP</label>
          <input
            ref={inputRef}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center font-mono text-3xl font-extrabold tracking-[.35em] text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            value={otp}
            onChange={handleOtp}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
          />

          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span className={expired ? "text-red-600" : "text-slate-500"}>
              {expired ? "OTP expired" : `Expires in ${minutes}:${seconds}`}
            </span>
            <button
              type="button"
              disabled={resending || resendWait > 0}
              onClick={onResend}
              className="font-extrabold text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {resending ? "Sending…" : resendWait > 0 ? `Resend in ${resendWait}s` : "Resend OTP"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={verifying}
              className="rounded-xl border border-slate-200 px-4 py-3 font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? "Verifying…" : "Verify & confirm"}
            </button>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            Never share your OTP with anyone. Banking System staff should never ask you for it.
          </p>
        </form>
      </div>
    </div>
  );
}
