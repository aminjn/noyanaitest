"use client";
import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import LockIcon from "@/Components/Icons/LockIcon";
import { adminDateTimeFormat, ta } from "@/Components/Admin/i18n/adminText";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";
import classes from "./ProviderStatus.module.css";

// Provider suspension (2026-10 admin audit P2-9), shared by the doctor,
// clinic, hospital, pharmacy, para clinic and insurance pages. Suspension
// is the platform's decision and is distinct from the draft / published
// flag: a suspended provider is off the site and takes no new bookings or
// orders until an admin lifts it (backend Lib/providerStatus.ts,
// Controllers/adminProviderController.ts). The owner is told, with the
// reason, by an in-app notification and push.

export type ProviderKind =
  | "doctorprofile"
  | "clinic"
  | "hospital"
  | "pharmacy"
  | "paraClinic"
  | "insurance";

export const providerAccessModel: Record<ProviderKind, AccessLevelModel> = {
  doctorprofile: "DoctorProfile",
  clinic: "Clinic",
  hospital: "Hospital",
  pharmacy: "Pharmacy",
  paraClinic: "ParaClinic",
  insurance: "Insurance",
};

export type ProviderStatusFields = {
  _id: string;
  status?: "active" | "suspended";
  statusReason?: string;
  statusChangedAt?: string;
  // the publish flag (Hospital: isActive)
  active?: boolean;
  isActive?: boolean;
};

export type ProviderState = "published" | "draft" | "suspended";

// one state for lists and filters: suspended wins over the publish flag
export const providerStateOf = (node?: ProviderStatusFields | null): ProviderState => {
  if (node?.status === "suspended") return "suspended";
  return (node?.active ?? node?.isActive) ? "published" : "draft";
};

export const providerStateLabels: Record<ProviderState, string> = {
  get published() {
    return ta("منتشرشده");
  },
  get draft() {
    return ta("پیش‌نویس");
  },
  get suspended() {
    return ta("معلق");
  },
};

export const ProviderStateBadge = ({ node }: { node?: ProviderStatusFields | null }) => {
  const state = providerStateOf(node);
  return (
    <span className={`${classes.badge} ${classes[`badge_${state}`] || ""}`}>
      <span className={classes.dot} />
      {providerStateLabels[state]}
    </span>
  );
};

// a Table column: label value (Set filter) + badge
export const providerStateColumn = <T extends ProviderStatusFields>() => ({
  name: ta("وضعیت"),
  value: (node: T) => providerStateLabels[providerStateOf(node)],
  component: (node: T) => <ProviderStateBadge node={node} />,
  filter: "Set" as const,
});

const dateFormat = adminDateTimeFormat({ year: "numeric", month: "long", day: "numeric" });
const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : dateFormat.format(date);
};

// shown at the top of a suspended provider's record page
export const ProviderStatusBanner = ({ node }: { node?: ProviderStatusFields | null }) => {
  if (node?.status !== "suspended") return null;
  const since = formatDate(node.statusChangedAt);
  return (
    <div className={classes.banner} role="status">
      <strong className={classes.bannerTitle}>
        {since ? ta("معلق از ${1}", [since]) : ta("معلق")}
      </strong>
      <p className={classes.bannerText}>
        {ta("این صفحه روی سایت نیست و نوبت یا سفارش تازه نمی‌گیرد. نوبت‌ها و سفارش‌های ثبت‌شده سر جایشان هستند.")}
      </p>
      {!!node.statusReason && (
        <p className={classes.bannerReason}>
          {ta("دلیل: ${1}", [node.statusReason])}
        </p>
      )}
    </div>
  );
};

const errorText = (err: unknown) => (err as Error)?.message || ta("خطایی رخ داد");

const SuspendProviderPopup = ({
  kind,
  node,
  onDone,
}: {
  kind: ProviderKind;
  node: ProviderStatusFields;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (reason.trim().length < 3) {
      pushNotification(ta("دلیل تعلیق را بنویسید"), "Error");
      return;
    }
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/${kind}/${node._id}/status`,
        method: "PUT",
        bodyParser: "JSON",
        payload: { status: "suspended", reason: reason.trim() },
      });
      pushNotification(ta("تعلیق شد"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={ta("تعلیق")}>
      <div className={classes.popupBody}>
        <p className={classes.popupHint}>
          {ta("صفحه از سایت و جستجو برداشته می‌شود و نوبت یا سفارش تازه نمی‌گیرد. نوبت‌ها و سفارش‌های ثبت‌شده سر جایشان می‌مانند. مالک پنل با همین دلیل باخبر می‌شود.")}
        </p>
        <AreaInput
          title={ta("دلیل تعلیق")}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className={classes.popupActions}>
          <Button variant="Error" onClick={submit} isLoading={busy}>
            {ta("تعلیق")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

const ReactivateProviderPopup = ({
  kind,
  node,
  onDone,
}: {
  kind: ProviderKind;
  node: ProviderStatusFields;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/${kind}/${node._id}/status`,
        method: "PUT",
        bodyParser: "JSON",
        payload: { status: "active" },
      });
      pushNotification(ta("تعلیق برداشته شد"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={ta("رفع تعلیق")}>
      <div className={classes.popupBody}>
        <p className={classes.popupHint}>
          {ta("صفحه به حالت پیش از تعلیق برمی‌گردد (منتشرشده یا پیش‌نویس) و مالک پنل باخبر می‌شود.")}
        </p>
        <div className={classes.popupActions}>
          <Button onClick={submit} isLoading={busy}>
            {ta("رفع تعلیق")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// The record page's header action: «تعلیق» (red, beside delete) or
// «رفع تعلیق». Empty for staff without update access on this kind.
export const useProviderStatusActions = ({
  kind,
  node,
  mutate,
}: {
  kind: ProviderKind;
  node?: ProviderStatusFields | null;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();
  const hasAccess = useAccessLevel();
  if (!node?._id || !hasAccess(providerAccessModel[kind], "update")) return [];
  if (node.status === "suspended")
    return [
      {
        title: ta("رفع تعلیق"),
        action: () =>
          setPopup(
            `ReactivateProvider-${kind}`,
            <ReactivateProviderPopup kind={kind} node={node} onDone={mutate} />,
          ),
      },
    ];
  return [
    {
      title: ta("تعلیق"),
      danger: true,
      icon: <LockIcon />,
      action: () =>
        setPopup(
          `SuspendProvider-${kind}`,
          <SuspendProviderPopup kind={kind} node={node} onDone={mutate} />,
        ),
    },
  ];
};
