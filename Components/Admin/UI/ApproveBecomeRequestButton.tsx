"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import { ta } from "@/Components/Admin/i18n/adminText";
import FormActions from "./FormActions";
import popupClasses from "../Requests/RequestDecisionActions.module.css";

// An older centre request has no licence expiry (2026-10, owner decision:
// the applicant gives it now): the admin enters it from the document before
// approving - the backend refuses the approval without one
// (Controllers/adminEntityController.ts approveBecome).
export const LicenceExpiryPopup = ({
  popupKey,
  submitLabel,
  onSubmit,
}: {
  popupKey: string;
  submitLabel: string;
  // resolves true when the approval went through (the popup closes)
  onSubmit: (certificateExpiresAt: Date) => Promise<boolean>;
}) => {
  const { closePopup } = usePopup();
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy || !expiresAt) return;
    setBusy(true);
    try {
      if (await onSubmit(expiresAt)) closePopup(popupKey);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={ta("تاریخ انقضای پروانه")}>
      <div className={popupClasses.popup}>
        <p className={popupClasses.hint}>
          {ta("این درخواست پیش از اجباری شدن تاریخ انقضا ثبت شده است. تاریخ انقضای پروانه را از روی مدرک وارد کنید؛ بدون آن درخواست تأیید نمی‌شود.")}
        </p>
        <DateInput title={ta("تاریخ انقضای پروانه")} onChange={(d) => setExpiresAt(d)} />
        <FormActions>
          <Button variant={expiresAt ? "Success" : "Disable"} isLoading={busy} onClick={submit}>
            {submitLabel}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup(popupKey)}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

// One-step approval of a "become X" request (2026-09), shared by every
// request page: the backend creates (or activates) the centre / doctor
// profile from the request, links the applicant, marks the request approved
// and notifies them; the admin then lands on the created record.
// Shown only while the request is pending - a rejected one must be reopened.
const ApproveBecomeRequestButton = ({
  requestPath,
  nodeId,
  status,
  label,
  done,
  target,
  mutate,
  payload,
  askLicenceExpiry,
}: {
  // e.g. "becomeclinic" -> POST /admin/becomeclinic/:nodeId/approve
  requestPath: string;
  nodeId: string;
  status?: string;
  label: string;
  done: string;
  // admin page of the created record, e.g. (id) => `/clinic/${id}`
  target: (id: string) => string;
  mutate: () => unknown;
  // sent with the approval, e.g. { councilChecked: true } for a doctor
  // request reviewed by hand
  payload?: Record<string, unknown>;
  // a centre request with no licence expiry: ask for it first
  askLicenceExpiry?: boolean;
}) => {
  const [busy, setBusy] = useState(false);
  const pushNotification = useNotification();
  const push = useProgress();
  const { setPopup } = usePopup();

  if (status && status !== "Pending") return null;

  const send = async (extra?: Record<string, unknown>): Promise<boolean> => {
    try {
      const body = { ...(payload || {}), ...(extra || {}) };
      const res = await fetcher({
        url: `${API}/admin/${requestPath}/${nodeId}/approve`,
        method: "POST",
        ...(Object.keys(body).length ? { payload: body } : {}),
      });
      pushNotification(done, "Success");
      await mutate();
      const id = res?.data?.node?._id;
      if (id) push(adminPath(target(id)));
      return true;
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
      return false;
    }
  };

  const approve = async () => {
    if (busy) return;
    if (askLicenceExpiry) {
      setPopup(
        "ApproveLicenceExpiry",
        <LicenceExpiryPopup
          popupKey="ApproveLicenceExpiry"
          submitLabel={label}
          onSubmit={(certificateExpiresAt) => send({ certificateExpiresAt })}
        />,
      );
      return;
    }
    setBusy(true);
    try {
      await send();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button isLoading={busy} onClick={approve}>
      {label}
    </Button>
  );
};

export default ApproveBecomeRequestButton;
