import { redirect } from "next/navigation";
import { getServerLocale } from "@/Components/i18n/serverContent";
import { localizePath } from "@/Components/i18n/locales";

// The month calendar here read the retired System-A sessions (DoctorSession),
// so it showed 0 available / 0 booked on every day even with live shifts and
// reservations. The doctor's live agenda is the schedule page; the day view
// under /doctorpanel/calendar/[stamp] stays for old System-A bookings.
const DoctorManageCalendar = () => {
  redirect(localizePath("/doctorpanel/schedule", getServerLocale()));
};

export default DoctorManageCalendar;
