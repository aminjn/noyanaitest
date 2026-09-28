"use client";

import { ReactNode } from "react";
import classes from "./ComingSoon.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";

const NS: ContentNamespace[] = ["common", "doctorPanelStub"];

// Placeholder for doctor-panel features without a backend yet: says what
// the page will do and points to the closest thing that works today.
const ComingSoon = ({
  title,
  target,
  text,
  icon,
  cta,
}: {
  title: ContentKey;
  target: string;
  text: ContentKey;
  icon: ReactNode;
  cta?: { label: ContentKey; href: string };
}) => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent(title), target },
  ]);
  return (
    <section className={classes.main}>
      <span className={classes.icon}>
        <Ixon width="1.75rem">{icon}</Ixon>
      </span>
      <span className={classes.badge}>{getContent("csSoon")}</span>
      <h1 className={classes.title}>{getContent(title)}</h1>
      <p className={classes.text}>{getContent(text)}</p>
      {!!cta && (
        <Link href={cta.href} className={classes.cta}>
          {getContent(cta.label)}
        </Link>
      )}
    </section>
  );
};

export default ComingSoon;
