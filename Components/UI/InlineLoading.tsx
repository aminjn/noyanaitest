import { WithStyleProps } from "../Layout/Layout";
import classes from "./InlineLoading.module.css";

const InlineLoading = ({ className = "", style }: WithStyleProps) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.dot} />
      <div className={classes.dot} style={{ animationDelay: "300ms" }} />
      <div className={classes.dot} style={{ animationDelay: "600ms" }} />
    </div>
  );
};

export default InlineLoading;
