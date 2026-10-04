"use client";

import classes from "./RxPrescription.module.css";
import Badge, { BadgeColor } from "../UI/Badge";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { t2xsRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common"];

// What a prescription-only order line carries (2026-10) - mirrors backend
// Lib/rxPrescription.ts IOrderLinePrescription
export type RxReviewStatus = "pending" | "approved" | "rejected";
export interface IOrderLinePrescription {
  kind: "erx" | "paper";
  insurer?: "tamin" | "salamat" | "other";
  trackingCode?: string;
  nationalCode?: string;
  files?: string[];
  note?: string;
  status?: RxReviewStatus;
  reason?: string;
  reviewedAt?: string;
}

const statusColor: Record<RxReviewStatus, BadgeColor> = {
  pending: "Warning",
  approved: "Success",
  rejected: "Error",
};

const statusKey: Record<RxReviewStatus, string> = {
  pending: "rxStatusPending",
  approved: "rxStatusApproved",
  rejected: "rxStatusRejected",
};

const insurerKey: Record<string, string> = {
  tamin: "rxInsurerTamin",
  salamat: "rxInsurerSalamat",
  other: "rxInsurerOther",
};

export const rxStatusOf = (p?: IOrderLinePrescription | null): RxReviewStatus =>
  p?.status === "approved" || p?.status === "rejected" ? p.status : "pending";

export const RxStatusBadge = ({ prescription }: { prescription?: IOrderLinePrescription | null }) => {
  const getContent = useScopedLocale(NS);
  const status = rxStatusOf(prescription);
  return (
    <Badge color={statusColor[status]} size="S" radius="High" mode="Fill">
      {getContent(statusKey[status] as ContentKey)}
    </Badge>
  );
};

// The prescription as the buyer gave it, for the buyer's order page and the
// pharmacy's incoming order (files open through /notpublic, which only the
// buyer, the selling pharmacy and the super admin may read).
export const RxPrescriptionDetails = ({
  prescription,
}: {
  prescription?: IOrderLinePrescription | null;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  if (!prescription || typeof prescription !== "object") return null;
  const files = Array.isArray(prescription.files) ? prescription.files : [];
  return (
    <div className={`${classes.main} ${t2xsRegular}`}>
      <span className={classes.row}>
        <RxStatusBadge prescription={prescription} />
        <span>{t(prescription.kind === "paper" ? "rxKindPaper" : "rxKindErx")}</span>
        {prescription.kind === "erx" && !!prescription.insurer && (
          <span>{t(insurerKey[prescription.insurer] || "rxInsurerOther")}</span>
        )}
      </span>
      {prescription.kind === "erx" && (
        <span className={classes.row}>
          {!!prescription.trackingCode && (
            <span>
              {t("rxTrackingCode")}:{" "}
              <bdi className={classes.code}>{prescription.trackingCode}</bdi>
            </span>
          )}
          {!!prescription.nationalCode && (
            <span>
              {t("rxNationalCode")}:{" "}
              <bdi className={classes.code}>{prescription.nationalCode}</bdi>
            </span>
          )}
        </span>
      )}
      {!!files.length && (
        <span className={classes.row}>
          {files.map((id, i) => (
            <a
              key={id}
              className={classes.link}
              href={`/api/v1/notpublic/${id}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("rxFile", [String(i + 1)])}
            </a>
          ))}
        </span>
      )}
      {!!prescription.note && <span className={classes.note}>{prescription.note}</span>}
      {rxStatusOf(prescription) === "rejected" && !!prescription.reason && (
        <span className={classes.reason}>
          {t("rxRejectReason")}: {prescription.reason}
        </span>
      )}
    </div>
  );
};
