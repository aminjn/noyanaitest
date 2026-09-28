"use client";

import classes from "./ListPageList.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Ixon from "../Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];

// Empty state for every public list page (doctors, clinics, diseases, …):
// a new site or a filter with no match shows a message, not a blank area.
const ListPageEmpty = () => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.empty}>
      <Ixon width="2rem" className={classes.emptyIcon}>
        <SearchIcon />
      </Ixon>
      <strong>{getContent("listEmptyTitle")}</strong>
      <span>{getContent("listEmptyHint")}</span>
    </div>
  );
};

export default ListPageEmpty;
