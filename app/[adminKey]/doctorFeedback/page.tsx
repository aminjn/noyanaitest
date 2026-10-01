import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "نظرات و امتیازها" page as a tab (2026-09 admin audit)
const LegacyDoctorFeedbackAdmin = () => redirect(`/${adminKey}/reviews?tab=visits`);

export default LegacyDoctorFeedbackAdmin;
