import { tlgMedium, tsmRegular } from "../Typography";
import classes from "./ListPageHeader.module.css";
const ListPageHeader = ({
  legend,
  title,
}: {
  title: string;
  legend: string;
}) => {
  return (
    <div className={classes.header}>
      <h1 className={`${classes.h1} ${tlgMedium}`}>{title}</h1>
      <p className={`${classes.legend} ${tsmRegular}`}>{legend}</p>
    </div>
  );
};

export default ListPageHeader;
