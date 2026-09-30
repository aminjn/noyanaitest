import classes from "./userShared.module.css";
import { adminDateTimeFormat, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";

export const roleLabels: Record<string, string> = {
  get admin() {
  return ta("سوپر ادمین");
},
  get notadmin() {
  return ta("کارمند");
},
  get user() {
  return ta("کاربر");
},
};

export const RoleBadge = ({ role }: { role: string }) => (
  <span className={`${classes.role} ${classes[`role_${role}`] || ""}`}>
    {roleLabels[role] || role}
  </span>
);

// Stored as 989123456789 -> shown as 09123456789
export const displayPhone = (phone?: string) =>
  phone?.startsWith("98") ? `0${phone.slice(2)}` : phone || "";

export const num = adminNumberFormat();

export const faDate = adminDateTimeFormat({
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const faDateTime = adminDateTimeFormat({
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
