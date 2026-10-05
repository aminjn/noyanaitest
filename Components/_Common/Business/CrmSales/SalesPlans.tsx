"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { useRouter } from "@/Components/i18n/navigation";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { useBizFormat } from "../bizShared";
import { CrmContext, useCrm } from "../Crm/crmShared";
import { contactName, Plan, planStatusKey, PlanStatus, useAction, useList, useSalesText } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload, emptyLine, LineEditor, Totals, DayField } from "./SalesWidgets";
import { Line } from "./salesShared";

const NEW_PLAN = "CrmsNewPlan";
const STATUSES: ("" | PlanStatus)[] = ["", "draft", "sent", "revised", "accepted", "declined"];

const NewPlan = ({ onDone }: { onDone: (id: string) => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [who, setWho] = useState<ContactChoice>({});
  const [subject, setSubject] = useState("");
  const [openTill, setOpenTill] = useState("");
  const [discountPercent, setDiscount] = useState(0);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const save = async () => {
    const r = await run<{ _id: string }>("POST", "/plans", {
      subject,
      openTill: openTill || null,
      discountPercent,
      items: lines.filter((l) => l.title.trim()),
      ...contactPayload(who),
    });
    if (r?._id) {
      closePopup(NEW_PLAN);
      onDone(r._id);
    }
  };
  return (
    <PopupCard title={t("crmsNewPlan")} size="wide">
      <div className={classes.popup}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsSubject")}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus />
          </label>
          <DayField label={t("crmsOpenTill")} value={openTill} onChange={(d) => setOpenTill(d)} optional />
          <label className={classes.field}>
            {t("crmsPlanDiscount")}
            <input inputMode="decimal" value={discountPercent} onChange={(e) => setDiscount(Math.min(100, Number(e.target.value.replace(/[^\d.]/g, "")) || 0))} />
          </label>
        </div>
        <h3 className={classes.cardTitle}>{t("crmsPatient")}</h3>
        <ContactPicker value={who} onChange={setWho} />
        <h3 className={classes.cardTitle}>{t("crmsItems")}</h3>
        <LineEditor lines={lines} onChange={setLines} withTax />
        <Totals lines={lines} discountPercent={discountPercent} />
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !subject.trim()} onClick={save}>
            {t("crmsCreate")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// Treatment plans / estimates (Nexxa crm/proposals + proforma): every plan
// with its status, total and invoice; a new one starts empty or from an
// inquiry (its lines copied).
const SalesPlans = () => {
  const t = useSalesText();
  const f = useBizFormat();
  const router = useRouter();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const [status, setStatus] = useState<"" | PlanStatus>("");
  const [q, setQ] = useState("");
  const { data, error } = useList<Plan>(`/plans?${new URLSearchParams({ ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) })}`);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <div className={classes.segmented} role="tablist">
            {STATUSES.map((x) => (
              <button key={x || "all"} type="button" role="tab" aria-selected={status === x} className={status === x ? classes.on : ""} onClick={() => setStatus(x)}>
                {t(x ? planStatusKey[x] : "crmsAllStatuses")}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmSearch")} aria-label={t("crmSearch")} />
        </div>
        {canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() => setPopup(NEW_PLAN, <CrmContext.Provider value={ctx}><NewPlan onDone={(id) => router.push(`${panel}/crm/plans/${id}`)} /></CrmContext.Provider>)}
          >
            {t("crmsNewPlan")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoPlans")}</p>
        ) : (
          <Table<Plan>
            data={data || []}
            name="CrmSalesPlans"
            renderer={{
              subject: {
                name: t("crmsSubject"),
                filter: "Text",
                value: (p) => p.subject,
                component: (p) => (
                  <Link href={`${panel}/crm/plans/${p._id}`} className={crm.linkButton}>
                    {p.subject}
                  </Link>
                ),
              },
              number: { name: t("crmsNumber"), filter: "Number", value: (p) => p.number },
              contact: { name: t("crmsPatient"), filter: "Text", value: (p) => contactName(p.contact) },
              date: { name: t("crmsDate"), filter: "Date", value: (p) => new Date(p.date) },
              total: { name: t("crmsTotal"), filter: "Number", value: (p) => p.total, component: (p) => <>{f.money(p.total)}</> },
              status: { name: t("crmsStatus"), filter: "Set", value: (p) => t(planStatusKey[p.status] || "crmsPlanDraft") },
              approval: {
                name: t("crmsApproval"),
                filter: "Set",
                value: (p) => (p.approval?.status && p.approval.status !== "none" ? t(`crmsApproval_${p.approval.status}`) : "—"),
              },
              invoice: { name: t("crmsInvoice"), value: (p) => (p.invoice ? t("crmsInvoiced") : "—") },
            }}
          />
        )}
      </HandleLoading>
    </section>
  );
};

export default SalesPlans;
