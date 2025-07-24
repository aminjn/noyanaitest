import { ReactNode } from "react";
import classes from "./DataPair.module.css";

const DataPair = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
  return (
    <div className={classes.main}>
      <span className={classes.title}>{title}</span>
      <span className={classes.value}>{value}</span>
    </div>
  );
};

export default DataPair;
