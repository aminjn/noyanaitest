import { ChangeEventHandler } from "react";
import { t2xsRegular, tbaseMedium, tlgDemiBold } from "../Typography";
import classes from "./ListPageHeaderSearch.module.css";
import Ixon from "../Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";

const ListPageHeaderSearch = ({
  legend,
  onChange,
  placeholder,
  title,
}: {
  title: string;
  legend: string;
  placeholder: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <div className={classes.header}>
      <div className={classes.headerContent}>
        <h1 className={`${classes.title} ${tlgDemiBold}`}>{title}</h1>
        <p className={`${classes.legend} ${t2xsRegular}`}>{legend}</p>
      </div>
      <div className={classes.searchBox}>
        <input
          className={`${classes.input} ${tbaseMedium}`}
          placeholder={placeholder}
          onChange={onChange}
        />
        <Ixon width="1.5rem" className={classes.searchIcon}>
          <SearchIcon />
        </Ixon>
      </div>
    </div>
  );
};

export default ListPageHeaderSearch;
