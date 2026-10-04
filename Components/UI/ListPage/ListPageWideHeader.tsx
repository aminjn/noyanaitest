import { ReactNode } from "react";
import classes from "./ListPageWideHeader.module.css";
import Ixon from "../Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import InfoCircleIcon from "@/Components/Icons/InfoiCircleIcon";
import Button from "../Button";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { tsmMedium, tsmRegular, txlMedium, txsMedium } from "../Typography";
import Link from "@/Components/i18n/Link";
// medicallyReviewedByX / medicallyReviewedByXOnY: the review line
import { ContentKey } from "@/Components/Enums/contentKeys";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
const ListPageWideHeader = ({
  icon,
  name,
  category,
  summary,
  primaryAction,
  secondaryAction,
  reviewer,
  pendingReview,
}: {
  icon: ReactNode;
  name: string;
  category?: { title: string; value: string };
  summary?: string;
  // every action goes somewhere (they used to be buttons with no handler)
  primaryAction: { title: string; href: string };
  secondaryAction: { title: string; href: string };
  // the doctor who medically reviewed the page; the shield is shown only
  // then (it used to be drawn on every page, a trust mark nobody earned)
  reviewer?: { name: string; href?: string; date?: string | Date };
  // AI drafted some of the text and no doctor has reviewed it since: a
  // small note in place of the review line (medicalReviewPending)
  pendingReview?: boolean;
}) => {
  const getContent = useScopedLocale();
  const intlLocale = useIntlLocale();
  const reviewedOn = (() => {
    if (!reviewer?.date) return "";
    const date = new Date(reviewer.date);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(intlLocale, { dateStyle: "medium" });
  })();
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.icon}>
          <Ixon width="2.25rem">{icon}</Ixon>
        </div>
        <div className={classes.content}>
          <div className={classes.titleBox}>
            <h1 className={`${classes.h1} ${txlMedium}`}>{name}</h1>
            {!!reviewer && (
              <Ixon width="1.5rem" className={classes.shield}>
                <ShieldCheckIcon />
              </Ixon>
            )}
          </div>
          {!!reviewer && (
            <span className={`${classes.reviewer} ${txsMedium}`}>
              {reviewedOn
                ? getContent("medicallyReviewedByXOnY", [reviewer.name, reviewedOn])
                : getContent("medicallyReviewedByX", [reviewer.name])}
              {!!reviewer.href && (
                <Link href={reviewer.href} className={classes.reviewerLink}>
                  {getContent("seeProfile")}
                </Link>
              )}
            </span>
          )}
          {!reviewer && !!pendingReview && (
            <span className={`${classes.reviewer} ${classes.pending} ${txsMedium}`}>
              {getContent("aiDraftAwaitingReview")}
            </span>
          )}
          {!!category?.value && (
            <legend
              className={`${classes.category} ${tsmMedium}`}
            >{`${category.title} : ${category.value}`}</legend>
          )}
        </div>
        <Ixon className={classes.info} width="1.5rem">
          <InfoCircleIcon />
        </Ixon>
      </div>
      {!!summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{summary}</p>
      )}
      <div className={classes.actions}>
        <Button variant="Primary" mode="Outline" size="L" radius="Medium" href={secondaryAction.href}>
          {secondaryAction.title}
        </Button>
        <Button
          variant="Primary"
          mode="Fill"
          size="L"
          radius="Medium"
          tailIcon={<ArrowLeftIcon />}
          href={primaryAction.href}
        >
          {primaryAction.title}
        </Button>
      </div>
    </div>
  );
};

export default ListPageWideHeader;

// the header's reviewer from an encyclopedia record (reviewedBy is the
// populated doctor, or missing when nobody reviewed the page)
export const medicalReviewerOf = (node: {
  reviewedBy?: unknown;
  reviewedAt?: string;
}) => {
  const doctor = node.reviewedBy as
    | { _id?: string; firstName?: string; lastName?: string; slug?: string }
    | undefined
    | null;
  if (!doctor || typeof doctor !== "object") return undefined;
  const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ");
  if (!name) return undefined;
  return {
    name,
    href: doctor.slug || doctor._id ? `/dr/${doctor.slug || doctor._id}` : undefined,
    date: node.reviewedAt,
  };
};

// some of the text was drafted by AI and no doctor reviewed it since
export const medicalReviewPending = (node: {
  aiDrafted?: boolean;
  reviewedBy?: unknown;
  reviewedAt?: string;
}) => !!node.aiDrafted && !medicalReviewerOf(node);
