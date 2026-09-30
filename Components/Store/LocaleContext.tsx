"use client";

import { createContext } from "react";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import { defaultLocale, Locale, locales } from "../i18n/locales";

// Holds whatever text content has been loaded for the current subtree.
// Populated only by LocaleScopeProvider: the root layout provides the app
// chrome's namespaces and each page/layout nests its own on top.
// (The old LocaleContextProvider, which loaded the entire TextContent
// document for every page, has been removed.)
const LocaleContext = createContext<{
  textContent: Partial<ITextContent>;
  locale: Locale;
  // languages the site serves right now (super admin "Site languages")
  enabledLocales: readonly Locale[];
  // the super admin's default language (unprefixed URLs, the admin panel)
  siteDefaultLocale: Locale;
}>({
  textContent: {},
  locale: defaultLocale,
  enabledLocales: locales,
  siteDefaultLocale: defaultLocale,
});

export default LocaleContext;
