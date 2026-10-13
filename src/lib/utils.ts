import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a fetch Response as JSON. If the server returned HTML (e.g., a
 * 500 error page) or an empty body, returns a fallback object instead of
 * throwing "Unexpected token <" — which would crash the UI.
 */
export async function safeJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return { ok: false, error: "Empty response from server" } as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // The server returned non-JSON (probably an HTML error page).
    // Extract a useful error message from the HTML if possible.
    const match = text.match(/<title>(.*?)<\/title>/i);
    return {
      ok: false,
      error: match ? match[1] : "Server error (non-JSON response — check the dev server console)",
    } as T;
  }
}
