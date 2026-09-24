import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import AdjustmentHorizontalIcon from "../Icons/AdjustmentHorizontalIcon";
import MapIcon from "../Icons/MapIcon";
import SearchIcon from "../Icons/SearchIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { txlDemiBold, txsMedium, txsRegular } from "../UI/Typography";
import classes from "./BookingHeader.module.css";
import { DoctorBookingOptions } from "./BookingPage2";
import useDebounce from "../Hooks/useDebounce";
import useProgress from "../Hooks/useProgress";

const NS: ContentNamespace[] = ["common", "booking"];

const BookingHeader = ({
  onChange,
  onAdvancedSearch,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>;
  onAdvancedSearch?: () => unknown;
}) => {
  const push = useProgress();

  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.header}>
      <h1 className={`${classes.title} ${txlDemiBold}`}>
        {getContent("bookingTitle")}
      </h1>
      <legend className={`${classes.subtitle} ${txsMedium}`}>
        {getContent("bookingSubTitle")}
      </legend>
      <div className={classes.searchContainer}>
        <div className={classes.searchBox}>
          <Ixon width="1.5rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            onChange={onChange}
            className={`${classes.searchInput} ${txsRegular}`}
            placeholder={getContent("bookingSearchPlaceholder")}
          />
          <Button
            variant="Primary"
            mode="Inline"
            size="M"
            radius="High"
            tailIcon={<AdjustmentHorizontalIcon />}
            className={`${classes.advanced} ${classes.mobileOnly}`}
            onClick={() => onAdvancedSearch?.()}
          />
          <Button
            variant="Primary"
            mode="Inline"
            size="M"
            radius="High"
            tailIcon={<AdjustmentHorizontalIcon />}
            className={classes.advanced}
            onClick={() => onAdvancedSearch?.()}
          >
            {getContent("advancedSearch")}
          </Button>
        </div>
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          tailIcon={<MapIcon />}
          onClick={() => push("/map")}
          className={classes.map}
        >
          {getContent("previewInMap")}
        </Button>
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          tailIcon={<MapIcon />}
          onClick={() => push("/map")}
          className={classes.mobileOnly}
          iconWidth="1rem"
        ></Button>
      </div>
    </div>
  );
};

export default BookingHeader;
