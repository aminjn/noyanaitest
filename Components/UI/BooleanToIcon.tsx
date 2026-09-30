"use client";
import { WithStyleProps } from "../Layout/Layout";
import useScopedLocale from "../Hooks/useScopedLocale";
import classes from "./BooleanToIcon.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// admin panel labels (ta: the panel's language); panels and pages use
// getContent(booleanToContentKey[`${value}`])
export const booleanToValue = {
  get true() {
    return ta("فعال");
  },
  get false() {
    return ta("غیرفعال");
  },
};

// Translation keys for booleanToValue: consumers outside the admin panel should
// render getContent(booleanToContentKey[`${value}`]) instead.
export const booleanToContentKey = {
  true: "active",
  false: "inactive",
} as const;

// Yes/no state as a small status pill (green dot = on, grey = off).
const BooleanToIcon = ({
  value,
  className = "",
  style = {},
}: WithStyleProps<{ value: boolean }>) => {
  const getContent = useScopedLocale();
  return (
    <span
      className={`${classes.main} ${value ? classes.on : classes.off} ${className}`}
      style={style}
    >
      <span className={classes.dot} />
      {getContent(booleanToContentKey[`${!!value}`])}
    </span>
  );
};

export default BooleanToIcon;
