import { permanentRedirect } from "next/navigation";

// The old doctors directory was merged into the bookable doctor profiles
// (2026-09): every doctor is listed, filtered and booked on /book.
const DoctorsList = () => permanentRedirect("/book");

export default DoctorsList;
