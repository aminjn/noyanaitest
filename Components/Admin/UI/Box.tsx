import { ReactNode } from "react";
import classes from "./Box.module.css";
import { WithStyleProps } from "./Loading";

const Box = ({
  children,
  className = "",
  style,
  noThanks,
}: WithStyleProps<{ children?: ReactNode; noThanks?: boolean }>) => {
  if (noThanks) return <div>{children}</div>;
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Box;
