"use client";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useSiteSettings from "@/Components/Hooks/useSiteSettings";
import { useMyPro } from "@/Components/Pro/useProData";
import { tehranInstantOf } from "@/Components/helpers/tehranTime";

// How long before a visit the patient may still cancel or move it online
// (the super admin's free-cancel window; a «پرو» member's is shorter), as
// the API applies it (userController cancel / reschedule).
const useChangeWindow = () => {
  const intlTag = useIntlLocale();
  const { patientFreeCancelHours: siteHours, freeCancelHoursText: siteText } = useSiteSettings();
  const { data: pro } = useMyPro();
  const proHours = pro?.active ? pro.freeCancelHours : null;
  const hours = proHours !== null && proHours >= 0 && proHours < siteHours ? proHours : siteHours;
  const hoursText = hours === siteHours ? siteText : new Intl.NumberFormat(intlTag).format(hours);
  const canChange = (r: { status: string; date: Date | string; start: number }) =>
    r.status === "pending" && tehranInstantOf(r.date, r.start).getTime() - Date.now() >= hours * 3600 * 1000;
  return { hours, hoursText, canChange };
};

export default useChangeWindow;
