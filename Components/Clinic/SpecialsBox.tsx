import { ReactNode } from "react";
import classes from "./SpecialsBox.module.css";
import Ixon from "../UI/Ixon";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import CrownIcon from "../Icons/CrownIcon";
import { t2xsRegular, tsmBold } from "../UI/Typography";

const SpecialsBox = ({
  icon,
  title,
  badge,
  description,
  button,
  children,
}: {
  icon: ReactNode;
  title: string;
  badge: string;
  description: string;
  button: string;
  children?: ReactNode;
}) => {
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={`${classes.icon} glassIcon tone-sky`}>
          <Ixon width="1.25rem">{icon}</Ixon>
        </div>
        <div className={classes.details}>
          <div className={classes.titleBox}>
            <span className={`${classes.title} ${tsmBold}`}>{title}</span>
            <Badge color="Primarylight" mode="Fill" radius="High" size="L">
              {badge}
            </Badge>
          </div>
          <span className={`${classes.description} ${t2xsRegular}`}>
            {description}
          </span>
        </div>
        <Button
          size="S"
          mode="Fill"
          variant="Secondary"
          radius="High"
          leadIcon={<CrownIcon />}
        >
          {button}
        </Button>
      </div>
      <div className={classes.list}>{children}</div>
    </div>
  );
};

export default SpecialsBox;
