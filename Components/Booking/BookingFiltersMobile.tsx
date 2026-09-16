import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import { BookingCommon } from "./BookingPage2";
import { ContentKey } from "../Enums/contentKeys";
import classes from "./BookingFiltersMobile.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import Ixon from "../UI/Ixon";
import FilterIcon from "../Icons/FilterIcon";
import BarsAltIcon from "../Icons/BarsAltIcon";
import { t2xsDemiBold } from "../UI/Typography";
import Drawer from "./Drawer";

const BookingFiltersMobile = ({
  common,
  filters,
  setCommon,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  filters: {
    title: ContentKey;
    active: boolean;
    drawer: (close: () => unknown) => ReactNode;
  }[];
}) => {
  const [openDrawer, setOpenDrawer] = useState<{
    content: (close: () => unknown) => ReactNode;
    title: ContentKey;
  } | null>(null);

  const getContent = useScopedLocale(["booking"]);

  return (
    <Fragment>
      <div className={classes.container}>
        <div className={classes.main}>
          <button
            className={`${classes.filter} ${t2xsDemiBold}`}
            onClick={() =>
              setOpenDrawer({ content: () => "", title: "filters" })
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
              setOpenDrawer({ content: () => "", title: "sortBy" })
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
        />
      )}
    </Fragment>
  );
};

export default BookingFiltersMobile;
