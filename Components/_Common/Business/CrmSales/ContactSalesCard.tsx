"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { useCrm } from "../Crm/crmShared";
import { Credit, CustomField, leadStatusKey, planStatusKey, PlanStatus, useAction, useProfile, useSalesMeta, useSalesText } from "./salesShared";
import { CustomFieldInputs } from "./SalesWidgets";
import { contractStateKey, ContractState } from "./SalesContracts";

type SalesFile = {
  ext: { nationalId?: string; email?: string; customFields?: Record<string, string>; creditLimit: number; freeCredit: boolean; mergedInto?: string };
  leads: { _id: string; title: string; status: "open" | "won" | "lost"; value: number }[];
  plans: { _id: string; number: number; subject: string; status: PlanStatus; total: number }[];
  contracts: { _id: string; number: number; subject: string; state: ContractState; value: number }[];
  carePlans: { _id: string; name: string; amount: number; status: string; nextRunDate: string }[];
  calls: { _id: string; direction: string; status: string; startedAt: string; summary?: string }[];
  credit: Credit | null;
};

// The sales side of one patient's file (Nexxa contacts/[id]): their
// treatment inquiries, plans, contracts and care plans, the extra details
// (national id, the centre's own fields) and the credit they have.
const ContactSalesCard = ({ contactId }: { contactId: string }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { api, panel, canWrite } = useCrm();
  const { funnel } = useProfile();
  const { data: meta } = useSalesMeta();
  const { run, busy } = useAction();
  const { data, mutate } = useSWR<SalesFile>(`${API}${api}/contacts/${contactId}/sales`, (url: string) => fetcher({ url }).then((res) => res.data as SalesFile));
  const [ext, setExt] = useState<{ nationalId?: string; email?: string; cf?: Record<string, string>; creditLimit?: number; freeCredit?: boolean }>({});
  useEffect(() => setExt({}), [data]);
  if (!data) return null;
  const fields = asArray<CustomField>(meta?.customFields).filter((x) => x.entity === "contact");
  const dirty = Object.keys(ext).length > 0;
  const save = async () => {
    const payload: Record<string, unknown> = {};
    if (ext.nationalId !== undefined) payload.nationalId = ext.nationalId;
    if (ext.email !== undefined) payload.email = ext.email;
    if (ext.cf) payload.customFields = ext.cf;
    if (ext.creditLimit !== undefined) payload.creditLimit = ext.creditLimit;
    if (ext.freeCredit !== undefined) payload.freeCredit = ext.freeCredit;
    if (await run("PATCH", `/contacts/${contactId}/ext`, payload)) mutate();
  };
  const linkList = <T extends { _id: string }>(rows: T[], href: (r: T) => string, text: (r: T) => string) =>
    rows.length ? (
      <ul className={s.history}>
        {rows.slice(0, 6).map((r) => (
          <li key={r._id}>
            <Link href={href(r)} className={crm.linkButton}>
              {text(r)}
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className={classes.muted}>—</p>
    );
  return (
    <section className={classes.card}>
      <h3 className={classes.cardTitle}>{t("crmsContactSales")}</h3>
      <div className={s.formGrid}>
        {funnel && (
          <div>
            <h4 className={classes.tileLabel}>{t("crmsNavPipeline")}</h4>
            {linkList(data.leads, (l) => `${panel}/crm/leads/${l._id}`, (l) => `${l.title} · ${t(leadStatusKey[l.status])}`)}
          </div>
        )}
        <div>
          <h4 className={classes.tileLabel}>{t("crmsNavPlans")}</h4>
          {linkList(data.plans, (p) => `${panel}/crm/plans/${p._id}`, (p) => `${f.money(p.number)} · ${p.subject} · ${t(planStatusKey[p.status])}`)}
        </div>
        <div>
          <h4 className={classes.tileLabel}>{t("crmsNavContracts")}</h4>
          {linkList(data.contracts, (c) => `${panel}/crm/contracts/${c._id}`, (c) => `${c.subject} · ${t(contractStateKey[c.state])}`)}
        </div>
        <div>
          <h4 className={classes.tileLabel}>{t("crmsNavCarePlans")}</h4>
          {linkList(data.carePlans, () => `${panel}/crm/care-plans`, (c) => `${c.name} · ${f.money(c.amount)}`)}
        </div>
      </div>
      <div className={s.formGrid}>
        <label className={classes.field}>
          {t("crmsNationalId")}
          <input dir="ltr" inputMode="numeric" maxLength={10} value={ext.nationalId ?? data.ext.nationalId ?? ""} disabled={!canWrite} onChange={(e) => setExt({ ...ext, nationalId: e.target.value.replace(/\D/g, "") })} />
        </label>
        <label className={classes.field}>
          {t("crmsEmail")}
          <input dir="ltr" value={ext.email ?? data.ext.email ?? ""} disabled={!canWrite} onChange={(e) => setExt({ ...ext, email: e.target.value })} />
        </label>
        <label className={classes.field}>
          {t("crmsCreditLimit")}
          <input
            inputMode="numeric"
            value={ext.creditLimit ?? data.ext.creditLimit ?? 0}
            disabled={!canWrite}
            onChange={(e) => setExt({ ...ext, creditLimit: Number(e.target.value.replace(/\D/g, "")) || 0 })}
          />
        </label>
      </div>
      {data.credit && (
        <p className={classes.muted}>
          {data.credit.enforced ? t("crmsCreditLine", [f.money(data.credit.balance), f.money(data.credit.limit)]) : t("crmsCreditNone", [f.money(data.credit.balance)])}{" "}
          <Link href={`${panel}/crm/approvals`} className={crm.linkButton}>
            {t("crmsAskCredit")}
          </Link>
        </p>
      )}
      {fields.length > 0 && <CustomFieldInputs defs={fields} values={ext.cf ?? data.ext.customFields ?? {}} onChange={(cf) => setExt({ ...ext, cf })} />}
      {canWrite && (
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!dirty || !!busy} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      )}
    </section>
  );
};

export default ContactSalesCard;
