export const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const dateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const shortDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function transactionLabel(type) {
  const labels = {
    DEPOSIT: "Deposit",
    WITHDRAW: "Withdrawal",
    TRANSFER_OUT: "Transfer sent",
    TRANSFER_IN: "Transfer received",
    TRANSFER: "Transfer",
  };
  return labels[type] || (type || "Transaction").replaceAll("_", " ");
}

export function isCredit(type) {
  return type === "DEPOSIT" || type === "TRANSFER_IN";
}
