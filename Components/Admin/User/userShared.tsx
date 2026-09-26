import classes from "./userShared.module.css";

export const roleLabels: Record<string, string> = {
  admin: "سوپر ادمین",
  notadmin: "کارمند",
  user: "کاربر",
};

export const RoleBadge = ({ role }: { role: string }) => (
  <span className={`${classes.role} ${classes[`role_${role}`] || ""}`}>
    {roleLabels[role] || role}
  </span>
);

// Stored as 989123456789 -> shown as 09123456789
export const displayPhone = (phone?: string) =>
  phone?.startsWith("98") ? `0${phone.slice(2)}` : phone || "";

export const num = new Intl.NumberFormat("fa-IR");

export const faDate = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const faDateTime = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
