"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import CreateForm from "../UI/CreateForm";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";
import { displayPhone, faDate } from "./userShared";
import classes from "./userShared.module.css";

// Account actions of the super admin "users" page (2026-10): create, edit,
// suspend / reactivate, close, reset identity. One place, used by the list
// rows and the user page header, after Doctolib Pro / Practo back offices.

export type UserStatus = "active" | "suspended" | "deleted";

export const statusLabels: Record<UserStatus, string> = {
  get active() {
    return ta("فعال");
  },
  get suspended() {
    return ta("معلق");
  },
  get deleted() {
    return ta("حذف‌شده");
  },
};

export const StatusBadge = ({
  status = "active",
  until,
}: {
  status?: UserStatus;
  until?: string | null;
}) => (
  <span className={`${classes.status} ${classes[`status_${status}`] || ""}`}>
    {statusLabels[status] || status}
    {status === "suspended" && until && !isNaN(new Date(until).getTime())
      ? ` ${ta("تا ${1}", [faDate.format(new Date(until))])}`
      : ""}
  </span>
);

const errorText = (err: unknown) => (err as Error)?.message || ta("خطایی رخ داد");

type UserLike = {
  _id: string;
  phone: string;
  username?: string;
  status?: UserStatus;
  role?: string;
};

// --- create ---
export const CreateUserPopup = ({ onDone }: { onDone: (id?: string) => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("کاربر جدید")}>
      <p className={classes.popupHint}>
        {ta("کاربر با همین شماره موبایل و کد پیامکی وارد می‌شود و احراز هویتش را خودش انجام می‌دهد.")}
      </p>
      <CreateForm<{ phone: string; username: string }, { data: { data: { _id: string } } }>
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/admin/users`,
          method: "POST",
          parser: "JSON",
          successCb: (res) => {
            closePopup();
            onDone(res?.data?.data?._id);
          },
        }}
        renderer={{
          phone: { type: "text", title: ta("شماره موبایل"), required: true },
          username: { type: "text", title: ta("نام نمایشی") },
        }}
      />
    </PopupCard>
  );
};

// --- edit ---
export const EditUserPopup = ({ user, onDone }: { user: UserLike; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("ویرایش کاربر")}>
      <p className={classes.popupHint}>
        {ta("با تغییر شماره موبایل، کاربر از همه‌ی دستگاه‌ها خارج می‌شود و باید با شماره‌ی جدید وارد شود.")}
      </p>
      <CreateForm<{ phone: string; username: string }>
        onCancel={() => closePopup()}
        defaultValue={{ phone: displayPhone(user.phone), username: user.username || "" }}
        hookProps={{
          path: `${API}/admin/users/${user._id}`,
          method: "PATCH",
          parser: "JSON",
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          phone: { type: "text", title: ta("شماره موبایل"), required: true },
          username: { type: "text", title: ta("نام نمایشی") },
        }}
      />
    </PopupCard>
  );
};

// --- suspend ---
export const SuspendUserPopup = ({ user, onDone }: { user: UserLike; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("تعلیق حساب")}>
      <p className={classes.popupHint}>
        {ta("کاربر فوراً از همه‌ی دستگاه‌ها خارج می‌شود و تا رفع تعلیق نمی‌تواند وارد شود. نوبت‌ها و سفارش‌هایش سر جایش می‌ماند.")}
      </p>
      <CreateForm<{ reason: string; until: string }>
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/admin/users/${user._id}/status`,
          method: "POST",
          parser: "JSON",
          mutator: (inp) => ({
            status: "suspended",
            reason: inp.reason,
            ...(inp.until ? { until: inp.until } : {}),
          }),
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          reason: { type: "area", title: ta("دلیل تعلیق"), required: true },
          until: { type: "date", title: ta("تا تاریخ (خالی = تا رفع دستی)") },
        }}
      />
    </PopupCard>
  );
};

// --- close (anonymise) ---
export const DeleteUserPopup = ({ user, onDone }: { user: UserLike; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/users/${user._id}`,
        method: "DELETE",
        payload: { reason },
        bodyParser: "JSON",
      });
      pushNotification(ta("حساب کاربر حذف شد"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={ta("حذف حساب کاربر")}>
      <div className={classes.popupBody}>
        <p className={classes.popupHint}>
          {ta("شماره، نام و اطلاعات هویتی ${1} پاک می‌شود و دیگر نمی‌تواند وارد شود. نوبت‌ها، نسخه‌ها، سفارش‌ها و پرداخت‌ها برای سابقه‌ی پزشکی و مالی می‌مانند. این کار برگشت‌پذیر نیست.", [displayPhone(user.phone)])}
        </p>
        <Input title={ta("دلیل (اختیاری)")} onChange={(e) => setReason(e.target.value)} />
        <div className={classes.popupActions}>
          <Button variant="Error" onClick={submit} isLoading={busy}>
            {ta("حذف حساب")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// One hook for both places: returns the action handlers.
export const useUserActions = (onChanged: () => unknown) => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const push = useProgress();
  const call = async (url: string, payload?: Record<string, unknown>, okText?: string) => {
    try {
      await fetcher({ url, method: "POST", payload, bodyParser: "JSON" });
      if (okText) pushNotification(okText, "Success");
      onChanged();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    }
  };
  return {
    create: () =>
      setPopup(
        "AdminCreateUser",
        <CreateUserPopup
          onDone={(id) => {
            onChanged();
            if (id) push(adminPath(`/user/${id}`));
          }}
        />,
      ),
    edit: (user: UserLike) =>
      setPopup("AdminEditUser", <EditUserPopup user={user} onDone={onChanged} />),
    suspend: (user: UserLike) =>
      setPopup("AdminSuspendUser", <SuspendUserPopup user={user} onDone={onChanged} />),
    activate: (user: UserLike) =>
      call(`${API}/admin/users/${user._id}/status`, { status: "active" }, ta("حساب کاربر فعال شد")),
    remove: (user: UserLike) =>
      setPopup("AdminDeleteUser", <DeleteUserPopup user={user} onDone={onChanged} />),
    resetIdentity: (user: UserLike) =>
      call(`${API}/admin/users/${user._id}/identity/reset`, undefined, ta("احراز هویت کاربر بازنشانی شد")),
  };
};
