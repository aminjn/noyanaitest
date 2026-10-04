"use client";

import { useMemo } from "react";
import classes from "./ReviewBits.module.css";
import BadgeCheckIcon from "../Icons/BadgeCheckIcon";
import useLocale from "../Hooks/useLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { safeFormatDate } from "../helpers/safeFormatDate";
import { ContentKey } from "../Enums/contentKeys";

// Verified reviews (2026-10, Zocdoc / Doctolib / Digikala): the badge on a
// review backed by a completed visit or a delivered order, with its month,
// and the provider's one public reply under it.

export type ReviewBasisKind = "visit" | "purchase";

export type ReviewReply = { content?: string; at?: string | Date } | null | undefined;

export const VerifiedBadge = ({
  kind,
  at,
}: {
  kind?: ReviewBasisKind | string | null;
  at?: string | Date | null;
}) => {
  const getContent = useLocale();
  const intlTag = useIntlLocale();
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { year: "numeric", month: "long" }),
    [intlTag],
  );
  const month = safeFormatDate(fmt, at, "");
  const key = (kind === "purchase" ? "verifiedPurchaseBadge" : "verifiedVisitBadge") as ContentKey;
  const label = getContent(key, [month]).replace(/[\s·،,-]+$/, "");
  return (
    <span className={classes.badge}>
      <BadgeCheckIcon />
      {label}
    </span>
  );
};

export const ProviderReply = ({ reply }: { reply: ReviewReply }) => {
  const getContent = useLocale();
  const intlTag = useIntlLocale();
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { year: "numeric", month: "long", day: "numeric" }),
    [intlTag],
  );
  if (!reply || typeof reply.content !== "string" || !reply.content.trim()) return null;
  return (
    <div className={classes.reply}>
      <div className={classes.replyHead}>
        <span>{getContent("providerReplyTitle" as ContentKey)}</span>
        <span className={classes.replyDate}>{safeFormatDate(fmt, reply.at, "")}</span>
      </div>
      <p className={classes.replyText}>{reply.content}</p>
    </div>
  );
};
