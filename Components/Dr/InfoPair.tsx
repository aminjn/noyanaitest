import { ReactNode } from "react";
import Ixon from "../UI/Ixon";
import classes from "./InfoPair.module.css";

const InfoPair = ({
  icon,
  title,
  value,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) => {
  return (
    <div className={classes.pair}>
      <legend className={classes.title}>
        <Ixon width="1.5rem">{icon}</Ixon>
        <span>{title}</span>
      </legend>
      <p className={classes.value}>{value}</p>
    </div>
  );
};

export default InfoPair;
