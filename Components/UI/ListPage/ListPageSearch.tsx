import { ChangeEventHandler } from "react";
import { tsmRegular } from "../Typography";
import classes from "./ListPageSearch.module.css";
import Ixon from "../Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import { WithStyleProps } from "@/Components/Layout/Layout";

const ListPageSearch = ({
  placeholder,
  onChange,
  className = "",
  style,
}: WithStyleProps<{
  placeholder: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}>) => {
  return (
    <div className={`${classes.search} ${className}`} style={style}>
      <input
        className={`${classes.input} ${tsmRegular}`}
        placeholder={placeholder}
        onChange={onChange}
      />
      <Ixon width="1.5rem" className={classes.searchIcon}>
        <SearchIcon />
      </Ixon>
    </div>
  );
};

export default ListPageSearch;
