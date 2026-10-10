"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import classes from "./BookingNoticeSetting.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

type Notice = { minutes: number | null; options: number[] };

const KEY = `${API}/doctor/booking-notice`;

// «حداقل زمان رزرو پیش از نوبت» (2026-10, Doctolib's minimum booking
// notice): how long before a visit a patient may still book it. The rule
// itself is the backend's (Lib/bookingNotice.ts: the slot picker, the
// cards' first free time and the booking API all follow it).
const BookingNoticeSetting = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const pushNotification = useNotification();
  const hasAccess = useDoctorAcl();
  const canEdit = hasAccess("mutateCalendar");
  const { data, mutate } = useSWR<Notice>(KEY, (url: string) =>
    fetcher({ url }).then((res) => {
      const d = (res?.data?.data || {}) as Partial<Notice>;
      return {
        minutes: typeof d.minutes === "number" ? d.minutes : null,
        options: (Array.isArray(d.options) ? d.options : []).filter((n) => typeof n === "number"),
      };
    }),
  );
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const label = (m: number) =>
    m === 0
      ? getContent("bnUntilStart")
      : m < 60
        ? getContent("bnMinutes", [num.format(m)])
        : m < 1440
          ? getContent("bnHours", [num.format(m / 60)])
          : getContent("bnDays", [num.format(m / 1440)]);

  const save = async (raw: string) => {
    const minutes = raw === "" ? null : Number(raw);
    setBusy(true);
    try {
      mutate({ ...data, minutes }, { revalidate: false });
      await fetcher({ url: KEY, method: "POST", bodyParser: "JSON", payload: { minutes } });
      pushNotification(getContent("bnSaved"), "Success");
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
      mutate();
    }
  };

  return (
    <label className={classes.row}>
      <span className={classes.text}>
        <strong>{getContent("bnTitle")}</strong>
        <small>{getContent("bnHint")}</small>
      </span>
      <select
        className={classes.select}
        value={data.minutes === null ? "" : String(data.minutes)}
        disabled={!canEdit || busy}
        onChange={(e) => save(e.target.value)}
      >
        <option value="">{getContent("bnDefault")}</option>
        {data.options.map((m) => (
          <option key={m} value={m}>
            {label(m)}
          </option>
        ))}
      </select>
    </label>
  );
};

export default BookingNoticeSetting;
