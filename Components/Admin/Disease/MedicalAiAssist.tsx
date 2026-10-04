"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import InlineLink from "../UI/InlineLink";
import useNotification from "@/Components/Hooks/useNotification";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./MedicalAiAssist.module.css";

// AI draft and AI check of an encyclopedia page (disease, drug, symptom),
// the editorial pattern of Healthline, Ada and Altibbi: the model drafts,
// a named doctor reviews, and nothing AI-written is shown as reviewed.
// - «پیش‌نویس با هوش مصنوعی» fills only the EMPTY text fields of the form
//   (backend Services/medicalContentAi.ts), marks the record `aiDrafted` and
//   clears the reviewer; nothing is saved until «ثبت».
// - «بررسی با هوش مصنوعی» lists likely errors and missing safety warnings
//   in what is written; it changes nothing.
// Drawn above the editor's fields through AdminRecordEditor `tools`.

export type MedicalKind = "disease" | "drug" | "symptom";

type Issue = {
  field: string;
  severity: "high" | "medium" | "low";
  message: string;
  suggestion?: string;
};

type Status = { configured: boolean; provider?: string; model?: string };

// the editor's titles of the fields the AI may write (same ta() texts as
// the forms)
const fieldTitles = (kind: MedicalKind): Record<string, string> =>
  kind === "drug"
    ? {
        description: ta("توضیحات"),
        prescribingInfo: ta("اطلاعات تجویز"),
        dosage: ta("دوز مصرفی"),
        sideEffects: ta("عوارض جانبی"),
        warning: ta("هشدار"),
        pregnancyWarning: ta("هشدار بارداری"),
        breastfeedingWarning: ta("هشدار شیردهی"),
        alcoholWarning: ta("هشدار الکل"),
        foodWarning: ta("هشدار غذایی"),
        overdosage: ta("مصرف بیش از حد"),
        clinicalPharmacology: ta("فارماکولوژی بالینی"),
        name: ta("نام"),
        summary: ta("خلاصه"),
      }
    : {
        description: ta("توضیحات"),
        pathophysiology: ta("پاتوفیزیولوژی"),
        naturalProgression: ta("سیر طبیعی"),
        possibleComplication: ta("عوارض احتمالی"),
        expectedPrognosis: ta("پیش‌آگهی"),
        name: ta("نام"),
        summary: ta("خلاصه"),
      };

const severityColor = { high: "Error", medium: "Warning", low: "Info" } as const;
const severityTitle = (s: Issue["severity"]) =>
  s === "high" ? ta("مهم") : s === "medium" ? ta("متوسط") : ta("جزئی");

// the unsaved text of the form (the server adds the saved record under it)
const textOf = (input: Record<string, unknown>) => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input || {}))
    if (typeof v === "string") out[k] = v;
  return out;
};

const MedicalAiAssist = <
  T extends { aiDrafted?: boolean; reviewedBy?: unknown },
>({
  kind,
  nodeId,
  node,
  input,
  fill,
}: {
  kind: MedicalKind;
  nodeId: string;
  node?: T;
  input: Partial<T>;
  fill: (values: Partial<T>) => void;
}) => {
  const pushNotification = useNotification();
  const { data: status } = useSWR<Status>(`${API}/admin/medical/ai/status`, (url: string) =>
    fetcher({ url }).then((res) => res?.data as Status),
  );
  const [busy, setBusy] = useState<"" | "draft" | "check">("");
  const [error, setError] = useState("");
  const [drafted, setDrafted] = useState<string[] | null>(null);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const titles = fieldTitles(kind);
  const titleOf = (key: string) => (key === "general" ? ta("کل صفحه") : titles[key] || key);

  const call = async (action: "ai-draft" | "ai-check") =>
    fetcher({
      url: `${API}/admin/medical/${kind}/${nodeId || "new"}/${action}`,
      method: "POST",
      payload: { record: textOf(input as Record<string, unknown>) },
    });

  const run = async (which: "draft" | "check") => {
    if (busy) return;
    setBusy(which);
    setError("");
    try {
      if (which === "draft") {
        const res = await call("ai-draft");
        const drafts = (res?.data?.drafts || {}) as Record<string, unknown>;
        const keys = Object.keys(drafts).filter((k) => typeof drafts[k] === "string" && drafts[k]);
        if (!keys.length) {
          setDrafted([]);
          pushNotification(
            Array.isArray(res?.data?.skipped) && res.data.skipped.length
              ? ta("هوش مصنوعی برای بخش‌های خالی متنی پیشنهاد نکرد")
              : ta("همه‌ی بخش‌ها پر است؛ هوش مصنوعی فقط بخش‌های خالی را می‌نویسد"),
            "Warn",
          );
          return;
        }
        const values: Record<string, unknown> = {};
        for (const k of keys) values[k] = drafts[k];
        // the reviewed text is not the page's text any more: the reviewed
        // line goes until a doctor reviews it again
        fill({ ...values, aiDrafted: true, reviewedBy: null, reviewedAt: null } as unknown as Partial<T>);
        setDrafted(keys);
      } else {
        const res = await call("ai-check");
        const list = Array.isArray(res?.data?.issues) ? (res.data.issues as Issue[]) : [];
        setIssues(list.filter((el) => el && typeof el.message === "string"));
      }
    } catch (err) {
      setError(err instanceof FetchError ? err.message : ta("خطایی رخ داد؛ دوباره امتحان کنید"));
    } finally {
      setBusy("");
    }
  };

  const configured = status?.configured;
  const pending =
    (input as { aiDrafted?: boolean }).aiDrafted ?? node?.aiDrafted;
  const reviewer =
    "reviewedBy" in (input as object)
      ? (input as { reviewedBy?: unknown }).reviewedBy
      : node?.reviewedBy;

  return (
    <section className={classes.main} aria-label={ta("هوش مصنوعی")}>
      <div className={classes.row}>
        <strong className={classes.title}>{ta("دستیار نگارش با هوش مصنوعی")}</strong>
        {!!pending && !reviewer && (
          <Badge color="Warning" size="L">
            {ta("پیش‌نویس هوش مصنوعی، در انتظار بازبینی پزشک")}
          </Badge>
        )}
      </div>
      <p className={classes.note}>
        {ta(
          "هوش مصنوعی فقط بخش‌های خالی را پیش‌نویس می‌کند. متن آن بدون منبع است و ممکن است خطا داشته باشد؛ تا پزشکی آن را نخواند و به‌عنوان بازبینی‌کننده ثبت نشود، صفحه «در انتظار بازبینی پزشک» نشان داده می‌شود.",
        )}
      </p>
      {status && !configured ? (
        <p className={classes.warn} role="status">
          {ta("هوش مصنوعی برای محتوای پزشکی تنظیم نشده است.")}{" "}
          <InlineLink href={adminPath("/appConfig?tab=ai")}>
            {ta("تنظیمات سیستم ← هوش مصنوعی")}
          </InlineLink>
        </p>
      ) : (
        <div className={classes.row}>
          <Button
            size="S"
            mode="Outline"
            isLoading={busy === "draft"}
            onClick={() => run("draft")}
          >
            {ta("پیش‌نویس با هوش مصنوعی")}
          </Button>
          <Button
            size="S"
            mode="Outline"
            variant="Secondary"
            isLoading={busy === "check"}
            onClick={() => run("check")}
          >
            {ta("بررسی با هوش مصنوعی")}
          </Button>
        </div>
      )}
      {!!error && (
        <p className={classes.error} role="alert">
          {error}
        </p>
      )}
      {!!drafted?.length && (
        <p className={classes.done} role="status">
          {ta("این بخش‌ها پر شد: ${1}. متن‌ها را بخوانید و اصلاح کنید، سپس «ثبت» را بزنید؛ تا آن موقع چیزی ذخیره نشده است.", [
            drafted.map(titleOf).join("، "),
          ])}
        </p>
      )}
      {!!issues && (
        <div className={classes.issues} aria-live="polite">
          {!issues.length ? (
            <p className={classes.note}>
              {ta("هوش مصنوعی مشکلی پیدا نکرد. این بررسی جای بازبینی پزشک را نمی‌گیرد.")}
            </p>
          ) : (
            <>
              <p className={classes.note}>
                {ta("موارد زیر را هوش مصنوعی علامت زده است؛ چیزی تغییر نکرده. هر مورد را خودتان یا پزشک بازبینی‌کننده بررسی کنید.")}
              </p>
              <ul className={classes.list}>
                {issues.map((issue, i) => (
                  <li key={i} className={classes.issue}>
                    <div className={classes.row}>
                      <Badge color={severityColor[issue.severity] || "Warning"} size="L">
                        {severityTitle(issue.severity)}
                      </Badge>
                      <strong>{titleOf(issue.field)}</strong>
                    </div>
                    <span>{issue.message}</span>
                    {!!issue.suggestion && (
                      <span className={classes.note}>
                        {ta("پیشنهاد: ${1}", [issue.suggestion])}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default MedicalAiAssist;
