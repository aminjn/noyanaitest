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
}) =>
  new Date(value).toLocaleString(intlTag, {
    ...(date ? { day: "numeric", month: "long", year: "numeric" } : {}),
    ...(time ? { hour: "numeric", minute: "numeric", second: "numeric" } : {}),
  });

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
