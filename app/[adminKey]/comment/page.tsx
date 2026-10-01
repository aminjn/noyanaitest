import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// merged into the "نظرات و امتیازها" page as a tab (2026-09 admin audit)
const LegacyCommentAdmin = () => redirect(`/${adminKey}/reviews?tab=pages`);

export default LegacyCommentAdmin;
