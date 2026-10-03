import { redirect } from "next/navigation";
import { adminKey } from "@/Components/config";

// cities and districts are tabs of their province / city pages; the list
// opens from the provinces (the menu link used to give a 404)
const LegacyGeoListAdmin = () => redirect(`/${adminKey}/province`);

export default LegacyGeoListAdmin;
