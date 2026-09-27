"use client";

import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { useMemo, useState } from "react";
import classes from "./DoctorManagePatientsPage.module.css";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import AssistantStrip from "@/Components/UI/AssistantStrip";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import SparkIcon from "@/Components/Icons/SparkIcon";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPatient"];

export type DoctorPatientPopulation = Population<{
  User: UserPopulation;
  Doctor: DoctorProfilePopulation;
}>;
export interface IDoctorPatient<
  T extends DoctorPatientPopulation = DoctorPatientPopulation
> extends MongoDoc {
  createdAt: Date;
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
}

type PatientStats = {
  visits: number;
  missed: number;
  lastVisit: string | null;
  nextVisit: string | null;
};

type PatientRow = IDoctorPatient<{ User: { Identity: Record<never, never> } }> & {
  stats?: PatientStats;
};

// Recall: a patient who was seen before but not in this many days and
// has nothing booked (Doctolib / Docplanner-style recall list).
const RECALL_DAYS = 180;

const DoctorManagePatientsPage = () => {
  const { data, error } = useSWR<PatientRow[]>(`${API}/doctor/patient`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const day = useMemo(() => new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }), [intlTag]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"" | "recall" | "missed" | "upcoming">("");

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patients"), target: "/doctorpanel/patient" },
  ]);

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const cutoff = Date.now() - RECALL_DAYS * 864e5;
    return list.map((p) => {
      const identity = p.user?.identity;
      const full = identity ? `${identity.givenName || ""} ${identity.lastName || ""}`.trim() : "";
      const name = full || p.user?.username || getContent("notAssigned");
      const s: PatientStats = p.stats || { visits: 0, missed: 0, lastVisit: null, nextVisit: null };
      const recall = !s.nextVisit && !!s.lastVisit && new Date(s.lastVisit).getTime() < cutoff;
      return { p, name, phone: p.user?.phone || "", s, recall };
    });
  }, [data, getContent]);

  const counts = useMemo(
    () => ({
      recall: rows.filter((r) => r.recall).length,
      missed: rows.filter((r) => r.s.missed > 0).length,
      upcoming: rows.filter((r) => !!r.s.nextVisit).length,
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (filter === "recall" && !r.recall) return false;
        if (filter === "missed" && !(r.s.missed > 0)) return false;
        if (filter === "upcoming" && !r.s.nextVisit) return false;
        if (q && !`${r.name} ${r.phone}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        // soonest next visit first, then most recent last visit
        const an = a.s.nextVisit ? new Date(a.s.nextVisit).getTime() : Infinity;
        const bn = b.s.nextVisit ? new Date(b.s.nextVisit).getTime() : Infinity;
        if (an !== bn) return an - bn;
        const al = a.s.lastVisit ? new Date(a.s.lastVisit).getTime() : 0;
        const bl = b.s.lastVisit ? new Date(b.s.lastVisit).getTime() : 0;
        return bl - al;
      });
  }, [rows, query, filter]);

  const chip = (key: "recall" | "missed" | "upcoming", label: string) => ({
    key,
    label,
    active: filter === key,
    onClick: () => setFilter(filter === key ? "" : key),
  });

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("patients")}</h1>
            <span className={classes.count}>{getContent("patCount", [num.format(rows.length)])}</span>
            <label className={classes.search}>
              <Ixon width="1.05rem">
                <SearchIcon />
              </Ixon>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getContent("patSearch")}
                aria-label={getContent("patSearch")}
              />
            </label>
          </header>

          <AssistantStrip
            title={getContent("patAssistant")}
            clearLabel={getContent("patClearFilter")}
            onClear={() => setFilter("")}
            chips={[
              ...(counts.recall ? [chip("recall", getContent("patAiRecall", [num.format(counts.recall)]))] : []),
              ...(counts.missed ? [chip("missed", getContent("patAiMissed", [num.format(counts.missed)]))] : []),
              ...(counts.upcoming ? [chip("upcoming", getContent("patAiUpcoming", [num.format(counts.upcoming)]))] : []),
            ]}
          />

          {!visible.length ? (
            <div className={classes.empty}>{getContent("patEmpty")}</div>
          ) : (
            <ul className={classes.grid}>
              {visible.map(({ p, name, phone, s, recall }) => (
                <li key={p._id}>
                  <Link href={`/doctorpanel/patient/${p._id}`} className={classes.card}>
                    <div className={classes.top}>
                      <InitialAvatar name={name} seed={p._id} size="3rem" />
                      <div className={classes.who}>
                        <strong>{name}</strong>
                        {!!phone && <span className={classes.phone}>{phone}</span>}
                      </div>
                    </div>
                    <div className={classes.stats}>
                      <span>
                        <em>{num.format(s.visits)}</em>
                        {getContent("patVisitsLabel")}
                      </span>
                      <span>
                        <em>{s.lastVisit ? day.format(new Date(s.lastVisit)) : "—"}</em>
                        {getContent("patLastVisitLabel")}
                      </span>
                    </div>
                    <div className={classes.chips}>
                      {s.nextVisit && (
                        <span className={classes.next}>
                          {getContent("patNextVisit", [day.format(new Date(s.nextVisit))])}
                        </span>
                      )}
                      {recall && (
                        <span className={classes.recall}>
                          <Ixon width="0.8rem">
                            <SparkIcon />
                          </Ixon>
                          {getContent("patRecallChip")}
                        </span>
                      )}
                      {s.missed > 0 && (
                        <span className={classes.missed}>{getContent("patMissed", [num.format(s.missed)])}</span>
                      )}
                      {!s.visits && !s.nextVisit && <span className={classes.muted}>{getContent("patNoVisits")}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManagePatientsPage;
