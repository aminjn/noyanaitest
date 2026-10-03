import { NextResponse, NextRequest } from "next/server";
import { getPublicData } from "./Components/helpers/getPublicData";
import { IShortLink } from "./Components/Admin/ShortLink/AdminManageShortLinksPage";
import { IRedirection } from "./Components/Admin/Redirection/AdminManageRedirectionsPage";
import { getSiteLocales } from "./Components/i18n/getEnabledLocales";
import { legacyAdminTarget } from "./Components/Admin/legacyAdminPages";
import {
  LOCALE_HEADER,
  PATH_HEADER,
  localizePath,
  splitLocale,
} from "./Components/i18n/locales";

const middleware = async (req: NextRequest) => {
  // "/en/doctors" -> serve "/doctors" in English; "/x" and "/<default>/x"
  // are the site default (set by the super admin). The page tree itself has
  // no locale segment.
  const site = await getSiteLocales();
  const { locale, path: pathname } = splitLocale(
    req.nextUrl.pathname,
    site.default,
  );

  // A language the super admin switched off -> the same page in the
  // default language (no prefix). The super admin panel always shows the
  // default language, whatever the visitor picked.
  const adminKey = process.env.ADMIN_KEY;
  const isAdmin =
    !!adminKey && (pathname === `/${adminKey}` || pathname.startsWith(`/${adminKey}/`));
  if (
    locale !== site.default &&
    (isAdmin || !site.enabled.includes(locale))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url, 307);
  }

  // an admin page that moved into a tab of another one
  if (isAdmin) {
    const target = legacyAdminTarget(pathname.slice(adminKey!.length + 1));
    if (target !== null) {
      const url = new URL(`/${adminKey}/${target}`, req.url);
      req.nextUrl.searchParams.forEach((v, k) => {
        if (!url.searchParams.has(k)) url.searchParams.set(k, v);
      });
      return NextResponse.redirect(url, 307);
    }
  }

  if (pathname.startsWith("/l/")) {
    const match = pathname.match(/^\/l\/([^/]+)$/);
    if (match) {
      const token = match[1];
      const data = await getPublicData<IShortLink>(
        `shortlink/${encodeURIComponent(token)}`,
      );
      // 302: a short link can be re-pointed later, so browsers must not cache it
      if (data) return NextResponse.redirect(data.target, 302);
    }
  }
  const data = await getPublicData<IRedirection | null>("redirect", {
    path: pathname,
  });
  if (data)
    return NextResponse.redirect(
      new URL(localizePath(data.current, locale, site.default), req.url),
      data.statusCode,
    );

  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  headers.set(PATH_HEADER, pathname);
  // No rewrite here: the "/<locale>" prefix is stripped by next.config's
  // rewrites (see the note there on why a middleware rewrite 500s behind
  // nginx). The page still gets the locale / path through these headers.
  return NextResponse.next({ request: { headers } });
};

// Skip Next internals, API proxying and static files (the redirect lookup
// above used to run for every JS/CSS/font request too).
export const config = {
  matcher: ["/((?!_next/|api/|files/|icons/|fonts/|favicon.ico|manifest.json|sw.js|.*\\.[a-zA-Z0-9]+$).*)"],
};

export default middleware;
