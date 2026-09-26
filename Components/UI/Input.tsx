import {
  ChangeEventHandler,
  forwardRef,
  HTMLInputTypeAttribute,
  ReactNode,
  useState,
} from "react";
import classes from "./Input.module.css";
import { WithStyleProps } from "../Layout/Layout";
import { currencize } from "../helpers/currencize";
import { numberToPersianWords } from "../helpers/lib";
import { tsmRegular } from "./Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

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
    required?: boolean;
    price?: boolean;
    placeholder?: string | boolean;
    autoComplete?: string;
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
      required,
      price,
      placeholder,
      autoComplete,
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState<string>(defaultValue || "");

    const getContent = useScopedLocale(LOCALE_NS);

    return (
      <div
        style={style}
        className={`${classes.main} ${price ? classes.withPrice : ""} ${className}`}
      >
        <input
          pattern={pattern}
          className={`${classes.input} ${inputClass}`}
          placeholder={typeof placeholder === "string" ? placeholder : ""}
          type={type}
          disabled={readOnly}
          onChange={(e) => {
            setInnerValue(e.target.value);
            onChange?.(e);
          }}
          defaultValue={defaultValue}
          min={min}
          max={max}
          step={step}
          ref={ref}
          autoFocus={autoFocuse}
          inputMode={inputMode}
          autoComplete={autoComplete}
        />
        {!!title && (
          <label className={classes.title}>
            {!!required && <span className={classes.required}>* </span>}
            <span>{title}</span>
          </label>
        )}
        {!!lead && <span className={classes.lead}>{lead}</span>}
        {!!tail && <span className={classes.tail}>{tail}</span>}
        {!!price && (
          <span className={`${classes.price} ${tsmRegular}`}>
            {getContent("xToman", [
              currencize(
                numberToPersianWords(
                  Number(innerValue.replaceAll(/\D/g, "") || "0"),
                ),
              ),
            ])}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
