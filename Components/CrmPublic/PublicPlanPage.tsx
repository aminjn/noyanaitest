"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "./CrmPublic.module.css";
import SignaturePad from "./SignaturePad";
import { errorOf, usePublicFormat, usePublicText } from "./publicShared";

type PublicPlan = {
  org: string;
  number: number;
  subject: string;
  patient: string;
  date: string;
  openTill?: string;
  status: "sent" | "accepted" | "declined" | "revised";
  items: { title: string; qty: number; unitPrice: number; discount: number; taxRate: number; sessions?: number }[];
  discountPercent: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  terms?: string;
  acceptedName?: string;
  decidedAt?: string;
  canDecide: boolean;
};

// The treatment plan a centre sent by SMS (/tp/<token>, Nexxa /pr/[id]):
// its lines and total; the patient accepts with their name and a drawn
// signature, or declines. Once decided it only shows the answer.
const PublicPlanPage = ({ token }: { token: string }) => {
  const t = usePublicText();
  const f = usePublicFormat();
  const valid = /^[A-Za-z0-9_-]{8,20}$/.test(token);
  const { data, error, mutate } = useSWR<PublicPlan | null>(valid ? `${API}/public/crm/plan/${token}` : null, (url: string) => fetcher({ url }).then((res) => (res.data as PublicPlan) || null));
  const [name, setName] = useState("");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const decide = async (decision: "accept" | "decline") => {
    setBusy(true);
    setErr("");
    try {
      await fetcher({ url: `${API}/public/crm/plan/${token}/${decision}`, method: "POST", bodyParser: "JSON", payload: decision === "accept" ? { name, signature } : {} });
      mutate();
    } catch (x) {
      setErr(errorOf(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className={classes.main}>
      <section className={classes.card}>
        {!valid || error ? (
          <p className={classes.text}>{t("crmsPubPlanInvalid")}</p>
        ) : !data ? (
          <p className={classes.text}>…</p>
        ) : (
          <>
            <div className={classes.meta}>
              <h1 className={classes.title}>{data.org}</h1>
              <span>
                {t("crmsPubPlanN", [f.money(data.number)])} · {data.subject}
              </span>
              <span>
                {t("crmsPubFor")}: {data.patient || "—"} · {f.date(data.date)}
                {data.openTill ? ` · ${t("crmsPubValidTill", [f.date(data.openTill)])}` : ""}
              </span>
            </div>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("crmsPubService")}</th>
                    <th className={classes.num}>{t("crmsPubQty")}</th>
                    <th className={classes.num}>{t("crmsPubUnitPrice")}</th>
                    <th className={classes.num}>{t("crmsPubDiscountPct")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(data.items) ? data.items : []).map((l, i) => (
                    <tr key={i}>
                      <td>
                        {l.title}
                        {l.sessions ? ` (${t("crmsSessionsN", [f.money(l.sessions)])})` : ""}
                      </td>
                      <td className={classes.num}>{f.money(l.qty)}</td>
                      <td className={classes.num}>{f.money(l.unitPrice)}</td>
                      <td className={classes.num}>{f.money(l.discount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={classes.meta}>
              <span>
                {t("crmsSubtotal")}: {f.money(data.subtotal)}
              </span>
              {data.discount > 0 && (
                <span>
                  {t("crmsDiscount")}: {f.money(data.discount)}
                </span>
              )}
              {data.tax > 0 && (
                <span>
                  {t("crmsTax")}: {f.money(data.tax)}
                </span>
              )}
            </div>
            <div className={classes.total}>
              <span>{t("crmsTotal")}</span>
              <span>
                {f.money(data.total)} {t("toman")}
              </span>
            </div>
            {data.terms && <p className={classes.text}>{data.terms}</p>}
            {data.status === "accepted" ? (
              <p className={classes.ok}>{t("crmsPubAccepted", [data.acceptedName || "", f.date(data.decidedAt)])}</p>
            ) : data.status === "declined" ? (
              <p className={classes.text}>{t("crmsPubDeclined")}</p>
            ) : data.canDecide ? (
              <>
                <label className={classes.field}>
                  {t("crmsPubYourName")}
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <SignaturePad onChange={setSignature} label={t("crmsPubSignHere")} clearLabel={t("crmsPubClear")} />
                {err && <p className={classes.error}>{err}</p>}
                <div className={classes.actions}>
                  <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2} onClick={() => decide("accept")}>
                    {t("crmsPubAccept")}
                  </button>
                  <button type="button" className={classes.ghost} disabled={busy} onClick={() => window.confirm(t("crmsPubDeclineConfirm")) && decide("decline")}>
                    {t("crmsPubDecline")}
                  </button>
                </div>
              </>
            ) : (
              <p className={classes.text}>{t("crmsPubExpired")}</p>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default PublicPlanPage;
