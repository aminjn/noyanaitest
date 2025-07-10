import { Fragment } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./FormatDate.module.css";

const FormatDate = ({
  value,
  date = true,
  time = true,
  className = "",
  style,
}: WithStyleProps<{
  value?: Date;
  date?: boolean;
  time?: boolean;
}>) => {
  if (!value) return <Fragment />;
  return (
    <span className={className} style={style}>
      {new Date(value).toLocaleString("fa-IR", {
        ...(date ? { day: "numeric", month: "long", year: "numeric" } : {}),
        ...(time
          ? { hour: "numeric", minute: "numeric", second: "numeric" }
          : {}),
      })}
    </span>
  );
};

export default FormatDate;
