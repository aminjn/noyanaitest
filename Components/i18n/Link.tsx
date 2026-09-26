"use client";

// next/link that keeps the current language: internal string hrefs get the
// "/<locale>" prefix (Persian stays unprefixed).
import NextLink from "next/link";
import { ComponentProps, forwardRef } from "react";
import { useLocale } from "./navigation";
import { localizePath } from "./locales";

type Props = ComponentProps<typeof NextLink>;

const Link = forwardRef<HTMLAnchorElement, Props>(({ href, ...props }, ref) => {
  const locale = useLocale();
  const localized =
    typeof href === "string"
      ? localizePath(href, locale)
      : href.pathname
        ? { ...href, pathname: localizePath(href.pathname, locale) }
        : href;
  return <NextLink ref={ref} href={localized} {...props} />;
});

Link.displayName = "Link";

export default Link;
