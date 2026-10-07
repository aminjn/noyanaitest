"use client";

import { useMemo } from "react";
import useSWR from "swr";
import classes from "./InsuranceCoverage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType, doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import Ixon from "@/Components/UI/Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";

const NS: ContentNamespace[] = ["common", "drProfile"];

type CoverageItem = {
  _id: string;
  name: string;
  isBasic?: boolean;
  covered?: boolean;
  plan?: string | null;
  insurerShare?: number;
  patientShare?: number | null;
};
type Coverage = { sessionType: DoctorSessionType | null; price?: number | null; hidePrice?: boolean; items: CoverageItem[] };

// «پوشش بیمه» on the doctor's profile (2026-10): every insurance the doctor
// (or their centre) accepts and, where a tariff covers the first visit
// type, the estimated patient share - Zocdoc's "estimated cost with your
// insurance". The booking page computes the exact quote.
const InsuranceCoverage = ({ doctorId, fallback }: { doctorId: string; fallback?: { _id: string; name?: string }[] }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data } = useSWR<Coverage>(`${API}/public/dr/${doctorId}/coverage`, (url: string) =>
    fetcher({ url }).then((res) => {
      const d = res?.data || {};
      return { ...d, items: (Array.isArray(d.items) ? d.items : []).filter((i: CoverageItem) => !!i?._id) } as Coverage;
    }),
  );
  // until it loads (or if it fails): the names alone
  const items: CoverageItem[] = data?.items?.length ? data.items : (fallback || []).map((f) => ({ _id: f._id, name: f.name || "" }));
  if (!items.length) return null;
  const anyEstimate = items.some((i) => typeof i.patientShare === "number");
  return (
    <div className={classes.box}>
      <ul className={classes.list}>
        {items.map((i) => (
          <li key={i._id} className={classes.item}>
            <span className={`${classes.icon} tone-teal`}>
              <Ixon width="0.9rem">
                <ShieldCheckIcon />
              </Ixon>
            </span>
            <span className={classes.text}>
              <b>
                {i.name}
                {i.isBasic !== undefined && <small>{i.isBasic ? getContent("drInsBasic") : getContent("drInsSupp")}</small>}
              </b>
              <span className={classes.hint}>
                {typeof i.patientShare === "number"
                  ? getContent("drInsPatientShare", [getContent("xToman", [nf.format(i.patientShare)])])
                  : i.covered
                    ? getContent("drInsCovered")
                    : getContent("drInsAtDesk")}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {anyEstimate && !!data?.sessionType && (
        <p className={classes.note}>{getContent("drInsEstimateNote", [getContent(doctorSessionTypeContentKeyDict[data.sessionType])])}</p>
      )}
    </div>
  );
};

export default InsuranceCoverage;
