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
  return (
    <span
      style={{ width, height: width, ...style }}
      className={`${classes.main} ${className}`}
    >
      {children}
    </span>
  );
};

export default Ixon;
