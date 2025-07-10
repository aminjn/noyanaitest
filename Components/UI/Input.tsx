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
    },
    ref
  ) => {
    return (
      <div style={style} className={`${classes.main} ${className}`}>
        <input
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
        />
        {!!title && <span className={classes.title}>{title}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
