import { NextResponse, NextRequest } from "next/server";
import { getPublicData } from "./Components/helpers/getPublicData";
import { IShortLink } from "./Components/Admin/ShortLink/AdminManageShortLinksPage";
import { IRedirection } from "./Components/Admin/Redirection/AdminManageRedirectionsPage";
import {
  isEnabledLocale,
  LOCALE_HEADER,
  localizePath,
  splitLocale,
} from "./Components/i18n/locales";

const middleware = async (req: NextRequest) => {
  // "/en/doctors" -> serve "/doctors" in English; "/fa/x" and "/x" are
  // Persian. The page tree itself has no locale segment.
  const { locale, path: pathname } = splitLocale(req.nextUrl.pathname);

  // Not translated yet -> the Persian page (no prefix), not a half-done LTR
  // one. The super admin panel is Persian-only as well.
  const adminKey = process.env.ADMIN_KEY;
  const isAdmin =
    !!adminKey && (pathname === `/${adminKey}` || pathname.startsWith(`/${adminKey}/`));
  if (locale !== "fa" && (!isEnabledLocale(locale) || isAdmin)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url, 307);
  }

  if (pathname.startsWith("/l/")) {
    const match = pathname.match(/^\/l\/([^/]+)$/);
    if (match) {
      const token = match[1];
      const data = await getPublicData<IShortLink>(
        `shortlink/${encodeURIComponent(token)}`,
      );
      if (data) return NextResponse.redirect(data.target, 301);
    }
  }
  const data = await getPublicData<IRedirection | null>("redirect", {
    path: pathname,
  });
  if (data)
    return NextResponse.redirect(
      new URL(localizePath(data.current, locale), req.url),
      data.statusCode,
    );

  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  if (pathname === req.nextUrl.pathname)
    return NextResponse.next({ request: { headers } });
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url, { request: { headers } });
};

// Skip Next internals, API proxying and static files (the redirect lookup
// above used to run for every JS/CSS/font request too).
export const config = {
  matcher: ["/((?!_next/|api/|files/|icons/|fonts/|favicon.ico|manifest.json|sw.js|.*\\.[a-zA-Z0-9]+$).*)"],
};

export default middleware;
