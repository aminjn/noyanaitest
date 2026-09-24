import {
  ChangeEventHandler,
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
} from "react";
import classes from "./BookingAdvancedSearchPopup.module.css";
import {
  BookingCommon,
  bookingNodes,
  bookingNodesContentKeyDict,
} from "./BookingPage2";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import ToggleInput from "../UI/ToggleInput";
import CloseIcon from "../Icons/CloseIcon";
import SearchIcon from "../Icons/SearchIcon";
import { txsRegular } from "../UI/Typography";
import BookingMap2 from "./BookingMap2";
import { ICity, IDistrict, IProvince } from "../Admin/Province/AdminManageProvincesPage";

const NS: ContentNamespace[] = ["common", "booking"];

// Wide flyout popup opened from BookingHeader's "advancedSearch" button. Reuses
// the same options state (and the same MultiSelectInput/ToggleInput/etc. field
// components) each Booking*.tsx component already maintains for its sidebar -
// this is a third shell around that state, laid out as a flat field grid
// instead of BookingFilter's accordion, per the reference screenshot. Doctor
// (DoctorBooking.tsx) builds the richest field set since its options model has
// every field shown in the reference image; Clinic/Pharmacy build a smaller
// set from whatever their own options model actually supports.
const BookingAdvancedSearchPopup = ({
  common,
  setCommon,
  query,
  onQueryChange,
  filtered,
  onClear,
  children,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  query?: string;
  onQueryChange: ChangeEventHandler<HTMLInputElement>;
  filtered?: boolean;
  onClear?: () => unknown;
  children?: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  return (
    <div className={classes.card}>
      <div className={classes.topBar}>
        {!!filtered && !!onClear && (
          <Button variant="Error" mode="Inline" size="S" onClick={() => onClear()}>
            {getContent("deleteAll")}
          </Button>
        )}
        <button
          type="button"
          className={classes.close}
          onClick={() => closePopup()}
        >
          <Ixon width=".875rem">
            <CloseIcon />
          </Ixon>
        </button>
      </div>
      <div className={classes.grid}>
        <div className={classes.nodes}>
          {bookingNodes.map((node) => (
            <button
              key={node}
              type="button"
              onClick={() => {
                setCommon((prev) => ({ ...prev, node }));
                closePopup();
              }}
              className={`${classes.node} ${common.node === node ? classes.activeNode : ""} ${txsRegular}`}
            >
              {getContent(bookingNodesContentKeyDict[node])}
            </button>
          ))}
        </div>
        {children}
      </div>
      <div className={classes.bottom}>
        <div className={classes.searchBox}>
          <Ixon width="1.25rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            className={`${classes.searchInput} ${txsRegular}`}
            placeholder={getContent("bookingSearchPlaceholder")}
            value={query}
            onChange={onQueryChange}
          />
        </div>
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          onClick={() => closePopup()}
        >
          {getContent("search")}
        </Button>
        <Button
          variant="Neutral"
          mode="Outline"
          size="M"
          radius="High"
          onClick={() => closePopup()}
        >
          {getContent("closeAndSearch")}
        </Button>
      </div>
    </div>
  );
};

export default BookingAdvancedSearchPopup;

// A field cell shaped like MultiSelectInput's own box (same border/radius/
// min-height) so it lines up with the real dropdown fields inside the grid.
export const AdvancedSearchField = ({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) => (
  <div className={classes.field}>
    <span className={`${classes.fieldLabel} ${txsRegular}`}>{label}</span>
    {children}
  </div>
);

export const AdvancedSearchToggleField = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => unknown;
}) => (
  <AdvancedSearchField label={title}>
    <ToggleInput value={active} onChange={onClick} />
  </AdvancedSearchField>
);

type LocationOptions = {
  location?: { coords: [number, number]; radius: number } | null;
  province?: IProvince | null;
  city?: ICity | null;
  district?: IDistrict[] | null;
};

// Same "select on map" trigger every Booking*.tsx file already wires to
// BookingMap2 in its sidebar segments - kept to just that trigger here since
// the reference popup only shows the label + button for this cell (province/
// city/district stay in the sidebar).
export const AdvancedSearchLocationField = <T extends LocationOptions>({
  options,
  setOptions,
}: {
  options: T;
  setOptions: Dispatch<SetStateAction<T>>;
}) => {
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <AdvancedSearchField label={getContent("geospetialPositoin")}>
      <Button
        size="S"
        radius="High"
        variant="Secondary"
        mode="Inline"
        className={classes.mapButton}
        onClick={() =>
          setPopup(
            "BookingMap2",
            <BookingMap2
              defaultValue={options.location || undefined}
              onApply={(location) =>
                setOptions((prev) => ({
                  ...prev,
                  location,
                  province: null,
                  city: null,
                  district: null,
                }))
              }
            />,
          )
        }
      >
        {getContent("selectOnMap")}
      </Button>
    </AdvancedSearchField>
  );
};
