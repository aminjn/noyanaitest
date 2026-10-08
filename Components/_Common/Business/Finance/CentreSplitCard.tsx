"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { useFin, useFinText } from "./finShared";

type Sum = { insurer?: number; doctor?: number; count?: number };
type Row = {
  kind: "clinic" | "hospital" | "doctor";
  id: string;
  name?: string;
  member?: boolean;
  doctorPercent?: number;
  proposal?: { doctorPercent?: number } | null;
  booked?: Sum;
  upcoming?: Sum;
};
type Data = { rows?: Row[]; totals?: { booked?: Sum; upcoming?: Sum } };

// The doctors' share of what insurers pay a clinic or hospital (2026-10,
// Lib/centreInsurerSplit.ts): on the centre's claims page, what it owes each
// doctor (3305 doctors' share payable); on the doctor's, what each centre
// owes them (1411, the centre). Both read the same reservation lines the two
// books were posted from, with the agreed percentage and a pending change.
const CentreSplitCard = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, node } = useFin();
  const asDoctor = node === "doctor";
  const show = node === "doctor" || node === "clinic" || node === "hospital";
  const { data, error } = useSWR<Data>(show ? `${API}${api}/centre-split` : null, (url: string) =>
    fetcher({ url }).then((res) => (res.data || {}) as Data),
  );
  if (!show) return null;
  const rows = asArray<Row>(data?.rows).filter((r) => r && r.id);
  // a doctor who never practised in a centre has nothing to see here
  if (asDoctor && data && !rows.length) return null;
  const totals = data?.totals || {};
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <h2 className={classes.cardTitle}>{t(asDoctor ? "cisFinTitleDoctor" : "cisFinTitleCentre")}</h2>
      </div>
      <p className={classes.muted}>{t(asDoctor ? "cisFinHintDoctor" : "cisFinHintCentre")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("cisNone")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t(asDoctor ? "cisColCentre" : "cisColDoctor")}</th>
                    <th className={classes.num}>{t("cisColPercent")}</th>
                    <th className={classes.num}>{t("cisColInsurer")}</th>
                    <th className={classes.num}>{t(asDoctor ? "cisColDue" : "cisColOwed")}</th>
                    <th className={classes.num}>{t("cisColUpcoming")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.kind}:${r.id}`}>
                      <td className={classes.wrap}>
                        {r.name || "—"}
                        {!r.member && <span className={fin.small}> ({t("cisFormer")})</span>}
                      </td>
                      <td className={classes.num}>
                        {f.percent(r.doctorPercent ?? 100)}
                        {r.proposal?.doctorPercent != null && (
                          <div className={fin.small}>{t("cisPendingShort", [f.money(r.proposal.doctorPercent)])}</div>
                        )}
                      </td>
                      <td className={classes.num}>{f.money(r.booked?.insurer)}</td>
                      <td className={classes.num}>
                        <b>{f.money(r.booked?.doctor)}</b>
                      </td>
                      <td className={classes.num}>{f.money(r.upcoming?.doctor)}</td>
                    </tr>
                  ))}
                </tbody>
                {rows.length > 1 && (
                  <tfoot>
                    <tr>
                      <th>{t("cisTotal")}</th>
                      <th />
                      <th className={classes.num}>{f.money(totals.booked?.insurer)}</th>
                      <th className={classes.num}>{f.money(totals.booked?.doctor)}</th>
                      <th className={classes.num}>{f.money(totals.upcoming?.doctor)}</th>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default CentreSplitCard;
