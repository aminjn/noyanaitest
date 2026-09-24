import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import { BookingCommon, bookingSorts } from "./BookingPage2";
import { ContentKey } from "../Enums/contentKeys";
import classes from "./BookingFiltersMobile.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import FilterIcon from "../Icons/FilterIcon";
import BarsAltIcon from "../Icons/BarsAltIcon";
import { t2xsDemiBold } from "../UI/Typography";
import Drawer from "./Drawer";
import BookingFilterFullDrawer from "./BookingFilterFullDrawer";

const NS: ContentNamespace[] = ["common", "booking"];

const BookingFiltersMobile = ({
  common,
  filters,
  setCommon,
  top,
  actives,
  segments,
  filtered,
  onClear,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  filters: {
    title: ContentKey;
    active: boolean;
    drawer: (close: () => unknown) => ReactNode;
  }[];
  top?: ReactNode;
  actives?: ReactNode;
  segments?: ReactNode;
  filtered?: boolean;
  onClear?: () => unknown;
}) => {
  const [openDrawer, setOpenDrawer] = useState<{
    content: (close: () => unknown) => ReactNode;
    title: ContentKey;
    fullScreen?: boolean;
  } | null>(null);

  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <div className={classes.container}>
        <div className={classes.main}>
          <button
            className={`${classes.filter} ${t2xsDemiBold}`}
            onClick={() =>
              setOpenDrawer({
                content: () => (
                  <BookingFilterFullDrawer
                    common={common}
                    setCommon={setCommon}
                    top={top}
                    actives={actives}
                    segments={segments}
                    filtered={filtered}
                    onClear={onClear}
                  />
                ),
                title: "filters",
                fullScreen: true,
              })
            }
          >
            <Ixon width=".675rem" className={classes.filterIcon}>
              <FilterIcon />
            </Ixon>
            <span>{getContent("filters")}</span>
          </button>
          <button
            className={`${classes.filter} ${t2xsDemiBold}`}
            onClick={() =>
              setOpenDrawer({
                content: (close) => (
                  <div className={classes.sortOptions}>
                    {bookingSorts.map((sort) => (
                      <button
                        key={sort}
                        type="button"
                        className={`${classes.filter} ${t2xsDemiBold} ${common.sort === sort ? classes.activeFilter : ""}`}
                        onClick={() => {
                          setCommon((prev) => ({ ...prev, sort }));
                          close();
                        }}
                      >
                        {getContent(sort)}
                      </button>
                    ))}
                  </div>
                ),
                title: "sortBy",
              })
            }
          >
            <Ixon width=".675rem" className={classes.filterIcon}>
              <BarsAltIcon />
            </Ixon>
            <span>{getContent("sortBy")}</span>
          </button>
          {filters.map((filter) => (
            <button
              key={filter.title}
              onClick={() =>
                setOpenDrawer({
                  content: filter.drawer,
                  title: filter.title,
                })
              }
              className={`${classes.filter} ${t2xsDemiBold} ${filter.active ? classes.activeFilter : ""}`}
            >
              {getContent(filter.title)}
            </button>
          ))}
        </div>
      </div>
      {!!openDrawer && (
        <Drawer
          title={openDrawer.title}
          close={() => setOpenDrawer(null)}
          content={openDrawer.content}
          fullScreen={openDrawer.fullScreen}
        />
      )}
    </Fragment>
  );
};

export default BookingFiltersMobile;
