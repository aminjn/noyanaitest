import { redirect } from "next/navigation";
import { getServerLocale } from "@/Components/i18n/serverContent";
import { localizePath } from "@/Components/i18n/locales";

// (2026-10) the CRM inbox, the sales approvals and the finance requests desk
// became the panel's one «کارتابل»; old links and notifications land there
const Moved = () => {
  redirect(localizePath("/hospitalpanel/kartabl", getServerLocale()));
};

export default Moved;
