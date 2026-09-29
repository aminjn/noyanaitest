import { Dispatch, SetStateAction } from "react";
import {
  DoctorBookingOptions,
  BookingPageDoctor,
  bookingSorts,
  BookingCommon,
} from "./BookingPage2";
import classes from "./DoctorBookingResults.module.css";
import SortButton from "../UI/SortButton";
import BarsIcon from "../Icons/BarsIcon";
import Ixon from "../UI/Ixon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import { t2xsRegular } from "../UI/Typography";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import DoctorAvailabilityStrip from "./DoctorAvailabilityStrip";
import BookingResults from "./BookingResults";
import { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";
const DoctorBookinResult = ({
  options,
  setOptions,
  data,
  count,
  common,
  setCommon,
  descriptions,
}: {
  options: DoctorBookingOptions;
  setOptions: Dispatch<SetStateAction<DoctorBookingOptions>>;
  data?: BookingPageDoctor[];
  count?: number;
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  descriptions?: IBookingDescription[];
}) => {
  return (
    <BookingResults common={common} setCommon={setCommon} count={count}>
      {/* the one shared doctor card (same as the homepage), with the
          free-slots strip - grid view uses the full card, list view the row */}
      {(Array.isArray(data) ? data : []).map((doctor) => (
        <DoctorCardAlt
          key={doctor._id}
          node={doctor as unknown as Parameters<typeof DoctorCardAlt>[0]["node"]}
          variant={common.view === "Grid" ? "grid" : "row"}
          footer={<DoctorAvailabilityStrip node={doctor} />}
        />
      ))}
    </BookingResults>
  );
};

export default DoctorBookinResult;
