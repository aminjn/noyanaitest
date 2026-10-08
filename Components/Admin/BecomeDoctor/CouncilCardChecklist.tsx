"use client";

import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";
import FormatDate from "@/Components/UI/FormatDate";
import classes from "./CouncilCardChecklist.module.css";

export const councilChecklistItems = ["name", "code", "title", "speciality", "authentic"] as const;
export type CouncilChecklistItem = (typeof councilChecklistItems)[number];

// The reviewer's checklist for a doctor request filed without the medical
// council inquiry (its keys not configured, or the service down - backend
// doctorOnboardingController, verification "manual"). Doctolib / Zocdoc
// verify a practitioner against the registry; where the registry can't be
// queried, the back office compares the licence card with what was entered
// - item by item, so "approved" means the comparison was made. Approving
// is open only once every item is ticked (the backend refuses it too).
const CouncilCardChecklist = ({
  requestId,
  status,
  fullName,
  code,
  title,
  specialities,
  hasCard,
  checked,
  onChange,
  checkedAt,
}: {
  requestId: string;
  status?: string;
  fullName: string;
  code?: string;
  title?: string;
  specialities: string[];
  hasCard: boolean;
  checked: Record<CouncilChecklistItem, boolean>;
  onChange: (next: Record<CouncilChecklistItem, boolean>) => void;
  checkedAt?: string;
}) => {
  if (status && status !== "Pending")
    return (
      <div className={classes.main}>
        <span className={classes.title}>{ta("بررسی دستی کارت نظام پزشکی")}</span>
        <span className={classes.muted}>
          {checkedAt ? (
            <>
              {ta("کارت نظام پزشکی پیش از تأیید به‌صورت دستی بررسی شد")} · <FormatDate value={checkedAt} />
            </>
          ) : (
            ta("این درخواست بدون استعلام نظام پزشکی ثبت شده بود.")
          )}
        </span>
      </div>
    );

  const labels: Record<CouncilChecklistItem, string> = {
    name: ta("نام و نام خانوادگی روی کارت با «${1}» یکی است", [fullName || "—"]),
    code: ta("شماره‌ی نظام پزشکی روی کارت با «${1}» یکی است", [code || "—"]),
    title: ta("عنوان روی کارت با «${1}» می‌خواند", [title ? ta(title) : "—"]),
    speciality: ta("رشته‌ی روی کارت با تخصص‌های انتخاب‌شده می‌خواند: ${1}", [specialities.join(" · ") || "—"]),
    authentic: ta("تصویر کارت خوانا است و نشانه‌ی دستکاری ندارد"),
  };
  const done = councilChecklistItems.every((k) => checked[k]);

  return (
    <div className={classes.main}>
      <span className={classes.title}>{ta("فهرست بررسی دستی کارت نظام پزشکی")}</span>
      <span className={classes.muted}>
        {ta("استعلام نظام پزشکی برای این درخواست انجام نشده است. کارت نظام پزشکی را باز کنید و هر مورد را با اطلاعات واردشده تطبیق دهید.")}
      </span>
      {hasCard ? (
        <a
          href={`${API}/admin/becomedoctor/${requestId}/file/councilCard`}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.file}
        >
          {ta("باز کردن کارت نظام پزشکی")}
        </a>
      ) : (
        <span className={classes.warn}>{ta("کارت نظام پزشکی بارگذاری نشده است")}</span>
      )}
      <ul className={classes.list}>
        {councilChecklistItems.map((k) => (
          <li key={k}>
            <label className={classes.item}>
              <input
                type="checkbox"
                checked={!!checked[k]}
                disabled={!hasCard}
                onChange={(e) => onChange({ ...checked, [k]: e.target.checked })}
              />
              <span>{labels[k]}</span>
            </label>
          </li>
        ))}
      </ul>
      {!done && <span className={classes.warn}>{ta("برای تأیید، همه‌ی موارد فهرست بررسی را تیک بزنید.")}</span>}
    </div>
  );
};

export default CouncilCardChecklist;
