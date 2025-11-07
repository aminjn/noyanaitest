import { ReactNode } from "react";
import classes from "./DoctorsCardList.module.css";

const DoctorsCardList = ({ children }: { children: ReactNode }) => {
  return <ul className={classes.list}>{children}</ul>;
};

export default DoctorsCardList;
