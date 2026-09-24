import { Dispatch, ReactNode, SetStateAction } from "react";
import classes from "./BookingFilterFullDrawer.module.css";
import {
  BookingCommon,
  bookingNodes,
  bookingNodesContentKeyDict,
} from "./BookingPage2";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { txsRegular } from "../UI/Typography";
import Button from "../UI/Button";

const NS: ContentNamespace[] = ["common", "booking"];

// Full-screen counterpart to BookingFilter.tsx's sidebar, shown inside the
// mobile filters drawer (see BookingFiltersMobile's "filters" pill). It's a
// standalone component (not a wrapper around BookingFilter) so it can lay
// its sections out for a full-width screen instead of the narrow 18rem
// sidebar box, while accepting the exact same top/actives/segments content
// the desktop sidebar renders.
const BookingFilterFullDrawer = ({
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
  onClear?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={classes.nodes}>
        {bookingNodes.map((node) => (
          <button
            key={node}
            type="button"
            onClick={() => setCommon((prev) => ({ ...prev, node }))}
            className={`${classes.node} ${common.node === node ? classes.activeNode : ""} ${txsRegular}`}
          >
            {getContent(bookingNodesContentKeyDict[node])}
          </button>
        ))}
      </div>
      {!!top && <div className={classes.top}>{top}</div>}
      {!!filtered && (
        <div className={classes.clearRow}>
          <Button
            variant="Error"
            mode="Inline"
            size="S"
            radius="High"
            onClick={() => onClear?.()}
          >
            {getContent("deleteAll")}
          </Button>
        </div>
      )}
      {!!actives && <div className={classes.activeFilters}>{actives}</div>}
      {!!segments && <div className={classes.segments}>{segments}</div>}
    </div>
  );
};

export default BookingFilterFullDrawer;
