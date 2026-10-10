"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PlaceLocationCard from "./PlaceLocationCard";
import classes from "./RoutePage.module.css";

// «باز کردن در مسیریاب» (2026-10): the destination pinned on NexaMap and the
// way there from the visitor, with travel modes, time, cost and the GPX -
// the shared place card in its route mode. `to` is "lat,lng".
const RoutePage = () => {
  const params = useSearchParams();
  const to = params?.get("to") || "";
  const name = (params?.get("name") || "").slice(0, 80);
  const coords = useMemo(() => {
    const [lat, lng] = to.split(",").map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      ? [lng, lat]
      : null;
  }, [to]);
  return (
    <main className={classes.main}>
      <PlaceLocationCard coords={coords} name={name || undefined} autoRoute className={classes.card} />
    </main>
  );
};

export default RoutePage;
