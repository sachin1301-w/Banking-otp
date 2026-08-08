import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { user, login, loading, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (location.state?.registeredEmail) setEmail(location.state.registeredEmail);
  }, [location.state]);

  if (user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(email.trim(), password); } catch { /* shown by context */ }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_.95fr] bg-white">
      <section className="relative hidden lg:flex overflow-hidden bg-[#08111f] text-white p-14 xl:p-20 flex-col justify-between">
        <div className="absolute inset-0 opacity-60" style={{background:"radial-gradient(circle at 15% 15%, rgba(37,99,235,.45), transparent 28rem), radial-gradient(circle at 85% 75%, rgba(20,184,166,.32), transparent 26rem)"}} />
        <div className="absolute -right-28 top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-14 top-34 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-lg font-extrabold shadow-xl">BS</div>
            <div><p className="font-extrabold text-xl">Banking System</p><p className="text-xs text-slate-400 tracking-[.18em] uppercase">Digital banking portal</p></div>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-blue-300">One secure sign-in</p>
          <h1 className="mt-5 text-5xl xl:text-6xl font-extrabold tracking-[-.045em] leading-[1.05]">Banking that feels simple, secure and fast.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-lg">Customers and administrators use the same protected entry point. Your account role automatically opens the right dashboard.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            {[['JWT','Secure access'],['24/7','Live balance'],['100%','Role protected']].map(([v,l]) => <div key={l} className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur"><p className="text-xl font-extrabold">{v}</p><p className="text-xs text-slate-400 mt-1">{l}</p></div>)}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">Protected by JWT authentication and role-based authorization.</p>
      </section>

      <section className="flex items-center justify-center px-5 sm:px-10 py-12 bg-[#f8fafc]">
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center font-extrabold">BS</div>
            <div><p className="font-extrabold text-lg">Banking System</p><p className="text-xs text-slate-500">Secure digital banking</p></div>
          </div>

          <div className="mb-8">
            <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Secure portal</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Sign in as a customer or administrator.</p>
          </div>

          {location.state?.registered && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Account created successfully. Your savings account is ready—sign in to continue.</div>}
          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="form-label" htmlFor="email">Email address</label><input className="form-input" id="email" type="email" autoComplete="username" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@example.com" /></div>
            <div><label className="form-label" htmlFor="password">Password</label><input className="form-input" id="password" type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" /></div>
            <button className="primary-btn w-full" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in securely"}</button>
          </form>

          <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-xs font-semibold text-slate-400">NEW CUSTOMER</span><span className="h-px flex-1 bg-slate-200"/></div>
          <Link to="/register" className="mt-5 w-full flex items-center justify-center secondary-btn">Create an account</Link>
          <p className="mt-6 text-center text-xs text-slate-400">Admin and user dashboards are separated automatically after authentication.</p>
        </div>
      </section>
    </div>
  );
}
