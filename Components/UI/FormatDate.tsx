import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { Fragment } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./FormatDate.module.css";

export const dateToString = ({
  value,
  date = true,
  time = true,
  intlTag = "fa-IR",
}: {
  value: Date;
  date?: boolean;
  time?: boolean;
  // Intl tag of the current language (useIntlLocale); Persian by default
  intlTag?: string;
}) => {
  const parsed = new Date(value);
  // a missing / malformed date shows a dash, not "Invalid Date"
  if (value === undefined || value === null || isNaN(parsed.getTime()))
    return "—";
  return parsed.toLocaleString(intlTag, {
    timeZone: TEHRAN_TZ,
    ...(date ? { day: "numeric", month: "long", year: "numeric" } : {}),
    ...(time ? { hour: "numeric", minute: "numeric", second: "numeric" } : {}),
  });
};

const FormatDate = ({
  value,
  date = true,
  time = true,
  className = "",
  style,
}: WithStyleProps<{
  value?: Date | string | number;
  date?: boolean;
  time?: boolean;
}>) => {
  const intlTag = useIntlLocale();
  if (!value) return <Fragment />;
  return (
    <span className={className} style={style}>
      {dateToString({ value: new Date(value), date, time, intlTag })}
    </span>
  );
};

export default FormatDate;
