"use client";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { CentreLicenceKind } from "@/Components/helpers/centreLicence";
import { adminDateTimeFormat, ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import { CentreSection } from "./CentreSections";
import classes from "./CentreLicenceSection.module.css";

// GET/PUT /admin/<kind>/<id>/licence (backend
// Controllers/adminCentreLicenceController.ts)
type LicenceView = {
  number: string;
  issuedAt: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  verifiedBy: { _id: string; username?: string; phone?: string } | string | null;
  verified: boolean;
  expired: boolean;
};
type LicenceInput = {
  number?: string;
  issuedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  verified?: boolean;
};

const who = (value: LicenceView["verifiedBy"]) =>
  value && typeof value === "object" ? value.username || value.phone || "" : "";

// A centre's operating licence and its verified tick (2026-10): what the
// tick on the centre card and page means - a licence number the staff
// approved that has not expired (backend Lib/centreVerified.ts). Only the
// staff edit it here; the centre's own panel can't. Shared by the clinic,
// hospital, pharmacy, lab and insurer record pages («مجوز» tab).
const CentreLicenceSection = ({ kind, nodeId }: { kind: CentreLicenceKind; nodeId: string }) => {
  const url = `${API}/admin/${kind}/${nodeId}/licence`;
  const { data, error, mutate } = useSWR<LicenceView>(nodeId ? url : null, (u: string) =>
    fetcher({ url: u }).then((res) => res.data),
  );
  const format = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : adminDateTimeFormat({ year: "numeric", month: "long", day: "numeric" }).format(d);
  };
  const state = !data ? "none" : data.verified ? "verified" : data.expired ? "expired" : "none";
  const stateLabel =
    state === "verified" ? ta("نشان تأیید فعال است") : state === "expired" ? ta("پروانه منقضی شده؛ نشان تأیید برداشته شد") : ta("بدون نشان تأیید");

  return (
    <CentreSection
      title={ta("پروانه‌ی فعالیت و نشان تأیید")}
      hint={ta("نشان تأیید روی کارت و صفحه‌ی مرکز فقط وقتی دیده می‌شود که شماره‌ی پروانه را پشتیبانی تأیید کرده باشد و تاریخ انقضای آن نگذشته باشد. ۳۰ روز پیش از انقضا و هنگام انقضا به مرکز اطلاع داده می‌شود. خود مرکز این بخش را نمی‌تواند تغییر دهد.")}
    >
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.status}>
              <span className={`${classes.badge} ${classes[`badge_${state}`] || ""}`}>
                <span className={classes.dot} />
                {stateLabel}
              </span>
              {!!data.verifiedAt && (
                <span className={classes.meta}>
                  {who(data.verifiedBy)
                    ? ta("تأیید توسط ${1} در ${2}", [who(data.verifiedBy), format(data.verifiedAt)])
                    : ta("تأیید در ${1}", [format(data.verifiedAt)])}
                </span>
              )}
              <span className={classes.meta}>
                {ta("برای تأیید، شماره و تاریخ انقضای آینده لازم است. با برداشتن تیک، نشان تأیید فوراً برداشته می‌شود.")}
              </span>
              <span className={classes.meta}>
                {ta("تغییر شماره‌ی پروانه نشان تأیید را برمی‌دارد؛ پس از ذخیره، پروانه‌ی جدید را با تاریخ‌هایش دوباره تأیید کنید.")}
              </span>
              {!!data.verifiedAt && !data.expiresAt && (
                <span className={classes.warn}>
                  {ta("تاریخ انقضای این پروانه ثبت نشده است؛ آن را وارد کنید.")}
                </span>
              )}
            </div>
            {/* redrawn from the saved licence after each save: a new number
                comes back unverified and its tick must be set again */}
            <CreateForm<LicenceInput>
              key={`${data.number}|${data.issuedAt || ""}|${data.expiresAt || ""}|${data.verifiedAt || ""}`}
              defaultValue={{
                number: data.number,
                issuedAt: data.issuedAt || undefined,
                expiresAt: data.expiresAt || undefined,
                verified: !!data.verifiedAt,
              }}
              hookProps={{
                path: url,
                method: "PUT",
                parser: "JSON",
                successCb: () => mutate(),
              }}
              renderer={{
                number: {
                  type: "text",
                  title: ta("شماره‌ی پروانه (کد سیام / مجوز بیمه مرکزی)"),
                  ltr: true,
                },
                issuedAt: { type: "date", title: ta("تاریخ صدور") },
                expiresAt: { type: "date", title: ta("تاریخ انقضا") },
                verified: { type: "bool", title: ta("پروانه را بررسی و تأیید کردم") },
              }}
            />
          </>
        )}
      </HandleLoading>
    </CentreSection>
  );
};

export default CentreLicenceSection;
