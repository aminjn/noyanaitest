import { cache } from "react";
import { headers } from "next/headers";
import { ContentKey } from "../Enums/contentKeys";
import { getMessages } from "./getMessages";
import { defaultLocale, isLocale, Locale, LOCALE_HEADER } from "./locales";

// Server components: the request's language (set by middleware).
export const getServerLocale = (): Locale => {
  try {
    const locale = headers().get(LOCALE_HEADER);
    return isLocale(locale) ? locale : defaultLocale;
  } catch {
    return defaultLocale;
  }
};

const messagesFor = cache((locale: Locale) => getMessages(locale));

// Server-side counterpart of useLocale(): same lookup and ${n} filling.
export const getServerContent = async () => {
  const messages = await messagesFor(getServerLocale());
  return (key: ContentKey, vars?: string[]) => {
    let result = messages[key] === undefined ? key : messages[key];
    (vars || []).forEach((value, i) => {
      result = result.replaceAll("$" + "{" + (i + 1) + "}", value);
    });
    return result;
  };
};
