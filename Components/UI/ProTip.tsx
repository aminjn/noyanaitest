import classes from "./ProTip.module.css";
import { ReactNode } from "react";

const ProTip = ({ children }: { children?: ReactNode }) => {
  return <p className={classes.main}>{children}</p>;
};

export default ProTip;
