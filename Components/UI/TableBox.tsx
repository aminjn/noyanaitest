import { Fragment, ReactNode } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./TableBox.module.css";

const TableBox = ({
  actions,
  children,
  title,
  className,
  style,
}: WithStyleProps<{
  children: ReactNode;
  title: string;
  actions?: [{ id: string; content: ReactNode }];
}>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.header}>
        <legend className={classes.title}>{title}</legend>
        {!!actions?.length && (
          <div className={classes.actions}>
            {actions.map((action) => (
              <Fragment key={action.id}>{action.content}</Fragment>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default TableBox;
