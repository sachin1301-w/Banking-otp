import client from "./client";

export const usersApi = {
  me: () => client.get("/users/me").then((r) => r.data),
  listAll: () => client.get("/admin/users").then((r) => r.data),
  getById: (id) => client.get(`/users/${id}`).then((r) => r.data),
  update: (id, body) => client.put(`/users/${id}`, body).then((r) => r.data),
  promote: (id) => client.patch(`/admin/users/${id}/promote`).then((r) => r.data),
  deactivate: (id) => client.patch(`/admin/users/${id}/deactivate`).then((r) => r.data),
  activate: (id) => client.patch(`/admin/users/${id}/activate`).then((r) => r.data),
};

export const accountsApi = {
  me: () => client.get("/accounts/me").then((r) => r.data),
  listAll: () => client.get("/accounts").then((r) => r.data),
  getByUser: (userId) => client.get(`/accounts/user/${userId}`).then((r) => r.data),
  getByNumber: (accountNumber) => client.get(`/accounts/number/${accountNumber}`).then((r) => r.data),
  open: (body) => client.post("/accounts", body).then((r) => r.data),
  close: (id) => client.delete(`/accounts/${id}`).then((r) => r.data),
};

export const transactionsApi = {
  listAll: () => client.get("/transactions").then((r) => r.data),
  byAccount: (accountNumber) => client.get(`/transactions/account/${accountNumber}`).then((r) => r.data),
  byType: (type) => client.get(`/transactions/type/${type}`).then((r) => r.data),

  // Step 1: these endpoints validate the request and email an OTP.
  requestDepositOtp: (body) => client.post("/transactions/deposit", body).then((r) => r.data),
  requestWithdrawOtp: (body) => client.post("/transactions/withdraw", body).then((r) => r.data),
  requestTransferOtp: (body) => client.post("/transactions/transfer", body).then((r) => r.data),

  // Step 2: the balance changes only after the OTP is verified.
  verifyOtp: (body) => client.post("/transactions/otp/verify", body).then((r) => r.data),
};
