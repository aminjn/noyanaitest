"use client";
import { KeyboardEventHandler, RefObject, useId, useLayoutEffect, useRef } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./MobileInput.module.css";
import { isMobile } from "../helpers/Validators";
import { groupNationalMobile, toNationalMobile } from "../helpers/phone";
import useScopedLocale from "../Hooks/useScopedLocale";
import Ixon from "./Ixon";
import CheckIcon from "../Icons/CheckIcon";
import AlertCircleIcon from "../Icons/AlertCircleIcon";

// An Iranian mobile number behind a +98 chip (Snapp / Digikala / Doctolib
// style). Takes any script and any shape - "0912…", "+98 912…", "۰۹۱۲…",
// "٠٩١٢…" - and hands back the 10 national digits ("9122862184"). The
// number reads left to right in every language, so the field is LTR and the
// chip sits before it.
const MobileInput = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  error,
  label,
  readOnly,
  autoFocus,
  inputRef,
  className = "",
  style,
}: WithStyleProps<{
  // the national digits (see Components/helpers/phone.ts)
  value: string;
  onChange: (digits: string) => unknown;
  onBlur?: () => unknown;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  // shown under the field; also marks it invalid
  error?: string | false;
  label?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}>) => {
  const getContent = useScopedLocale();
  const id = useId();
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || ownRef;
  // where the caret goes after the value is re-grouped: after this many digits
  const caretDigits = useRef<number | null>(null);

  const display = groupNationalMobile(value);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || caretDigits.current === null || document.activeElement !== el) return;
    let seen = 0;
    let pos = 0;
    while (pos < display.length && seen < caretDigits.current) {
      if (/\d/.test(display[pos])) seen++;
      pos++;
    }
    caretDigits.current = null;
    el.setSelectionRange(pos, pos);
  }, [display, ref]);

  const valid = isMobile(value);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <label className={classes.label} htmlFor={id}>
        {label || getContent("mobileNumber")}
      </label>
      <div
        className={`${classes.control} ${error ? classes.invalid : ""} ${readOnly ? classes.readOnly : ""}`}
        dir="ltr"
      >
        <span className={classes.prefix} aria-hidden>
          +98
        </span>
        <input
          ref={ref}
          id={id}
          className={classes.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          dir="ltr"
          placeholder="912 345 6789"
          autoFocus={autoFocus}
          readOnly={readOnly}
          value={display}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            const raw = e.target.value;
            const caret = e.target.selectionStart ?? raw.length;
            const before = toNationalMobile(raw.slice(0, caret));
            const next = toNationalMobile(raw);
            caretDigits.current = Math.min(before.replace(/^0$/, "").length || (next === "0" ? 1 : 0), next.length);
            onChange(next);
          }}
        />
        {valid && !error && (
          <span className={classes.ok} aria-hidden>
            <Ixon width="1.125rem">
              <CheckIcon />
            </Ixon>
          </span>
        )}
      </div>
      {!!error && (
        <p id={`${id}-error`} className={classes.error} role="alert">
          <Ixon width="1rem">
            <AlertCircleIcon />
          </Ixon>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default MobileInput;
