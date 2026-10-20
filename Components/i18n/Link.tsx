"use client";

// next/link that keeps the current language: internal string hrefs get the
// "/<locale>" prefix (Persian stays unprefixed).
import NextLink from "next/link";
import { ComponentProps, forwardRef } from "react";
import { useLocale } from "./navigation";
import { localizePath } from "./locales";
import { safeHref } from "../helpers/safeHref";

type Props = ComponentProps<typeof NextLink>;

const Link = forwardRef<HTMLAnchorElement, Props>(({ href, ...props }, ref) => {
  const locale = useLocale();
  const localized =
    typeof href === "string"
      ? // a stored link (rich text, ad, notification) never runs script
        localizePath(href.trim() ? (safeHref(href) ?? "#") : href, locale)
      : href.pathname
        ? { ...href, pathname: localizePath(href.pathname, locale) }
        : href;
  return <NextLink ref={ref} href={localized} {...props} />;
});

Link.displayName = "Link";

export default Link;
