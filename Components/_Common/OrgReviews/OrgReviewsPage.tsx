"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import classes from "./OrgReviewsPage.module.css";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  ProviderReply,
  ReviewBasisKind,
  ReviewReply,
  VerifiedBadge,
} from "@/Components/Comment/ReviewBits";

const NS: ContentNamespace[] = ["common", "orgReviews"];

type Review = {
  _id: string;
  content?: string;
  score?: number;
  createdAt?: string;
  author?: { username?: string; identity?: { givenName?: string; lastName?: string } };
  verified?: boolean;
  verifiedKind?: ReviewBasisKind;
  verifiedAt?: string | null;
  reply?: ReviewReply;
};
type Reviews = { items: Review[]; count: number; average: number; rated?: boolean; canReply?: boolean };

type ReviewKind = "clinic" | "hospital" | "paraClinic" | "insurance" | "doctor";

// the provider's one public answer to a review (2026-10)
const ReplyForm = ({ kind, id, onDone }: { kind: ReviewKind; id: string; onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open)
    return (
      <div className={classes.replyActions}>
        <Button size="S" mode="Outline" onClick={() => setOpen(true)}>
          {getContent("replyPublicly")}
        </Button>
      </div>
    );
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/${kind}/review/${id}/reply`,
        method: "POST",
        bodyParser: "JSON",
        payload: { content: text.trim() },
      });
      pushNotification(getContent("replySent"), "Success");
      setOpen(false);
      await onDone();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={classes.replyForm}>
      <textarea
        className={classes.replyArea}
        value={text}
        maxLength={1000}
        onChange={(e) => setText(e.target.value)}
        placeholder={getContent("replyPlaceholder")}
      />
      <div className={classes.replyActions}>
        <Button size="S" variant="Primary" onClick={send} isLoading={busy}>
          {getContent("sendReply")}
        </Button>
        <Button size="S" variant="Neutral" mode="Outline" onClick={() => setOpen(false)}>
          {getContent("cancel")}
        </Button>
      </div>
    </div>
  );
};

// A centre's (or a doctor's) published reviews and average score
// (2026-10): the verified reviews behind the public score, each with its
// visit / purchase badge; the owner answers each one publicly, once.
// Moderation stays with the super admin.
const OrgReviewsPage = ({ kind, panel }: { kind: ReviewKind; panel: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }), [intlTag]);
  const date = useMemo(() => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }), [intlTag]);
  const { data, error, mutate } = useSWR<Reviews>(`${API}/${kind}/review`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  useBreadCrump([
    { title: getContent("dashboard"), target: `/${panel}` },
    { title: getContent("orgReviewsTitle"), target: `/${panel}/review` },
  ]);
  const items = Array.isArray(data?.items) ? data.items : [];
  const rated = data?.rated !== false;
  // the display name, or first name and last initial (never the full name)
  const who = (r: Review) =>
    r.author?.username ||
    [r.author?.identity?.givenName, r.author?.identity?.lastName ? `${r.author.identity.lastName.charAt(0)}.` : ""]
      .filter(Boolean)
      .join(" ") ||
    "—";

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <h1 className={classes.title}>{getContent("orgReviewsTitle")}</h1>
            {!!data.count && rated && (
              <span className={classes.average}>
                ★ {getContent("orgReviewsAverage", [num.format(data.average || 0), num.format(data.count)])}
              </span>
            )}
          </div>
          <p className={classes.hint}>{getContent("orgReviewsHint")}</p>
          {!items.length ? (
            <p className={classes.empty}>{getContent("orgReviewsEmpty")}</p>
          ) : (
            <ul className={classes.list}>
              {items.map((r) => (
                <li key={r._id} className={classes.card}>
                  <div className={classes.cardHead}>
                    <InitialAvatar name={who(r)} seed={r._id} size="2.25rem" />
                    <strong>{who(r)}</strong>
                    {rated && (
                      <span className={classes.score}>{"★".repeat(Math.max(0, Math.min(5, Number(r.score) || 0)))}</span>
                    )}
                    {!!r.createdAt && <span className={classes.date}>{safeFormatDate(date, r.createdAt)}</span>}
                  </div>
                  {r.verified && <VerifiedBadge kind={r.verifiedKind} at={r.verifiedAt} />}
                  {!!r.content && <p className={classes.content}>{r.content}</p>}
                  <ProviderReply reply={r.reply} />
                  {!r.reply?.content && data.canReply && (
                    <ReplyForm kind={kind} id={r._id} onDone={() => mutate()} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default OrgReviewsPage;
