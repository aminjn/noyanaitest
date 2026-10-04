"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "./CrmPublic.module.css";
import { errorOf, usePublicText } from "./publicShared";

type Form = { org: string; kind: string; title?: string; intro?: string; thanks?: string; askEmail: boolean; askCity: boolean; askKind: boolean; requests: boolean };
// what can be asked for, by the centre's kind (the panel's own list)
const kindsOf: Record<string, string[]> = {
  paraClinic: ["lab", "imaging", "homeSampling", "checkup", "corporate", "other"],
  insurance: ["corporate", "group", "supplementary", "other"],
  pharmacy: ["medication", "other"],
};
const careKinds = ["cosmetic", "dental", "ivf", "surgery", "checkup", "corporate", "other"];

// A centre's public inquiry form (2026-10, backend crmSalesController
// crmPublicRouter; Nexxa webform and estimate requests): /f/<slug> makes a
// treatment inquiry on the centre's board, /r/<slug> a cost-estimate
// request. A hidden field catches bots; it can sit in an iframe.
const PublicCrmForm = ({ slug, mode }: { slug: string; mode: "lead" | "request" }) => {
  const t = usePublicText();
  const valid = /^[a-z0-9-]{3,40}$/.test(slug);
  const { data, error } = useSWR<Form | null>(valid ? `${API}/public/crm/form/${slug}` : null, (url: string) => fetcher({ url }).then((res) => (res.data as Form) || null));
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, val: string) => setV({ ...v, [k]: val });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await fetcher({
        url: `${API}/public/crm/form/${slug}/${mode}`,
        method: "POST",
        bodyParser: "JSON",
        payload: { ...v, ...(v.budget ? { budget: Number(v.budget.replace(/\D/g, "")) || 0 } : {}) },
      });
      setSent(true);
    } catch (x) {
      setErr(errorOf(x));
    } finally {
      setBusy(false);
    }
  };
  const off = !valid || error || (data && mode === "request" && !data.requests);
  return (
    <main className={classes.main}>
      <section className={classes.card}>
        {off ? (
          <p className={classes.text}>{t("crmsPubFormOff")}</p>
        ) : !data ? (
          <p className={classes.text}>…</p>
        ) : sent ? (
          <>
            <h1 className={classes.title}>{data.org}</h1>
            <p className={classes.ok}>{data.thanks || t("crmsPubThanks")}</p>
          </>
        ) : (
          <form onSubmit={submit} className={classes.form}>
            <h1 className={classes.title}>{data.title || t(mode === "request" ? "crmsPubEstimateTitle" : "crmsPubFormTitle", [data.org])}</h1>
            {data.intro && <p className={classes.text}>{data.intro}</p>}
            <div className={classes.grid}>
              <label className={classes.field}>
                {t("crmsPubName")} *
                <input required minLength={2} value={v.name || ""} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
              </label>
              <label className={classes.field}>
                {t("crmsPubMobile")} *
                <input required dir="ltr" inputMode="tel" value={v.phone || ""} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
              </label>
              {data.askEmail && (
                <label className={classes.field}>
                  {t("crmsPubEmail")}
                  <input type="email" dir="ltr" value={v.email || ""} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </label>
              )}
              {data.askCity && (
                <label className={classes.field}>
                  {t("crmsPubCity")}
                  <input value={v.city || ""} onChange={(e) => set("city", e.target.value)} />
                </label>
              )}
              {data.askKind && (
                <label className={classes.field}>
                  {t("crmsPubKind")}
                  <select value={v.kind || ""} onChange={(e) => set("kind", e.target.value)}>
                    <option value="">—</option>
                    {(kindsOf[data.kind] || careKinds).map((k) => (
                      <option key={k} value={k}>
                        {t(`crmsKind_${k}`)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {mode === "request" && (
                <>
                  <label className={classes.field}>
                    {t("crmsPubSubject")} *
                    <input required value={v.subject || ""} onChange={(e) => set("subject", e.target.value)} />
                  </label>
                  <label className={classes.field}>
                    {t("crmsPubBudget")}
                    <input inputMode="numeric" value={v.budget || ""} onChange={(e) => set("budget", e.target.value)} />
                  </label>
                  {data.kind === "insurance" && (
                    <label className={classes.field}>
                      {t("crmsPubCompany")}
                      <input value={v.company || ""} onChange={(e) => set("company", e.target.value)} />
                    </label>
                  )}
                </>
              )}
            </div>
            {data.kind === "paraClinic" && (
              <div className={classes.grid}>
                <label className={classes.field}>
                  {t("crmsPubAddress")}
                  <textarea value={v.address || ""} onChange={(e) => set("address", e.target.value)} />
                </label>
                <label className={classes.field}>
                  {t("crmsPubPreferredTime")}
                  <input value={v.preferredAt || ""} onChange={(e) => set("preferredAt", e.target.value)} />
                </label>
                <label className={classes.field}>
                  {t("crmsPubReferrer")}
                  <input value={v.referrer || ""} onChange={(e) => set("referrer", e.target.value)} />
                </label>
              </div>
            )}
            <label className={classes.field}>
              {t("crmsPubMessage")}
              <textarea value={v.message || ""} onChange={(e) => set("message", e.target.value)} />
            </label>
            <label className={classes.hp} aria-hidden="true">
              website
              <input tabIndex={-1} autoComplete="off" value={v.website || ""} onChange={(e) => set("website", e.target.value)} />
            </label>
            {err && <p className={classes.error}>{err}</p>}
            <p className={classes.meta}>{t("crmsPubConsent", [data.org])}</p>
            <div className={classes.actions}>
              <button type="submit" className={classes.primary} disabled={busy}>
                {t("crmsPubSend")}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default PublicCrmForm;
