import { ReactNode } from "react";
import classes from "./IconWithCountButton.module.css";
import { t2xsRegular } from "./Typography";
import Ixon from "./Ixon";

const IconWithCountButton = ({
  count,
  children,
  onClick,
  label,
}: {
  children?: ReactNode;
  count?: number;
  onClick?: () => unknown;
  // the button's name for screen readers (the icon has no text)
  label?: string;
}) => {
  return (
    <button type="button" onClick={onClick} className={classes.main} aria-label={label} title={label}>
      <span className={classes.icon}>
        {!!count && (
          <span className={`${classes.count} ${t2xsRegular}`}>{count > 99 ? "99+" : count}</span>
        )}
        <Ixon width="1.5rem">{children}</Ixon>
      </span>
    </button>
  );
};

export default IconWithCountButton;
