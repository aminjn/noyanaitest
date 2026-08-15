import { ReactNode } from "react";
import Ixon from "../UI/Ixon";
import classes from "./InfoPair.module.css";
import CogIcon from "../Icons/CogIcon";

const InfoPair = ({
  icon = <CogIcon />,
  title,
  value,
  target,
}: {
  title: string;
  value: string;
  icon?: ReactNode;
  target?: string;
}) => {
  return (
    <div className={classes.pair}>
      <legend className={classes.title}>
        <Ixon width="1.5rem" className={classes.icon}>
          {icon}
        </Ixon>
        <span>{title}</span>
      </legend>
      {target ? (
        <a className={classes.value} rel="nofollow" href={target}>
          {value}
        </a>
      ) : (
        <p className={classes.value}>{value}</p>
      )}
    </div>
  );
};

export default InfoPair;
