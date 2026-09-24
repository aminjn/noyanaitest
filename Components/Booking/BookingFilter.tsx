import { Dispatch, ReactNode, SetStateAction } from "react";
import classes from "./BookingFilter.module.css";
import {
  BookingCommon,
  bookingNodes,
  bookingNodesContentKeyDict,
} from "./BookingPage2";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tmdMedium, txsRegular } from "../UI/Typography";
import Button from "../UI/Button";

const NS: ContentNamespace[] = ["common", "booking"];

const BookingFilter = ({
  common,
  setCommon,
  top,
  actives,
  segments,
  filtered,
  onClear,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  top?: ReactNode;
  actives?: ReactNode;
  segments?: ReactNode;
  filtered?: boolean;
  onClear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={classes.top}>
        <div className={classes.nodes}>
          {bookingNodes.map((node) => (
            <button
              key={node}
              onClick={() => setCommon((prev) => ({ ...prev, node }))}
              className={`${classes.node} ${common.node === node ? classes.activeNode : ""} ${txsRegular}`}
              type="button"
            >
              {getContent(bookingNodesContentKeyDict[node])}
            </button>
          ))}
        </div>
        {top}
      </div>
      <div className={classes.bot}>
        <div className={classes.botHeader}>
          <span className={`${classes.botTitle} ${tmdMedium}`}>
            {getContent("filters")}
          </span>
          {filtered && (
            <Button
              variant="Error"
              mode="Inline"
              size="S"
              radius="High"
              onClick={() => onClear()}
            >
              {getContent("deleteAll")}
            </Button>
          )}
        </div>
        <div className={classes.activeFilters}>{actives}</div>
        {segments}
      </div>
    </div>
  );
};

export default BookingFilter;
