import { NextResponse, type NextRequest } from "next/server";

/**
 * Production protection for the Keystatic CMS admin.
 *
 * The admin (`/keystatic`) and its API (`/api/keystatic/*`) use local git
 * storage with no built-in auth, so they must never be publicly reachable in
 * production. Policy:
 *   - Development: always allowed (local content editing).
 *   - Production: 404 UNLESS `KEYSTATIC_ENABLED=true` AND both
 *     `KEYSTATIC_ADMIN_USER` + `KEYSTATIC_ADMIN_PASSWORD` are set — then HTTP
 *     Basic Auth is enforced. Enabled-without-credentials still 404s, so the
 *     admin can never be exposed by a half-configured env.
 *
 * Public routes are never matched (see `config.matcher`) and stay static.
 */

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Keystatic CMS", charset="UTF-8"' },
  });
}

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

function checkBasicAuth(header: string | null, user: string, pass: string): boolean {
  if (!header || !header.toLowerCase().startsWith("basic ")) return false;
  try {
    const decoded = atob(header.slice(6).trim());
    const idx = decoded.indexOf(":");
    if (idx === -1) return false;
    return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  // Local development: unrestricted so the team can edit content locally.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  // Production must explicitly opt in.
  if (process.env.KEYSTATIC_ENABLED !== "true") return notFound();

  const user = process.env.KEYSTATIC_ADMIN_USER;
  const pass = process.env.KEYSTATIC_ADMIN_PASSWORD;
  // Enabled but not fully credentialed → refuse to expose.
  if (!user || !pass) return notFound();

  if (!checkBasicAuth(req.headers.get("authorization"), user, pass)) {
    return unauthorized();
  }
  return NextResponse.next();
}

// Only the CMS admin surfaces are gated; all public routes are untouched.
export const config = {
  matcher: ["/keystatic/:path*", "/api/keystatic/:path*"],
};
