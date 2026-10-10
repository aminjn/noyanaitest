"use client";

import { ReactNode, useContext } from "react";
import LocaleContext from "./LocaleContext";
import { readMessages } from "../i18n/messagesStore";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { Locale, setSiteDefaultLocale } from "../i18n/locales";

// The root layout renders the only real provider: all texts of the current
// language (Components/i18n/getMessages) plus the locale. Nested usages from
// pages are passthroughs now - kept so the ~300 page files don't need
// touching; their namespaces/initialTextContent props are ignored.
const LocaleScopeProvider = ({
  children,
  initialTextContent,
  locale,
  enabledLocales,
  siteDefaultLocale,
}: {
  children: ReactNode;
  namespaces?: ContentNamespace[];
  initialTextContent?: Partial<ITextContent>;
  locale?: Locale;
  enabledLocales?: readonly Locale[];
  // the super admin's default language (root layout only): unprefixed URLs
  // and the links built in the browser follow it
  siteDefaultLocale?: Locale;
}) => {
  const parent = useContext(LocaleContext);
  if (siteDefaultLocale) setSiteDefaultLocale(siteDefaultLocale);
  if (!locale) return <>{children}</>;
  return (
    <LocaleContext.Provider
      value={{
        // the root's texts come from the cached script / the server slot
        // (Components/i18n/messagesStore.ts), never as a serialized prop
        textContent:
          initialTextContent ||
          (Object.keys(parent.textContent || {}).length
            ? parent.textContent
            : (readMessages(locale) as Partial<ITextContent>)),
        locale,
        enabledLocales: enabledLocales || parent.enabledLocales,
        siteDefaultLocale: siteDefaultLocale || parent.siteDefaultLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleScopeProvider;
