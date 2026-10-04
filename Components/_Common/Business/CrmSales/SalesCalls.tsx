"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import { useBizFormat } from "../bizShared";
import { CrmContext, phoneText, useCrm, useCrmText } from "../Crm/crmShared";
import { contactName, useAction, useList, useNames, useSalesMeta } from "./salesShared";
import { Call, CALL_POPUP, CallForm, callStatuses } from "./SalesCallForm";

// The call log (Nexxa crm/calls): every call on the patients' files, in
// or out, its outcome and what was said; each one also stands on the
// patient's timeline and is removed from it with the call.
const SalesCalls = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const names = useNames();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { data: meta } = useSalesMeta();
  const { run } = useAction();
  const [direction, setDirection] = useState("");
  const [status, setStatus] = useState("");
  const { data, error, mutate } = useList<Call>(`/calls?${new URLSearchParams({ ...(direction ? { direction } : {}), ...(status ? { status } : {}) })}`);
  const open = (call?: Call) => setPopup(CALL_POPUP, <CrmContext.Provider value={ctx}><CallForm meta={meta} call={call} onDone={() => mutate()} /></CrmContext.Provider>);
  const mins = (sec: number) => f.money(Math.round((sec || 0) / 60));
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <select value={direction} onChange={(e) => setDirection(e.target.value)} aria-label={t("crmsDirection")}>
            <option value="">{t("crmsAllDirections")}</option>
            <option value="inbound">{t("crmsInbound")}</option>
            <option value="outbound">{t("crmsOutbound")}</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("crmsCallResult")}>
            <option value="">{t("crmsAllStatuses")}</option>
            {callStatuses.map((x) => (
              <option key={x} value={x}>
                {t(`crmsCall_${x}`)}
              </option>
            ))}
          </select>
        </div>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmsNewCall")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoCalls")}</p>
        ) : (
          <Table
            data={data || []}
            name="CrmSalesCalls"
            renderer={{
              contact: {
                name: t("crmsPatient"),
                filter: "Text",
                value: (c) => contactName(c.contact) || c.phone || "",
                component: (c) =>
                  c.contact && typeof c.contact === "object" ? (
                    <Link href={`${panel}/crm/contacts/${c.contact._id}`} className={crm.linkButton}>
                      {contactName(c.contact)}
                    </Link>
                  ) : (
                    <bdi dir="ltr">{phoneText(c.phone || "")}</bdi>
                  ),
              },
              startedAt: { name: t("crmsCallAt"), filter: "Date", value: (c) => new Date(c.startedAt) },
              direction: { name: t("crmsDirection"), filter: "Set", value: (c) => t(c.direction === "inbound" ? "crmsInbound" : "crmsOutbound") },
              status: { name: t("crmsCallResult"), filter: "Set", value: (c) => t(`crmsCall_${c.status}`) },
              durationSec: { name: t("crmsMinutes"), filter: "Number", value: (c) => c.durationSec, component: (c) => <>{mins(c.durationSec)}</> },
              summary: { name: t("crmsCallSummary"), filter: "Text", value: (c) => c.summary || "" },
              lead: { name: t("crmsLead"), value: (c) => (c.lead && typeof c.lead === "object" ? c.lead.title : "—") },
              assignee: { name: t("crmsAssignee"), filter: "Set", value: (c) => names.staff(meta, c.assignee) },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      component: (c) => (
                        <TableActions>
                          <button type="button" className={crm.linkButton} onClick={() => open(c)}>
                            {t("crmsEdit")}
                          </button>
                          <button
                            type="button"
                            className={crm.linkDanger}
                            onClick={async () => {
                              if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/calls/${c._id}`))) mutate();
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

export default SalesCalls;
