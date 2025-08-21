import FormatDate from "@/Components/UI/FormatDate";
import classes from "./DoctorCalendarDay.module.css";

const DoctorCalendarDay = ({ stamp }: { stamp: Date }) => {
  return <FormatDate value={stamp} />;
};

export default DoctorCalendarDay;
