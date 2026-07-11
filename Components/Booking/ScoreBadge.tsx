import { ReactNode } from "react";
import Ixon from "../UI/Ixon";
import { t2xsMedium } from "../UI/Typography";
import classes from "./ScoreBadge.module.css";
const ScoreBadge = ({
  icon,
  value,
  iconColor,
}: {
  icon: ReactNode;
  value: string;
  iconColor: string;
}) => {
  return (
    <div className={`${classes.score} ${t2xsMedium}`}>
      <Ixon style={{ color: iconColor }} width=".75rem">
        {icon}
      </Ixon>
      <span>{value}</span>
    </div>
  );
};

export default ScoreBadge;
