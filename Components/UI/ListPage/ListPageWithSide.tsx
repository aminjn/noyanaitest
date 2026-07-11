import { ReactNode } from "react";
import classes from "./ListPageWithSide.module.css";
const ListPageWithSide = ({
  children,
  side,
}: {
  children?: ReactNode;
  side?: ReactNode;
}) => {
  return (
    <div className={classes.main}>
      <div className={classes.side}>{side}</div>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default ListPageWithSide;
