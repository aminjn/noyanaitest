import { WithStyleProps } from "../Layout/Layout";
import classes from "./VerticalDivider.module.css";
const VerticalDivider = ({ className = "", style }: WithStyleProps) => {
  return (
    <span className={`${classes.main} ${className}`} style={style}>
      |
    </span>
  );
};

export default VerticalDivider;
