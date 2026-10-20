"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import Link from "../i18n/Link";
import Button from "../UI/Button";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import SafeBoundary from "../UI/SafeBoundary";
import PlaceSearch from "../Map/PlaceSearch";
import type { LatLng } from "../Map/nexamap";
import classes from "./WizardPage.module.css";

// After the health chat's assessment names a specialty (2026-10): the
// patient shares their location (the browser's, or an address / city typed
// through NexaMap's search) and sees that specialty's doctors nearest to
// them, closest by travel first (backend filterBooking2 "near me"), with a
// link to all of them. The point is kept in this browser only.
//
// Benchmark: Ada and K Health end on "see a neurologist"; Doctolib and
// Paziresh24 start from "specialty + where you are". This joins the two.

const NS: ContentNamespace[] = ["common", "wizardPage"];
const STORE = "wizardNearPoint";
const RADIUS_KM = 30;

type Speciality = { _id: string; name: string; slug?: string };
type Row = { _id?: string };

const readPoint = (): LatLng | null => {
  try {
    const raw = localStorage.getItem(STORE);
    const p = raw ? JSON.parse(raw) : null;
    return p && typeof p.lat === "number" && typeof p.lng === "number" ? p : null;
  } catch {
    return null;
  }
};

const WizardNearbyDoctors = ({ speciality }: { speciality: Speciality }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const [point, setPoint] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [typing, setTyping] = useState(false);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => setPoint(readPoint()), []);

  const keep = (p: LatLng) => {
    setPoint(p);
    setTyping(false);
    try {
      localStorage.setItem(STORE, JSON.stringify(p));
    } catch {
      /* the point is only a convenience */
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return setGeoError(true);
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        keep({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setGeoError(true);
        setTyping(true);
      },
      { timeout: 15_000, maximumAge: 10 * 60_000 },
    );
  };

  const query = (withPoint: boolean) => {
    const params = new URLSearchParams({ sort: "Best", speciality: speciality._id, page: "1" });
    if (withPoint && point) {
      params.set("location.coords.lat", String(point.lat));
      params.set("location.coords.lng", String(point.lng));
      params.set("location.radius", String(RADIUS_KM));
    }
    return `${API}/public/filterBooking2?${params.toString()}`;
  };
  const rowsOf = (res: { data?: { rows?: unknown } }) => (Array.isArray(res?.data?.rows) ? (res.data.rows as Row[]) : []);
  const { data: near, isLoading } = useSWR(point ? query(true) : null, (url: string) => fetcher({ url }).then(rowsOf));
  // none within reach: the specialty's best doctors anywhere
  const { data: anywhere } = useSWR(point && near && !near.length ? query(false) : null, (url: string) => fetcher({ url }).then(rowsOf));
  const rows = (near?.length ? near : anywhere || []).filter((r) => !!r?._id).slice(0, 4);
  const allHref = `/book?speciality=${speciality._id}&name=${encodeURIComponent(speciality.name)}`;

  return (
    <div className={classes.nearby}>
      <p className={classes.nearbyTitle}>{getContent("wizNearTitle", [speciality.name])}</p>
      {!point && (
        <>
          <p className={classes.nearbyNote}>{getContent("wizNearAsk")}</p>
          <div className={classes.nearbyActions}>
            <Button size="S" onClick={locate} isLoading={locating}>
              {getContent("wizNearUseMine")}
            </Button>
            <Button size="S" mode="Outline" onClick={() => setTyping((v) => !v)}>
              {getContent("wizNearTypeAddress")}
            </Button>
          </div>
        </>
      )}
      {geoError && <p className={classes.nearbyNote}>{getContent("wizNearGeoDenied")}</p>}
      {typing && (
        <PlaceSearch
          onPick={(pick) => keep(pick.location)}
          placeholder={getContent("wizNearAddressPlaceholder")}
          noResults={getContent("wizNearNoPlace")}
          locale={intlTag}
          autoFocus
        />
      )}
      {!!point && (
        <>
          {isLoading && <p className={classes.nearbyNote}>{getContent("wizNearLoading")}</p>}
          {!!near && !near.length && !!rows.length && <p className={classes.nearbyNote}>{getContent("wizNearNoneClose")}</p>}
          <div className={classes.nearbyCards}>
            {rows.map((doctor) => (
              <SafeBoundary key={doctor._id} name="wizard-doctor">
                <DoctorCardAlt node={doctor as unknown as Parameters<typeof DoctorCardAlt>[0]["node"]} variant="row" />
              </SafeBoundary>
            ))}
          </div>
          <div className={classes.nearbyActions}>
            <Link href={allHref} className={classes.nearbyAll}>
              {getContent("wizNearSeeAll", [speciality.name])}
            </Link>
            <button type="button" className={classes.nearbyChange} onClick={() => setTyping((v) => !v)}>
              {getContent("wizNearChangePlace")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WizardNearbyDoctors;
