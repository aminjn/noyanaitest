"use client";
import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ToggleInput from "@/Components/UI/ToggleInput";
import BookingNoticeSetting from "./BookingNoticeSetting";
import classes from "./DoctorManageShiftsPage.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// The hours page's settings in one compact strip (2026-10): the official
// holidays switch («در تعطیلات رسمی ویزیت دارم»; a day's own choice on the
// calendar overrides it) and the minimum booking notice
// (BookingNoticeSetting).
const HoursSettingsStrip = ({
  works,
  canEdit,
  onChanged,
}: {
  // null while the calendar is loading
  works: boolean | null;
  canEdit: boolean;
  onChanged: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);

  const setWorks = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}/doctor/holidays/policy`, method: "POST", bodyParser: "JSON", payload: { works: next } });
      pushNotification(getContent("holSaved"), "Success");
      await onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={classes.strip} aria-label={getContent("hcSettingsTitle")}>
      <div className={classes.stripItem}>
        <ToggleInput
          title={getContent("holWorksSwitch")}
          value={!!works}
          readOnly={!canEdit || busy || works === null}
          onChange={() => works !== null && setWorks(!works)}
        />
        <small>{getContent("hcHolidaySwitchHint")}</small>
      </div>
      {/* the minimum booking notice (its own component and endpoint) */}
      <div className={classes.stripItem}>
        <BookingNoticeSetting />
      </div>
    </section>
  );
};

export default HoursSettingsStrip;
