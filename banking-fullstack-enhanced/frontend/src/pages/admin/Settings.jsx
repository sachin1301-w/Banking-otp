import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ToastContext";

export default function Settings() {
  const { user } = useAuth();
  const pushToast = useToast();
  const [orgName, setOrgName] = useState("Banking System");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const handleSave = (e) => {
    e.preventDefault();
    pushToast("Settings saved.", "success");
  };

  return (
    <div className="max-w-lg space-y-8">
      <div className="bank-surface p-6">
        <h2 className="font-display text-lg text-ink mb-1">Signed in as</h2>
        <p className="text-sm text-slate font-mono">{user?.email}</p>
        <p className="text-xs text-slate-light mt-1 uppercase tracking-widest">{user?.role}</p>
      </div>

      <form onSubmit={handleSave} className="bank-surface p-6 space-y-5">
        <h2 className="font-display text-lg text-ink mb-1">Platform Preferences</h2>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-2">
            Organization Name
          </label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-2">
            Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="form-input"
          >
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>
        <button
          type="submit"
          className="primary-btn px-6"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
