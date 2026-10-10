import { Dispatch, SetStateAction, useState } from "react";
import SearchIcon from "../Icons/SearchIcon";
import Ixon from "../UI/Ixon";
import classes from "./SearcButton.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const SearchButton = ({ open }: { open: () => void }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <div className={classes.main}>
      <button
        type="button"
        aria-label={getContent("search")}
        title={getContent("search")}
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
