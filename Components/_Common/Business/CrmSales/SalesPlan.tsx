"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { useRouter } from "@/Components/i18n/navigation";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { useBizFormat } from "../bizShared";
import { CrmContext, useCrm } from "../Crm/crmShared";
import { approvalStatusKey, contactName, dayOf, Line, Plan, planStatusKey, useAction, useSalesText } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload, CopyLink, LineEditor, Totals, DayField } from "./SalesWidgets";

const DISCOUNT_POPUP = "CrmsPlanDiscount";

// a discount for the manager to approve (Nexxa discount-requests): a
// percent or an amount, applied to this plan once approved
export const DiscountRequest = ({ plan, invoice, onDone }: { plan?: string; invoice?: string; onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [n, setN] = useState("");
  const [description, setDescription] = useState("");
  return (
    <PopupCard title={t("crmsAskDiscount")}>
      <div className={classes.popup}>
        <div className={classes.segmented} role="tablist">
          {(["percent", "amount"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? classes.on : ""} onClick={() => setMode(m)}>
              {t(m === "percent" ? "crmsByPercent" : "crmsByAmount")}
            </button>
          ))}
        </div>
        <label className={classes.field}>
          {t(mode === "percent" ? "crmsDiscountPct" : "crmsDiscountAmount")}
          <input inputMode="decimal" value={n} onChange={(e) => setN(e.target.value.replace(/[^\d.]/g, ""))} autoFocus />
        </label>
        <label className={classes.field}>
          {t("crmsReason")}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!!busy || !(Number(n) > 0)}
            onClick={async () => {
              const ok = await run("POST", "/approvals", {
                kind: "discount",
                ...(plan ? { plan } : {}),
                ...(invoice ? { invoice } : {}),
                ...(mode === "percent" ? { percent: Math.min(100, Number(n)) } : { amount: Number(n) }),
                description,
              });
              if (ok) {
                closePopup(DISCOUNT_POPUP);
                onDone();
              }
            }}
          >
            {t("crmsSendRequest")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// One treatment plan (Nexxa crm/proposals/[id] and proforma): its lines,
// the manager's approval when the centre asks for one, sending it to the
// patient (link and SMS), the patient's answer (online with a signature,
// or at the desk), and the invoice it becomes - once.
const SalesPlan = ({ id }: { id: string }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const router = useRouter();
  const ctx = useCrm();
  const { api, panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run, busy } = useAction();
  const { data, error, mutate } = useSWR<Plan>(`${API}${api}/plans/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as Plan));
  const [edit, setEdit] = useState<{ subject?: string; openTill?: string; discountPercent?: number; lines?: Line[]; note?: string; terms?: string; who?: ContactChoice }>({});
  const [link, setLink] = useState("");
  useEffect(() => setEdit({}), [data?._id, data?.status, data?.total]);
  if (!data)
    return (
      <HandleLoading data={!!data} error={error}>
        <></>
      </HandleLoading>
    );
  const p = data;
  const locked = !!p.invoice || p.status === "accepted" || p.approval?.status === "pending";
  const editable = canWrite && !locked;
  const lines = edit.lines ?? p.items;
  const disc = edit.discountPercent ?? p.discountPercent;
  const dirty = Object.keys(edit).length > 0;
  const save = async () => {
    const payload: Record<string, unknown> = {};
    if (edit.subject !== undefined) payload.subject = edit.subject;
    if (edit.openTill !== undefined) payload.openTill = edit.openTill || null;
    if (edit.discountPercent !== undefined) payload.discountPercent = edit.discountPercent;
    if (edit.lines) payload.items = edit.lines.filter((l) => l.title.trim());
    if (edit.note !== undefined) payload.note = edit.note;
    if (edit.terms !== undefined) payload.terms = edit.terms;
    if (edit.who) Object.assign(payload, contactPayload(edit.who));
    if (await run("PATCH", `/plans/${id}`, payload)) mutate();
  };
  const send = async () => {
    const r = await run<{ pending: boolean; link: string; sms?: boolean }>("POST", `/plans/${id}/send`, {}, { quiet: true });
    if (r) {
      setLink(r.link);
      mutate();
    }
  };
  const decide = async (status: "accepted" | "declined" | "draft") => {
    if (await run("POST", `/plans/${id}/status`, { status })) mutate();
  };
  const invoice = async (issue: boolean) => {
    const r = await run<{ invoice: string }>("POST", `/plans/${id}/invoice`, { issue });
    if (r?.invoice) mutate();
  };
  const remove = async () => {
    if (!window.confirm(t("crmsConfirmDelete"))) return;
    if (await run("DELETE", `/plans/${id}`)) router.push(`${panel}/crm/plans`);
  };
  const showLink = link || (p.status !== "draft" ? p.link : "");
  return (
    <div className={s.twoCol}>
      <div className={s.stack}>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h2 className={classes.cardTitle}>
              {t("crmsPlanN", [f.money(p.number)])} · {p.subject}
            </h2>
            <span className={classes.badge}>{t(planStatusKey[p.status])}</span>
          </div>
          <div className={s.formGrid}>
            <label className={classes.field}>
              {t("crmsSubject")}
              <input value={edit.subject ?? p.subject} disabled={!editable} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} />
            </label>
            <DayField label={t("crmsOpenTill")} value={edit.openTill ?? dayOf(p.openTill)} onChange={(d) => setEdit({ ...edit, openTill: d })} disabled={!editable} optional />
            <label className={classes.field}>
              {t("crmsPlanDiscount")}
              <input
                inputMode="decimal"
                value={disc}
                disabled={!editable}
                onChange={(e) => setEdit({ ...edit, discountPercent: Math.min(100, Number(e.target.value.replace(/[^\d.]/g, "")) || 0) })}
              />
            </label>
          </div>
          <LineEditor lines={lines} onChange={(l) => setEdit({ ...edit, lines: l })} withTax readOnly={!editable} />
          <Totals lines={lines} discountPercent={disc} />
          <label className={classes.field}>
            {t("crmsTerms")}
            <textarea value={edit.terms ?? p.terms ?? ""} disabled={!editable} onChange={(e) => setEdit({ ...edit, terms: e.target.value })} rows={4} />
          </label>
          <label className={classes.field}>
            {t("crmsNoteInternal")}
            <textarea value={edit.note ?? p.note ?? ""} disabled={!editable} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />
          </label>
          {editable && (
            <div className={classes.actions}>
              <button type="button" className={classes.primary} disabled={!dirty || !!busy} onClick={save}>
                {t("crmsSave")}
              </button>
              <button type="button" className={classes.ghost} disabled={!dirty} onClick={() => setEdit({})}>
                {t("crmsDiscard")}
              </button>
            </div>
          )}
          {(p.status === "sent" || p.status === "declined") && editable && <p className={classes.muted}>{t("crmsEditMakesRevision")}</p>}
        </section>
      </div>
      <div className={s.stack}>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsPatient")}</h3>
          {editable && (edit.who !== undefined || !p.contact) ? (
            <ContactPicker value={edit.who || {}} onChange={(who) => setEdit({ ...edit, who })} />
          ) : (
            <p>
              {p.contact ? (
                <Link href={`${panel}/crm/contacts/${p.contact._id}`} className={crm.linkButton}>
                  {contactName(p.contact)}
                </Link>
              ) : (
                "—"
              )}
            </p>
          )}
          {editable && p.contact && edit.who === undefined && (
            <button type="button" className={crm.linkButton} onClick={() => setEdit({ ...edit, who: {} })}>
              {t("crmsChange")}
            </button>
          )}
          {p.credit?.enforced && (
            <p className={classes.muted}>
              {t("crmsCreditLine", [f.money(p.credit.balance), f.money(p.credit.limit)])}
            </p>
          )}
          {p.lead && (
            <Link href={`${panel}/crm/leads/${p.lead}`} className={crm.linkButton}>
              {t("crmsOpenLead")}
            </Link>
          )}
        </section>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsNextSteps")}</h3>
          {p.approval?.status && p.approval.status !== "none" && (
            <p className={classes.muted}>
              {t("crmsApproval")}: {t(`crmsApproval_${p.approval.status}`)}
            </p>
          )}
          {canWrite && !p.invoice && p.status !== "accepted" && (
            <div className={classes.actions}>
              <button type="button" className={classes.primary} disabled={!!busy || dirty || p.approval?.status === "pending" || !p.items.length} onClick={send}>
                {t(p.status === "draft" ? "crmsSendToPatient" : "crmsSendAgain")}
              </button>
              <button
                type="button"
                className={classes.ghost}
                disabled={p.approval?.status === "pending"}
                onClick={() => setPopup(DISCOUNT_POPUP, <CrmContext.Provider value={ctx}><DiscountRequest plan={id} onDone={() => mutate()} /></CrmContext.Provider>)}
              >
                {t("crmsAskDiscount")}
              </button>
            </div>
          )}
          {showLink && <CopyLink text={showLink} />}
          {canWrite && !p.invoice && (p.status === "sent" || p.status === "revised" || p.status === "draft") && (
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} disabled={!!busy || p.approval?.status === "pending"} onClick={() => decide("accepted")}>
                {t("crmsAcceptAtDesk")}
              </button>
              <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => decide("declined")}>
                {t("crmsDeclineAtDesk")}
              </button>
            </div>
          )}
          {p.status === "accepted" && (
            <p className={classes.muted}>
              {t("crmsAcceptedBy", [p.acceptedName || "—", f.date(p.decidedAt)])}
            </p>
          )}
          {p.signature && <img src={p.signature} alt={t("crmsSignature")} className={s.sig} />}
          {p.invoice ? (
            <p>
              <Link href={`${panel}/finance/invoices`} className={crm.linkButton}>
                {t("crmsInvoiceN", [f.money(p.invoiceInfo?.number), f.money(p.invoiceInfo?.total)])}
              </Link>
              {p.invoiceInfo?.status && <span className={classes.badge}>{t(`crmsInv_${p.invoiceInfo.status}`)}</span>}
            </p>
          ) : (
            canWrite &&
            p.status !== "declined" && (
              <div className={classes.actions}>
                <button type="button" className={classes.primary} disabled={!!busy || dirty || !p.contact || p.approval?.status === "pending"} onClick={() => invoice(false)}>
                  {t("crmsMakeInvoice")}
                </button>
                <button type="button" className={classes.ghost} disabled={!!busy || dirty || !p.contact || p.approval?.status === "pending"} onClick={() => invoice(true)}>
                  {t("crmsMakeInvoiceIssue")}
                </button>
              </div>
            )
          )}
          {canWrite && p.status === "declined" && !p.invoice && (
            <button type="button" className={crm.linkButton} onClick={() => decide("draft")}>
              {t("crmsBackToDraft")}
            </button>
          )}
        </section>
        {!!p.approvals?.length && (
          <section className={classes.card}>
            <h3 className={classes.cardTitle}>{t("crmsNavApprovals")}</h3>
            <ul className={s.history}>
              {p.approvals.map((a) => (
                <li key={a._id}>
                  <span>
                    {t(`crmsApKind_${a.kind}`)} · {t(approvalStatusKey[a.status])}
                  </span>
                  <span className={classes.muted}>{f.date(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {canWrite && (
          <button type="button" className={crm.linkDanger} onClick={remove} disabled={!!busy}>
            {t("crmsDeletePlan")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesPlan;
