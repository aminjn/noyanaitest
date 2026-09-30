import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// The old doctors directory was merged into doctor profiles (2026-09): the
// admin manages every doctor in one list.
const LegacyAdminDoctors = () => redirect(`/${adminKey}/doctorprofile`);

export default LegacyAdminDoctors;
