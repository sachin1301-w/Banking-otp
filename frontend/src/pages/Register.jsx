import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:"", email:"", phoneNumber:"", password:"", confirmPassword:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await client.post("/users", { fullName:form.fullName.trim(), email:form.email.trim(), phoneNumber:form.phoneNumber.trim(), password:form.password });
      navigate("/login", { replace:true, state:{ registered:true, registeredEmail:form.email.trim() } });
    } catch (err) {
      const details = err.response?.data?.errors;
      setError(err.response?.data?.message || (details ? Object.values(details).join(" · ") : "Could not create account."));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[.8fr_1.2fr] rounded-[28px] overflow-hidden shadow-2xl shadow-slate-300/40 border border-slate-200 bg-white">
        <aside className="relative bg-[#08111f] text-white p-9 sm:p-12 overflow-hidden">
          <div className="absolute -left-28 -bottom-24 h-80 w-80 rounded-full bg-blue-600/25 blur-2xl" />
          <div className="relative flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-extrabold">BS</div><span className="font-extrabold text-lg">Banking System</span></div>
          <div className="relative mt-16">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">New customer</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Open your digital banking profile.</h1>
            <p className="mt-4 text-slate-300 leading-7">Registration creates a secure customer profile and a zero-balance savings account so you can start using the dashboard immediately.</p>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              {["Protected password storage", "Automatic savings account", "Real-time transaction history"].map((t)=><div key={t} className="flex gap-3"><span className="h-6 w-6 rounded-full bg-emerald-400/15 text-emerald-300 flex items-center justify-center">✓</span><span>{t}</span></div>)}
            </div>
          </div>
        </aside>

        <main className="p-7 sm:p-12">
          <div className="flex items-center justify-between gap-4 mb-8"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Create account</p><h2 className="text-3xl font-extrabold tracking-tight mt-1">Your details</h2></div><Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">← Sign in</Link></div>
          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="form-label">Full name</label><input className="form-input" required value={form.fullName} onChange={change("fullName")} placeholder="Your full name" /></div>
            <div className="sm:col-span-2"><label className="form-label">Email address</label><input className="form-input" type="email" required value={form.email} onChange={change("email")} placeholder="you@example.com" /></div>
            <div className="sm:col-span-2"><label className="form-label">Phone number</label><input className="form-input" required value={form.phoneNumber} onChange={change("phoneNumber")} placeholder="10-digit mobile number" /></div>
            <div><label className="form-label">Password</label><input className="form-input" type="password" minLength="8" required value={form.password} onChange={change("password")} placeholder="Minimum 8 characters" /></div>
            <div><label className="form-label">Confirm password</label><input className="form-input" type="password" required value={form.confirmPassword} onChange={change("confirmPassword")} placeholder="Repeat password" /></div>
            <div className="sm:col-span-2 mt-2"><button className="primary-btn w-full" disabled={loading}>{loading ? "Creating your account…" : "Create banking account"}</button><p className="text-xs text-slate-400 text-center mt-4">By creating an account, you agree to use this banking demo responsibly.</p></div>
          </form>
        </main>
      </div>
    </div>
  );
}
