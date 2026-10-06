"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./PatientTimeline.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import PillIcon from "@/Components/Icons/PillIcon";
import DocumentIcon from "@/Components/Icons/DocumentIcon";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import { ReservationStatus } from "@/Components/Dashboard/Booking/reservationStatus";

const NS: ContentNamespace[] = ["common", "doctorPanelPatient"];

type VisitEvent = {
  kind: "visit";
  id: string;
  at: string;
  status: ReservationStatus;
  sessionType?: string;
  start: number;
  office?: string | null;
  patientName?: string | null;
  desk?: boolean;
  note?: { assessment?: string; plan?: string; subjective?: string; aiAssisted?: boolean } | null;
};
type RxEvent = { kind: "prescription"; id: string; at: string; items: number; labItems: number };
type RecordEvent = {
  kind: "record";
  id: string;
  at: string;
  title: string;
  description?: string;
  files: number;
  profileTitle?: string;
};
type TimelineEvent = VisitEvent | RxEvent | RecordEvent;

type Timeline = {
  events: TimelineEvent[];
  stats: { visits: number; missed: number; cancelled: number; upcoming: number };
  clinical: boolean;
};

const FILTERS = ["all", "visit", "prescription", "record"] as const;
type Filter = (typeof FILTERS)[number];
const filterKeys: Record<Filter, ContentKey> = {
  all: "ptlAll",
  visit: "ptlVisits",
  prescription: "ptlPrescriptions",
  record: "ptlRecords",
};

// The patient's story with this doctor, newest first: visits and their
// outcome with the note's assessment and plan, prescriptions and records
// (GET /doctor/patient/:id/timeline).
const PatientTimeline = ({ patientId, selfName }: { patientId: string; selfName?: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }),
    [intlTag],
  );
  // visit minutes are wall-clock (like shifts): shown as they are
  const time = (m: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };
  const [filter, setFilter] = useState<Filter>("all");
  const { data } = useSWR<Timeline>(`${API}/doctor/patient/${patientId}/timeline`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const events = (Array.isArray(data?.events) ? data!.events : []).filter((e) => e && e.id);
  const shown = filter === "all" ? events : events.filter((e) => e.kind === filter);
  const stats = data?.stats;

  const fmtDate = (at: string) => {
    const d = new Date(at);
    return isNaN(d.getTime()) ? "—" : dateFmt.format(d);
  };

  return (
    <section className={classes.main} aria-label={getContent("ptlTitle")}>
      <header className={classes.head}>
        <h2 className={classes.title}>{getContent("ptlTitle")}</h2>
        {!!stats && (
          <ul className={classes.stats}>
            <li className="tone-teal">{getContent("ptlStatVisits", [num.format(stats.visits)])}</li>
            {stats.upcoming > 0 && <li className="tone-indigo">{getContent("ptlStatUpcoming", [num.format(stats.upcoming)])}</li>}
            {stats.missed > 0 && <li className="tone-rose">{getContent("ptlStatMissed", [num.format(stats.missed)])}</li>}
          </ul>
        )}
      </header>
      <div className={classes.filters} role="tablist">
        {FILTERS.filter((f) => f !== "prescription" || data?.clinical).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`${classes.filter} ${filter === f ? classes.filterOn : ""}`}
            onClick={() => setFilter(f)}
          >
            {getContent(filterKeys[f])}
          </button>
        ))}
      </div>

      {!data ? (
        <p className={classes.muted}>…</p>
      ) : !shown.length ? (
        <p className={classes.muted}>{getContent("ptlEmpty")}</p>
      ) : (
        <ol className={classes.list}>
          {shown.map((e) => (
            <li key={`${e.kind}-${e.id}`} className={classes.event}>
              <span
                className={`${classes.dot} glassIcon ${
                  e.kind === "visit" ? "tone-indigo" : e.kind === "prescription" ? "tone-teal" : "tone-amber"
                }`}
                aria-hidden
              >
                <Ixon width="1rem">
                  {e.kind === "visit" ? <CalendarIcon /> : e.kind === "prescription" ? <PillIcon /> : <DocumentIcon />}
                </Ixon>
              </span>
              <div className={classes.body}>
                <div className={classes.line}>
                  <span className={classes.date}>{fmtDate(e.at)}</span>
                  {e.kind === "visit" && (
                    <>
                      <span className={classes.meta}>
                        {[
                          typeof e.start === "number" ? time(e.start) : "",
                          e.sessionType ? getContent(e.sessionType as ContentKey) : "",
                          e.office || "",
                          // only when booked for someone else (a child, a parent)
                          e.patientName && e.patientName !== selfName ? e.patientName : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <ReservationStatusBadge status={e.status} />
                    </>
                  )}
                  {e.kind === "prescription" && (
                    <span className={classes.meta}>
                      {getContent("ptlRxItems", [num.format(e.items), num.format(e.labItems)])}
                    </span>
                  )}
                  {e.kind === "record" && <strong className={classes.recordTitle}>{e.title}</strong>}
                </div>
                {e.kind === "visit" && !!e.note && (e.note.assessment || e.note.plan || e.note.subjective) && (
                  <dl className={classes.note}>
                    {!!e.note.assessment && (
                      <>
                        <dt>{getContent("ptlAssessment")}</dt>
                        <dd>{e.note.assessment}</dd>
                      </>
                    )}
                    {!!e.note.plan && (
                      <>
                        <dt>{getContent("ptlPlan")}</dt>
                        <dd>{e.note.plan}</dd>
                      </>
                    )}
                    {!!e.note.subjective && (
                      <>
                        <dt>{getContent("ptlNote")}</dt>
                        <dd>{e.note.subjective}</dd>
                      </>
                    )}
                  </dl>
                )}
                {e.kind === "visit" && data.clinical && !e.note && e.status === "completed" && (
                  <span className={classes.muted}>{getContent("ptlNoNote")}</span>
                )}
                {e.kind === "record" && (!!e.description || e.files > 0) && (
                  <p className={classes.recordText}>
                    {[e.description, e.files > 0 ? getContent("ptlFiles", [num.format(e.files)]) : "", e.profileTitle]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {e.kind === "visit" && (
                  <Link href={`/doctorpanel/booking/${e.id}`} className={classes.open}>
                    {getContent(e.note ? "ptlOpenNote" : "ptlOpenVisit")}
                  </Link>
                )}
                {e.kind === "prescription" && (
                  <Link href={`/doctorpanel/prescription/${e.id}`} className={classes.open}>
                    {getContent("ptlOpenRx")}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default PatientTimeline;
