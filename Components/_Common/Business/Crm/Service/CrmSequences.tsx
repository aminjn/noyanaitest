"use client";

import { useEffect, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { useBizFormat } from "../../bizShared";
import { CrmSegment, CrmTemplate, presetKey, useCrmTemplates } from "../crmShared";
import { useRouter } from "@/Components/i18n/navigation";
import { StarterBanner } from "./starters";
import { Badge, ConfirmButton, ContactField, listOf, phoneText, Ref, TeamOptions, useCall, useCrm, useCrmText, useGet, useWhen } from "./svc";

// «پیام‌های زنجیره‌ای» (2026-10), nexxacrm's crm/sequences: a few steps a
// patient walks after they are enrolled - an approved SMS template, a
// follow-up task for the team, a note - each so many days after the one
// before (Lib/business/crmService/sequence.ts).

type Channel = "sms" | "task" | "note";
type Step = { _id?: string; channel: Channel; waitDays: number; template?: string | null; text?: string | null; assignee?: string | null };
type Sequence = { _id: string; name: string; active: boolean; steps: Step[]; activeCount?: number; completed?: number; stopped?: number; createdAt: string };
type Enrollment = {
  _id: string;
  status: "active" | "completed" | "stopped";
  currentStep: number;
  nextRunAt?: string;
  createdAt: string;
  contact?: { _id: string; name?: string; phone: string } | null;
  log: { step: number; at: string; result: string; reason?: string }[];
};

const channelKey: Record<Channel, string> = { sms: "crmeChSms", task: "crmeChTask", note: "crmeChNote" };
const enrollKey: Record<Enrollment["status"], string> = { active: "crmeEnrActive", completed: "crmeEnrCompleted", stopped: "crmeEnrStopped" };
const resultKey: Record<string, string> = {
  sent: "crmeResSent",
  task: "crmeResTask",
  note: "crmeResNote",
  skipped: "crmeResSkipped",
  failed: "crmeResFailed",
  waiting: "crmeResWaiting",
};

const SequenceList = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const { panel, canWrite } = useCrm();
  const call = useCall();
  const router = useRouter();
  const { data, error, mutate } = useGet<Sequence[]>("/sequences", (d) => listOf<Sequence>(d));
  const [name, setName] = useState("");
  const create = async () => {
    const r = await call<Sequence>("POST", "/sequences", { name: name.trim() });
    if (r?._id) router.push(`${panel}/crm/sequences/${r._id}`);
  };
  return (
    <div className={s.stack}>
    <StarterBanner onSeeded={() => mutate()} />
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={s.hint}>{t("crmeSeqHint")}</p>
        {canWrite && (
          <div className={s.row}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("crmeSeqName")} maxLength={80} />
            <button type="button" className={classes.primary} disabled={name.trim().length < 2} onClick={create}>
              {t("crmeNewSeq")}
            </button>
          </div>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!data.length ? (
            <p className={classes.empty}>{t("crmeNoSeqs")}</p>
          ) : (
            <Table
              data={data}
              name="CrmSequences"
              renderer={{
                name: { name: t("crmName"), value: (q) => q.name, filter: "Text", component: (q) => <Link href={`${panel}/crm/sequences/${q._id}`}>{q.name}</Link> },
                steps: { name: t("crmeSteps"), value: (q) => q.steps.length, filter: "Number" },
                active: {
                  name: t("crmeStatus"),
                  value: (q) => t(q.active ? "crmeActive" : "crmInactive"),
                  filter: "Set",
                  component: (q) => <Badge tone={q.active ? "ok" : "muted"}>{t(q.active ? "crmeActive" : "crmInactive")}</Badge>,
                },
                enrolled: { name: t("crmeEnrActive"), value: (q) => q.activeCount || 0, filter: "Number", component: (q) => f.money(q.activeCount || 0) },
                completed: { name: t("crmeEnrCompleted"), value: (q) => q.completed || 0, filter: "Number", component: (q) => f.money(q.completed || 0) },
                actions: {
                  name: t("crmeActions"),
                  component: (q) =>
                    canWrite ? (
                      <ConfirmButton onConfirm={async () => (await call("DELETE", `/sequences/${q._id}`)) && mutate()}>{t("bizDelete")}</ConfirmButton>
                    ) : null,
                },
              }}
            />
          ))}
      </HandleLoading>
    </section>
    </div>
  );
};

const StepEditor = ({ step, templates, onChange, onRemove }: { step: Step; templates: CrmTemplate[]; onChange: (s: Step) => void; onRemove: () => void }) => {
  const t = useCrmText();
  const { canWrite } = useCrm();
  const tpl = templates.find((x) => x._id === step.template);
  return (
    <li className={s.step}>
      <div className={s.stepFields}>
        <label className={classes.field}>
          {t("crmeChannel")}
          <select value={step.channel} disabled={!canWrite} onChange={(e) => onChange({ ...step, channel: e.target.value as Channel })}>
            {(Object.keys(channelKey) as Channel[]).map((c) => (
              <option key={c} value={c}>
                {t(channelKey[c])}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          {t("crmeWaitDays")}
          <input type="number" min={0} max={365} dir="ltr" value={step.waitDays} disabled={!canWrite} onChange={(e) => onChange({ ...step, waitDays: Math.max(0, Number(e.target.value) || 0) })} />
        </label>
        {step.channel === "sms" ? (
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmTemplate")}
            <select value={step.template || ""} disabled={!canWrite} onChange={(e) => onChange({ ...step, template: e.target.value || null })}>
              <option value="">{t("crmNoTemplate")}</option>
              {templates.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name}
                  {x.status !== "Approved" ? ` (${t("crmAutoTplNotApproved")})` : ""}
                </option>
              ))}
            </select>
            {tpl && <span className={s.hint}>{tpl.text}</span>}
          </label>
        ) : (
          <>
            <label className={`${classes.field} ${s.wideField}`}>
              {t(step.channel === "task" ? "crmeTaskText" : "crmeNoteText")}
              <input value={step.text || ""} maxLength={500} disabled={!canWrite} onChange={(e) => onChange({ ...step, text: e.target.value })} placeholder={t("crmeVarsHint")} />
            </label>
            {step.channel === "task" && (
              <label className={classes.field}>
                {t("crmAssignee")}
                <select value={step.assignee || ""} disabled={!canWrite} onChange={(e) => onChange({ ...step, assignee: e.target.value || null })}>
                  <TeamOptions none="crmeOwnerDefault" />
                </select>
              </label>
            )}
          </>
        )}
      </div>
      {canWrite && (
        <div className={s.row}>
          <button type="button" className={crm.linkDanger} onClick={onRemove}>
            {t("crmeRemoveStep")}
          </button>
        </div>
      )}
    </li>
  );
};

const SequenceDetail = ({ id }: { id: string }) => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const { canWrite, canSend, panel } = useCrm();
  const { data: tplData } = useCrmTemplates();
  const templates = listOf<CrmTemplate>(tplData);
  const { data, error, mutate } = useGet<{ sequence: Sequence; enrollments: Enrollment[] } | null>(`/sequences/${id}`, (d) =>
    d && typeof d === "object" ? (d as { sequence: Sequence; enrollments: Enrollment[] }) : null,
  );
  const segs = useGet<{ presets: CrmSegment[]; saved: CrmSegment[] } | null>("/segments", (d) => (d && typeof d === "object" ? (d as never) : null));
  const [steps, setSteps] = useState<Step[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState<Ref>(null);
  const [segment, setSegment] = useState("");
  useEffect(() => {
    if (data?.sequence) {
      setSteps(listOf<Step>(data.sequence.steps));
      setName(data.sequence.name);
    }
  }, [data?.sequence]);
  const seq = data?.sequence;
  const save = async () => {
    if (await call("PATCH", `/sequences/${id}`, { name, steps })) mutate();
  };
  const toggle = async () => {
    if (seq && (await call("POST", `/sequences/${id}/toggle`, { active: !seq.active }))) mutate();
  };
  const enroll = async (payload: Record<string, unknown>) => {
    const r = await call<{ enrolled: number; skipped: number }>("POST", `/sequences/${id}/enroll`, payload, false);
    if (r) {
      setContact(null);
      setSegment("");
      mutate();
    }
    return r;
  };
  const [enrolled, setEnrolled] = useState<{ enrolled: number; skipped: number } | null>(null);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!seq && (
        <div className={s.stack}>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <div className={s.row}>
                <Link href={`${panel}/crm/sequences`} className={crm.linkButton}>
                  {t("back")}
                </Link>
                <input value={name} disabled={!canWrite} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label={t("crmeSeqName")} />
                <Badge tone={seq.active ? "ok" : "muted"}>{t(seq.active ? "crmeActive" : "crmInactive")}</Badge>
              </div>
              <div className={s.row}>
                {canSend && (
                  <button type="button" className={classes.ghost} onClick={toggle}>
                    {t(seq.active ? "crmeTurnOff" : "crmeTurnOn")}
                  </button>
                )}
                {canWrite && (
                  <button type="button" className={classes.primary} onClick={save}>
                    {t("bizSave")}
                  </button>
                )}
              </div>
            </div>
            <p className={s.hint}>{t("crmeSeqRules")}</p>
            <ol className={s.steps}>
              {steps.map((st, i) => (
                <StepEditor
                  key={st._id || `n${i}`}
                  step={st}
                  templates={templates}
                  onChange={(n) => setSteps((x) => x.map((y, j) => (j === i ? n : y)))}
                  onRemove={() => setSteps((x) => x.filter((_, j) => j !== i))}
                />
              ))}
            </ol>
            {canWrite && steps.length < 20 && (
              <div className={s.row}>
                <button type="button" className={classes.ghost} onClick={() => setSteps((x) => [...x, { channel: "sms", waitDays: x.length ? 2 : 0 }])}>
                  {t("crmeAddStep")}
                </button>
              </div>
            )}
          </section>
          {canWrite && (
            <section className={classes.card}>
              <h2 className={classes.cardTitle}>{t("crmeEnroll")}</h2>
              <div className={s.grid2}>
                <div className={s.stack}>
                  <ContactField value={contact} onChange={setContact} />
                  <button
                    type="button"
                    className={classes.primary}
                    disabled={!contact}
                    onClick={async () => setEnrolled((await enroll({ contacts: [contact!._id] })) || null)}
                  >
                    {t("crmeEnrollOne")}
                  </button>
                </div>
                <div className={s.stack}>
                  <label className={classes.field}>
                    {t("crmeEnrollSegment")}
                    <select value={segment} onChange={(e) => setSegment(e.target.value)}>
                      <option value="">—</option>
                      {listOf<CrmSegment>(segs.data?.presets).map((p) => (
                        <option key={p._id} value={p._id}>
                          {t(presetKey[p.preset || ""] || p.preset || "")} ({p.count})
                        </option>
                      ))}
                      {listOf<CrmSegment>(segs.data?.saved).map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.count})
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className={classes.ghost} disabled={!segment} onClick={async () => setEnrolled((await enroll({ segment })) || null)}>
                    {t("crmeEnrollAll")}
                  </button>
                </div>
              </div>
              {enrolled && <p className={s.hint}>{t("crmeEnrolledN", [String(enrolled.enrolled), String(enrolled.skipped)])}</p>}
            </section>
          )}
          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{t("crmeEnrollments")}</h2>
            <Table
              data={listOf<Enrollment>(data?.enrollments)}
              name="CrmSequenceEnrollments"
              renderer={{
                contact: { name: t("crmName"), value: (e) => e.contact?.name || "", filter: "Text" },
                phone: { name: t("crmPhone"), value: (e) => e.contact?.phone || "", component: (e) => <bdi dir="ltr">{phoneText(e.contact?.phone || "")}</bdi> },
                status: { name: t("crmeStatus"), value: (e) => t(enrollKey[e.status]), filter: "Set", component: (e) => <Badge tone={e.status === "active" ? "ok" : "muted"}>{t(enrollKey[e.status])}</Badge> },
                step: { name: t("crmeAtStep"), value: (e) => Math.min(e.currentStep + 1, seq.steps.length) },
                next: { name: t("crmeNextRun"), value: (e) => (e.status === "active" && e.nextRunAt ? new Date(e.nextRunAt) : ""), component: (e) => (e.status === "active" ? w.at(e.nextRunAt) : "—") },
                last: {
                  name: t("crmeLastResult"),
                  value: (e) => {
                    const l = e.log?.[e.log.length - 1];
                    return l ? t(resultKey[l.result] || l.result) : "";
                  },
                },
                actions: {
                  name: t("crmeActions"),
                  component: (e) =>
                    canWrite && e.status === "active" ? (
                      <ConfirmButton onConfirm={async () => (await call("POST", `/enrollments/${e._id}/stop`)) && mutate()}>{t("crmeStop")}</ConfirmButton>
                    ) : null,
                },
              }}
            />
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

const CrmSequences = ({ id }: { id?: string }) => (id ? <SequenceDetail id={id} /> : <SequenceList />);

export default CrmSequences;
