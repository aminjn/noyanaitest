import { Dispatch, SetStateAction, useState } from "react";
import SearchIcon from "../Icons/SearchIcon";
import Ixon from "../UI/Ixon";
import classes from "./SearcButton.module.css";
import SearchModal from "./SearchModal";

const SearchButton = ({isOpen ,setIsOpen}:{setIsOpen:Dispatch<SetStateAction<boolean>> , isOpen:boolean}) => {
  return (
    <div className={classes.main}>
      <button type="button" onClick={() => setIsOpen(true)}>
        <Ixon width="1.5rem">
          <SearchIcon />
        </Ixon>
      </button>
    </div>
  );
};

export default SearchButton;
