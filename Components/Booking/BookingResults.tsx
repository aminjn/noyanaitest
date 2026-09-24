import { Dispatch, ReactNode, SetStateAction } from "react";
import { BookingCommon, bookingSorts } from "./BookingPage2";
import classes from "./BookingResults.module.css";
import SortButton from "../UI/SortButton";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { t2xsRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import BarsIcon from "../Icons/BarsIcon";
import { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";

const NS: ContentNamespace[] = ["common", "booking"];

const BookingResults = ({
  common,
  setCommon,
  children,
  count,
}: {
  children?: ReactNode;
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  count?: number;
}) => {
  const getContent = useScopedLocale(NS);

  const getCompContent = getContent;

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <SortButton
          title={getContent("sortBy")}
          options={bookingSorts.map((el) => ({
            title: getContent(el),
            value: el,
          }))}
          value={common.sort}
          onChange={(e) =>
            setCommon((prev) => ({
              ...prev,
              sort: bookingSorts.find((el) => el === e) || prev.sort,
            }))
          }
        />
        <div className={classes.headerMeta}>
          <div className={`${classes.count} ${t2xsRegular}`}>
            {getCompContent("xResults", [String(count ?? 0)])}
          </div>
          <button
            className={classes.toggleView}
            onClick={() =>
              setCommon((prev) => ({
                ...prev,
                view: prev.view === "Grid" ? "List" : "Grid",
              }))
            }
          >
            <div
              className={`${classes.viewSegment} ${classes.gridView} ${common.view === "Grid" ? classes.activeView : ""}`}
            >
              <Ixon width=".75rem">
                <CategoriesIcon />
              </Ixon>
            </div>
            <div
              className={`${classes.viewSegment} ${classes.listView} ${common.view === "List" ? classes.activeView : ""}`}
            >
              <Ixon width=".75rem">
                <BarsIcon />
              </Ixon>
            </div>
          </button>
        </div>
      </div>
      <div
        className={`${classes.content} ${common.view === "Grid" ? classes.grid : ""}`}
      >
        {children}
      </div>
    </div>
  );
};

export default BookingResults;
