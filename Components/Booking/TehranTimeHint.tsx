"use client";

import { useLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./TehranTimeHint.module.css";

// Booking times are the clinic's, Tehran time (2026-10): a reader of another
// language, often outside Iran, is told so next to the slots. Persian
// readers see the times as they are.
const TehranTimeHint = ({ ns, className = "" }: { ns: ContentNamespace[]; className?: string }) => {
  const locale = useLocale();
  const getContent = useScopedLocale(ns);
  if (locale === "fa") return null;
  return <small className={`${classes.hint} ${className}`}>{getContent("timesInTehranTime")}</small>;
};

export default TehranTimeHint;
