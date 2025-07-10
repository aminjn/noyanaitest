import { ReactNode } from "react";
import classes from "./Title.module.css";

const Title = ({ children }: { children: ReactNode }) => {
  return <legend className={classes.main}>{children}</legend>;
};

export default Title;
