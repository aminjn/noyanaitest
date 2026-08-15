import { ReactNode } from "react";
import classes from "./IconTitle.module.css";
import Ixon from "./Ixon";
import { tbaseMedium } from "./Typography";

const IconTitle = ({
  children,
  icon,
}: {
  icon?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <div className={`${classes.main} ${tbaseMedium}`}>
      {!!icon && (
        <Ixon width="1rem" className={classes.icon}>
          {icon}
        </Ixon>
      )}
      <span>{children}</span>
    </div>
  );
};

export default IconTitle;
