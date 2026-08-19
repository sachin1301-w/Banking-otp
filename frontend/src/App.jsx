import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ToastContext";
import { AdminRoute, UserRoute, RoleHome } from "./auth/RouteGuards";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Forbidden from "./pages/Forbidden";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AccountManagement from "./pages/admin/AccountManagement";
import AllTransactions from "./pages/admin/AllTransactions";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import MyProfile from "./pages/user/MyProfile";
import MyAccount from "./pages/user/MyAccount";
import Deposit from "./pages/user/Deposit";
import Withdraw from "./pages/user/Withdraw";
import Transfer from "./pages/user/Transfer";
import TransactionHistory from "./pages/user/TransactionHistory";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/403" element={<Forbidden />} />

          {/* Admin portal */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/accounts" element={<AccountManagement />} />
              <Route path="/admin/transactions" element={<AllTransactions />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* User portal */}
          <Route element={<UserRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/transactions" element={<TransactionHistory />} />
            </Route>
          </Route>

          {/* Anything unmatched: send to the role-aware home, which itself
              redirects to /login when logged out. */}
          <Route path="*" element={<RoleHome />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
