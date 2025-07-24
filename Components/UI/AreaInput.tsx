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
}: WithStyleProps<{
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  title?: string;
  defaultValue?: string;
  readOnly?: boolean;
}>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && <span className={classes.title}>{title}</span>}
      <textarea
        placeholder={title}
        className={classes.area}
        onChange={onChange}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default AreaInput;
