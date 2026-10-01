"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./LeaveByHint.module.css";
import Ixon from "../UI/Ixon";
import ClockIcon from "../Icons/ClockIcon";
import WarningIcon from "../Icons/WarningIcon";
import SendIcon from "../Icons/SendIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tsmMedium, txsMedium, txsRegular } from "../UI/Typography";
import { navigationUrl } from "../helpers/navigationUrl";
import { getMapConfig, LatLng, placeInfo, route, toLatLng, trafficZones } from "./nexamap";
import { useTravelText, useUserLocation } from "./mapHooks";

const NS: ContentNamespace[] = ["common", "bookingFinalize", "dashboardBooking"];

// For an in-person visit: when to leave (by car, from where the visitor is
// now, to arrive ~15 minutes early, with the traffic expected at that
// hour) and whether the office is inside the traffic zone at visit time.
// Optional and quiet: nothing is shown when a part has no data.

const EARLY_MIN = 15;

// "06:30-18:00" -> minutes of day; null when the format is unknown
const parseHours = (hours: unknown): [number, number] | null => {
  if (typeof hours !== "string") return null;
  const m = hours.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])];
};

// Is the zone in force at `at`? The provider tells us about today only;
// for another day: never on Fridays (Iran's weekend), otherwise by hours.
const zoneActiveAt = (status: unknown, at: Date): boolean => {
  const s = (status && typeof status === "object" ? status : {}) as { active_today?: unknown; hours?: unknown };
  const today = new Date();
  const sameDay = today.toDateString() === at.toDateString();
  if (sameDay && s.active_today === false) return false;
  if (!sameDay && at.getDay() === 5) return false;
  const hours = parseHours(s.hours);
  if (!hours) return true;
  const minute = at.getHours() * 60 + at.getMinutes();
  return minute >= hours[0] && minute < hours[1];
};

const LeaveByHint = ({
  coords,
  date,
  start,
  className = "",
}: {
  // the office, GeoJSON [lng, lat]
  coords?: number[] | null;
  // the visit day and its start (minutes after midnight)
  date?: Date | string | null;
  start?: number | null;
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const text = useTravelText();
  const me = useUserLocation();

  const lng0 = Array.isArray(coords) ? coords[0] : undefined;
  const lat0 = Array.isArray(coords) ? coords[1] : undefined;
  const office = useMemo(() => toLatLng([lng0, lat0]), [lng0, lat0]);

  const visitAt = useMemo(() => {
    if (!date || typeof start !== "number" || !Number.isFinite(start)) return null;
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, start);
  }, [date, start]);
  const upcoming = !!visitAt && visitAt.getTime() > Date.now();

  const { data: config } = useSWR("nexamap-config", () => getMapConfig());
  const enabled = !config || config.enabled;

  // --- traffic zone at visit time ---
  const { data: info } = useSWR(
    enabled && upcoming && office ? ["nexamap-place-info", office.lat, office.lng] : null,
    () => placeInfo(office as LatLng),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const zoneName = info?.trafficZone || null;
  const { data: zones } = useSWR(zoneName ? "nexamap-traffic-zones" : null, () => trafficZones(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const zoneInForce =
    !!zoneName && !!visitAt && zoneActiveAt(zones?.status?.[zoneName], visitAt);

  // --- leave by ---
  const [leave, setLeave] = useState<{ at: Date; duration: number } | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "failed" | "location">("idle");

  const compute = async () => {
    if (!office || !visitAt || state === "busy") return;
    setState("busy");
    const origin = await me.request();
    if (!origin) return setState("location");
    const arriveBy = visitAt.getTime() - EARLY_MIN * 60_000;
    const durationFor = async (departAt: number) => {
      const res = await route({
        waypoints: [origin, office],
        mode: "car",
        depart_at: new Date(Math.max(departAt, Date.now())).toISOString(),
      });
      const list = Array.isArray(res?.routes) ? res.routes : [];
      const best = list.find((r) => r?.primary) || list[0];
      const s = best?.summary?.duration_s;
      if (typeof s !== "number" || !Number.isFinite(s)) throw new Error("no route");
      return s;
    };
    try {
      // first guess: half an hour; once more with the real departure
      // time when the traffic makes it differ a lot
      let duration = await durationFor(arriveBy - 30 * 60_000);
      if (Math.abs(duration - 30 * 60) > 5 * 60) duration = await durationFor(arriveBy - duration * 1000);
      setLeave({ at: new Date(arriveBy - duration * 1000), duration });
      setState("idle");
    } catch {
      setState("failed");
    }
  };

  // the visitor already shared their location on this page: no click needed
  useEffect(() => {
    if (me.status === "ok" && !leave && state === "idle" && upcoming && office && enabled) compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.status, upcoming, office, enabled]);

  if (!office || !upcoming || !enabled) return null;
  const navUrl = navigationUrl(coords || undefined);
  const late = !!leave && leave.at.getTime() < Date.now();

  return (
    <div className={`${classes.main} ${className}`}>
      {leave ? (
        <div className={classes.row}>
          <Ixon width="1rem" className={classes.icon}>
            <ClockIcon />
          </Ixon>
          <div className={classes.text}>
            <span className={tsmMedium}>
              {late ? getContent("mapLeaveNow") : getContent("mapLeaveBy", [text.clock(leave.at)])}
            </span>
            <span className={`${classes.muted} ${txsRegular}`}>
              {getContent("mapLeaveByHint", [text.duration(leave.duration)])}
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`${classes.link} ${txsMedium}`}
          onClick={compute}
          disabled={state === "busy"}
        >
          <Ixon width="1rem">
            <ClockIcon />
          </Ixon>
          {state === "busy" ? getContent("mapRouting") : getContent("mapWhenToLeave")}
        </button>
      )}
      {state === "location" && (
        <span className={`${classes.muted} ${txsRegular}`}>{getContent("mapLocationDenied")}</span>
      )}
      {state === "failed" && (
        <span className={`${classes.muted} ${txsRegular}`}>{getContent("mapRouteFailed")}</span>
      )}
      {zoneInForce && (
        <div className={`${classes.row} ${classes.warning}`} role="note">
          <Ixon width="1rem">
            <WarningIcon />
          </Ixon>
          <span className={txsRegular}>{getContent("mapVisitInTrafficZone")}</span>
        </div>
      )}
      {!!navUrl && (
        <button
          type="button"
          className={`${classes.link} ${txsMedium}`}
          onClick={() => window.open(navUrl, "_blank", "noopener")}
        >
          <Ixon width="1rem">
            <SendIcon />
          </Ixon>
          {getContent("mapOpenInNavApp")}
        </button>
      )}
    </div>
  );
};

export default LeaveByHint;
