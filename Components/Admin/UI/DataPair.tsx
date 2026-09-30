import { ReactNode } from "react";
import classes from "./DataPair.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

const DataPair = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
  return (
    <div className={classes.main}>
      <span className={classes.title}>{typeof title === "string" ? ta(title) : title}</span>
      <span className={classes.value}>{value}</span>
    </div>
  );
};

export default DataPair;
