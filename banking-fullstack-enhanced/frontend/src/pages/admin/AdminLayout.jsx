import { Outlet, useLocation } from "react-router-dom";
import PortalShell from "../../components/PortalShell";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", icon: "dashboard", end: true },
  { to: "/admin/users", label: "Customers", icon: "users" },
  { to: "/admin/accounts", label: "Accounts", icon: "wallet" },
  { to: "/admin/transactions", label: "Transactions", icon: "history" },
  { to: "/admin/analytics", label: "Analytics", icon: "chart" },
  { to: "/admin/reports", label: "Reports", icon: "report" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];
const TITLES = {
  "/admin/dashboard": ["Admin Overview", "Live operational view of customers, accounts and money movement"],
  "/admin/users": ["Customer Management", "Review roles, status and registered customers"],
  "/admin/accounts": ["Account Management", "Open, review and close customer accounts"],
  "/admin/transactions": ["All Transactions", "Audit bank-wide deposits, withdrawals and transfers"],
  "/admin/analytics": ["Analytics", "Understand activity, volume and customer growth"],
  "/admin/reports": ["Reports", "Export operational and transaction reports"],
  "/admin/settings": ["Settings", "Review administrative portal settings"],
};
export default function AdminLayout() {
  const [title, subtitle] = TITLES[useLocation().pathname] || ["Admin Portal", "Bank operations"];
  return <PortalShell title={title} subtitle={subtitle} roleLabel="Administrator" navItems={NAV}><Outlet /></PortalShell>;
}
