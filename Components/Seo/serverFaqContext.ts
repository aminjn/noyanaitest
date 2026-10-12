import { getServerContent, getServerLocale } from "../i18n/serverContent";
import { intlLocale, listSeparator } from "../i18n/locales";
import { FaqContext } from "./autoFaq";

// The auto-FAQ wording context of a server component: the request's
// language, its Intl tag (useIntlLocale's server twin) and list separator.
export const getServerFaqContext = async (): Promise<FaqContext> => {
  const locale = getServerLocale();
  const t = await getServerContent();
  return { t, intl: intlLocale[locale], sep: listSeparator(locale) };
};
