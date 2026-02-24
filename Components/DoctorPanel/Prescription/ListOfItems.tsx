import { ReactNode } from "react";
import classes from "./ListOfItems.module.css";

const ListOfItems = ({ children }: { children?: ReactNode }) => {
  return <div className={classes.main}>{children}</div>;
};

export default ListOfItems;
