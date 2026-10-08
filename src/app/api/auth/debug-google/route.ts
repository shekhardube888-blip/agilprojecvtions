import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/auth/debug-google
// Diagnostic endpoint — checks EVERYTHING about the Google OAuth setup and
// returns a detailed report of what's configured, what's missing, and the
// EXACT redirect URI you must put in Google Cloud Console.
//
// Visit this URL in your browser to see a full diagnostic report.
// Use ?json=1 for a machine-readable response.

const REDIRECT_PATH = "/api/auth/callback/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wantJson = url.searchParams.get("json") === "1";

  const checks: { ok: boolean; label: string; value: string; hint?: string }[] = [];

  // 1. GOOGLE_CLIENT_ID
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  checks.push({
    ok: !!clientId && clientId.length > 10,
    label: "GOOGLE_CLIENT_ID",
    value: clientId ? `${clientId.slice(0, 20)}…${clientId.slice(-10)}` : "(empty)",
    hint: !clientId ? "Set this in .env — copy from Google Cloud Console → Credentials → OAuth 2.0 Client ID" : undefined,
  });

  // 2. GOOGLE_CLIENT_SECRET
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  checks.push({
    ok: !!clientSecret && clientSecret.length > 5,
    label: "GOOGLE_CLIENT_SECRET",
    value: clientSecret ? `${clientSecret.slice(0, 3)}…${clientSecret.slice(-3)}` : "(empty)",
    hint: !clientSecret ? "Set this in .env — copy the Client Secret from the same Google Cloud page" : undefined,
  });

  // 3. NEXTAUTH_SECRET
  const nextauthSecret = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || "";
  checks.push({
    ok: !!nextauthSecret,
    label: "NEXTAUTH_SECRET",
    value: nextauthSecret ? "✓ set" : "(empty)",
    hint: !nextauthSecret ? "Generate with: openssl rand -base64 32  →  put in .env as NEXTAUTH_SECRET=..." : undefined,
  });

  // 4. NEXTAUTH_URL — must match the URL the browser uses
  const nextauthUrl = process.env.NEXTAUTH_URL || "";
  const host = url.host;
  const protocol = url.protocol;
  const actualUrl = `${protocol}//${host}`;
  const expectedRedirectUri = `${actualUrl}${REDIRECT_PATH}`;
  checks.push({
    ok: !!nextauthUrl && (nextauthUrl.replace(/\/$/, "") === actualUrl),
    label: "NEXTAUTH_URL",
    value: nextauthUrl || "(empty)",
    hint: !nextauthUrl
      ? `Set in .env: NEXTAUTH_URL="${actualUrl}"`
      : (nextauthUrl.replace(/\/$/, "") !== actualUrl
          ? `MISMATCH! .env says "${nextauthUrl}" but the browser URL is "${actualUrl}". Update .env to NEXTAUTH_URL="${actualUrl}"`
          : undefined),
  });

  // 5. The EXACT redirect URI to put in Google Cloud
  checks.push({
    ok: true, // informational
    label: "EXACT Redirect URI (put this in Google Cloud Console → Authorized redirect URIs)",
    value: expectedRedirectUri,
    hint: "This must EXACTLY match what's in Google Cloud → no trailing slash, http:// (not https://) for localhost",
  });

  // 6. Check if the Google provider is enabled
  const googleEnabled = !!(clientId && clientSecret);
  checks.push({
    ok: googleEnabled,
    label: "Google provider status",
    value: googleEnabled ? "✓ ENABLED" : "✗ DISABLED (missing creds)",
    hint: googleEnabled ? undefined : "The Google button will show a 'not configured' alert until both GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set in .env",
  });

  // 7. Common mistakes check
  const mistakes: string[] = [];
  if (clientId && !clientId.includes(".apps.googleusercontent.com")) {
    mistakes.push("GOOGLE_CLIENT_ID doesn't look right — it should end with '.apps.googleusercontent.com'");
  }
  if (nextauthUrl && nextauthUrl.startsWith("https://localhost")) {
    mistakes.push("NEXTAUTH_URL uses https://localhost — use http://localhost for local dev");
  }
  if (nextauthUrl && nextauthUrl.endsWith("/")) {
    mistakes.push("NEXTAUTH_URL has a trailing slash — remove it");
  }

  const allOk = checks.filter(c => c.label !== "EXACT Redirect URI (put this in Google Cloud Console → Authorized redirect URIs)").every(c => c.ok) && mistakes.length === 0;

  if (wantJson) {
    return NextResponse.json({ ok: allOk, checks, mistakes, redirectUri: expectedRedirectUri });
  }

  // Return a nice HTML diagnostic page
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Google OAuth Diagnostic</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0a1422; color: #e2e8f0; margin: 0; padding: 2rem; line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; }
  h1 { color: ${allOk ? "#34d399" : "#f87171"}; font-size: 1.5rem; }
  .summary { padding: 1rem 1.5rem; border-radius: 8px; margin: 1rem 0; background: ${allOk ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)"}; border: 1px solid ${allOk ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}; }
  .check { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem 1rem; padding: 0.75rem 1rem; border-radius: 6px; background: rgba(255,255,255,0.03); margin: 0.5rem 0; align-items: start; }
  .check .label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; }
  .check .value { font-family: monospace; font-size: 0.8rem; color: #fcd34d; word-break: break-all; text-align: right; }
  .check .hint { grid-column: 1 / -1; color: #f87171; font-size: 0.75rem; margin-top: 0.25rem; }
  .check.ok .value { color: #34d399; }
  .check.fail .value { color: #f87171; }
  .check.info { background: rgba(103,232,249,0.05); border: 1px solid rgba(103,232,249,0.2); }
  .check.info .value { color: #67e8f9; }
  .step { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); padding: 1rem 1.5rem; border-radius: 8px; margin: 0.75rem 0; }
  .step h3 { color: #a5b4fc; font-size: 0.95rem; margin: 0 0 0.5rem; }
  .step code { background: rgba(0,0,0,0.3); padding: 0.1rem 0.4rem; border-radius: 3px; color: #fcd34d; font-size: 0.85rem; }
  .copy-btn { background: #06b6d4; color: #0a1422; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem; }
  .copy-btn:hover { background: #0891b2; }
  .mistakes { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.3); padding: 1rem 1.5rem; border-radius: 8px; margin: 1rem 0; }
  .mistakes h3 { color: #f87171; margin: 0 0 0.5rem; }
  .mistakes li { margin: 0.25rem 0; }
  .restart-note { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.3); padding: 0.75rem 1rem; border-radius: 6px; margin: 1rem 0; font-size: 0.85rem; }
  code.inline { background: rgba(0,0,0,0.3); padding: 0.1rem 0.4rem; border-radius: 3px; color: #fcd34d; }
</style></head>
<body><div class="container">
  <h1>${allOk ? "✓ Google OAuth is properly configured" : "✗ Google OAuth has issues"}</h1>
  <div class="summary">
    ${allOk
      ? "All checks passed. The Google button should now open the Chrome profile picker. If it's still not working, make sure you restarted the dev server after editing .env (<code class='inline'>npm run dev</code>) and that the redirect URI in Google Cloud EXACTLY matches the one shown below."
      : "Some checks failed. Fix the items marked ✗ below, restart the dev server, then try again."}
  </div>

  <h2>Configuration checks</h2>
  ${checks.map(c => `
  <div class="check ${c.ok ? "ok" : "fail"} ${c.label.includes("EXACT") ? "info" : ""}">
    <div class="label">${c.label}</div>
    <div class="value">${c.value}</div>
    ${c.hint ? `<div class="hint">⚠ ${c.hint}</div>` : ""}
  </div>`).join("")}

  ${mistakes.length > 0 ? `
  <div class="mistakes">
    <h3>⚠ Common mistakes detected</h3>
    <ul>${mistakes.map(m => `<li>${m}</li>`).join("")}</ul>
  </div>` : ""}

  <h2>Step-by-step fix</h2>
  <div class="step">
    <h3>Step 1 — Create the OAuth Client in Google Cloud</h3>
    Go to <code>https://console.cloud.google.com/</code> → APIs & Services → Credentials → Create Credentials → OAuth client ID → Application type: <strong>Web application</strong>
  </div>
  <div class="step">
    <h3>Step 2 — Add the EXACT redirect URI</h3>
    Under "Authorized redirect URIs", add this EXACT URL (copy it):
    <div style="margin-top:0.5rem"><code style="font-size:0.85rem;word-break:break-all;color:#67e8f9">${expectedRedirectUri}</code>
    <button class="copy-btn" onclick="navigator.clipboard.writeText('${expectedRedirectUri}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button></div>
    <p style="font-size:0.8rem;color:#94a3b8;margin-top:0.5rem">⚠ Must be <strong>http://</strong> (not https://) for localhost. No trailing slash. No spaces.</p>
  </div>
  <div class="step">
    <h3>Step 3 — Copy Client ID + Secret to .env</h3>
    In your project's <code>.env</code> file, add these lines (replace the values with YOUR actual ID + Secret from Google Cloud):
    <pre style="background:rgba(0,0,0,0.3);padding:0.75rem;border-radius:6px;overflow-x:auto;color:#34d399;font-size:0.8rem;margin-top:0.5rem">GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
NEXTAUTH_URL="${actualUrl}"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"</pre>
  </div>
  <div class="step">
    <h3>Step 4 — Restart the dev server</h3>
    .env changes are NOT picked up automatically. Stop the server (Ctrl+C) and restart:
    <pre style="background:rgba(0,0,0,0.3);padding:0.75rem;border-radius:6px;overflow-x:auto;color:#67e8f9;font-size:0.8rem;margin-top:0.5rem">npm run dev</pre>
  </div>
  <div class="step">
    <h3>Step 5 — Test</h3>
    Open <code>http://localhost:3000</code> → click "Sign in with Google" → a popup opens → you see the <strong>Google Chrome profile picker</strong> (all your Google accounts) → pick one → consent → done.
  </div>

  <div class="restart-note">
    <strong>Still not working?</strong> Visit <a href="/api/auth/debug-google?json=1" style="color:#67e8f9">/api/auth/debug-google?json=1</a> for the raw diagnostic, or check the dev server console (the terminal where <code class="inline">npm run dev</code> is running) for error messages when you click the Google button.
  </div>

  <p style="text-align:center;margin-top:2rem"><a href="/" style="color:#67e8f9">← Back to portal</a></p>
</div></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
