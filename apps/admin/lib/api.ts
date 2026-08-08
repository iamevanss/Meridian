/**
 * API client for the admin console. Deliberately separate from the
 * customer app's client: different token storage key, and it only ever
 * calls /auth/admin/login + /admin/* routes, which the backend protects
 * with a completely separate JWT secret (see packages/api/src/lib/auth.ts).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "meridian_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.formErrors?.[0] || data?.error || "Something went wrong.";
    throw new ApiError(typeof message === "string" ? message : "Request failed", res.status);
  }

  return data;
}

export const adminApi = {
  login: (input: { email: string; password: string }) =>
    request("/auth/admin/login", { method: "POST", body: JSON.stringify(input) }),

  getAccounts: (status?: string) => request(`/admin/accounts${status ? `?status=${status}` : ""}`),

  getTransactions: () => request("/admin/transactions"),

  getAuditLog: () => request("/admin/audit-log"),

  freezeAccount: (accountId: string, reason: string) =>
    request("/admin/accounts/freeze", { method: "POST", body: JSON.stringify({ accountId, reason }) }),

  unfreezeAccount: (accountId: string, reason: string) =>
    request("/admin/accounts/unfreeze", { method: "POST", body: JSON.stringify({ accountId, reason }) }),

  adjustBalance: (accountId: string, amountDollars: number, reason: string) =>
    request("/admin/accounts/adjust-balance", { method: "POST", body: JSON.stringify({ accountId, amountDollars, reason }) }),
};
