import { ReactNode } from "react";
import classes from "./BookingFilterSegment.module.css";
import { t2xsRegular } from "../UI/Typography";
const BookingFilterSegment = ({
  title,
  action,
  children,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) => {
  return (
    <div className={classes.segment}>
      <span className={classes.segmentHeader}>
        <span className={`${classes.segmentTitle} ${t2xsRegular}`}>
          {title}
        </span>
        {action}
      </span>
      <div className={classes.segmentContent}>{children}</div>
    </div>
  );
};

export default BookingFilterSegment;
