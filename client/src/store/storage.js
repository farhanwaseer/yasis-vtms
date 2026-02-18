const AUTH_STORAGE_KEY = "vtms_admin_auth";

export function loadAuthState() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;
    if (!parsed.token) return undefined;
    return {
      token: parsed.token,
      employee: parsed.employee || null,
    };
  } catch {
    return undefined;
  }
}

export function saveAuthState(authState) {
  try {
    if (!authState?.token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const payload = {
      token: authState.token,
      employee: authState.employee || null,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors to avoid breaking UI.
  }
}
