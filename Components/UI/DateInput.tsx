import DatePicker from "react-multi-date-picker";
import classes from "./Input.module.css";
import { WithStyleProps } from "../Layout/Layout";
import { useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import useLocale from "../Hooks/useLocale";

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
  defaultValue?: Date | string;
  onChange?: (e: Date) => unknown;
  readOnly?: boolean;
  placeholder?: string | boolean;
  onClear?: () => unknown;
}>) => {
  const getContent = useLocale();

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
        value={defaultValue}
        onChange={(e) => {
          const newVal = e?.toDate();
          if (newVal) onChange?.(newVal);
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
