import { ChangeEventHandler, useState } from "react";
import classes from "./SelectInput.module.css";
import { WithStyleProps } from "../Layout/Layout";

const SelectInput = ({
  onChange,
  options,
  className = "",
  readOnly,
  style,
  title,
  defaultValue,
}: WithStyleProps<{
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: Record<string, string>;
  title?: string;
  readOnly?: boolean;
  defaultValue?: string;
}>) => {
  const [value, setValue] = useState<string>(defaultValue ?? "");
  // options may bring their own "" entry (e.g. "None"); then the title isn't
  // repeated as a second empty option
  const hasEmpty = Object.prototype.hasOwnProperty.call(options, "");

  const select = (
    <select
      name={title}
      disabled={readOnly}
      className={`${classes.main} ${className}`}
      style={style}
      onChange={(e) => {
        setValue(e.target.value);
        onChange?.(e);
      }}
      defaultValue={defaultValue}
    >
      {!!title && !hasEmpty && <option value="">{title}</option>}
      {Object.keys(options).map((option) => (
        <option key={option} value={option}>
          {options[option]}
        </option>
      ))}
    </select>
  );

  if (!title) return select;
  // Like Input: once something is picked the title floats on the border,
  // so the field is still labelled (before that the first option shows it).
  const floating = value !== "" || hasEmpty;
  return (
    <div className={classes.wrap}>
      {select}
      {floating && <span className={classes.title}>{title}</span>}
    </div>
  );
};

export default SelectInput;
