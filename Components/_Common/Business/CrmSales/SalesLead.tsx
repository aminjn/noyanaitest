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
import { asArray, useBizFormat } from "../bizShared";
import { CrmContext, phoneText, useCrm, usePercent } from "../Crm/crmShared";
import { NewFollowUp } from "../Crm/CrmContactProfile";
import { CustomField, dayOf, Lead, LeadSource, leadKindKey, useProfile, leadStatusKey, Line, MiniContact, Pipeline, planStatusKey, PlanStatus, useAction, useNames, useSalesMeta, useSalesText } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload, CustomFieldInputs, DoctorReferrerFields, LineEditor, Totals, DayField } from "./SalesWidgets";
import { Call, CALL_POPUP, CallForm } from "./SalesCallForm";

const LOST_POPUP = "CrmsLost";
const FU_POPUP = "CrmContactFollowUp";

type LeadFile = {
  lead: Lead;
  contact: (MiniContact & { visits?: number; spent?: number }) | null;
  plan: { _id: string; number: number; subject: string; status: PlanStatus; total: number; invoice?: string } | null;
  calls: Call[];
  activities: { _id: string; kind: string; text: string; createdAt: string; dueAt?: string; doneAt?: string }[];
  activityCount: number;
  pipeline: Pipeline | null;
};

// lost needs a reason (Nexxa markLost); the owner's standard reasons first
const LostForm = ({ reasons, onPick }: { reasons: string[]; onPick: (r: string) => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const [r, setR] = useState(reasons[0] || "");
  const [other, setOther] = useState("");
  return (
    <PopupCard title={t("crmsMarkLost")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsLostReason")}
          <select value={r} onChange={(e) => setR(e.target.value)}>
            {reasons.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
            <option value="">{t("crmsOtherReason")}</option>
          </select>
        </label>
        {!r && (
          <label className={classes.field}>
            {t("crmsOtherReason")}
            <input value={other} onChange={(e) => setOther(e.target.value)} />
          </label>
        )}
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.danger}
            disabled={!(r || other.trim())}
            onClick={() => {
              closePopup(LOST_POPUP);
              onPick(r || other.trim());
            }}
          >
            {t("crmsMarkLost")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// One treatment inquiry (Nexxa crm/lead/[id]): its patient, stage, value
// from its items, owner, custom fields, calls and the patient's notes,
// and the way out: accepted (won), lost with a reason, or a treatment plan.
const SalesLead = ({ id }: { id: string }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const pct = usePercent();
  const names = useNames();
  const router = useRouter();
  const ctx = useCrm();
  const { api, panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { data: meta } = useSalesMeta();
  const { run, busy } = useAction();
  const pf = useProfile();
  const { data, error, mutate } = useSWR<LeadFile>(`${API}${api}/leads/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as LeadFile));
  const lead = data?.lead;
  const [edit, setEdit] = useState<Partial<Lead> & { lines?: Line[]; who?: ContactChoice; cf?: Record<string, string>; ref?: { id?: string; name?: string } }>({});
  useEffect(() => setEdit({}), [lead?._id, lead?.updatedAt]);
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  if (!data || !lead)
    return (
      <HandleLoading data={!!data} error={error}>
        <></>
      </HandleLoading>
    );
  const pipe = data.pipeline;
  const stage = pipe?.stages.find((x) => x._id === lead.stage);
  const v = <K extends keyof Lead>(k: K) => (edit[k] !== undefined ? edit[k] : lead[k]) as Lead[K];
  const lines = edit.lines ?? lead.items;
  const dirty = Object.keys(edit).length > 0;
  const leadFields = asArray<CustomField>(meta?.customFields).filter((x) => x.entity === "lead");
  const save = async () => {
    const payload: Record<string, unknown> = {};
    for (const k of ["title", "kind", "probability", "priority", "note", "source", "assignee", "stage"] as const) if (edit[k] !== undefined) payload[k] = edit[k] === "" ? null : edit[k];
    if (edit.expectedClose !== undefined) payload.expectedClose = edit.expectedClose || null;
    if (edit.lines) payload.items = edit.lines.filter((l) => l.title.trim());
    if (edit.who) Object.assign(payload, contactPayload(edit.who));
    if (edit.cf) payload.customFields = edit.cf;
    if (edit.doctor !== undefined) payload.doctor = edit.doctor;
    if (edit.ref) Object.assign(payload, edit.ref.id ? { referrer: edit.ref.id } : { referrer: null, referrerName: edit.ref.name || "" });
    if (await run("PATCH", `/leads/${id}`, payload)) mutate();
  };
  const setStatus = async (status: Lead["status"], reason?: string) => {
    if (await run("POST", `/leads/${id}/status`, { status, reason })) mutate();
  };
  const toPlan = async () => {
    const r = await run<{ _id: string }>("POST", `/leads/${id}/plan`, {});
    if (r?._id) router.push(`${panel}/crm/plans/${r._id}`);
  };
  const remove = async () => {
    if (!window.confirm(t("crmsConfirmDelete"))) return;
    if (await run("DELETE", `/leads/${id}`)) router.push(`${panel}/crm/pipeline`);
  };
  const contact = data.contact;
  return (
    <div className={s.twoCol}>
      <div className={s.stack}>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h2 className={classes.cardTitle}>{lead.title}</h2>
            <span className={classes.badge}>{t(leadStatusKey[lead.status])}</span>
          </div>
          <div className={s.formGrid}>
            <label className={classes.field}>
              {t("crmsLeadTitle")}
              <input value={v("title")} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </label>
            <label className={classes.field}>
              {t("crmsKind")}
              <select value={v("kind")} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, kind: e.target.value as Lead["kind"] })}>
                {pf.kinds.map((k) => (
                  <option key={k} value={k}>
                    {t(leadKindKey(k))}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              {t("crmsStage")}
              <select value={v("stage")} disabled={!canWrite || lead.status !== "open"} onChange={(e) => setEdit({ ...edit, stage: e.target.value })}>
                {pipe?.stages.map((x) => (
                  <option key={x._id} value={x._id}>
                    {names.stage(x)}
                  </option>
                ))}
              </select>
            </label>
            <DoctorReferrerFields
              meta={meta}
              department={pipe?.department?.id}
              doctor={edit.doctor !== undefined ? edit.doctor : lead.doctor}
              onDoctor={(d) => setEdit({ ...edit, doctor: d })}
              referrer={edit.ref ?? { id: lead.referrer, name: lead.referrerName }}
              onReferrer={(ref) => setEdit({ ...edit, ref })}
              disabled={!canWrite}
            />
            <label className={classes.field}>
              {t("crmsProbability")}
              <input inputMode="numeric" value={v("probability")} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, probability: Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0) })} />
            </label>
            <label className={classes.field}>
              {t("crmsPriority")}
              <select value={v("priority")} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, priority: Number(e.target.value) })}>
                {[0, 1, 2, 3].map((p) => (
                  <option key={p} value={p}>
                    {t(`crmsPriority_${p}`)}
                  </option>
                ))}
              </select>
            </label>
            <DayField label={t("crmsExpectedClose")} value={dayOf(v("expectedClose"))} onChange={(d) => setEdit({ ...edit, expectedClose: d })} disabled={!canWrite} optional />
            <label className={classes.field}>
              {t("crmsSource")}
              <select value={v("source") || ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, source: e.target.value })}>
                <option value="">{lead.sourceName && !lead.source ? lead.sourceName : "—"}</option>
                {meta?.sources.map((x) => (
                  <option key={x._id} value={x._id}>
                    {names.source(x)}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              {t("crmsAssignee")}
              <select value={v("assignee") || ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, assignee: e.target.value })}>
                <option value="">{t("crmsUnassigned")}</option>
                {meta?.staff.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={classes.field}>
            {t("crmsNote")}
            <textarea value={v("note") || ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />
          </label>
          {stage && (stage.requiredFields.length > 0 || stage.requireActivity) && <p className={classes.muted}>{t("crmsStageNeeds")}</p>}
        </section>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsItems")}</h3>
          <LineEditor lines={lines} onChange={(l) => setEdit({ ...edit, lines: l })} readOnly={!canWrite} />
          <Totals lines={lines} />
        </section>
        {leadFields.length > 0 && (
          <section className={classes.card}>
            <h3 className={classes.cardTitle}>{t("crmsMoreInfo")}</h3>
            <CustomFieldInputs defs={leadFields} values={edit.cf ?? lead.customFields ?? {}} onChange={(cf) => setEdit({ ...edit, cf })} />
          </section>
        )}
        {canWrite && (
          <div className={classes.actions}>
            <button type="button" className={classes.primary} disabled={!dirty || !!busy} onClick={save}>
              {t("crmsSave")}
            </button>
            <button type="button" className={classes.ghost} disabled={!dirty} onClick={() => setEdit({})}>
              {t("crmsDiscard")}
            </button>
          </div>
        )}
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h3 className={classes.cardTitle}>{t("crmsCalls")}</h3>
            {canWrite && contact && (
              <button type="button" className={classes.ghost} onClick={() => setPopup(CALL_POPUP, withCtx(<CallForm meta={meta} contact={contact} lead={id} onDone={() => mutate()} />))}>
                {t("crmsNewCall")}
              </button>
            )}
          </div>
          {data.calls.length === 0 ? (
            <p className={classes.muted}>{t("crmsNoCalls")}</p>
          ) : (
            <ul className={s.history}>
              {data.calls.map((c) => (
                <li key={c._id}>
                  <span>
                    {t(c.direction === "inbound" ? "crmsInbound" : "crmsOutbound")} · {t(`crmsCall_${c.status}`)}
                    {c.summary ? ` · ${c.summary}` : ""}
                  </span>
                  <span className={classes.muted}>{f.date(c.startedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className={s.stack}>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsPatient")}</h3>
          {edit.who !== undefined || !contact ? (
            <ContactPicker value={edit.who || {}} onChange={(who) => setEdit({ ...edit, who })} />
          ) : (
            <dl className={s.kv}>
              <dt>{t("crmsPatientName")}</dt>
              <dd>
                <Link href={`${panel}/crm/contacts/${contact._id}`} className={crm.linkButton}>
                  {contact.name || "—"}
                </Link>
              </dd>
              <dt>{t("crmsMobile")}</dt>
              <dd>
                <bdi dir="ltr">{phoneText(contact.phone || "")}</bdi>
              </dd>
              <dt>{t("crmsVisits")}</dt>
              <dd>{f.money(contact.visits)}</dd>
            </dl>
          )}
          {canWrite && contact && edit.who === undefined && (
            <button type="button" className={crm.linkButton} onClick={() => setEdit({ ...edit, who: {} })}>
              {t("crmsChange")}
            </button>
          )}
        </section>
        <section className={classes.card}>
          <dl className={s.kv}>
            <dt>{t("crmsValue")}</dt>
            <dd>{f.money(lead.value)}</dd>
            <dt>{t("crmsProbability")}</dt>
            <dd>{pct(lead.probability, 100)}</dd>
            <dt>{t("crmsScore")}</dt>
            <dd>{f.money(lead.ruleScore)}</dd>
            {lead.lostReason && (
              <>
                <dt>{t("crmsLostReason")}</dt>
                <dd>{lead.lostReason}</dd>
              </>
            )}
            {lead.closedAt && (
              <>
                <dt>{t("crmsClosedAt")}</dt>
                <dd>{f.date(lead.closedAt)}</dd>
              </>
            )}
          </dl>
          {canWrite && (
            <div className={classes.actions}>
              {lead.status === "open" ? (
                <>
                  <button type="button" className={classes.primary} disabled={!!busy} onClick={() => setStatus("won")}>
                    {t("crmsMarkWon")}
                  </button>
                  <button
                    type="button"
                    className={classes.danger}
                    disabled={!!busy}
                    onClick={() => setPopup(LOST_POPUP, <LostForm reasons={asArray<LeadSource>(meta?.lossReasons).filter((x) => x.active).map((x) => names.source(x))} onPick={(r) => setStatus("lost", r)} />)}
                  >
                    {t("crmsMarkLost")}
                  </button>
                </>
              ) : (
                <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => setStatus("open")}>
                  {t("crmsReopen")}
                </button>
              )}
            </div>
          )}
        </section>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsPlan")}</h3>
          {data.plan ? (
            <Link href={`${panel}/crm/plans/${data.plan._id}`} className={crm.linkButton}>
              {t("crmsPlanN", [f.money(data.plan.number)])} · {t(planStatusKey[data.plan.status])} · {f.money(data.plan.total)}
            </Link>
          ) : (
            <>
              <p className={classes.muted}>{t("crmsNoPlanYet")}</p>
              {canWrite && (
                <button type="button" className={classes.primary} disabled={!!busy || !contact} onClick={toPlan}>
                  {t("crmsMakePlan")}
                </button>
              )}
            </>
          )}
        </section>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h3 className={classes.cardTitle}>{t("crmsActivity")}</h3>
            {canWrite && contact && (
              <button type="button" className={classes.ghost} onClick={() => setPopup(FU_POPUP, withCtx(<NewFollowUp contactId={contact._id} onDone={() => mutate()} />))}>
                {t("crmNewFollowUp")}
              </button>
            )}
          </div>
          <ul className={s.history}>
            {data.activities.slice(0, 12).map((a) => (
              <li key={a._id}>
                <span>{a.text}</span>
                <span className={classes.muted}>{f.date(a.dueAt || a.createdAt)}</span>
              </li>
            ))}
            {(lead.history || [])
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={`h${i}`}>
                  <span>
                    {t(`crmsHist_${h.kind}`)}: {h.kind === "status" ? t(leadStatusKey[(h.text.split(":")[0] as Lead["status"]) || "open"] || h.text) + (h.text.includes(":") ? ` (${h.text.split(":").slice(1).join(":").trim()})` : "") : h.text}
                  </span>
                  <span className={classes.muted}>{f.date(h.at)}</span>
                </li>
              ))}
          </ul>
        </section>
        {canWrite && (
          <button type="button" className={crm.linkDanger} onClick={remove}>
            {t("crmsDeleteLead")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesLead;
