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
  defaultvalue,
}: WithStyleProps<{
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: Record<string, string>;
  title?: string;
  readOnly?: boolean;
  defaultvalue?: string;
}>) => {
  return (
    <select
      name={title}
      disabled={readOnly}
      className={`${classes.main} ${className}`}
      style={style}
      onChange={onChange}
      defaultValue={defaultvalue}
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
