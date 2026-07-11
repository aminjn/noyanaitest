import { ReactNode } from "react";
import classes from "./ListPageLayout.module.css";
const ListPageLayout = ({ children }: { children: ReactNode }) => {
  return <div className={classes.main}>{children}</div>;
};

export default ListPageLayout;
