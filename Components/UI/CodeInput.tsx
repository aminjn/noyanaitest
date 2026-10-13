"use client";
import { ClipboardEvent, useEffect, useRef } from "react";
import classes from "./CodeInput.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { WithStyleProps } from "../Layout/Layout";
import { toLatinDigits } from "../helpers/phone";

// The SMS code as separate digit boxes. Typing moves to the next box,
// Backspace on an empty box goes back, arrows move, a paste (or the phone's
// code autofill, `one-time-code`) fills every box at once - in any script.
// Controlled: `value` is the digits typed so far.
const CodeInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  readOnly,
  autoFocus,
  invalid,
  className = "",
  style,
}: WithStyleProps<{
  length?: number;
  value: string;
  onChange: (val: string) => unknown;
  // every box is filled (also right after a paste / autofill)
  onComplete?: (val: string) => unknown;
  readOnly?: boolean;
  autoFocus?: boolean;
  // the code was refused: red boxes and a shake
  invalid?: boolean;
}>) => {
  const getContent = useScopedLocale();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");
  // the code as of the last keystroke: fast typing (or a keyboard that
  // types for you) can land in the next box before the parent re-renders
  const latest = useRef(value);
  latest.current = value;

  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    if (!el) return;
    el.focus();
    requestAnimationFrame(() => el.select());
  };

  useEffect(() => {
    if (autoFocus) focusBox(Math.min(value.length, length - 1));
    // only when the boxes appear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // a refused code is cleared by the parent: start again from the first box
  useEffect(() => {
    if (invalid && !value) focusBox(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalid, value]);

  const commit = (next: string) => {
    const clean = toLatinDigits(next).replace(/\D/g, "").slice(0, length);
    latest.current = clean;
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  // write `typed` starting at box `index`, keeping the boxes before it
  const fillFrom = (index: number, typed: string) => {
    const head = latest.current.slice(0, index);
    const clean = commit(head + typed);
    focusBox(clean.length >= length ? length - 1 : clean.length);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = toLatinDigits(e.clipboardData.getData("text")).replace(/\D/g, "");
    e.preventDefault();
    if (!pasted || readOnly) return;
    fillFrom(0, pasted);
  };

  return (
    <div
      className={`${classes.main} ${invalid ? classes.invalid : ""} ${className}`}
      style={style}
      dir="ltr"
      role="group"
      aria-label={getContent("otpCodeLabel")}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          className={`${classes.digit} ${digit ? classes.filled : ""}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          // the phone offers the SMS code on the first box and fills them all
          autoComplete={index === 0 ? "one-time-code" : "off"}
          // a whole code can arrive in one box (autofill, some keyboards)
          maxLength={index === 0 ? length : 2}
          readOnly={readOnly}
          value={digit}
          aria-label={getContent("otpDigitLabel", [String(index + 1), String(length)])}
          aria-invalid={invalid || undefined}
          onFocus={(e) => {
            // the boxes fill in order: a tap past the end goes to the first empty one
            if (index > latest.current.length) return focusBox(latest.current.length);
            e.currentTarget.select();
          }}
          onPaste={onPaste}
          onChange={(e) => {
            if (readOnly) return;
            const typed = toLatinDigits(e.target.value).replace(/\D/g, "");
            if (!typed) {
              // the digit was deleted (select + delete, cut)
              const cur = latest.current;
              commit(cur.slice(0, index) + cur.slice(index + 1));
              return;
            }
            // a box holding a digit got one more: the newest replaces it
            const had = latest.current[index] || "";
            const fresh = typed.length === 2 && had ? typed.replace(had, "") || typed[1] : typed;
            fillFrom(index, fresh);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !latest.current[index] && index > 0) {
              e.preventDefault();
              commit(latest.current.slice(0, index - 1));
              focusBox(index - 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              focusBox(index - 1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              focusBox(index + 1);
            } else if (e.key === "Home") {
              e.preventDefault();
              focusBox(0);
            } else if (e.key === "End") {
              e.preventDefault();
              focusBox(length - 1);
            }
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;
