import { ReactNode } from "react";
import classes from "./TableActions.module.css";

const TableActions = ({ children }: { children?: ReactNode }) => {
  return <div className={classes.main}>{children}</div>;
};

export default TableActions;
