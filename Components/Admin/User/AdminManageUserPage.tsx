"use client";
import UserProCard from "./UserProCard";
import { useEffect, useState } from "react";
import Link from "@/Components/i18n/Link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import classes from "./AdminManageUserPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import useUser from "@/Components/Hooks/useUser";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import Button from "@/Components/UI/Button";
import HandleLoading from "../UI/HandleLoading";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import {
  RoleBadge,
  displayPhone,
  faDate,
  faDateTime,
  num,
  roleLabels,
} from "./userShared";
import { ta } from "@/Components/Admin/i18n/adminText";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import useProgress from "@/Components/Hooks/useProgress";
import { StatusBadge, UserStatus, useUserActions } from "./userActions";
import UserActivity from "./UserActivity";
import OpenTicketPopup from "../Support/OpenTicketPopup";

export type UserDetail = {
  _id: string;
  phone: string;
  username?: string;
  role: "admin" | "notadmin" | "user";
  status?: UserStatus;
  statusReason?: string;
  statusChangedAt?: string;
  suspendedUntil?: string;
  createdAt: string;
  lastLogin: string | null;
  identity: {
    givenName: string;
    lastName: string;
    nationalId: string;
    gender: "male" | "female";
    dateOfbirth: string;
    fatherName?: string;
    birthPlace?: string;
  } | null;
  accessLevel: { _id: string; name: string } | null;
  walletBalance: number;
  walletPending?: number;
  counts: { reservations: number; orders: number };
  profiles: { key: string; title: string; href: string; name: string }[];
  isSelf: boolean;
};

type AccessLevelOption = { _id: string; name: string };

// a missing / malformed date must not throw (Intl throws on Invalid Date)
const isDate = (value?: string | null): value is string =>
  !!value && !isNaN(new Date(value).getTime());
const formatDate = (value?: string | null, withTime = false) =>
  isDate(value)
    ? (withTime ? faDateTime : faDate).format(new Date(value))
    : "—";

const Field = ({ title, value }: { title: string; value?: React.ReactNode }) => (
  <div className={classes.field}>
    <span className={classes.fieldTitle}>{title}</span>
    <span className={classes.fieldValue}>{value || "—"}</span>
  </div>
);

const roleOptions: { role: UserDetail["role"]; title: string; description: string }[] = [
  { role: "user", get title() {
  return ta("کاربر عادی");
}, get description() {
  return ta("بدون دسترسی به پنل مدیریت");
} },
  { role: "notadmin", get title() {
  return ta("کارمند");
}, get description() {
  return ta("دسترسی به پنل طبق سطح دسترسی انتخاب‌شده");
} },
  { role: "admin", get title() {
  return ta("سوپر ادمین");
}, get description() {
  return ta("دسترسی کامل به همه بخش‌ها و تنظیمات سیستم");
} },
];

// Role + access level editor and forced logout. Full admins only; the
// backend enforces the same rules (no self-change, keep one admin).
export const RoleManager = ({
  user,
  onChanged,
}: {
  user: UserDetail;
  onChanged: () => void;
}) => {
  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();
  const [role, setRole] = useState<UserDetail["role"]>(user.role);
  const [accessLevel, setAccessLevel] = useState<string>(user.accessLevel?._id || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(user.role);
    setAccessLevel(user.accessLevel?._id || "");
  }, [user.role, user.accessLevel?._id]);

  const { data: levels } = useSWR<AccessLevelOption[]>(
    `${API}/auto/accesslevel`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const dirty =
    role !== user.role ||
    (role === "notadmin" && accessLevel !== (user.accessLevel?._id || ""));
  const canSave = dirty && (role !== "notadmin" || !!accessLevel);

  const save = async () => {
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/users/${user._id}/role`,
        method: "PATCH",
        payload: role === "notadmin" ? { role, accessLevel } : { role },
      });
      pushNotification(ta("نقش کاربر به‌روزرسانی شد"), "Success");
      closePopup("userRole");
      onChanged();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = () =>
    setPopup(
      "userRole",
      <ConfirmationPopup
        message={ta("نقش ${1} به «${2}» تغییر کند؟${3}", [displayPhone(user.phone), roleLabels[role], role === "admin" ? ` ${ta("سوپر ادمین به همه بخش‌ها و تنظیمات دسترسی کامل دارد.")}` : ""])}
        onConfirm={save}
      />,
    );

  const logout = async () => {
    try {
      await fetcher({ url: `${API}/admin/users/${user._id}/logout`, method: "POST" });
      pushNotification(ta("کاربر از همه دستگاه‌ها خارج شد"), "Success");
      closePopup("userLogout");
      onChanged();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  if (user.isSelf)
    return (
      <p className={classes.note}>
        {ta("نقش حساب خودتان از این‌جا قابل تغییر نیست. برای تغییر، از سوپر ادمین دیگری کمک بگیرید.")}
      </p>
    );

  return (
    <div className={classes.roleManager}>
      <div className={classes.roleOptions} role="radiogroup">
        {roleOptions.map((option) => (
          <label
            key={option.role}
            className={`${classes.roleOption} ${role === option.role ? classes.roleOptionActive : ""}`}
          >
            <input
              type="radio"
              name="role"
              checked={role === option.role}
              onChange={() => setRole(option.role)}
            />
            <span className={classes.roleOptionTitle}>{option.title}</span>
            <span className={classes.roleOptionDesc}>{option.description}</span>
          </label>
        ))}
      </div>

      {role === "notadmin" && (
        <label className={classes.selectField}>
          <span>{ta("سطح دسترسی")}</span>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
            <option value="">{ta("انتخاب کنید...")}</option>
            {(Array.isArray(levels) ? levels : []).map((level) => (
              <option key={level._id} value={level._id}>
                {level.name || ta("بدون نام")}
              </option>
            ))}
          </select>
          {Array.isArray(levels) && levels.length === 0 && (
            <span className={classes.note}>
              {ta("هنوز سطح دسترسی‌ای ساخته نشده.")}{" "}
              <Link href={adminPath("/team?tab=roles")}>{ta("ساخت سطح دسترسی")}</Link>
            </span>
          )}
        </label>
      )}

      <div className={classes.actions}>
        <Button
          size="M"
          onClick={canSave ? confirmSave : undefined}
          variant={canSave ? "Primary" : "Disable"}
          isLoading={saving}
        >
          {ta("ذخیره نقش")}
        </Button>
        <Button
          size="M"
          mode="Outline"
          variant="Error"
          onClick={() =>
            setPopup(
              "userLogout",
              <ConfirmationPopup
                message={ta("همه نشست‌های این کاربر باطل شود؟ کاربر باید دوباره وارد شود.")}
                onConfirm={logout}
              />,
            )
          }
        >
          {ta("خروج از همه دستگاه‌ها")}
        </Button>
      </div>
    </div>
  );
};

const AdminManageUserPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { user: viewer } = useUser();
  const { data, error, mutate } = useSWR<UserDetail>(
    params ? `${API}/admin/users/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const displayName =
    [data?.identity?.givenName, data?.identity?.lastName]
      .filter(Boolean)
      .join(" ") || data?.username;
  const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
  const hasAccess = useAccessLevel();
  const push = useProgress();
  const status = data?.status || "active";
  const actions = useUserActions(() => {
    // a closed account has nothing left to show
    mutate().catch(() => push(adminPath("/user")));
  });
  const canEdit = hasAccess("User", "update") && status !== "deleted" && !data?.isSelf;
  const canDelete =
    hasAccess("User", "delete") && status !== "deleted" && data?.role === "user" && !data?.isSelf;
  const { setPopup } = usePopup();
  const canTicket = viewer?.role === "admin" || hasAccess("Ticket", "write");
  const canReadTickets = viewer?.role === "admin" || hasAccess("Ticket", "readAll");

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <Link href={adminPath("/user")} className={classes.back}>
            <Ixon width="1rem" className={classes.backIcon}>
              <ChevronIcon />
            </Ixon>
            <span>{ta("کاربران")}</span>
          </Link>

          <section className={`${classes.card} ${classes.hero}`}>
            <span className={classes.avatar}>{(displayName || ta("؟")).trim().charAt(0)}</span>
            <div className={classes.heroText}>
              <div className={classes.heroTitle}>
                <h1>{displayName || ta("بدون نام")}</h1>
                <RoleBadge role={data.role} />
                <StatusBadge status={status} until={data.suspendedUntil} />
              </div>
              <span className={classes.phone}>{displayPhone(data.phone)}</span>
              <span className={classes.meta}>
                {ta("عضویت: ${1}", [formatDate(data.createdAt)])}
                {isDate(data.lastLogin) &&
                  ta(" · آخرین ورود/خروج: ${1}", [formatDate(data.lastLogin, true)])}
              </span>
            </div>
            <div className={classes.stats}>
              <div>
                <strong>{num.format(data.counts?.reservations ?? 0)}</strong>
                <span>{ta("رزرو")}</span>
              </div>
              <div>
                <strong>{num.format(data.counts?.orders ?? 0)}</strong>
                <span>{ta("سفارش")}</span>
              </div>
              <div>
                <strong>{num.format(data.walletBalance ?? 0)}</strong>
                <span>{ta("موجودی کیف پول (تومان)")}</span>
              </div>
              {(data.walletPending ?? 0) > 0 && (
                <div>
                  <strong>{num.format(data.walletPending ?? 0)}</strong>
                  <span>{ta("در دوره‌ی تسویه (تومان)")}</span>
                </div>
              )}
            </div>
          </section>

          {(canEdit || canDelete || canTicket || canReadTickets) && (
            <div className={classes.actionBar}>
              {canTicket && status !== "deleted" && (
                <Button
                  size="M"
                  variant="Neutral"
                  onClick={() =>
                    setPopup(
                      "AdminOpenTicket",
                      <OpenTicketPopup
                        user={{ _id: data._id, phone: data.phone, username: data.username }}
                        onCreated={(id) => push(adminPath(`/ticket/${id}`))}
                      />,
                    )
                  }
                >
                  {ta("تیکت برای این کاربر")}
                </Button>
              )}
              {canReadTickets && (
                <Link href={adminPath(`/ticket?user=${data._id}`)} className={classes.link}>
                  {ta("تیکت‌های کاربر")}
                </Link>
              )}
              {canEdit && (
                <Button size="M" variant="Neutral" onClick={() => actions.edit(data)}>
                  {ta("ویرایش موبایل و نام")}
                </Button>
              )}
              {canEdit && data.role !== "admin" && status === "active" && (
                <Button size="M" variant="Warning" mode="Outline" onClick={() => actions.suspend(data)}>
                  {ta("تعلیق حساب")}
                </Button>
              )}
              {canEdit && status === "suspended" && (
                <Button size="M" variant="Success" onClick={() => actions.activate(data)}>
                  {ta("رفع تعلیق")}
                </Button>
              )}
              {viewer?.role === "admin" && data.identity && (
                <Button size="M" variant="Neutral" mode="Outline" onClick={() => actions.resetIdentity(data)}>
                  {ta("بازنشانی احراز هویت")}
                </Button>
              )}
              {canDelete && (
                <Button
                  size="M"
                  variant="Error"
                  mode="Outline"
                  onClick={() => actions.remove(data)}
                >
                  {ta("حذف حساب")}
                </Button>
              )}
            </div>
          )}

          {status !== "active" && (
            <div className={`${classes.card} ${classes.statusNote}`} role="status">
              <strong>
                {status === "deleted" ? ta("این حساب حذف شده است.") : ta("این حساب معلق است.")}
              </strong>
              {data.statusReason && <span>{ta("دلیل: ${1}", [data.statusReason])}</span>}
              {isDate(data.statusChangedAt) && (
                <span className={classes.meta}>{formatDate(data.statusChangedAt, true)}</span>
              )}
            </div>
          )}

          <div className={classes.grid}>
            <section className={classes.card}>
              <h2 className={classes.cardTitle}>{ta("اطلاعات هویتی")}</h2>
              {data.identity ? (
                <div className={classes.fields}>
                  <Field title={ta("نام")} value={data.identity.givenName} />
                  <Field title={ta("نام خانوادگی")} value={data.identity.lastName} />
                  <Field title={ta("کد ملی")} value={data.identity.nationalId} />
                  <Field
                    title={ta("جنسیت")}
                    value={
                      data.identity.gender === "female"
                        ? ta("زن")
                        : data.identity.gender === "male"
                          ? ta("مرد")
                          : undefined
                    }
                  />
                  <Field
                    title={ta("تاریخ تولد")}
                    value={
                      isDate(data.identity.dateOfbirth)
                        ? formatDate(data.identity.dateOfbirth)
                        : undefined
                    }
                  />
                  <Field title={ta("نام پدر")} value={data.identity.fatherName} />
                  <Field title={ta("محل تولد")} value={data.identity.birthPlace} />
                  <Field title={ta("نام کاربری")} value={data.username} />
                </div>
              ) : (
                <p className={classes.note}>{ta("این کاربر هنوز احراز هویت نشده است.")}</p>
              )}
            </section>

            <section className={classes.card}>
              <h2 className={classes.cardTitle}>{ta("پروفایل‌های مرتبط")}</h2>
              {profiles.length ? (
                <ul className={classes.profiles}>
                  {profiles.map((profile) => (
                    <li key={profile.href}>
                      <Link href={adminPath(`/${profile.href}`)} className={classes.profile}>
                        <span className={classes.profileType}>{profile.title}</span>
                        <span className={classes.profileName}>{profile.name}</span>
                        <Ixon width="0.9rem" className={classes.profileArrow}>
                          <ChevronIcon />
                        </Ixon>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={classes.note}>
                  {ta("این کاربر پزشک، کلینیک، داروخانه یا مرکز دیگری ندارد.")}
                </p>
              )}
            </section>
          </div>

          {/* the patients' «پرو» membership (2026-10) */}
          {(viewer?.role === "admin" || hasAccess("Finance", "readAll")) && (
            <UserProCard
              userId={data._id}
              canManage={viewer?.role === "admin" || hasAccess("Finance", "update")}
            />
          )}

          <UserActivity
            userId={data._id}
            canSeeReservations={
              viewer?.role === "admin" ||
              hasAccess("Reservation", "readAll")
            }
            canSeeOrders={viewer?.role === "admin" || hasAccess("Order", "readAll")}
            canSeeWallet={viewer?.role === "admin" || hasAccess("Finance", "readAll")}
            // the manual correction: full admins and the finance team
            // (Finance "update", same as POST /admin/wallet/:id/adjust)
            canAdjustWallet={viewer?.role === "admin" || hasAccess("Finance", "update")}
            onChanged={() => mutate()}
          />

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <h2 className={classes.cardTitle}>{ta("نقش و دسترسی")}</h2>
              <div className={classes.headLinks}>
                {data.role === "notadmin" && data.accessLevel && (
                  <Link
                    href={adminPath(`/accesslevel/${data.accessLevel._id}`)}
                    className={classes.link}
                  >
                    {ta("سطح دسترسی: ${1}", [data.accessLevel.name])}
                  </Link>
                )}
                {viewer?.role === "admin" && data.role !== "user" && (
                  <Link href={adminPath(`/audit?actor=${data._id}`)} className={classes.link}>
                    {ta("لاگ عملیات این ادمین")}
                  </Link>
                )}
              </div>
            </div>
            {viewer?.role === "admin" ? (
              <RoleManager user={data} onChanged={() => mutate()} />
            ) : (
              <p className={classes.note}>
                {ta("نقش فعلی: ${1}. تغییر نقش فقط توسط سوپر ادمین ممکن است.", [roleLabels[data.role] || data.role])}
              </p>
            )}
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminManageUserPage;
