import { ChangeEventHandler } from "react";
import classes from "./AreaInput.module.css";
import { WithStyleProps } from "../Layout/Layout";

const AreaInput = ({
  className = "",
  defaultValue,
  onChange,
  readOnly,
  style,
  title,
  required,
  inputClass = "",
}: WithStyleProps<{
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  title?: string;
  defaultValue?: string;
  readOnly?: boolean;
  required?: boolean;
  inputClass?: string;
}>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && (
        <span className={classes.title}>
          {required && <span className={classes.required}>* </span>}
          <span>{title}</span>
        </span>
      )}
      <textarea
        placeholder={title}
        className={`${classes.area} ${inputClass}`}
        onChange={onChange}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default AreaInput;
