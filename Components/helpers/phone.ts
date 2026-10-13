// Iranian mobile numbers, typed in any script.
//
// The site keeps a mobile as its 10 national digits without the leading 0
// ("9122862184", what `isMobile` checks and what the auth calls prefix with
// 0); the backend stores it as 98 + those digits ("989122862184").

// Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII, everything else kept
export const toLatinDigits = (str: string) =>
  String(str ?? "")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

// What the visitor typed or pasted ("0912 286 2184", "+98 912…", "۰۹۱۲…")
// as the 10 national digits. A lone "0" is kept so typing 0912 does not
// look like the first key was swallowed.
export const toNationalMobile = (raw: string) => {
  let d = toLatinDigits(raw).replace(/\D/g, "");
  if (d === "0") return d;
  if (d.startsWith("0098")) d = d.slice(4);
  else if (d.startsWith("98") && d.length > 10) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
};

// "9122862184" -> "912 286 2184" (as it is typed after the +98 chip)
export const groupNationalMobile = (d: string) =>
  [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");

// A stored phone ("989122862184", "09122862184", "9122862184") for people:
// "0912 286 2184". Anything that is not an Iranian mobile comes back as is.
export const formatMobile = (phone: string | undefined | null) => {
  const raw = toLatinDigits(String(phone ?? "")).replace(/\D/g, "");
  const d = raw.startsWith("98") && raw.length === 12 ? raw.slice(2) : raw.startsWith("0") && raw.length === 11 ? raw.slice(1) : raw;
  if (d.length !== 10 || !d.startsWith("9")) return String(phone ?? "");
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

// LTR isolate, so a number inside a Persian/Arabic sentence keeps its order
export const ltrIsolate = (s: string) => `⁦${s}⁩`;
