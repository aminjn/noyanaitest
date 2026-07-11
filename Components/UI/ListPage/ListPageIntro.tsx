import { tsmDemiBold, tsmRegular } from "../Typography";
import classes from "./ListPageIntro.module.css";

const ListPageIntro = ({
  description,
  title,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className={classes.intro}>
      <h2 className={`${classes.h2} ${tsmDemiBold}`}>{title}</h2>
      <p className={`${classes.description} ${tsmRegular}`}>{description}</p>
    </div>
  );
};

export default ListPageIntro;
