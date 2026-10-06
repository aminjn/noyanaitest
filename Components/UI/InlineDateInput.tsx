import { useEffect, useState } from "react";
import classes from "./InlineDateInput.module.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { t2xsRegular } from "./Typography";
import Ixon from "./Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { fromPicker, pickerValueOf } from "../helpers/tehranTime";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const InlineDateInput = ({
  onChange,
  value,
  max,
  min,
  placeholder,
  prefix,
}: {
  value: Date | null;
  onChange: (e: Date | null) => unknown;
  min?: Date;
  max?: Date;
  placeholder?: string;
  prefix?: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  // Mirrors `value` locally so the picked date renders immediately even when
  // this component sits inside a popup snapshot (Components/Popup/Popup.tsx)
  // that won't re-receive fresh props from its parent after the popup opens -
  // onChange is still called so the real state upstream stays correct.
  const [innerValue, setInnerValue] = useState<Date | null>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  return (
    <div className={classes.main}>
      {!!prefix && <span className={t2xsRegular}>{prefix}</span>}
      <DatePicker
        containerClassName={classes.container}
        placeholder={placeholder || getContent("selectDate")}
        inputClass={`${classes.input} ${t2xsRegular}`}
        calendar={persian}
        locale={persian_fa}
        multiple={false}
        // Tehran days in and out (Components/helpers/tehranTime.ts)
        value={pickerValueOf(innerValue) || null}
        onChange={(e) => {
          const picked = e?.toDate();
          const newValue = picked ? fromPicker(picked) : null;
          setInnerValue(newValue);
          onChange(newValue);
        }}
        minDate={pickerValueOf(min)}
        maxDate={pickerValueOf(max)}
      />
      {!!innerValue && (
        <button
          type="button"
          onClick={() => {
            setInnerValue(null);
            onChange(null);
          }}
          className={classes.clear}
        >
          <Ixon width="1rem">
            <XMarkIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};

export default InlineDateInput;
