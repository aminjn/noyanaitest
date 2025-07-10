import { ReactNode } from "react";
import classes from "./FormActions.module.css";
import { WithStyleProps } from "./Loading";

const FormActions = ({
  children,
  className = "",
  style,
}: WithStyleProps<{ children: ReactNode }>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default FormActions;
