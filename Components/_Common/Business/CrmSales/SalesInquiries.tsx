"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import { useBizFormat } from "../bizShared";
import { phoneText, useCrm, useCrmText } from "../Crm/crmShared";
import { leadKindKey, leadKinds, useAction, useList } from "./salesShared";

const Q_POPUP = "CrmsInquiry";

type Inquiry = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  subject: string;
  description?: string;
  kind?: string;
  budget: number;
  status: "new" | "reviewed" | "converted" | "closed";
  source: "web" | "manual";
  lead?: string;
  createdAt: string;
};

// Cost-estimate requests (Nexxa crm/estimate-requests): from the public
// form (/r/<slug>) or typed in at the desk; reviewed, closed, or turned
// once into a treatment inquiry on the board.
const SalesInquiries = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const router = useRouter();
  const { api, panel, canWrite } = useCrm();
  const { setPopup, closePopup } = usePopup();
  const { run, busy } = useAction();
  const [status, setStatus] = useState<"" | Inquiry["status"]>("new");
  const { data, error, mutate } = useList<Inquiry>(`/inquiries${status ? `?status=${status}` : ""}`);
  const add = () =>
    setPopup(
      Q_POPUP,
      <PopupCard title={t("crmsNewInquiry")} size="wide">
        <CreateForm<Partial<Inquiry>>
          renderer={{
            name: { type: "text", title: t("crmsPatientName"), required: true },
            phone: { type: "text", title: t("crmsMobile"), ltr: true },
            subject: { type: "text", title: t("crmsSubject"), required: true },
            kind: { type: "select", title: t("crmsKind"), options: Object.fromEntries(leadKinds.map((k) => [k, t(leadKindKey(k))])) },
            budget: { type: "number", title: t("crmsBudget"), price: true },
            company: { type: "text", title: t("crmsCompany") },
            email: { type: "text", title: t("crmsEmail"), ltr: true },
            description: { type: "area", title: t("crmsDescription") },
          }}
          onCancel={() => closePopup(Q_POPUP)}
          hookProps={{
            path: `${API}${api}/inquiries`,
            method: "POST",
            parser: "JSON",
            successCb: () => {
              mutate();
              closePopup(Q_POPUP);
            },
          }}
        />
      </PopupCard>,
    );
  const convert = async (q: Inquiry) => {
    const r = await run<{ lead: string }>("POST", `/inquiries/${q._id}/convert`, {});
    if (r?.lead) router.push(`${panel}/crm/leads/${r.lead}`);
  };
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["new", "reviewed", "converted", "closed", ""] as const).map((x) => (
            <button key={x || "all"} type="button" role="tab" aria-selected={status === x} className={status === x ? classes.on : ""} onClick={() => setStatus(x)}>
              {t(x ? `crmsIq_${x}` : "crmsAllStatuses")}
            </button>
          ))}
        </div>
        <div className={classes.actions}>
          <Link href={`${panel}/crm/sales-settings`} className={classes.ghost}>
            {t("crmsFormSettings")}
          </Link>
          {canWrite && (
            <button type="button" className={classes.primary} onClick={add}>
              {t("crmsNewInquiry")}
            </button>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoInquiries")}</p>
        ) : (
          <Table
            data={data || []}
            name="CrmSalesInquiries"
            renderer={{
              subject: { name: t("crmsSubject"), filter: "Text", value: (q) => q.subject },
              name: { name: t("crmsPatientName"), filter: "Text", value: (q) => q.name },
              phone: { name: t("crmsMobile"), filter: "Text", value: (q) => q.phone || "", component: (q) => <bdi dir="ltr">{phoneText(q.phone || "")}</bdi> },
              kind: { name: t("crmsKind"), filter: "Set", value: (q) => t(leadKindKey(q.kind)) },
              budget: { name: t("crmsBudget"), filter: "Number", value: (q) => q.budget, component: (q) => <>{f.money(q.budget)}</> },
              source: { name: t("crmsSource"), filter: "Set", value: (q) => t(q.source === "web" ? "crmsFromWeb" : "crmsFromDesk") },
              createdAt: { name: t("crmsDate"), filter: "Date", value: (q) => new Date(q.createdAt) },
              status: { name: t("crmsStatus"), filter: "Set", value: (q) => t(`crmsIq_${q.status}`) },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      width: 280,
                      component: (q) => (
                        <TableActions>
                          {q.lead ? (
                            <Link href={`${panel}/crm/leads/${q.lead}`} className={crm.linkButton}>
                              {t("crmsOpenLead")}
                            </Link>
                          ) : (
                            <button type="button" className={crm.linkButton} disabled={!!busy} onClick={() => convert(q)}>
                              {t("crmsToLead")}
                            </button>
                          )}
                          {q.status !== "converted" && (
                            <select
                              className={crm.inlineSelect}
                              value={q.status}
                              aria-label={t("crmsStatus")}
                              onChange={async (e) => {
                                if (await run("PATCH", `/inquiries/${q._id}`, { status: e.target.value })) mutate();
                              }}
                            >
                              {(["new", "reviewed", "closed"] as const).map((x) => (
                                <option key={x} value={x}>
                                  {t(`crmsIq_${x}`)}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            type="button"
                            className={crm.linkDanger}
                            onClick={async () => {
                              if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/inquiries/${q._id}`))) mutate();
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

export default SalesInquiries;
