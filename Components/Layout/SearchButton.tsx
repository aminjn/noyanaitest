import { Dispatch, SetStateAction, useState } from "react";
import SearchIcon from "../Icons/SearchIcon";
import Ixon from "../UI/Ixon";
import classes from "./SearcButton.module.css";
import SearchModal from "./SearchModal";

const SearchButton = ({ open }: { open: () => void }) => {
  return (
    <div className={classes.main}>
      <button
        type="button"
        onClick={() => {
          open();
        }}
      >
        <Ixon width="1.5rem">
          <SearchIcon />
        </Ixon>
      </button>
    </div>
  );
};

export default SearchButton;
