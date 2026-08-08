/**
 * Thin API client for the customer-facing app.
 * Talks to the Express backend at NEXT_PUBLIC_API_URL (Railway/Render).
 * Token is kept in localStorage under a namespaced key so it never
 * collides with the admin app's separate token (see apps/admin/lib/api.ts).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "meridian_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
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
  const token = getToken();
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
    const message = data?.error?.formErrors?.[0] || data?.error || "Something went wrong. Please try again.";
    throw new ApiError(typeof message === "string" ? message : "Request failed", res.status);
  }

  return data;
}

export const api = {
  signup: (input: { email: string; password: string; firstName: string; lastName: string }) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(input) }),

  getAccounts: () => request("/accounts"),

  getTransactions: (accountId: string) => request(`/accounts/${accountId}/transactions`),

  transfer: (input: { fromAccountId: string; toAccountNumber: string; amountDollars: number; description: string; memo?: string }) =>
    request("/transfers", { method: "POST", body: JSON.stringify(input) }),
};
