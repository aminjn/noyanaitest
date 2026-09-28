"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./VisitFeedbackCard.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import Button from "@/Components/UI/Button";
import StarIcon from "@/Components/Icons/StarIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "dashboardBooking"];

type MyFeedback = {
  overalScore: number;
  suggest: boolean;
  publicMessage?: string;
  status?: "Pending" | "Approved" | "Rejected";
} | null;

const statusKey = {
  Pending: "visitReviewPending",
  Approved: "visitReviewApproved",
  Rejected: "visitReviewRejected",
} as const;

export const Stars = ({ value, size = "1rem" }: { value: number; size?: string }) => (
  <span className={classes.stars} style={{ fontSize: size }} aria-hidden>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= Math.round(value) ? classes.on : classes.off}>
        <StarIcon />
      </span>
    ))}
  </span>
);

// Verified visit review (2026-09): shown on a completed booking, one per
// visit (POST /user/reservation/:id/feedback enforces it).
const VisitFeedbackCard = ({ reservationId }: { reservationId: string }) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const { data, mutate, isLoading } = useSWR<MyFeedback>(
    `${API}/user/reservation/${reservationId}/feedback`,
    (url: string) => fetcher({ url }).then((res) => res?.data ?? null),
  );

  const [score, setScore] = useState(0);
  const [suggest, setSuggest] = useState<boolean | null>(null);
  const [publicMessage, setPublicMessage] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return null;

  if (data)
    return (
      <section className={classes.card}>
        <h2 className={classes.title}>{getContent("visitReviewTitle")}</h2>
        <p
          className={
            data.status === "Rejected" ? classes.muted : classes.thanks
          }
        >
          {getContent(statusKey[data.status || "Pending"])}
        </p>
        <Stars value={data.overalScore} size="1.25rem" />
        {!!data.publicMessage && (
          <p className={classes.quote}>{data.publicMessage}</p>
        )}
      </section>
    );

  const submit = async () => {
    if (busy) return;
    if (!score || suggest === null)
      return pushNotification(getContent("visitReviewPickScore"), "Warn");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/user/reservation/${reservationId}/feedback`,
        method: "POST",
        payload: {
          overalScore: score,
          suggest,
          ...(publicMessage.trim() ? { publicMessage: publicMessage.trim() } : {}),
          ...(privateMessage.trim()
            ? { privateMessage: privateMessage.trim() }
            : {}),
        },
      });
      pushNotification(getContent("visitReviewThanks"), "Success");
      await mutate();
    } catch (err) {
      pushNotification(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={classes.card}>
      <h2 className={classes.title}>{getContent("visitReviewTitle")}</h2>
      <p className={classes.muted}>{getContent("visitReviewIntro")}</p>

      <div className={classes.field}>
        <span className={classes.label}>{getContent("visitReviewScore")}</span>
        <div className={classes.picker} role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={score === n}
              aria-label={`${n} / 5`}
              className={`${classes.pick} ${n <= score ? classes.on : classes.off}`}
              onClick={() => setScore(n)}
            >
              <StarIcon />
            </button>
          ))}
        </div>
      </div>

      <div className={classes.field}>
        <span className={classes.label}>
          {getContent("visitReviewRecommend")}
        </span>
        <div className={classes.choices}>
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              className={`${classes.choice} ${suggest === v ? classes.choiceOn : ""}`}
              onClick={() => setSuggest(v)}
            >
              {getContent(v ? "yes" : "no")}
            </button>
          ))}
        </div>
      </div>

      <label className={classes.field}>
        <span className={classes.label}>{getContent("visitReviewPublic")}</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={publicMessage}
          onChange={(e) => setPublicMessage(e.target.value)}
        />
      </label>

      <label className={classes.field}>
        <span className={classes.label}>{getContent("visitReviewPrivate")}</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={privateMessage}
          onChange={(e) => setPrivateMessage(e.target.value)}
        />
      </label>

      <div className={classes.actions}>
        <Button isLoading={busy} onClick={submit}>
          {getContent("visitReviewSubmit")}
        </Button>
      </div>
    </section>
  );
};

export default VisitFeedbackCard;
