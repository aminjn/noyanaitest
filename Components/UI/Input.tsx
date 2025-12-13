import { ChangeEventHandler, forwardRef, HTMLInputTypeAttribute } from "react";
import classes from "./Input.module.css";
import { WithStyleProps } from "../Layout/Layout";

const Input = forwardRef<
  HTMLInputElement,
  WithStyleProps<{
    title?: string;
    type?: HTMLInputTypeAttribute;
    defaultValue?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    readOnly?: boolean;
    min?: number;
    max?: number;
    step?: number;
    autoFocuse?: boolean;
    pattern?: string;
    inputMode?:
      | "none"
      | "text"
      | "tel"
      | "url"
      | "email"
      | "numeric"
      | "decimal"
      | "search";
  }>
>(
  (
    {
      className = "",
      defaultValue,
      max,
      min,
      onChange,
      readOnly,
      step,
      style,
      title,
      type,
      autoFocuse,
      pattern,
      inputMode,
    },
    ref
  ) => {
    return (
      <div style={style} className={`${classes.main} ${className}`}>
        <input
          pattern={pattern}
          className={classes.input}
          placeholder=""
          type={type}
          disabled={readOnly}
          onChange={onChange}
          defaultValue={defaultValue}
          min={min}
          max={max}
          step={step}
          ref={ref}
          autoFocus={autoFocuse}
          inputMode={inputMode}
        />
        {!!title && <span className={classes.title}>{title}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
