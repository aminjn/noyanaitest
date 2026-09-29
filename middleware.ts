import { NextResponse, NextRequest } from "next/server";
import { getPublicData } from "./Components/helpers/getPublicData";
import { IShortLink } from "./Components/Admin/ShortLink/AdminManageShortLinksPage";
import { IRedirection } from "./Components/Admin/Redirection/AdminManageRedirectionsPage";
import { getEnabledLocales } from "./Components/i18n/getEnabledLocales";
import {
  LOCALE_HEADER,
  PATH_HEADER,
  localizePath,
  splitLocale,
} from "./Components/i18n/locales";

const middleware = async (req: NextRequest) => {
  // "/en/doctors" -> serve "/doctors" in English; "/fa/x" and "/x" are
  // Persian. The page tree itself has no locale segment.
  const { locale, path: pathname } = splitLocale(req.nextUrl.pathname);

  // A language the super admin switched off -> the Persian page (no
  // prefix). The super admin panel is Persian-only as well.
  const adminKey = process.env.ADMIN_KEY;
  const isAdmin =
    !!adminKey && (pathname === `/${adminKey}` || pathname.startsWith(`/${adminKey}/`));
  if (
    locale !== "fa" &&
    (isAdmin || !(await getEnabledLocales()).includes(locale))
  ) {
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
      // 302: a short link can be re-pointed later, so browsers must not cache it
      if (data) return NextResponse.redirect(data.target, 302);
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
