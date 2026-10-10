import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Layout from "@/Components/Layout/Layout";
import { PopupContextProvider } from "@/Components/Store/PopupContext";
import { NotificationContextProvider } from "@/Components/Store/NotificationContext";
import { ProgressContextProvider } from "@/Components/Store/ProgressContext";
import { BreadCrumpContextProvider } from "@/Components/Store/BreadCrumpStore";
import { SockectContextProvider } from "@/Components/Store/SocketContext";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { putServerMessages } from "@/Components/i18n/messagesStore";
import { createHash } from "crypto";
import { getMessages } from "@/Components/i18n/getMessages";
import { getSiteLocales } from "@/Components/i18n/getEnabledLocales";
import AdminTextProvider from "@/Components/Admin/i18n/AdminTextProvider";
import { loadAdminDictionary } from "@/Components/Admin/i18n/loadAdminDictionary";
import { setAdminDictionary } from "@/Components/Admin/i18n/adminText";
import { headers } from "next/headers";
import { themeInitScript } from "@/Components/UI/Theme/theme";
import { installTehranTimeZone, tehranTimeZoneInitScript } from "@/Components/helpers/tehranTime";
import { localeAlternates } from "@/Components/i18n/alternates";
import {
  isLocale,
  LOCALE_HEADER,
  PATH_HEADER,
  setSiteDefaultLocale,
  localeDir,
} from "@/Components/i18n/locales";

// Dates render in Tehran time on the server too, whatever its zone
// (Components/helpers/tehranTime.ts)
installTehranTimeZone();

const font = localFont({
  src: "./fonts/IRANYekanXVFaNumVF.woff",
  variable: "--fontFa",
  weight: "100 900",
});

const baseMetadata: Metadata = {
  applicationName: "NoyanAI",
  manifest: "/manifest.json",
  // app/favicon.ico is picked up automatically by Next; these add the
  // modern/high-res variants alongside it.
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "NoyanAI",
    statusBarStyle: "default",
  },
};

// Site-wide defaults in the visitor's language: a page with its own title
// (a doctor, a pharmacy, an article...) reads "<page> | <brand>"; a page with
// no SEO entry at all still gets the real site title, never a placeholder.
export const generateMetadata = async (): Promise<Metadata> => {
  const site = await getSiteLocales();
  const headerLocale = headers().get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : site.default;
  const messages = await getMessages(locale);
  const brand = messages.aboutTitleNoyan || "NoyanAI";
  return {
    ...baseMetadata,
    title: { default: messages.siteTitle || brand, template: `%s | ${brand}` },
    description: messages.footerText,
    alternates: localeAlternates(site.enabled),
  };
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteLocales();
  const headerLocale = headers().get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : site.default;
  // the super admin panel shows the site default: its texts' dictionary
  // (Components/Admin/i18n) is sent with admin pages only
  const path = headers().get(PATH_HEADER) || "";
  const adminKey = process.env.ADMIN_KEY;
  const isAdmin =
    !!adminKey && (path === `/${adminKey}` || path.startsWith(`/${adminKey}/`));
  const [messages, adminDict] = await Promise.all([
    getMessages(locale),
    isAdmin ? loadAdminDictionary(site.default) : Promise.resolve(null),
  ]);
  setSiteDefaultLocale(site.default);
  setAdminDictionary(adminDict);
  // the texts reach the browser as one cached script, not inside every
  // page (Components/i18n/messagesStore.ts); server rendering reads them here
  putServerMessages(locale, messages);
  const messagesVersion = createHash("sha1").update(JSON.stringify(messages)).digest("hex").slice(0, 12);

  // No <Suspense> around the tree: it used to be here only because
  // ProgressContextProvider called useSearchParams(), and its fallback
  // (<Layout> without any providers) is what reached the initial HTML —
  // header/footer with no text content. useSearchParams now lives in its own
  // small Suspense boundary inside ProgressContextProvider instead.
  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Tehran time for every formatted date, before any bundle runs */}
        <script dangerouslySetInnerHTML={{ __html: tehranTimeZoneInitScript }} />
        {/* parser-blocking on purpose: the texts are there before hydration */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src={`/i18n/${locale}.${messagesVersion}.js`} />
      </head>
      <body className={font.variable}>
        <LocaleScopeProvider
          locale={locale}
          enabledLocales={site.enabled}
          siteDefaultLocale={site.default}
        >
          <AdminTextProvider dict={adminDict}>
          <ProgressContextProvider>
            <NotificationContextProvider>
              <PopupContextProvider>
                <BreadCrumpContextProvider>
                  <SockectContextProvider>
                    <Layout>{children}</Layout>
                  </SockectContextProvider>
                </BreadCrumpContextProvider>
              </PopupContextProvider>
            </NotificationContextProvider>
          </ProgressContextProvider>
          </AdminTextProvider>
        </LocaleScopeProvider>
      </body>
    </html>
  );
}
