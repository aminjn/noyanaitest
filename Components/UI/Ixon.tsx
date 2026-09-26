import { ReactNode } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./Ixon.module.css";

const Ixon = ({
  width = "100%",
  className = "",
  style = {},
  children,
}: WithStyleProps<{
  width?: string;
  children?: ReactNode;
}>) => {
  // A chevron turned sideways points "back" in RTL; mirror it in LTR pages.
  const sideways = /rotateZ\(-?90deg\)/.test(String(style.transform || ""));
  return (
    <span
      style={{ width, height: width, ...style }}
      className={`${classes.main} ${sideways ? classes.sideways : ""} ${className}`}
    >
      {children}
    </span>
  );
};

export default Ixon;
