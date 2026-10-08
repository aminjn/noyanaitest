"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo } from "react";
import classes from "./ReviewBits.module.css";
import BadgeCheckIcon from "../Icons/BadgeCheckIcon";
import useLocale from "../Hooks/useLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { formatMonthYear, safeFormatDate } from "../helpers/safeFormatDate";
import { ContentKey } from "../Enums/contentKeys";
import { knownReviewTags, negativeReviewTags, reviewTagContentKey } from "./reviewTags";

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
  const month = formatMonthYear(intlTag, at, "");
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
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, year: "numeric", month: "long", day: "numeric" }),
    [intlTag],
  );
  if (!reply || typeof reply.content !== "string" || !reply.content.trim()) return null;
  return (
    <div className={classes.reply}>
      <div className={classes.replyHead}>
        <span>{getContent("providerReplyTitle")}</span>
        <span className={classes.replyDate}>{safeFormatDate(fmt, reply.at, "")}</span>
      </div>
      <p className={classes.replyText}>{reply.content}</p>
    </div>
  );
};

// The quick tags of a seller review (pharmacy / lab): read-only chips on a
// review, chips with a count in the page summary, or toggles in the form.
export const ReviewTagChips = ({
  tags,
  counts,
  selected,
  onToggle,
}: {
  tags: unknown;
  counts?: Record<string, number>;
  selected?: string[];
  onToggle?: (tag: string) => void;
}) => {
  const getContent = useLocale();
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const list = knownReviewTags(tags).filter((t) => !counts || (counts[t] || 0) > 0);
  if (!list.length) return null;
  return (
    <div className={classes.tags}>
      {list.map((tag) => {
        const label = getContent(reviewTagContentKey[tag]);
        const tone = negativeReviewTags.has(tag) ? classes.tagNegative : "";
        if (onToggle) {
          const on = !!selected?.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              className={`${classes.tag} ${classes.tagToggle} ${tone} ${on ? classes.tagOn : ""}`}
              onClick={() => onToggle(tag)}
            >
              {label}
            </button>
          );
        }
        return (
          <span key={tag} className={`${classes.tag} ${tone}`}>
            {label}
            {!!counts && <span className={classes.tagCount}>{num.format(counts[tag] || 0)}</span>}
          </span>
        );
      })}
    </div>
  );
};
