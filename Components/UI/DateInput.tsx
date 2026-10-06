import DatePicker from "react-multi-date-picker";
import classes from "./Input.module.css";
import { WithStyleProps } from "../Layout/Layout";
import { useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { fromPicker, pickerValueOf } from "../helpers/tehranTime";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const DateInput = ({
  className = "",
  style,
  title,
  defaultValue,
  onChange,
  readOnly,
  placeholder,
  onClear,
}: WithStyleProps<{
  title?: string;
  // a "YYYY-MM-DD" day or an instant, read as its Tehran day
  defaultValue?: Date | string;
  // the picked day as its Tehran noon (Components/helpers/tehranTime.ts)
  onChange?: (e: Date) => unknown;
  readOnly?: boolean;
  placeholder?: string | boolean;
  onClear?: () => unknown;
}>) => {
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <DatePicker
        inputClass={classes.input}
        placeholder={
          "string" === typeof placeholder
            ? placeholder
            : !!placeholder
              ? title
              : getContent("selectDate")
        }
        portal
        portalTarget={document.body}
        calendarPosition="top-center"
        value={pickerValueOf(defaultValue)}
        onChange={(e) => {
          const newVal = e?.toDate();
          if (newVal) onChange?.(fromPicker(newVal));
        }}
        calendar={persian}
        locale={persian_fa}
        disabled={readOnly}
      />
      <span className={classes.title}>{title}</span>
    </div>
  );
};

export default DateInput;
