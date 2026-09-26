"use client";
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

type UserDetail = {
  _id: string;
  phone: string;
  username?: string;
  role: "admin" | "notadmin" | "user";
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
  counts: { reservations: number; orders: number };
  profiles: { key: string; title: string; href: string; name: string }[];
  isSelf: boolean;
};

type AccessLevelOption = { _id: string; name: string };

const Field = ({ title, value }: { title: string; value?: React.ReactNode }) => (
  <div className={classes.field}>
    <span className={classes.fieldTitle}>{title}</span>
    <span className={classes.fieldValue}>{value || "—"}</span>
  </div>
);

const roleOptions: { role: UserDetail["role"]; title: string; description: string }[] = [
  { role: "user", title: "کاربر عادی", description: "بدون دسترسی به پنل مدیریت" },
  { role: "notadmin", title: "کارمند", description: "دسترسی به پنل طبق سطح دسترسی انتخاب‌شده" },
  { role: "admin", title: "سوپر ادمین", description: "دسترسی کامل به همه بخش‌ها و تنظیمات سیستم" },
];

// Role + access level editor and forced logout. Full admins only; the
// backend enforces the same rules (no self-change, keep one admin).
const RoleManager = ({
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
      pushNotification("نقش کاربر به‌روزرسانی شد", "Success");
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
        message={`نقش ${displayPhone(user.phone)} به «${roleLabels[role]}» تغییر کند؟${
          role === "admin" ? " سوپر ادمین به همه بخش‌ها و تنظیمات دسترسی کامل دارد." : ""
        }`}
        onConfirm={save}
      />,
    );

  const logout = async () => {
    try {
      await fetcher({ url: `${API}/admin/users/${user._id}/logout`, method: "POST" });
      pushNotification("کاربر از همه دستگاه‌ها خارج شد", "Success");
      closePopup("userLogout");
      onChanged();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    }
  };

  if (user.isSelf)
    return (
      <p className={classes.note}>
        نقش حساب خودتان از این‌جا قابل تغییر نیست. برای تغییر، از سوپر ادمین دیگری کمک بگیرید.
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
          <span>سطح دسترسی</span>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
            <option value="">انتخاب کنید...</option>
            {levels?.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>
          {levels && levels.length === 0 && (
            <span className={classes.note}>
              هنوز سطح دسترسی‌ای ساخته نشده.{" "}
              <Link href={adminPath("/accesslevel")}>ساخت سطح دسترسی</Link>
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
          ذخیره نقش
        </Button>
        <Button
          size="M"
          mode="Outline"
          variant="Error"
          onClick={() =>
            setPopup(
              "userLogout",
              <ConfirmationPopup
                message="همه نشست‌های این کاربر باطل شود؟ کاربر باید دوباره وارد شود."
                onConfirm={logout}
              />,
            )
          }
        >
          خروج از همه دستگاه‌ها
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

  const displayName = data?.identity
    ? `${data.identity.givenName} ${data.identity.lastName}`
    : data?.username;

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <Link href={adminPath("/user")} className={classes.back}>
            <Ixon width="1rem" className={classes.backIcon}>
              <ChevronIcon />
            </Ixon>
            <span>کاربران</span>
          </Link>

          <section className={`${classes.card} ${classes.hero}`}>
            <span className={classes.avatar}>{(displayName || "؟").trim().charAt(0)}</span>
            <div className={classes.heroText}>
              <div className={classes.heroTitle}>
                <h1>{displayName || "بدون نام"}</h1>
                <RoleBadge role={data.role} />
              </div>
              <span className={classes.phone}>{displayPhone(data.phone)}</span>
              <span className={classes.meta}>
                {`عضویت: ${faDate.format(new Date(data.createdAt))}`}
                {data.lastLogin &&
                  ` · آخرین ورود/خروج: ${faDateTime.format(new Date(data.lastLogin))}`}
              </span>
            </div>
            <div className={classes.stats}>
              <div>
                <strong>{num.format(data.counts.reservations)}</strong>
                <span>رزرو</span>
              </div>
              <div>
                <strong>{num.format(data.counts.orders)}</strong>
                <span>سفارش</span>
              </div>
              <div>
                <strong>{num.format(data.walletBalance)}</strong>
                <span>موجودی کیف پول (تومان)</span>
              </div>
            </div>
          </section>

          <div className={classes.grid}>
            <section className={classes.card}>
              <h2 className={classes.cardTitle}>اطلاعات هویتی</h2>
              {data.identity ? (
                <div className={classes.fields}>
                  <Field title="نام" value={data.identity.givenName} />
                  <Field title="نام خانوادگی" value={data.identity.lastName} />
                  <Field title="کد ملی" value={data.identity.nationalId} />
                  <Field
                    title="جنسیت"
                    value={data.identity.gender === "female" ? "زن" : "مرد"}
                  />
                  <Field
                    title="تاریخ تولد"
                    value={faDate.format(new Date(data.identity.dateOfbirth))}
                  />
                  <Field title="نام پدر" value={data.identity.fatherName} />
                  <Field title="محل تولد" value={data.identity.birthPlace} />
                  <Field title="نام کاربری" value={data.username} />
                </div>
              ) : (
                <p className={classes.note}>این کاربر هنوز احراز هویت نشده است.</p>
              )}
            </section>

            <section className={classes.card}>
              <h2 className={classes.cardTitle}>پروفایل‌های مرتبط</h2>
              {data.profiles.length ? (
                <ul className={classes.profiles}>
                  {data.profiles.map((profile) => (
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
                  این کاربر پزشک، کلینیک، داروخانه یا مرکز دیگری ندارد.
                </p>
              )}
            </section>
          </div>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <h2 className={classes.cardTitle}>نقش و دسترسی</h2>
              <div className={classes.headLinks}>
                {data.role === "notadmin" && data.accessLevel && (
                  <Link
                    href={adminPath(`/accesslevel/${data.accessLevel._id}`)}
                    className={classes.link}
                  >
                    {`سطح دسترسی: ${data.accessLevel.name}`}
                  </Link>
                )}
                {viewer?.role === "admin" && data.role !== "user" && (
                  <Link href={adminPath(`/audit?actor=${data._id}`)} className={classes.link}>
                    لاگ عملیات این ادمین
                  </Link>
                )}
              </div>
            </div>
            {viewer?.role === "admin" ? (
              <RoleManager user={data} onChanged={() => mutate()} />
            ) : (
              <p className={classes.note}>
                {`نقش فعلی: ${roleLabels[data.role]}. تغییر نقش فقط توسط سوپر ادمین ممکن است.`}
              </p>
            )}
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminManageUserPage;
