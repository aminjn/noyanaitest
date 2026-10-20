// Links and redirects whose target comes from stored data (rich text, ads,
// notifications, AI cards, backend redirects) must never run script:
// React 18 and next/link still navigate to "javascript:" / "data:" hrefs.

// schemes a stored link may use; everything else (javascript:, data:,
// vbscript:, file:, blob:...) is dropped
const SAFE_SCHEMES = /^(https?|mailto|tel|sms|tg|whatsapp|geo):/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * A href that is safe to render: relative paths, "#anchors", "?query" and
 * http(s)/mailto/tel/sms links pass; any other scheme becomes undefined.
 * Browsers ignore tabs/newlines and leading control characters inside a
 * scheme ("java\tscript:"), so the check runs on the stripped text.
 */
export const safeHref = (href: unknown): string | undefined => {
  if (typeof href !== "string") return undefined;
  const trimmed = href.trim();
  if (!trimmed) return undefined;
  // eslint-disable-next-line no-control-regex
  const probe = trimmed.replace(/[\u0000- \u007f-\u009f]/g, "");
  if (HAS_SCHEME.test(probe) && !SAFE_SCHEMES.test(probe)) return undefined;
  return trimmed;
};

/**
 * A same-origin path to navigate to after an action (login, payment, an AI
 * "open page" card): it must start with a single "/" and name no host
 * ("//evil.com", "/\\evil.com" leave the site). Anything else -> fallback.
 */
export const safeLocalPath = <F extends string | undefined = undefined>(
  path: unknown,
  fallback?: F,
): string | F => {
  if (typeof path !== "string") return fallback as F;
  // eslint-disable-next-line no-control-regex
  const p = path.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!p.startsWith("/") || p.startsWith("//") || p.startsWith("/\\")) return fallback as F;
  return p;
};

/** An external page the browser is sent to (payment gateway, OAuth): https only. */
export const safeExternalUrl = (url: unknown): string | undefined => {
  if (typeof url !== "string") return undefined;
  try {
    const u = new URL(url.trim(), typeof window !== "undefined" ? window.location.href : undefined);
    if (u.protocol === "https:") return u.toString();
    // same-origin (e.g. a local wallet result page, or http in development)
    if (typeof window !== "undefined" && u.origin === window.location.origin) return u.toString();
  } catch {}
  return undefined;
};
