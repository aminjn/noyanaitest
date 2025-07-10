import { ClipboardEventHandler, useCallback, useEffect, useState } from "react";
import classes from "./CodeInput.module.css";
import useNotification from "../Hooks/useNotification";
import { WithStyleProps } from "../Layout/Layout";

const CodeInput = ({
  length = 6,
  onChange,
  readOnly,
  className = "",
  style,
}: WithStyleProps<{
  length?: number;
  onChange?: (val: string) => unknown;
  readOnly?: boolean;
}>) => {
  const [value, setValue] = useState<string>("");
  const [shouldShow, setShouldShow] = useState<boolean>();
  const pushNotification = useNotification();

  const onPaste = useCallback<ClipboardEventHandler<HTMLInputElement>>(
    (e) => {
      const pasted = e.clipboardData.getData("text");
      const code = pasted.match(/\d{5}/)?.[0];
      if (!code)
        return pushNotification("مقدار کپی شده شامل کد نمیباشد", "Error");
      setValue(code);
      onChange?.(code);
      setShouldShow(false);
    },
    [onChange, pushNotification]
  );

  useEffect(() => {
    if (!shouldShow) setShouldShow(true);
  }, [shouldShow]);

  if (!shouldShow) return null;
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {Array.apply(null, Array(length)).map((_, index) => (
        <input
          onPaste={onPaste}
          key={`code${index}`}
          inputMode="numeric"
          pattern="[0-9]*"
          className={classes.digit}
          readOnly={readOnly}
          defaultValue={value[index]}
          onKeyUp={(e) => {
            if (
              !e.currentTarget.getAttribute("prev") &&
              e.code === "Backspace"
            ) {
              const prev = e.currentTarget.previousElementSibling;
              if (prev?.tagName === "INPUT") (prev as HTMLInputElement).focus();
            }
          }}
          onFocus={(e) => {
            e.target.setSelectionRange(0, 1);
          }}
          onInput={(e) => {
            if (
              !e.currentTarget.value ||
              isNaN(Number(e.currentTarget.value)) ||
              e.currentTarget.value.length !== 1
            )
              return;
            const next = e.currentTarget.nextElementSibling;
            if (next?.tagName === "INPUT") {
              (next as HTMLInputElement).focus();
            }
          }}
          onChange={(e) => {
            const prevVal = e.target.getAttribute("prev") || "";
            if (
              !e.target.value ||
              (!isNaN(Number(e.target.value)) && e.target.value.length === 1)
            ) {
              e.target.setAttribute("prev", e.target.value);
            } else {
              e.target.value = prevVal;
            }
            const temp = value.split("");
            temp[index] = e.target.value;
            const newVal = temp.join("");
            setValue(newVal);
            onChange?.(newVal);
          }}
        />
      ))}
    </div>
  );
};
export default CodeInput;
