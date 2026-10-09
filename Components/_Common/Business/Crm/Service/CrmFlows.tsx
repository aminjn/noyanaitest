"use client";

import { useEffect, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { automationKey, CrmAutomation, CrmTemplate, useCrmTemplates } from "../crmShared";
import { useRouter } from "@/Components/i18n/navigation";
import { Badge, ConfirmButton, ContactField, listOf, Ref, TeamOptions, useCall, useCrm, useCrmText, useGet, useWhen } from "./svc";
import { TIERS, tierKey } from "./CrmClub";
import { StarterBanner } from "./starters";
import { FLOW_TRIGGERS, isProfile } from "./profiles";

// «گردش‌کارهای خودکار» (2026-10), nexxacrm's automation engine: a trigger
// (a visit done or missed, a new patient, a ticket, an invoice, a reward
// taken...), the patients it is for, then steps in order - a condition
// (no = stop), a delay, an approval in a team member's inbox, and actions
// (an SMS template, a follow-up, a task, a note, a tag, a notice, a
// sequence, club points). Every run is logged step by step. The six
// ready-made journeys (recall, thanks, birthday...) keep running from
// «خودکارسازی‌ها» and are listed here too.

export const TRIGGERS = [
  "visit.completed",
  "visit.noShow",
  "visit.cancelled",
  "contact.created",
  "ticket.created",
  "ticket.resolved",
  "invoice.issued",
  "club.redeemed",
  "sequence.completed",
  "return.created",
  "order.paid",
  "result.ready",
] as const;
type Trigger = (typeof TRIGGERS)[number];
// the triggers this profile has, in the list's order (profiles.ts)
const useTriggers = () => {
  const { node } = useCrm();
  const own = FLOW_TRIGGERS[isProfile(node) ? node : "clinic"];
  return TRIGGERS.filter((k) => own.includes(k));
};
const FIELDS = ["tags", "visits", "orders", "spent", "noShows", "gender", "insurer", "city", "source", "tier", "age"] as const;
const OPS = ["eq", "neq", "contains", "in", "gt", "lt", "empty", "notempty"] as const;
const ACTIONS = ["sendSms", "followUp", "task", "note", "addTag", "removeTag", "notify", "enrollSequence", "clubPoints"] as const;
type Action = (typeof ACTIONS)[number];
type Cond = { field: (typeof FIELDS)[number]; op: (typeof OPS)[number]; value?: string | null };
type FStep = {
  _id?: string;
  kind: "condition" | "delay" | "approval" | "action";
  conditions?: Cond[];
  days?: number;
  hours?: number;
  approver?: string | null;
  title?: string | null;
  onReject?: "stop" | "continue";
  action?: Action;
  template?: string | null;
  text?: string | null;
  tag?: string | null;
  dueDays?: number;
  assignee?: string | null;
  sequence?: string | null;
  project?: string | null;
  points?: number;
};
type Flow = { _id: string; name: string; trigger: Trigger; active: boolean; filters: Cond[]; steps: FStep[]; runCount?: number; lastRunAt?: string; runs?: Record<string, number> };
type Run = {
  _id: string;
  status: "running" | "waitingDelay" | "waitingApproval" | "done" | "failed" | "cancelled";
  trigger: string;
  step: number;
  resumeAt?: string;
  createdAt: string;
  contact?: { _id: string; name?: string; phone: string } | null;
  log: { step: number; kind: string; result: string; note?: string; at: string }[];
};

export const triggerKey = (k: string) => `crmeTr_${k.replace(".", "_")}`;
const fieldKey = (k: string) => `crmeFld_${k}`;
const opKey = (k: string) => `crmeOp_${k}`;
const actionKey = (k: string) => `crmeAct_${k}`;
const stepKindKey = { condition: "crmeStepCondition", delay: "crmeStepDelay", approval: "crmeStepApproval", action: "crmeStepAction" } as const;
const runKey: Record<Run["status"], string> = {
  running: "crmeRunRunning",
  waitingDelay: "crmeRunDelay",
  waitingApproval: "crmeRunApproval",
  done: "crmeRunDone",
  failed: "crmeRunFailed",
  cancelled: "crmeRunCancelled",
};
const runTone = (st: Run["status"]) => (st === "done" ? "ok" : st === "failed" ? "bad" : st === "cancelled" ? "muted" : "warn");
const logKey: Record<string, string> = {
  ok: "crmeLogOk",
  yes: "crmeLogYes",
  no: "crmeLogNo",
  waiting: "crmeLogWaiting",
  approved: "crmeLogApproved",
  rejected: "crmeLogRejected",
  skipped: "crmeLogSkipped",
  failed: "crmeLogFailed",
};

// why a step waited or was skipped (Lib/business/crmService/flow.ts)
const NOTE_CODES = ["window", "noCredit", "template", "optedOut", "contact", "project", "tag", "user", "sequence", "enrolled", "points", "approver", "gateway", "action"];

// ready-made workflows to start from (nexxacrm automation-templates.ts,
// made for a clinic); their texts are in the reader's language
const useRecipes = () => {
  const t = useCrmText();
  return [
    {
      key: "welcome",
      title: "crmeRcpWelcome",
      flow: () => ({
        name: t("crmeRcpWelcome"),
        trigger: "contact.created" as Trigger,
        filters: [],
        steps: [
          { kind: "action", action: "addTag", tag: t("crmeRcpTagNew") },
          { kind: "action", action: "followUp", text: t("crmeRcpWelcomeCall"), dueDays: 1 },
        ] as FStep[],
      }),
    },
    {
      key: "postVisit",
      title: "crmeRcpPostVisit",
      flow: () => ({
        name: t("crmeRcpPostVisit"),
        trigger: "visit.completed" as Trigger,
        filters: [],
        steps: [{ kind: "delay", days: 3 }, { kind: "action", action: "followUp", text: t("crmeRcpPostVisitCall"), dueDays: 0 }] as FStep[],
      }),
    },
    {
      key: "noShow",
      title: "crmeRcpNoShow",
      flow: () => ({
        name: t("crmeRcpNoShow"),
        trigger: "visit.noShow" as Trigger,
        filters: [],
        steps: [
          { kind: "action", action: "addTag", tag: t("crmeRcpTagNoShow") },
          { kind: "action", action: "followUp", text: t("crmeRcpNoShowCall"), dueDays: 0 },
        ] as FStep[],
      }),
    },
    {
      key: "complaint",
      title: "crmeRcpComplaint",
      flow: () => ({
        name: t("crmeRcpComplaint"),
        trigger: "ticket.created" as Trigger,
        filters: [],
        steps: [{ kind: "action", action: "notify", text: t("crmeRcpComplaintNotice") }] as FStep[],
      }),
    },
    {
      key: "loyal",
      title: "crmeRcpLoyal",
      flow: () => ({
        name: t("crmeRcpLoyal"),
        trigger: "visit.completed" as Trigger,
        filters: [{ field: "visits", op: "gt", value: "4" }] as Cond[],
        steps: [
          { kind: "approval", title: t("crmeRcpLoyalApprove"), onReject: "stop" },
          { kind: "action", action: "clubPoints", points: 50 },
          { kind: "action", action: "addTag", tag: t("crmeRcpTagLoyal") },
        ] as FStep[],
      }),
    },
  ];
};

const CondEditor = ({ conds, onChange }: { conds: Cond[]; onChange: (c: Cond[]) => void }) => {
  const t = useCrmText();
  const { canWrite } = useCrm();
  return (
    <div className={s.stack}>
      {conds.map((c, i) => (
        <div key={i} className={s.condRow}>
          <select value={c.field} disabled={!canWrite} onChange={(e) => onChange(conds.map((x, j) => (j === i ? { ...x, field: e.target.value as Cond["field"] } : x)))} aria-label={t("crmeField")}>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {t(fieldKey(f))}
              </option>
            ))}
          </select>
          <select value={c.op} disabled={!canWrite} onChange={(e) => onChange(conds.map((x, j) => (j === i ? { ...x, op: e.target.value as Cond["op"] } : x)))} aria-label={t("crmeOperator")}>
            {OPS.map((o) => (
              <option key={o} value={o}>
                {t(opKey(o))}
              </option>
            ))}
          </select>
          {c.op === "empty" || c.op === "notempty" ? (
            <span />
          ) : c.field === "tier" ? (
            <select value={c.value || ""} disabled={!canWrite} onChange={(e) => onChange(conds.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} aria-label={t("crmeValue")}>
              <option value="">—</option>
              {TIERS.map((k) => (
                <option key={k} value={k}>
                  {t(tierKey[k])}
                </option>
              ))}
            </select>
          ) : (
            <input value={c.value || ""} disabled={!canWrite} maxLength={200} onChange={(e) => onChange(conds.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder={t(c.op === "in" ? "crmeValueList" : "crmeValue")} />
          )}
          {canWrite && (
            <button type="button" className={crm.linkDanger} onClick={() => onChange(conds.filter((_, j) => j !== i))} aria-label={t("bizDelete")}>
              ×
            </button>
          )}
        </div>
      ))}
      {canWrite && conds.length < 10 && (
        <button type="button" className={crm.linkButton} onClick={() => onChange([...conds, { field: "tags", op: "contains", value: "" }])}>
          {t("crmeAddCondition")}
        </button>
      )}
    </div>
  );
};

const StepFields = ({ step, onChange, templates, sequences, projects }: { step: FStep; onChange: (s: FStep) => void; templates: CrmTemplate[]; sequences: { _id: string; name: string }[]; projects: { _id: string; name: string }[] }) => {
  const t = useCrmText();
  const { canWrite } = useCrm();
  const set = (patch: Partial<FStep>) => onChange({ ...step, ...patch });
  if (step.kind === "condition") return <CondEditor conds={step.conditions || []} onChange={(conditions) => set({ conditions })} />;
  if (step.kind === "delay")
    return (
      <div className={s.stepFields}>
        <label className={classes.field}>
          {t("crmeDays")}
          <input type="number" min={0} max={365} dir="ltr" disabled={!canWrite} value={step.days || 0} onChange={(e) => set({ days: Number(e.target.value) || 0 })} />
        </label>
        <label className={classes.field}>
          {t("crmeHoursN")}
          <input type="number" min={0} max={23} dir="ltr" disabled={!canWrite} value={step.hours || 0} onChange={(e) => set({ hours: Number(e.target.value) || 0 })} />
        </label>
      </div>
    );
  if (step.kind === "approval")
    return (
      <div className={s.stepFields}>
        <label className={`${classes.field} ${s.wideField}`}>
          {t("crmeApprovalTitle")}
          <input value={step.title || ""} disabled={!canWrite} maxLength={200} onChange={(e) => set({ title: e.target.value })} placeholder={t("crmeVarsHint")} />
        </label>
        <label className={classes.field}>
          {t("crmeApprover")}
          <select value={step.approver || ""} disabled={!canWrite} onChange={(e) => set({ approver: e.target.value || null })}>
            <TeamOptions none="crmeOwnerDefault" />
          </select>
        </label>
        <label className={classes.field}>
          {t("crmeOnReject")}
          <select value={step.onReject || "stop"} disabled={!canWrite} onChange={(e) => set({ onReject: e.target.value as "stop" | "continue" })}>
            <option value="stop">{t("crmeRejectStop")}</option>
            <option value="continue">{t("crmeRejectContinue")}</option>
          </select>
        </label>
      </div>
    );
  const a = step.action || "followUp";
  return (
    <div className={s.stepFields}>
      <label className={classes.field}>
        {t("crmeAction")}
        <select value={a} disabled={!canWrite} onChange={(e) => set({ action: e.target.value as Action })}>
          {ACTIONS.map((x) => (
            <option key={x} value={x}>
              {t(actionKey(x))}
            </option>
          ))}
        </select>
      </label>
      {a === "sendSms" && (
        <label className={`${classes.field} ${s.wideField}`}>
          {t("crmTemplate")}
          <select value={step.template || ""} disabled={!canWrite} onChange={(e) => set({ template: e.target.value || null })}>
            <option value="">{t("crmNoTemplate")}</option>
            {templates.map((x) => (
              <option key={x._id} value={x._id}>
                {x.name}
                {x.status !== "Approved" ? ` (${t("crmAutoTplNotApproved")})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {(a === "followUp" || a === "task" || a === "note" || a === "notify") && (
        <label className={`${classes.field} ${s.wideField}`}>
          {t("crmeText")}
          <input value={step.text || ""} disabled={!canWrite} maxLength={500} onChange={(e) => set({ text: e.target.value })} placeholder={t("crmeVarsHint")} />
        </label>
      )}
      {(a === "followUp" || a === "task") && (
        <label className={classes.field}>
          {t("crmeDueInDays")}
          <input type="number" min={0} max={365} dir="ltr" disabled={!canWrite} value={step.dueDays || 0} onChange={(e) => set({ dueDays: Number(e.target.value) || 0 })} />
        </label>
      )}
      {(a === "followUp" || a === "task" || a === "notify") && (
        <label className={classes.field}>
          {t("crmAssignee")}
          <select value={step.assignee || ""} disabled={!canWrite} onChange={(e) => set({ assignee: e.target.value || null })}>
            <TeamOptions none="crmeOwnerDefault" />
          </select>
        </label>
      )}
      {a === "task" && (
        <label className={classes.field}>
          {t("crmeBoardName")}
          <select value={step.project || ""} disabled={!canWrite} onChange={(e) => set({ project: e.target.value || null })}>
            <option value="">{t("crmeFirstBoard")}</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {(a === "addTag" || a === "removeTag") && (
        <label className={classes.field}>
          {t("crmeTag")}
          <input value={step.tag || ""} disabled={!canWrite} maxLength={40} onChange={(e) => set({ tag: e.target.value })} />
        </label>
      )}
      {a === "enrollSequence" && (
        <label className={classes.field}>
          {t("crmeSequence")}
          <select value={step.sequence || ""} disabled={!canWrite} onChange={(e) => set({ sequence: e.target.value || null })}>
            <option value="">—</option>
            {sequences.map((x) => (
              <option key={x._id} value={x._id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {a === "clubPoints" && (
        <label className={classes.field}>
          {t("crmePointsField")}
          <input type="number" dir="ltr" disabled={!canWrite} value={step.points || 0} onChange={(e) => set({ points: Number(e.target.value) || 0 })} />
        </label>
      )}
    </div>
  );
};

const FlowEditor = ({ id }: { id: string }) => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const router = useRouter();
  const { canWrite, canSend, panel } = useCrm();
  const { data: tplData } = useCrmTemplates();
  const seqs = useGet<{ _id: string; name: string }[]>("/sequences", (d) => listOf<{ _id: string; name: string }>(d));
  const projects = useGet<{ _id: string; name: string }[]>("/projects?status=active", (d) => listOf<{ _id: string; name: string }>(d));
  const { data, error, mutate } = useGet<{ flow: Flow; runs: Run[] } | null>(`/flows/${id}`, (d) => (d && typeof d === "object" ? (d as never) : null));
  const triggers = useTriggers();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<Trigger>(triggers[0] || "contact.created");
  const [filters, setFilters] = useState<Cond[]>([]);
  const [steps, setSteps] = useState<FStep[]>([]);
  const [contact, setContact] = useState<Ref>(null);
  const [open, setOpen] = useState<string>("");
  useEffect(() => {
    if (data?.flow) {
      setName(data.flow.name);
      setTrigger(data.flow.trigger);
      setFilters(listOf<Cond>(data.flow.filters));
      setSteps(listOf<FStep>(data.flow.steps));
    }
  }, [data?.flow]);
  const flow = data?.flow;
  const save = async () => (await call("PATCH", `/flows/${id}`, { name, trigger, filters, steps })) && mutate();
  const addStep = (kind: FStep["kind"]) =>
    setSteps((x) => [...x, kind === "condition" ? { kind, conditions: [{ field: "tags", op: "contains", value: "" }] } : kind === "delay" ? { kind, days: 1, hours: 0 } : kind === "approval" ? { kind, onReject: "stop" } : { kind, action: "followUp" }]);
  const move = (i: number, d: number) =>
    setSteps((x) => {
      const j = i + d;
      if (j < 0 || j >= x.length) return x;
      const n = [...x];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  return (
    <HandleLoading data={!!data} error={error}>
      {!!flow && (
        <div className={s.stack}>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <div className={s.row}>
                <Link href={`${panel}/crm/flows`} className={crm.linkButton}>
                  {t("back")}
                </Link>
                <input value={name} disabled={!canWrite} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label={t("crmeFlowName")} />
                <Badge tone={flow.active ? "ok" : "muted"}>{t(flow.active ? "crmeActive" : "crmInactive")}</Badge>
              </div>
              <div className={s.row}>
                {canSend && (
                  <button type="button" className={classes.ghost} onClick={async () => (await call("POST", `/flows/${id}/toggle`, { active: !flow.active })) && mutate()}>
                    {t(flow.active ? "crmeTurnOff" : "crmeTurnOn")}
                  </button>
                )}
                {canWrite && (
                  <>
                    <button type="button" className={classes.primary} onClick={save}>
                      {t("bizSave")}
                    </button>
                    <ConfirmButton onConfirm={async () => (await call("DELETE", `/flows/${id}`)) && router.push(`${panel}/crm/flows`)}>{t("bizDelete")}</ConfirmButton>
                  </>
                )}
              </div>
            </div>
            <div className={s.stepFields}>
              <label className={classes.field}>
                {t("crmeTrigger")}
                <select value={trigger} disabled={!canWrite} onChange={(e) => setTrigger(e.target.value as Trigger)}>
                  {Array.from(new Set([...triggers, trigger])).map((k) => (
                    <option key={k} value={k}>
                      {t(triggerKey(k))}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className={s.hint}>{t("crmeFlowRules")}</p>
            <h3 className={classes.cardTitle}>{t("crmeFilters")}</h3>
            <p className={s.hint}>{t("crmeFiltersHint")}</p>
            <CondEditor conds={filters} onChange={setFilters} />
            <h3 className={classes.cardTitle}>{t("crmeSteps")}</h3>
            <ol className={s.steps}>
              {steps.map((st, i) => (
                <li key={st._id || `n${i}`} className={s.step}>
                  <div className={s.between}>
                    <span className={s.strong}>{t(stepKindKey[st.kind])}</span>
                    {canWrite && (
                      <span className={s.row}>
                        <button type="button" className={crm.linkButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label={t("crmeUp")}>
                          ↑
                        </button>
                        <button type="button" className={crm.linkButton} onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label={t("crmeDown")}>
                          ↓
                        </button>
                        <button type="button" className={crm.linkDanger} onClick={() => setSteps((x) => x.filter((_, j) => j !== i))}>
                          {t("crmeRemoveStep")}
                        </button>
                      </span>
                    )}
                  </div>
                  <StepFields
                    step={st}
                    onChange={(n) => setSteps((x) => x.map((y, j) => (j === i ? n : y)))}
                    templates={listOf<CrmTemplate>(tplData)}
                    sequences={listOf<{ _id: string; name: string }>(seqs.data)}
                    projects={listOf<{ _id: string; name: string }>(projects.data)}
                  />
                </li>
              ))}
            </ol>
            {canWrite && (
              <div className={s.row}>
                {(["action", "condition", "delay", "approval"] as const).map((k) => (
                  <button key={k} type="button" className={classes.ghost} onClick={() => addStep(k)}>
                    + {t(stepKindKey[k])}
                  </button>
                ))}
              </div>
            )}
          </section>
          {canSend && (
            <section className={classes.card}>
              <h2 className={classes.cardTitle}>{t("crmeRunNow")}</h2>
              <p className={s.hint}>{t("crmeRunNowHint")}</p>
              <div className={s.grid2}>
                <ContactField value={contact} onChange={setContact} />
                <div className={s.row}>
                  <button type="button" className={classes.primary} disabled={!contact} onClick={async () => { if (await call("POST", `/flows/${id}/run`, { contact: contact!._id })) { setContact(null); mutate(); } }}>
                    {t("crmeRun")}
                  </button>
                </div>
              </div>
            </section>
          )}
          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{t("crmeRuns")}</h2>
            {!data.runs.length ? (
              <p className={classes.empty}>{t("crmeNoRuns")}</p>
            ) : (
              <ul className={crm.miniList}>
                {data.runs.map((r) => (
                  <li key={r._id} className={s.stack}>
                    <div className={s.between}>
                      <button type="button" className={s.row} onClick={() => setOpen(open === r._id ? "" : r._id)}>
                        <Badge tone={runTone(r.status)}>{t(runKey[r.status])}</Badge>
                        <span>{r.contact?.name || r.contact?.phone || "—"}</span>
                        <span className={classes.muted}>{w.at(r.createdAt)}</span>
                      </button>
                      {canWrite && ["running", "waitingDelay", "waitingApproval"].includes(r.status) && (
                        <ConfirmButton onConfirm={async () => (await call("POST", `/flow-runs/${r._id}/cancel`)) && mutate()}>{t("crmCancel")}</ConfirmButton>
                      )}
                    </div>
                    {open === r._id && (
                      <ol className={s.log}>
                        {r.log.map((l, i) => (
                          <li key={i}>
                            <Badge tone={l.result === "failed" ? "bad" : l.result === "no" || l.result === "rejected" ? "warn" : l.result === "skipped" ? "muted" : "ok"}>{t(logKey[l.result] || l.result)}</Badge>
                            <span>
                              {t("crmeStepN", [String(l.step + 1)])} · {t(l.kind in stepKindKey ? stepKindKey[l.kind as keyof typeof stepKindKey] : actionKey(l.kind))}
                            </span>
                            {l.note && <span className={classes.muted}>{l.kind === "delay" ? w.at(l.note) : NOTE_CODES.includes(l.note) ? t(`crmeNote_${l.note}`) : l.note}</span>}
                            <span className={classes.muted}>{w.at(l.at)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

const FlowList = () => {
  const t = useCrmText();
  const w = useWhen();
  const { panel, canWrite } = useCrm();
  const call = useCall();
  const router = useRouter();
  const triggers = useTriggers();
  // only the recipes whose event this profile has
  const recipes = useRecipes().filter((r) => (triggers as readonly string[]).includes(r.flow().trigger));
  const { data, error, mutate } = useGet<Flow[]>("/flows", (d) => listOf<Flow>(d));
  const legacy = useGet<CrmAutomation[]>("/automations", (d) => listOf<CrmAutomation>(d));
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<Trigger>(triggers[0] || "contact.created");
  const create = async (body: Record<string, unknown>) => {
    const r = await call<Flow>("POST", "/flows", body);
    if (r?._id) router.push(`${panel}/crm/flows/${r._id}`);
  };
  return (
    <div className={s.stack}>
      <StarterBanner onSeeded={() => mutate()} />
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <p className={s.hint}>{t("crmeFlowsHint")}</p>
          {canWrite && (
            <div className={s.row}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("crmeFlowName")} maxLength={80} />
              <select value={trigger} onChange={(e) => setTrigger(e.target.value as Trigger)} aria-label={t("crmeTrigger")}>
                {triggers.map((k) => (
                  <option key={k} value={k}>
                    {t(triggerKey(k))}
                  </option>
                ))}
              </select>
              <button type="button" className={classes.primary} disabled={name.trim().length < 2} onClick={() => create({ name, trigger, filters: [], steps: [] })}>
                {t("crmeNewFlow")}
              </button>
            </div>
          )}
        </div>
        {canWrite && recipes.length > 0 && (
          <div className={s.stack}>
            <span className={classes.muted}>{t("crmeRecipes")}</span>
            <div className={crm.chips}>
              {recipes.map((r) => (
                <button key={r.key} type="button" className={crm.chip} onClick={() => create(r.flow())}>
                  + {t(r.title)}
                </button>
              ))}
            </div>
          </div>
        )}
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (!data.length ? (
              <p className={classes.empty}>{t("crmeNoFlows")}</p>
            ) : (
              <Table
                data={data}
                name="CrmFlows"
                renderer={{
                  name: { name: t("crmeFlowName"), value: (f) => f.name, filter: "Text", component: (f) => <Link href={`${panel}/crm/flows/${f._id}`}>{f.name}</Link> },
                  trigger: { name: t("crmeTrigger"), value: (f) => t(triggerKey(f.trigger)), filter: "Set" },
                  steps: { name: t("crmeSteps"), value: (f) => f.steps?.length || 0, filter: "Number" },
                  active: { name: t("crmeStatus"), value: (f) => t(f.active ? "crmeActive" : "crmInactive"), filter: "Set", component: (f) => <Badge tone={f.active ? "ok" : "muted"}>{t(f.active ? "crmeActive" : "crmInactive")}</Badge> },
                  runs: { name: t("crmeRuns"), value: (f) => f.runCount || 0, filter: "Number" },
                  waiting: { name: t("crmeWaiting"), value: (f) => (f.runs?.waitingDelay || 0) + (f.runs?.waitingApproval || 0), filter: "Number" },
                  lastRunAt: { name: t("crmeLastRun"), value: (f) => (f.lastRunAt ? new Date(f.lastRunAt) : ""), component: (f) => (f.lastRunAt ? w.at(f.lastRunAt) : "—") },
                }}
              />
            ))}
        </HandleLoading>
      </section>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <h2 className={classes.cardTitle}>{t("crmeLegacyJourneys")}</h2>
          <Link href={`${panel}/crm/automations`} className={crm.linkButton}>
            {t("crmeManageJourneys")}
          </Link>
        </div>
        <p className={s.hint}>{t("crmeLegacyHint")}</p>
        <ul className={crm.miniList}>
          {listOf<CrmAutomation>(legacy.data).map((a) => (
            <li key={a._id} className={s.between}>
              <span>
                {a.name} · <span className={classes.muted}>{t(automationKey[a.kind]?.title || a.kind)}</span>
              </span>
              <Badge tone={a.enabled ? "ok" : "muted"}>{t(a.enabled ? "crmeActive" : "crmInactive")}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const CrmFlows = ({ id }: { id?: string }) => (id ? <FlowEditor id={id} /> : <FlowList />);

export default CrmFlows;
