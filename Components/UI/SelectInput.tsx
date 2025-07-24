import { ChangeEventHandler } from "react";
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
  return (
    <select
      name={title}
      disabled={readOnly}
      className={`${classes.main} ${className}`}
      style={style}
      onChange={onChange}
      defaultValue={defaultValue}
    >
      {!!title && <option value="">{title}</option>}
      {Object.keys(options).map((option) => (
        <option key={option} value={option}>
          {options[option]}
        </option>
      ))}
    </select>
  );
};

export default SelectInput;
