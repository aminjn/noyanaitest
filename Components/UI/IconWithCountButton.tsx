import { ReactNode } from "react";
import classes from "./IconWithCountButton.module.css";
import { t2xsRegular } from "./Typography";
import Ixon from "./Ixon";

const IconWithCountButton = ({
  count,
  children,
  onClick,
}: {
  children?: ReactNode;
  count?: number;
  onClick?: () => unknown;
}) => {
  return (
    <button type="button" onClick={onClick} className={classes.main}>
      {!!count && (
        <div className={`${classes.count} ${t2xsRegular}`}>{count}</div>
      )}
      <Ixon width="1.5rem">{children}</Ixon>
    </button>
  );
};

export default IconWithCountButton;
