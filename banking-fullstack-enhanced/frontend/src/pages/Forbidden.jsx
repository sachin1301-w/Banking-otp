import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Forbidden() {
  const { user } = useAuth();
  const home = user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-brick flex items-center justify-center">
          <span className="font-display text-2xl text-brick">403</span>
        </div>
        <h1 className="font-display text-2xl text-ink mb-3">Not on this ledger</h1>
        <p className="text-slate font-body mb-8">
          Your account doesn't hold access to this page. If you believe this is wrong, check with
          your administrator.
        </p>
        <Link
          to={home}
          className="inline-block bg-vault hover:bg-vault-dark text-paper font-semibold py-2.5 px-6 rounded-sm transition-colors"
        >
          Back to my dashboard
        </Link>
      </div>
    </div>
  );
}
