import { ContentKey } from "./contentKeys";

// Groups of ContentKeys that a given page/section actually needs.
//
// This is additive to contentKeys.tsx (which stays the single source of
// truth for every valid key) — it does not replace or change it. A key can
// appear in more than one namespace if it's genuinely shared.
//
// Only "common" and "home" are filled in for now, as a reference example.
// The rest of the ~1200 keys can be grouped into more namespaces the same
// way, page by page.
export const contentNamespaces = {
  // Keys used by sitewide chrome (header/footer/shared UI) that most pages
  // end up needing regardless of what namespace they belong to. Kept small
  // on purpose — this is just a starter set to illustrate the pattern.
  common: [
    "loading",
    "cancel",
    "submit",
    "close",
    "back",
    "confirm",
    "yes",
    "no",
  ],

  // Every key actually referenced by Components/Home/*.tsx (HomeHero,
  // HomeSpecialities, HomeServices, HomePopular, HomeAds, HomeRegister,
  // HomeIntroduction), found by grepping their getContent(...) calls.
  home: [
    "homeHeroTitle",
    "homeHeroLegend",
    "chatWithAi",
    "reserveABooking",
    "homeChatLegend",
    "aiInputPlaceholder",
    "homeAiExamplesLegend",
    "noyanIntroductionTitle",
    "noyanIntroductionLegend",
    "mostViewedSpecialities",
    "seeAll",
    "greatest",
    "goToPage",
    "HomeAdTitle",
    "homeAdSubtitle",
    "homeAdDescription",
    "onlineBooking",
    "popularDoctors",
    "noyanClinicalServicesTitle",
    "noyanClinicalServicesDescription",
    "seeAllClinicalServices",
    "bestCliniclaServices",
    "registerTitle",
    "registerDescription",
    "registerDoctorsAndClinics",
    "weHaveTooManyUsers",
  ],
} as const satisfies Record<string, readonly ContentKey[]>;

export type ContentNamespace = keyof typeof contentNamespaces;

// Flattens one or more namespaces into a deduped list of ContentKeys, e.g.
// getNamespaceKeys(["common", "home"]).
export const getNamespaceKeys = (
  namespaces: ContentNamespace[],
): ContentKey[] => {
  const set = new Set<ContentKey>();
  for (const ns of namespaces) {
    for (const key of contentNamespaces[ns]) set.add(key);
  }
  return Array.from(set);
};
