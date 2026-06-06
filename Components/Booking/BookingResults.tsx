import { Dispatch, SetStateAction } from "react";
import { BookingOptions, bookingSorts } from "./BookingPage2";
import classes from "./BookingResults.module.css";
import SortButton from "../UI/SortButton";
import useComplexLocale from "../Hooks/useComplexLocale";
import BarsIcon from "../Icons/BarsIcon";
import Ixon from "../UI/Ixon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import useLocale from "../Hooks/useLocale";
import { t2xsRegular } from "../UI/Typography";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import DoctorCard from "../Doctor/DoctorCard";
import DoctorCardBooking from "./DoctorCardBooking";
const BookingResults = ({
  options,
  setOptions,
  data,
}: {
  options: BookingOptions;
  setOptions: Dispatch<SetStateAction<BookingOptions>>;
  data?: IDoctorProfile[];
}) => {
  const getCompContent = useComplexLocale();

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <SortButton
          title={getContent("sortBy")}
          options={bookingSorts.map((el) => ({
            title: getContent(el),
            value: el,
          }))}
          value={options.sort}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              sort: bookingSorts.find((el) => el === e) || prev.sort,
            }))
          }
        />
        <div className={classes.headerMeta}>
          <div className={`${classes.count} ${t2xsRegular}`}>
            {getCompContent("xResults", ["1"])}
          </div>
          <button
            className={classes.toggleView}
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                view: prev.view === "Grid" ? "List" : "Grid",
              }))
            }
          >
            <div
              className={`${classes.viewSegment} ${classes.gridView} ${options.view === "Grid" ? classes.activeView : ""}`}
            >
              <Ixon width=".75rem">
                <CategoriesIcon />
              </Ixon>
            </div>
            <div
              className={`${classes.viewSegment} ${classes.listView} ${options.view === "List" ? classes.activeView : ""}`}
            >
              <Ixon width=".75rem">
                <BarsIcon />
              </Ixon>
            </div>
          </button>
        </div>
      </div>
      <div className={classes.content}>
        {data?.map((doctor) => (
          <DoctorCardBooking node={doctor} key={doctor._id} />
        ))}
      </div>
    </div>
  );
};

export default BookingResults;
