const SESSION_STORAGE_KEY = "bpn_anonymous_visit_session";

/** A session-scoped random identifier that is hashed on the server before storage. */
export function getAnonymousSessionToken() {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const token = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join("")}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  return token;
}
