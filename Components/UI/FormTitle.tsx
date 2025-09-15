import { ReactNode } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./FormTitle.module.css";

const FormTitle = ({
  children,
  className = "",
  style,
}: WithStyleProps<{ children?: ReactNode }>) => {
  return (
    <legend className={`${classes.main} ${className}`} style={style}>
      {children}
    </legend>
  );
};

export default FormTitle;
