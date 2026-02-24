import {
  ChangeEventHandler,
  forwardRef,
  HTMLInputTypeAttribute,
  ReactNode,
} from "react";
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
    lead?: ReactNode;
    tail?: ReactNode;
    inputClass?: string;
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
      lead,
      tail,
      inputClass = "",
    },
    ref,
  ) => {
    return (
      <div style={style} className={`${classes.main} ${className}`}>
        <input
          pattern={pattern}
          className={`${classes.input} ${inputClass}`}
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
        {!!title && <label className={classes.title}>{title}</label>}
        {!!lead && <span className={classes.lead}>{lead}</span>}
        {!!tail && <span className={classes.tail}>{tail}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
