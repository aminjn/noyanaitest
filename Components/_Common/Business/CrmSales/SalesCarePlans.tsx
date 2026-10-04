"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { isoDay, useBizFormat } from "../bizShared";
import { CrmContext, useCrm, useCrmText } from "../Crm/crmShared";
import { contactName, dayOf, groupOf, MiniContact, partKey, useAction, useList } from "./salesShared";
import { ContactChoice, ContactPicker } from "./SalesWidgets";

const CP_POPUP = "CrmsCarePlan";

type CarePlan = {
  _id: string;
  contact?: MiniContact | null;
  name: string;
  amount: number;
  taxRate: number;
  interval: "week" | "month" | "year";
  intervalCount: number;
  startDate: string;
  nextRunDate: string;
  endDate?: string;
  status: "active" | "paused" | "canceled";
  autoIssue: boolean;
  lastRunAt?: string;
  generatedCount: number;
  invoices: string[];
  note?: string;
  lastError?: string;
};

const CarePlanForm = ({ plan, onDone }: { plan?: CarePlan; onDone: () => void }) => {
  const t = useCrmText();
  const { node } = useCrm();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [who, setWho] = useState<ContactChoice>(plan?.contact ? { contact: plan.contact } : {});
  const [name, setName] = useState(plan?.name || "");
  const [amount, setAmount] = useState(plan ? String(plan.amount) : "");
  const [taxRate, setTax] = useState(plan ? String(plan.taxRate) : "0");
  const [interval, setIntv] = useState<CarePlan["interval"]>(plan?.interval || "month");
  const [count, setCount] = useState(plan ? String(plan.intervalCount) : "1");
  const [startDate, setStart] = useState(plan ? dayOf(plan.startDate) : isoDay(new Date()));
  const [endDate, setEnd] = useState(plan ? dayOf(plan.endDate) : "");
  const [autoIssue, setAuto] = useState(!!plan?.autoIssue);
  const [note, setNote] = useState(plan?.note || "");
  const save = async () => {
    const common = { name, amount: Number(amount) || 0, taxRate: Number(taxRate) || 0, interval, intervalCount: Number(count) || 1, endDate: endDate || null, autoIssue, note };
    const ok = plan
      ? await run("PATCH", `/care-plans/${plan._id}`, common)
      : await run("POST", "/care-plans", { ...common, contact: who.contact?._id, startDate });
    if (ok) {
      closePopup(CP_POPUP);
      onDone();
    }
  };
  return (
    <PopupCard title={t(plan ? "crmsEdit" : partKey(groupOf(node), "crmsNewCarePlan"))} size="wide">
      <div className={classes.popup}>
        {!plan && <ContactPicker value={who} onChange={setWho} allowNew={false} />}
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsName")}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={classes.field}>
            {t("crmsAmountPerPeriod")}
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className={classes.field}>
            {t("crmsTaxPct")}
            <input inputMode="decimal" value={taxRate} onChange={(e) => setTax(e.target.value.replace(/[^\d.]/g, ""))} />
          </label>
          <label className={classes.field}>
            {t("crmsEvery")}
            <input inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className={classes.field}>
            {t("crmsInterval")}
            <select value={interval} onChange={(e) => setIntv(e.target.value as CarePlan["interval"])}>
              {(["week", "month", "year"] as const).map((x) => (
                <option key={x} value={x}>
                  {t(`crmsInterval_${x}`)}
                </option>
              ))}
            </select>
          </label>
          {!plan && (
            <label className={classes.field}>
              {t("crmsStartDate")}
              <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
            </label>
          )}
          <label className={classes.field}>
            {t("crmsEndDate")}
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <label className={crm.checkField}>
          <input type="checkbox" checked={autoIssue} onChange={(e) => setAuto(e.target.checked)} />
          {t("crmsAutoIssue")}
        </label>
        <label className={classes.field}>
          {t("crmsNote")}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !name.trim() || !(Number(amount) > 0) || (!plan && !who.contact)} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// Care plans and memberships (Nexxa crm/subscriptions): each bills itself
// every period into the finance invoices; "bill now" is out of turn on
// purpose and only moves the due date once it has come.
const SalesCarePlans = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { panel, canWrite, node } = ctx;
  const { setPopup } = usePopup();
  const { run, busy } = useAction();
  const [status, setStatus] = useState<"" | CarePlan["status"]>("active");
  const { data, error, mutate } = useList<CarePlan>(`/care-plans${status ? `?status=${status}` : ""}`);
  const open = (plan?: CarePlan) => setPopup(CP_POPUP, <CrmContext.Provider value={ctx}><CarePlanForm plan={plan} onDone={() => mutate()} /></CrmContext.Provider>);
  const due = (data || []).filter((c) => c.status === "active" && +new Date(c.nextRunDate) <= Date.now()).length;
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["active", "paused", "canceled", ""] as const).map((x) => (
            <button key={x || "all"} type="button" role="tab" aria-selected={status === x} className={status === x ? classes.on : ""} onClick={() => setStatus(x)}>
              {t(x ? `crmsCp_${x}` : "crmsAllStatuses")}
            </button>
          ))}
        </div>
        {canWrite && (
          <div className={classes.actions}>
            <button
              type="button"
              className={classes.ghost}
              disabled={!!busy || !due}
              onClick={async () => {
                if (await run("POST", "/care-plans/run-due", {})) mutate();
              }}
            >
              {t("crmsRunDue", [f.money(due)])}
            </button>
            <button type="button" className={classes.primary} onClick={() => open()}>
              {t(partKey(groupOf(node), "crmsNewCarePlan"))}
            </button>
          </div>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoCarePlans")}</p>
        ) : (
          <Table
            data={data || []}
            name="CrmSalesCarePlans"
            renderer={{
              name: { name: t("crmsName"), filter: "Text", value: (c) => c.name },
              contact: {
                name: t("crmsPatient"),
                filter: "Text",
                value: (c) => contactName(c.contact),
                component: (c) =>
                  c.contact ? (
                    <Link href={`${panel}/crm/contacts/${c.contact._id}`} className={crm.linkButton}>
                      {contactName(c.contact)}
                    </Link>
                  ) : (
                    <>—</>
                  ),
              },
              amount: { name: t("crmsAmountPerPeriod"), filter: "Number", value: (c) => c.amount, component: (c) => <>{f.money(c.amount)}</> },
              every: { name: t("crmsInterval"), value: (c) => t(`crmsEveryN_${c.interval}`, [f.money(c.intervalCount)]) },
              nextRunDate: { name: t("crmsNextBill"), filter: "Date", value: (c) => new Date(c.nextRunDate) },
              generatedCount: { name: t("crmsBilled"), filter: "Number", value: (c) => c.generatedCount },
              status: { name: t("crmsStatus"), filter: "Set", value: (c) => t(`crmsCp_${c.status}`) + (c.lastError ? ` · ${c.lastError}` : "") },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      width: 260,
                      component: (c) => (
                        <TableActions>
                          {c.status === "active" && (
                            <button
                              type="button"
                              className={crm.linkButton}
                              disabled={!!busy}
                              onClick={async () => {
                                if (await run("POST", `/care-plans/${c._id}/run`, {})) mutate();
                              }}
                            >
                              {t("crmsBillNow")}
                            </button>
                          )}
                          <button type="button" className={crm.linkButton} onClick={() => open(c)}>
                            {t("crmsEdit")}
                          </button>
                          <select
                            className={crm.inlineSelect}
                            value={c.status}
                            aria-label={t("crmsStatus")}
                            onChange={async (e) => {
                              if (await run("POST", `/care-plans/${c._id}/status`, { status: e.target.value })) mutate();
                            }}
                          >
                            {(["active", "paused", "canceled"] as const).map((x) => (
                              <option key={x} value={x}>
                                {t(`crmsCp_${x}`)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className={crm.linkDanger}
                            onClick={async () => {
                              if (window.confirm(t("crmsConfirmDeleteKeepInvoices")) && (await run("DELETE", `/care-plans/${c._id}`))) mutate();
                            }}
                          >
                            {t("crmsDelete")}
                          </button>
                        </TableActions>
                      ),
                    },
                  }
                : {}),
            }}
          />
        )}
      </HandleLoading>
    </section>
  );
};

export default SalesCarePlans;
