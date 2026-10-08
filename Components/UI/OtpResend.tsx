"use client";
import { useEffect, useState } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import classes from "./OtpResend.module.css";

const NS: ContentNamespace[] = ["common"];

// What POST /auth (and /auth/signup) answers: the real wait before another
// SMS, and whether this tap sent one (a code sent a moment ago is not sent
// again - the patient enters that one).
export type OtpSendReply = { data?: { sent?: boolean; retryAfter?: number } };

export const otpWait = (reply: OtpSendReply | undefined) => {
  const n = Number(reply?.data?.retryAfter);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.ceil(n), 3600) : 60;
};

// The countdown under a code input, then "resend code". `startedAt` changes
// on every send so the clock restarts; `wait` is the server's retryAfter.
const OtpResend = ({
  wait,
  startedAt,
  recent,
  isLoading,
  onResend,
}: {
  wait: number;
  startedAt: number;
  recent?: boolean;
  isLoading?: boolean;
  onResend: () => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intl = useIntlLocale();
  const [left, setLeft] = useState(wait);

  useEffect(() => {
    const end = startedAt + wait * 1000;
    const tick = () => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [wait, startedAt]);

  const two = new Intl.NumberFormat(intl, { minimumIntegerDigits: 2, useGrouping: false });
  const clock = `${two.format(Math.floor(left / 60))}:${two.format(left % 60)}`;

  return (
    <div className={classes.main}>
      {recent && <p className={classes.note}>{getContent("codeRecentlySent")}</p>}
      {left > 0 ? (
        <p className={classes.wait} aria-live="polite">
          <span dir="ltr" className={classes.clock}>{clock}</span> {getContent("untilCodeResend")}
        </p>
      ) : (
        <button type="button" className={classes.resend} onClick={onResend} disabled={isLoading}>
          {getContent("resendCode")}
        </button>
      )}
    </div>
  );
};

export default OtpResend;
