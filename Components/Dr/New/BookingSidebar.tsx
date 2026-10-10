"use client";
import { officeAddressText } from "@/Components/DoctorPanel/Office/officeAddress";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useIntlLocale } from "@/Components/i18n/navigation";
import classes from "./BookingSidebar.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useProgress from "@/Components/Hooks/useProgress";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import BottomSheet from "@/Components/UI/BottomSheet";
import Link from "@/Components/i18n/Link";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { diffDaysYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import Calendar02Icon from "@/Components/Icons/Calendar02Icon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import { PublicDoctorProfilePageProps } from "../publicDoctorTypes";
import { DoctorConfig } from "../PublicDrSessions";
import SlotPicker, { SlotPick } from "@/Components/Booking/Flow/SlotPicker";
import { InsuranceNote, OfficePicker, VisitTypePicker } from "@/Components/Booking/Flow/BookingChoices";
import { clock, finalizeHref, useBookableSlots, visitTypeOrder } from "@/Components/Booking/Flow/bookingFlow";

const NS: ContentNamespace[] = ["common", "drBookingSidebar", "bookingFlow"];

type DoctorType = PublicDoctorProfilePageProps["doctor"];

// The doctor profile's booking panel (2026-10 redesign, docs/booking-
// benchmark.md): step 1 of 3, "choose". Visit type -> office -> day ->
// time, the next free time always shown, the price and insurances before
// the patient commits. On a phone it is a compact card plus a sticky
// bottom bar that opens the same picker in a bottom sheet (Doctolib /
// Zocdoc mobile). Logged-out patients pick first and sign in on the next
// step, not before.
const BookingSidebar = ({ doctor }: { doctor: DoctorType }) => {
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const getContent = useScopedLocale(NS);
  const push = useProgress();

  const { data: config, error: configError } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // only what can be booked: a type switched on without hours used to be
  // offered here and then showed an empty slot picker
  const activeTypes = useMemo(
    () =>
      config
        ? visitTypeOrder.filter(
            (t) =>
              config[t]?.active &&
              !!config[t]?.price &&
              (!Array.isArray(config.sessionTypes) || config.sessionTypes.includes(t)),
          )
        : [],
    [config],
  );
  const [sessionType, setSessionType] = useState<DoctorSessionType | null>(null);
  useEffect(() => {
    if (!sessionType && activeTypes.length) setSessionType(activeTypes[0]);
  }, [activeTypes, sessionType]);

  // bookable in-person places (an inactive one takes no bookings)
  const offices = useMemo(
    () =>
      (Array.isArray(config?.offices) ? config.offices : [])
        .filter((o) => o && o.active !== false)
        .map((o) => ({ _id: o._id, name: o.name, address: officeAddressText(o as { address?: string }) })),
    [config],
  );
  const [office, setOffice] = useState<string | null>(null);
  useEffect(() => {
    if (!office && offices.length) setOffice(offices[0]._id);
  }, [office, offices]);
  const officeFilter = sessionType === "inPerson" && offices.length > 1 ? office : null;

  const [pick, setPick] = useState<SlotPick | null>(null);
  useEffect(() => setPick(null), [sessionType, officeFilter]);
  const [sheet, setSheet] = useState(false);
  const closeSheet = useCallback(() => setSheet(false), []);

  const { data: slots } = useBookableSlots(doctor._id, sessionType, officeFilter);
  const next = slots?.nextAvailable;

  const settings = sessionType ? config?.[sessionType] : null;
  const priceText =
    settings?.price && !settings.hidePrice ? getContent("xToman", [nf.format(settings.price)]) : getContent("bfPriceOnSite");
  const minPrice = useMemo(() => {
    const prices = activeTypes.map((t) => (!config?.[t]?.hidePrice ? config?.[t]?.price || 0 : 0)).filter(Boolean);
    return prices.length ? Math.min(...prices) : 0;
  }, [activeTypes, config]);

  const today = tehranTodayYmd();
  const dayText = (ymd: string) => {
    const diff = diffDaysYmd(today, ymd);
    if (diff === 0) return getContent("today");
    if (diff === 1) return getContent("tomorrow");
    return tehranNoon(ymd).toLocaleDateString(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" });
  };
  const whenText = (p: { ymd: string; start: number }) => getContent("bfAtTime", [dayText(p.ymd), clock(p.start, nf)]);

  const go = () => {
    if (!pick) return;
    push(
      finalizeHref(doctor._id, {
        ymd: pick.ymd,
        start: pick.start,
        end: pick.end,
        sessionType,
        office: pick.office,
      }),
    );
  };

  const insuranceNames = (config?.insurances || []).map((i) => i?.insurance?.name || "").filter(Boolean);
  const speciality = doctor.mainSpeciality as { slug?: string; _id?: string; name?: string } | undefined;
  const fallback = (
    <div className={classes.fallback}>
      {activeTypes.length > 1 && (
        <span className={classes.muted}>{getContent("bfTryOtherType")}</span>
      )}
      {!!speciality?.name && (
        <Button
          href={`/speciality/${speciality.slug || speciality._id}`}
          variant="Primary"
          mode="Outline"
          size="S"
          radius="High"
        >
          {getContent("bfOtherDoctors", [speciality.name])}
        </Button>
      )}
    </div>
  );

  const chooser = (
    <div className={classes.chooser}>
      <section className={classes.block}>
        <h3 className={classes.label}>{getContent("bfVisitType")}</h3>
        <VisitTypePicker settings={config || undefined} value={sessionType} onChange={setSessionType} />
      </section>
      {sessionType === "inPerson" && offices.length > 1 && (
        <section className={classes.block}>
          <h3 className={classes.label}>{getContent("bfOffice")}</h3>
          <OfficePicker offices={offices} value={office} onChange={setOffice} />
        </section>
      )}
      <section className={classes.block}>
        <h3 className={classes.label}>{getContent("bfPickTime")}</h3>
        <SlotPicker
          doctorId={doctor._id}
          sessionType={sessionType}
          office={officeFilter}
          value={pick}
          onChange={setPick}
          fallback={fallback}
          waitlist
        />
      </section>
    </div>
  );

  const summary = (
    <div className={classes.summary}>
      <div className={classes.summaryText}>
        <span className={classes.summaryWhen}>
          {pick ? whenText(pick) : getContent("bfPickATime")}
        </span>
        <span className={classes.summaryPrice}>
          {sessionType ? `${getContent(doctorSessionTypeContentKeyDict[sessionType])} · ${priceText}` : ""}
        </span>
      </div>
      <Button
        className={classes.cta}
        radius="High"
        size="L"
        variant={pick ? "Primary" : "Disable"}
        onClick={go}
      >
        {getContent("bfContinue")}
      </Button>
    </div>
  );

  if (configError)
    return (
      <div className={classes.panel}>
        <p className={classes.muted}>{getContent("bfSlotsError")}</p>
      </div>
    );

  if (config && !activeTypes.length)
    return (
      <div className={classes.panel}>
        <h2 className={classes.title}>{getContent("reserveYourSpot")}</h2>
        <p className={classes.muted}>{getContent("bfNoOnlineBooking")}</p>
        {fallback}
      </div>
    );

  return (
    <>
      {/* tablet / desktop: the whole picker in the side column */}
      <div className={`${classes.panel} ${classes.desktop}`}>
        <header className={classes.head}>
          <span className={`${classes.headIcon} glassIcon`}>
            <Ixon width="1.25rem">
              <Calendar02Icon />
            </Ixon>
          </span>
          <div>
            <h2 className={classes.title}>{getContent("reserveYourSpot")}</h2>
            <p className={classes.muted}>{getContent("bfStepOf", [nf.format(1), nf.format(3)])}</p>
          </div>
        </header>
        {!config ? <div className={classes.skeleton} aria-busy="true" /> : chooser}
        {!!config?.insurances?.length && <InsuranceNote names={insuranceNames} />}
        {!!config && summary}
        <p className={classes.reassure}>
          <Ixon width="0.9rem">
            <ShieldCheckIcon />
          </Ixon>
          <span>{getContent("bfReassure")}</span>
        </p>
      </div>

      {/* phone: a compact card in the page, the picker in a bottom sheet */}
      <div className={`${classes.panel} ${classes.mobile}`}>
        <div className={classes.compactHead}>
          <h2 className={classes.title}>{getContent("reserveYourSpot")}</h2>
          {!!minPrice && <span className={classes.from}>{getContent("bfFromPrice", [nf.format(minPrice)])}</span>}
        </div>
        <div className={classes.typeChips}>
          {activeTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`${classes.typeChip} ${t === sessionType ? classes.typeChipOn : ""}`}
              onClick={() => setSessionType(t)}
            >
              {getContent(doctorSessionTypeContentKeyDict[t])}
            </button>
          ))}
        </div>
        <button type="button" className={classes.nextCard} onClick={() => setSheet(true)} data-book-open>
          <span className={`${classes.headIcon} tone-teal`}>
            <Ixon width="1.1rem">
              <Calendar02Icon />
            </Ixon>
          </span>
          <span className={classes.nextText}>
            <small>{getContent("bfFirstAvailable")}</small>
            <b>{next ? whenText(next) : slots ? getContent("bfFullyBooked") : "…"}</b>
          </span>
          <span className={classes.nextLink}>{getContent("bfSeeAllTimes")}</span>
        </button>
        {!!config?.insurances?.length && <InsuranceNote names={insuranceNames} />}
      </div>

      <div className={classes.stickyBar}>
        <div className={classes.stickyText}>
          <b>{pick ? whenText(pick) : next ? whenText(next) : getContent("reserveYourSpot")}</b>
          <small>{sessionType ? `${getContent(doctorSessionTypeContentKeyDict[sessionType])} · ${priceText}` : ""}</small>
        </div>
        <Button
          radius="High"
          size="M"
          variant="Primary"
          onClick={() => (pick ? go() : setSheet(true))}
        >
          {pick ? getContent("bfContinue") : getContent("bfBookNow")}
        </Button>
      </div>

      <BottomSheet
        open={sheet}
        onClose={closeSheet}
        title={getContent("reserveYourSpot")}
        subtitle={getContent("bfStepOf", [nf.format(1), nf.format(3)])}
        closeLabel={getContent("bfClose")}
        footer={summary}
      >
        {chooser}
        <p className={classes.sheetNote}>
          <Link href={`/dr/${doctor.slug || doctor._id}#dr-address`} onClick={closeSheet}>
            {getContent("bfSeeAddress")}
          </Link>
        </p>
      </BottomSheet>
    </>
  );
};

export default BookingSidebar;
