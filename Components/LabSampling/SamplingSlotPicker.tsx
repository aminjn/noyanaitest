"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import classes from "./SamplingSlotPicker.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { addDaysYmd, tehranTodayYmd } from "../helpers/tehranTime";
import { LabSamplingKind, SamplingSlotDay } from "./samplingTypes";
import useSamplingFormat from "./useSamplingFormat";
import { t2xsRegular, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];
const SPAN = 7;

type SlotsResponse = { days: SamplingSlotDay[]; horizonDays: number };

// The lab's free days and slots (GET /cart/sampling/slots, Tehran time): a
// row of days, then that day's times with the seats left. A full slot shows
// greyed out instead of disappearing, as Halodoc / Doctolib do.
const SamplingSlotPicker = ({
  paraClinic,
  kind,
  value,
  onChange,
}: {
  paraClinic: string;
  kind: LabSamplingKind;
  value: { ymd: string; start: number } | null;
  onChange: (next: { ymd: string; start: number } | null) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const fmt = useSamplingFormat();
  const [from, setFrom] = useState<string>(() => tehranTodayYmd());
  const { data } = useSWR<SlotsResponse>(
    `${API}/cart/sampling/slots?paraClinic=${paraClinic}&kind=${kind}&from=${from}&days=${SPAN}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const days = Array.isArray(data?.days) ? data!.days : [];
  const [day, setDay] = useState<string | null>(value?.ymd || null);

  // the first day with a free slot is opened by default
  useEffect(() => {
    if (!days.length) return;
    if (day && days.some((d) => d.ymd === day)) return;
    const first = days.find((d) => d.slots.some((s) => s.left > 0));
    setDay(first?.ymd || days[0].ymd);
  }, [days, day]);

  const today = tehranTodayYmd();
  const horizon = Math.max(1, Number(data?.horizonDays) || SPAN);
  const lastDay = addDaysYmd(today, horizon - 1);
  const canBack = from > today;
  const canForward = addDaysYmd(from, SPAN) <= lastDay;
  const current = days.find((d) => d.ymd === day);

  return (
    <div className={classes.main}>
      <span className={`${classes.empty} ${t2xsRegular}`}>{t("lsPickDay")}</span>
      <div className={classes.days}>
        {days.map((d) => {
          const free = d.slots.some((s) => s.left > 0);
          return (
            <button
              key={d.ymd}
              type="button"
              disabled={!free}
              className={`${classes.chip} ${d.ymd === day ? classes.active : ""} ${t2xsRegular}`}
              onClick={() => setDay(d.ymd)}
            >
              {fmt.day(d.ymd)}
            </button>
          );
        })}
      </div>
      <div className={classes.nav}>
        <button
          type="button"
          className={`${classes.navButton} ${t2xsRegular}`}
          disabled={!canBack}
          onClick={() => {
            const prev = addDaysYmd(from, -SPAN);
            setFrom(prev < today ? today : prev);
            setDay(null);
          }}
        >
          {t("lsPrevDays")}
        </button>
        <button
          type="button"
          className={`${classes.navButton} ${t2xsRegular}`}
          disabled={!canForward}
          onClick={() => {
            setFrom(addDaysYmd(from, SPAN));
            setDay(null);
          }}
        >
          {t("lsMoreDays")}
        </button>
      </div>
      <span className={`${classes.empty} ${t2xsRegular}`}>{t("lsPickTime")}</span>
      {!current || !current.slots.some((s) => s.left > 0) ? (
        <span className={`${classes.empty} ${t2xsRegular}`}>{t("lsNoSlots")}</span>
      ) : (
        <div className={classes.slots}>
          {current.slots.map((s) => {
            const active = value?.ymd === current.ymd && value.start === s.start;
            return (
              <button
                key={s.start}
                type="button"
                disabled={s.left < 1}
                className={`${classes.chip} ${active ? classes.active : ""}`}
                onClick={() => onChange(active ? null : { ymd: current.ymd, start: s.start })}
              >
                <span className={tsmRegular}>{fmt.range(current.ymd, s.start, s.end)}</span>
                {s.left < 1 && <span className={`${classes.left} ${t2xsRegular}`}>{t("lsFull")}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SamplingSlotPicker;
