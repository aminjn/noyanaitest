import { ReactNode } from "react";
import classes from "./BookingLayout.module.css";
const BookingLayout = ({ children }: { children?: ReactNode }) => {
  return <div className={classes.content}>{children}</div>;
};

export default BookingLayout;
