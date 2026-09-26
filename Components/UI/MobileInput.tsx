import { ChangeEventHandler, useState } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./MobileInput.module.css";
import { convertPersianToEnglishDigits } from "../helpers/lib";
import { isMobile } from "../helpers/Validators";
import useScopedLocale from "../Hooks/useScopedLocale";

const MobileInput = ({
  onChange,
  className = "",
  style,
  readOnly,
  defaultValue,
}: WithStyleProps<{
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  defaultValue?: string;
}>) => {
  const [value, setValue] = useState<string>("");
  const getContent = useScopedLocale();

  return (
    <div
      className={`${classes.main} ${
        !!value && !isMobile(value) ? classes.invalid : ""
      } ${className}`}
      style={style}
    >
      <input
        autoFocus
        readOnly={readOnly}
        className={classes.input}
        placeholder=""
        defaultValue={defaultValue}
        onChange={(e) => {
          e.target.value = convertPersianToEnglishDigits(e.target.value);
          const val = Number(e.target.value);
          if (isNaN(val) || !/^\d*$/.test(e.target.value)) {
            e.target.value = e.target.getAttribute("prev") || "";
            return;
          }
          e.target.setAttribute("prev", e.target.value);
          setValue(e.target.value);
          onChange?.(e);
        }}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <span className={classes.placeholder}>{getContent("mobileNumber")}</span>
      <span className={classes.pre}>+98</span>
      {!!value && !isMobile(value) && (
        <span className={classes.error}>
          {getContent("mobileNumberFormatError")}
        </span>
      )}
    </div>
  );
};

export default MobileInput;
