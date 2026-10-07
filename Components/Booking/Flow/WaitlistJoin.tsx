"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useUser from "@/Components/Hooks/useUser";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType, doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { addDaysYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";
import { DoctorConfig } from "@/Components/Dr/PublicDrSessions";
import Button from "@/Components/UI/Button";
import DateInput from "@/Components/UI/DateInput";
import Ixon from "@/Components/UI/Ixon";
import Link from "@/Components/i18n/Link";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import InlineLogin from "./InlineLogin";
import { visitTypeOrder } from "./bookingFlow";
import { MyWaitlistEntry, useMyWaitlist } from "./MyWaitlists";
import classes from "./WaitlistJoin.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

// "any time in the next N days" choices (cut to the booking horizon)
const SPANS = [7, 14, 30];

// «وقتی نوبت خالی شد خبرم کن» (Doctolib / Zocdoc waitlist, Lib/waitlist.ts
// on the server): offered by the slot picker when the doctor is full, the
// day is empty, or no time suits. The patient picks the visit type, an
// office (optional) and a range; a guest signs in by SMS code first, in
// place. POST /user/waitlist keeps one wait per doctor, type and office.
const WaitlistJoin = ({
  doctorId,
  sessionType,
  office,
  horizon = 30,
  variant = "card",
}: {
  doctorId: string;
  sessionType: DoctorSessionType | null | undefined;
  office?: string | null;
  horizon?: number;
  // "card": the full offer (doctor fully booked); "link": one quiet line
  variant?: "card" | "link";
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" }),
    [intlTag],
  );
  const notify = useNotification();
  const { user, isUserLoading } = useUser();
  const [open, setOpen] = useState(false);

  const { data: config } = useSWR<DoctorConfig>(
    open ? `${API}/public/doctor/${doctorId}/config` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const types = useMemo(
    () => (config ? visitTypeOrder.filter((t) => config[t]?.active && !!config[t]?.price) : []),
    [config],
  );
  const offices = useMemo(
    () =>
      (Array.isArray(config?.offices) ? config.offices : [])
        .filter((o) => o && o.active !== false)
        .map((o) => ({ _id: o._id, name: o.name })),
    [config],
  );

  const [type, setType] = useState<DoctorSessionType | null>(sessionType || null);
  useEffect(() => {
    if (sessionType) setType(sessionType);
  }, [sessionType]);
  useEffect(() => {
    if (!type && types.length) setType(types[0]);
  }, [type, types]);
  // "" = any office
  const [place, setPlace] = useState<string>(office || "");
  useEffect(() => setPlace(office || ""), [office]);

  const spans = SPANS.filter((n) => n <= horizon);
  if (!spans.includes(horizon) && horizon < 30) spans.push(horizon);
  const [span, setSpan] = useState<number | "custom">(spans[spans.length - 1] || 30);
  const today = tehranTodayYmd();
  const last = addDaysYmd(today, Math.max(1, horizon) - 1);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDaysYmd(today, Math.min(13, horizon - 1)));

  const { data: mine, mutate: refreshMine } = useMyWaitlist(!!user && open);
  const officeKey = type === "inPerson" ? place : "";
  const existing = (mine || []).find(
    (e: MyWaitlistEntry) =>
      e.status === "active" &&
      String((e.doctor as { _id?: string } | null)?._id || e.doctor) === doctorId &&
      e.sessionType === type &&
      (e.officeKey || "") === officeKey,
  );
  const [done, setDone] = useState<{ to: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const day = (ymd: string) => dayFmt.format(tehranNoon(ymd));
  const rangeOk = span !== "custom" || (from <= to && from >= today && to <= last);

  const join = async () => {
    if (!type || busy || !rangeOk) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}/user/waitlist`,
        method: "POST",
        payload: {
          doctor: doctorId,
          sessionType: type,
          ...(type === "inPerson" && place ? { office: place } : {}),
          ...(span === "custom" ? { from, to } : { days: span }),
        },
      });
      setDone({ to: res?.data?.to || (span === "custom" ? to : addDaysYmd(today, Number(span) - 1)) });
      refreshMine();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!sessionType) return null;

  if (!open)
    return variant === "link" ? (
      <p className={classes.linkLine}>
        <span>{getContent("bfWlNoFit")}</span>
        <button type="button" className={classes.link} onClick={() => setOpen(true)}>
          <Ixon width="0.9rem">
            <Bell01Icon />
          </Ixon>
          {getContent("bfWlCta")}
        </button>
      </p>
    ) : (
      <div className={classes.offer}>
        <span className={`${classes.icon} tone-indigo`}>
          <Ixon width="1.1rem">
            <Bell01Icon />
          </Ixon>
        </span>
        <div className={classes.offerText}>
          <b>{getContent("bfWlTitle")}</b>
          <small>{getContent("bfWlText")}</small>
        </div>
        <Button size="M" radius="High" variant="Primary" onClick={() => setOpen(true)}>
          {getContent("bfWlCta")}
        </Button>
      </div>
    );

  if (done)
    return (
      <div className={classes.done} role="status">
        <span className={`${classes.icon} tone-teal`}>
          <Ixon width="1.1rem">
            <CheckCircleIcon />
          </Ixon>
        </span>
        <div className={classes.offerText}>
          <b>{getContent("bfWlJoined")}</b>
          <small>{getContent("bfWlJoinedText", [day(done.to)])}</small>
          <Link href="/dashboard/booking" className={classes.link}>
            {getContent("bfWlSeeMine")}
          </Link>
        </div>
      </div>
    );

  return (
    <section className={classes.form} aria-label={getContent("bfWlTitle")}>
      <header className={classes.head}>
        <span className={`${classes.icon} tone-indigo`}>
          <Ixon width="1.1rem">
            <Bell01Icon />
          </Ixon>
        </span>
        <div className={classes.offerText}>
          <b>{getContent("bfWlTitle")}</b>
          <small>{getContent("bfWlText")}</small>
        </div>
      </header>

      {isUserLoading ? (
        <div className={classes.skeleton} aria-busy="true" />
      ) : !user ? (
        <div className={classes.block}>
          <p className={classes.lead}>{getContent("bfWlLoginLead")}</p>
          <InlineLogin />
        </div>
      ) : (
        <>
          {types.length > 1 && (
            <div className={classes.block}>
              <span className={classes.label}>{getContent("bfVisitType")}</span>
              <div className={classes.chips} role="radiogroup" aria-label={getContent("bfVisitType")}>
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={type === t}
                    className={`${classes.chip} ${type === t ? classes.chipOn : ""}`}
                    onClick={() => setType(t)}
                  >
                    {getContent(doctorSessionTypeContentKeyDict[t])}
                  </button>
                ))}
              </div>
            </div>
          )}
          {type === "inPerson" && offices.length > 1 && (
            <div className={classes.block}>
              <span className={classes.label}>{getContent("bfOffice")}</span>
              <div className={classes.chips} role="radiogroup" aria-label={getContent("bfOffice")}>
                {[{ _id: "", name: getContent("bfWlAnyOffice") }, ...offices].map((o) => (
                  <button
                    key={o._id || "any"}
                    type="button"
                    role="radio"
                    aria-checked={place === o._id}
                    className={`${classes.chip} ${place === o._id ? classes.chipOn : ""}`}
                    onClick={() => setPlace(o._id)}
                  >
                    {o.name || getContent("bfOffice")}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={classes.block}>
            <span className={classes.label}>{getContent("bfWlWhen")}</span>
            <div className={classes.chips} role="radiogroup" aria-label={getContent("bfWlWhen")}>
              {spans.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={span === n}
                  className={`${classes.chip} ${span === n ? classes.chipOn : ""}`}
                  onClick={() => setSpan(n)}
                >
                  {getContent("bfWlNextDays", [nf.format(n)])}
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={span === "custom"}
                className={`${classes.chip} ${span === "custom" ? classes.chipOn : ""}`}
                onClick={() => setSpan("custom")}
              >
                {getContent("bfWlCustom")}
              </button>
            </div>
            {span === "custom" && (
              <div className={classes.range}>
                <DateInput
                  title={getContent("bfWlFrom")}
                  defaultValue={from}
                  onChange={(d) => setFrom(tehranYmd(d))}
                />
                <DateInput title={getContent("bfWlTo")} defaultValue={to} onChange={(d) => setTo(tehranYmd(d))} />
              </div>
            )}
            {span === "custom" && !rangeOk && (
              <small className={classes.error}>{getContent("bfWlRangeHint", [day(today), day(last)])}</small>
            )}
          </div>
          {!!existing && <p className={classes.note}>{getContent("bfWlAlready", [day(existing.to)])}</p>}
          <div className={classes.actions}>
            <Button
              size="L"
              radius="High"
              variant={type && rangeOk ? "Primary" : "Disable"}
              isLoading={busy}
              onClick={join}
            >
              {getContent("bfWlJoin")}
            </Button>
            <button type="button" className={classes.link} onClick={() => setOpen(false)}>
              {getContent("bfWlNotNow")}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default WaitlistJoin;
