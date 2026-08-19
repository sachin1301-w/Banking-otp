import { Outlet, useLocation } from "react-router-dom";
import PortalShell from "../../components/PortalShell";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: "dashboard", end: true },
  { to: "/account", label: "My Accounts", icon: "wallet" },
  { to: "/deposit", label: "Deposit Money", icon: "plus" },
  { to: "/withdraw", label: "Withdraw Money", icon: "minus" },
  { to: "/transfer", label: "Transfer Money", icon: "transfer" },
  { to: "/transactions", label: "Transaction History", icon: "history" },
  { to: "/profile", label: "My Profile", icon: "user" },
];
const TITLES = {
  "/dashboard": ["Good to see you", "Your accounts and recent activity at a glance"],
  "/account": ["My Accounts", "View account details and current balances"],
  "/deposit": ["Deposit Money", "Add funds securely to your account"],
  "/withdraw": ["Withdraw Money", "Withdraw available funds from your account"],
  "/transfer": ["Transfer Money", "Send money instantly to another bank account"],
  "/transactions": ["Transaction History", "Review, search and export your account activity"],
  "/profile": ["My Profile", "Your customer information and account status"],
};
export default function UserLayout() {
  const [title, subtitle] = TITLES[useLocation().pathname] || ["Customer Portal", "Secure digital banking"];
  return <PortalShell title={title} subtitle={subtitle} roleLabel="Customer" navItems={NAV}><Outlet /></PortalShell>;
}
