import { Dispatch, SetStateAction } from "react";
import {
  DoctorBookingOptions,
  BookingPageDoctor,
  bookingSorts,
  BookingCommon,
} from "./BookingPage2";
import classes from "./DoctorBookingResults.module.css";
import SortButton from "../UI/SortButton";
import useComplexLocale from "../Hooks/useComplexLocale";
import BarsIcon from "../Icons/BarsIcon";
import Ixon from "../UI/Ixon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import useLocale from "../Hooks/useLocale";
import { t2xsRegular } from "../UI/Typography";
import DoctorCardBooking from "./DoctorCardBooking";
import BookingResults from "./BookingResults";
const DoctorBookinResult = ({
  options,
  setOptions,
  data,
  count,
  common,
  setCommon,
}: {
  options: DoctorBookingOptions;
  setOptions: Dispatch<SetStateAction<DoctorBookingOptions>>;
  data?: BookingPageDoctor[];
  count?: number;
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
}) => {
  const getCompContent = useComplexLocale();

  const getContent = useLocale();

  return (
    <BookingResults common={common} setCommon={setCommon} count={count}>
      {data?.map((doctor) => (
        <DoctorCardBooking node={doctor} key={doctor._id} view={common.view} />
      ))}
    </BookingResults>
  );
};

export default DoctorBookinResult;
