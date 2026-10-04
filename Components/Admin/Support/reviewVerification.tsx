"use client";

import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

// Verified reviews (2026-10): what the moderation tables show about a
// review's proof - a completed visit or a delivered order (with its
// month), unverified legacy ones (kept out of the public score), or open
// Q&A without stars.
export type VerificationState = "visit" | "purchase" | "unverified" | "qa";

export const verificationLabel = (state: VerificationState) =>
  state === "visit"
    ? ta("ویزیت تأییدشده")
    : state === "purchase"
      ? ta("خرید تأییدشده")
      : state === "qa"
        ? ta("پرسش و پاسخ (بدون امتیاز)")
        : ta("تأییدنشده (در امتیاز حساب نمی‌شود)");

export const verificationMonth = (at: unknown) =>
  safeFormatDate(new Intl.DateTimeFormat(adminIntlTag(), { year: "numeric", month: "long" }), at, "");

export const VerificationCell = ({ state, at }: { state: VerificationState; at?: unknown }) => {
  const month = state === "visit" || state === "purchase" ? verificationMonth(at) : "";
  return (
    <span>
      {verificationLabel(state)}
      {month ? ` · ${month}` : ""}
    </span>
  );
};
