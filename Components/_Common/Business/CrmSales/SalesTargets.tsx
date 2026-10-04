"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { isoDay, useBizFormat } from "../bizShared";
import { CrmContext, phoneText, useCrm, usePercent } from "../Crm/crmShared";
import { dayOf, SalesMeta, useAction, useList, useNames, useProfile, useSalesMeta, useSalesText } from "./salesShared";

const GOAL_POPUP = "CrmsGoal";
const COMM_POPUP = "CrmsCommission";
const metrics = ["wonValue", "wonCount", "leadsCreated", "plansSent", "invoiced", "serviceSales"] as const;
const moneyMetrics = ["wonValue", "invoiced", "serviceSales"];
const periods = ["month", "quarter", "year", "custom"] as const;

type Goal = {
  _id: string;
  title: string;
  assignee?: string;
  doctorName?: string;
  metric: (typeof metrics)[number];
  target: number;
  period: (typeof periods)[number];
  startDate: string;
  endDate: string;
  lines: { label: string; service?: string; targetQty: number; targetValue: number }[];
  done: number;
  pct: number;
  expected: number;
  behind: boolean;
};
type Tier = { from: number; pct: number };
type Rule = {
  _id: string;
  user?: string;
  doctorName?: string;
  title: string;
  scope: "self" | "team";
  mode: "flat" | "tiered";
  tierMethod: "marginal" | "whole";
  salesTiers: Tier[];
  collectionTiers: Tier[];
  salesPct: number;
  collectionPct: number;
  period: (typeof periods)[number];
  periodStart: string;
  periodEnd: string;
  active: boolean;
  result?: { salesBase: number; salesCommission: number; collectionBase: number; collectionCommission: number; total: number; invoiceCount: number; receiptCount: number; peopleCount: number } | null;
};
type Task = { kind: "lead" | "followUp" | "overdueClose" | "refill"; id: string; title: string; contact?: { _id: string; name?: string; phone?: string } | null; score: number; priority: number; dueAt?: string; meta?: Record<string, number> };
type ServiceRow = { kind: string; id: string; title: string; price: number };

const num = (v: string) => Math.max(0, Number(v.replace(/[^\d.]/g, "")) || 0);

const GoalForm = ({ meta, goal, onDone }: { meta?: SalesMeta; goal?: Goal; onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const { data: catalog } = useList<ServiceRow>("/sales/catalog");
  const services = (catalog || []).filter((c) => c.kind === "service" || c.kind === "package");
  const [title, setTitle] = useState(goal?.title || "");
  const pf = useProfile();
  // a staff member ("u:<id>") or one of the centre's doctors ("d:<name>")
  const [assignee, setAssignee] = useState(goal?.assignee ? `u:${goal.assignee}` : goal?.doctorName ? `d:${goal.doctorName}` : "");
  const [metric, setMetric] = useState<Goal["metric"]>(goal?.metric || "wonValue");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [period, setPeriod] = useState<Goal["period"]>(goal?.period || "month");
  const [startDate, setStart] = useState(goal ? dayOf(goal.startDate) : isoDay(new Date()));
  const [endDate, setEnd] = useState(goal ? dayOf(goal.endDate) : "");
  const [lines, setLines] = useState(goal?.lines || []);
  const save = async () => {
    const payload = { title, assignee: assignee.startsWith("u:") ? assignee.slice(2) : null, doctorName: assignee.startsWith("d:") ? assignee.slice(2) : "", metric, target: num(target), period, startDate, endDate: endDate || null, lines };
    if (await run(goal ? "PATCH" : "POST", goal ? `/goals/${goal._id}` : "/goals", payload)) {
      closePopup(GOAL_POPUP);
      onDone();
    }
  };
  return (
    <PopupCard title={t(goal ? "crmsEdit" : "crmsNewGoal")} size="wide">
      <div className={classes.popup}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsName")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={classes.field}>
            {t("crmsGoalFor")}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">{t("crmsWholeCentre")}</option>
              {(pf.teams || pf.assignment) && (
                <optgroup label={t("crmsStaff")}>
                  {meta?.staff.map((m) => (
                    <option key={m._id} value={`u:${m._id}`}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {pf.doctors && !!meta?.doctors.length && (
                <optgroup label={t("crmsDoctors")}>
                  {meta.doctors.map((d) => (
                    <option key={d._id} value={`d:${d.name}`}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsMetric")}
            <select value={metric} onChange={(e) => setMetric(e.target.value as Goal["metric"])}>
              {metrics.map((m) => (
                <option key={m} value={m}>
                  {t(`crmsMetric_${m}`)}
                </option>
              ))}
            </select>
          </label>
          {metric !== "serviceSales" && (
            <label className={classes.field}>
              {t("crmsTarget")}
              <input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} />
            </label>
          )}
          <label className={classes.field}>
            {t("crmsPeriod")}
            <select value={period} onChange={(e) => setPeriod(e.target.value as Goal["period"])}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {t(`crmsPeriod_${p}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t(period === "custom" ? "crmsStartDate" : "crmsPeriodOf")}
            <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
          </label>
          {period === "custom" && (
            <label className={classes.field}>
              {t("crmsEndDate")}
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEnd(e.target.value)} />
            </label>
          )}
        </div>
        {metric === "serviceSales" && (
          <div className={s.lines}>
            <p className={classes.muted}>{t("crmsServiceLinesHint")}</p>
            {lines.map((l, i) => (
              <div key={i} className={s.condRow}>
                <select
                  value={l.service || ""}
                  aria-label={t("crmsService")}
                  onChange={(e) => {
                    const sv = services.find((x) => x.id === e.target.value);
                    setLines(lines.map((x, k) => (k === i ? { ...x, service: e.target.value, label: sv?.title || x.label } : x)));
                  }}
                >
                  <option value="">—</option>
                  {services.map((sv) => (
                    <option key={sv.id} value={sv.id}>
                      {sv.title}
                    </option>
                  ))}
                </select>
                <input inputMode="numeric" placeholder={t("crmsTargetQty")} aria-label={t("crmsTargetQty")} value={l.targetQty || ""} onChange={(e) => setLines(lines.map((x, k) => (k === i ? { ...x, targetQty: num(e.target.value) } : x)))} />
                <input inputMode="numeric" placeholder={t("crmsTargetValue")} aria-label={t("crmsTargetValue")} value={l.targetValue || ""} onChange={(e) => setLines(lines.map((x, k) => (k === i ? { ...x, targetValue: num(e.target.value) } : x)))} />
                <button type="button" className={crm.linkDanger} aria-label={t("crmsRemoveLine")} onClick={() => setLines(lines.filter((_, k) => k !== i))}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" className={crm.linkButton} onClick={() => setLines([...lines, { label: "", targetQty: 0, targetValue: 0 }])}>
              {t("crmsAddLine")}
            </button>
          </div>
        )}
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !title.trim()} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const Goals = ({ meta }: { meta?: SalesMeta }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const pct = usePercent();
  const names = useNames();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run } = useAction();
  const { data, error, mutate } = useList<Goal>("/goals");
  const open = (goal?: Goal) => setPopup(GOAL_POPUP, <CrmContext.Provider value={ctx}><GoalForm meta={meta} goal={goal} onDone={() => mutate()} /></CrmContext.Provider>);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>{t("crmsGoalsHint")}</p>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmsNewGoal")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoGoals")}</p>
        ) : (
          <div className={s.goalGrid}>
            {(data || []).map((g) => {
              const show = (n: number) => (moneyMetrics.includes(g.metric) ? f.money(n) : f.money(n));
              return (
                <div key={g._id} className={s.goalCard}>
                  <div className={classes.cardHead}>
                    <strong>{g.title}</strong>
                    <span className={`${classes.badge} ${g.behind ? crm.badgeWarn : crm.badgeOk}`}>{t(g.behind ? "crmsBehind" : "crmsOnTrack")}</span>
                  </div>
                  <span className={classes.muted}>
                    {t(`crmsMetric_${g.metric}`)} · {g.assignee ? names.staff(meta, g.assignee) : g.doctorName || t("crmsWholeCentre")} · {f.date(g.startDate)} – {f.date(g.endDate)}
                  </span>
                  <div className={s.progress} role="progressbar" aria-valuenow={g.pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className={`${s.progressBar} ${g.behind ? s.progressBehind : ""}`} style={{ width: `${Math.min(100, g.pct)}%` }} />
                    <span className={s.pace} style={{ insetInlineStart: `${Math.min(100, g.expected)}%` }} />
                  </div>
                  <span>
                    {show(g.done)} / {show(g.target)} · {pct(g.done, g.target)}
                  </span>
                  <span className={classes.muted}>{t("crmsExpectedPace", [pct(g.expected, 100)])}</span>
                  {canWrite && (
                    <div className={classes.actions}>
                      <button type="button" className={crm.linkButton} onClick={() => open(g)}>
                        {t("crmsEdit")}
                      </button>
                      <button
                        type="button"
                        className={crm.linkDanger}
                        onClick={async () => {
                          if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/goals/${g._id}`))) mutate();
                        }}
                      >
                        {t("crmsDelete")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </HandleLoading>
    </section>
  );
};

const TierEditor = ({ tiers, onChange }: { tiers: Tier[]; onChange: (t: Tier[]) => void }) => {
  const t = useSalesText();
  return (
    <div className={s.lines}>
      {tiers.map((x, i) => (
        <div key={i} className={s.condRow}>
          <input inputMode="numeric" aria-label={t("crmsTierFrom")} placeholder={t("crmsTierFrom")} value={x.from || ""} onChange={(e) => onChange(tiers.map((y, k) => (k === i ? { ...y, from: num(e.target.value) } : y)))} />
          <input inputMode="decimal" aria-label={t("crmsTierPct")} placeholder={t("crmsTierPct")} value={x.pct || ""} onChange={(e) => onChange(tiers.map((y, k) => (k === i ? { ...y, pct: Math.min(100, num(e.target.value)) } : y)))} />
          <span />
          <button type="button" className={crm.linkDanger} aria-label={t("crmsRemoveLine")} onClick={() => onChange(tiers.filter((_, k) => k !== i))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className={crm.linkButton} onClick={() => onChange([...tiers, { from: 0, pct: 0 }])}>
        {t("crmsAddTier")}
      </button>
    </div>
  );
};

const CommissionForm = ({ meta, rule, onDone }: { meta?: SalesMeta; rule?: Rule; onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [r, setR] = useState<Omit<Rule, "_id" | "result">>(
    rule || {
      user: meta?.staff[0]?._id || "",
      title: "",
      scope: "self",
      mode: "flat",
      tierMethod: "marginal",
      salesTiers: [],
      collectionTiers: [],
      salesPct: 0,
      collectionPct: 0,
      period: "month",
      periodStart: isoDay(new Date()),
      periodEnd: "",
      active: true,
    },
  );
  const set = (p: Partial<Rule>) => setR({ ...r, ...p });
  const pf = useProfile();
  const save = async () => {
    const payload = { ...r, user: r.user || null, doctorName: r.user ? "" : r.doctorName || "", periodStart: dayOf(r.periodStart), periodEnd: dayOf(r.periodEnd) || null };
    if (await run(rule ? "PATCH" : "POST", rule ? `/commissions/${rule._id}` : "/commissions", payload)) {
      closePopup(COMM_POPUP);
      onDone();
    }
  };
  return (
    <PopupCard title={t(rule ? "crmsEdit" : "crmsNewCommission")} size="wide">
      <div className={classes.popup}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsName")}
            <input value={r.title} onChange={(e) => set({ title: e.target.value })} />
          </label>
          <label className={classes.field}>
            {t("crmsStaffMember")}
            <select
              value={r.user ? `u:${r.user}` : r.doctorName ? `d:${r.doctorName}` : ""}
              onChange={(e) => (e.target.value.startsWith("d:") ? set({ user: undefined, doctorName: e.target.value.slice(2), scope: "self" }) : set({ user: e.target.value.slice(2), doctorName: undefined }))}
            >
              <optgroup label={t("crmsStaff")}>
                {meta?.staff.map((m) => (
                  <option key={m._id} value={`u:${m._id}`}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              {pf.doctors && !!meta?.doctors.length && (
                <optgroup label={t("crmsDoctors")}>
                  {meta.doctors.map((d) => (
                    <option key={d._id} value={`d:${d.name}`}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsScope")}
            <select value={r.scope} onChange={(e) => set({ scope: e.target.value as Rule["scope"] })}>
              <option value="self">{t("crmsScope_self")}</option>
              <option value="team">{t("crmsScope_team")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsMode")}
            <select value={r.mode} onChange={(e) => set({ mode: e.target.value as Rule["mode"] })}>
              <option value="flat">{t("crmsMode_flat")}</option>
              <option value="tiered">{t("crmsMode_tiered")}</option>
            </select>
          </label>
          {r.mode === "tiered" ? (
            <label className={classes.field}>
              {t("crmsTierMethod")}
              <select value={r.tierMethod} onChange={(e) => set({ tierMethod: e.target.value as Rule["tierMethod"] })}>
                <option value="marginal">{t("crmsTier_marginal")}</option>
                <option value="whole">{t("crmsTier_whole")}</option>
              </select>
            </label>
          ) : (
            <>
              <label className={classes.field}>
                {t("crmsSalesPct")}
                <input inputMode="decimal" value={r.salesPct || ""} onChange={(e) => set({ salesPct: Math.min(100, num(e.target.value)) })} />
              </label>
              <label className={classes.field}>
                {t("crmsCollectionPct")}
                <input inputMode="decimal" value={r.collectionPct || ""} onChange={(e) => set({ collectionPct: Math.min(100, num(e.target.value)) })} />
              </label>
            </>
          )}
          <label className={classes.field}>
            {t("crmsPeriod")}
            <select value={r.period} onChange={(e) => set({ period: e.target.value as Rule["period"] })}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {t(`crmsPeriod_${p}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t(r.period === "custom" ? "crmsStartDate" : "crmsPeriodOf")}
            <input type="date" value={dayOf(r.periodStart)} onChange={(e) => set({ periodStart: e.target.value })} />
          </label>
          {r.period === "custom" && (
            <label className={classes.field}>
              {t("crmsEndDate")}
              <input type="date" value={dayOf(r.periodEnd)} onChange={(e) => set({ periodEnd: e.target.value })} />
            </label>
          )}
        </div>
        {r.mode === "tiered" && (
          <div className={s.formGrid}>
            <div>
              <h4 className={classes.cardTitle}>{t("crmsSalesTiers")}</h4>
              <TierEditor tiers={r.salesTiers} onChange={(x) => set({ salesTiers: x })} />
            </div>
            <div>
              <h4 className={classes.cardTitle}>{t("crmsCollectionTiers")}</h4>
              <TierEditor tiers={r.collectionTiers} onChange={(x) => set({ collectionTiers: x })} />
            </div>
          </div>
        )}
        <label className={crm.checkField}>
          <input type="checkbox" checked={r.active} onChange={(e) => set({ active: e.target.checked })} />
          {t("crmsActive")}
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !r.title.trim() || (!r.user && !r.doctorName)} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const Commissions = ({ meta }: { meta?: SalesMeta }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const names = useNames();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run } = useAction();
  const { data, error, mutate } = useList<Rule>("/commissions");
  const open = (rule?: Rule) => setPopup(COMM_POPUP, <CrmContext.Provider value={ctx}><CommissionForm meta={meta} rule={rule} onDone={() => mutate()} /></CrmContext.Provider>);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>{t("crmsCommissionHint")}</p>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmsNewCommission")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoCommissions")}</p>
        ) : (
          <Table<Rule>
            data={data || []}
            name="CrmSalesCommissions"
            renderer={{
              title: { name: t("crmsName"), filter: "Text", value: (r) => r.title },
              user: { name: t("crmsStaffMember"), filter: "Set", value: (r) => (r.user ? names.staff(meta, r.user) : r.doctorName || "—") },
              scope: { name: t("crmsScope"), filter: "Set", value: (r) => t(`crmsScope_${r.scope}`) },
              period: { name: t("crmsPeriod"), value: (r) => `${f.date(r.periodStart)} – ${f.date(r.periodEnd)}` },
              salesBase: { name: t("crmsSalesBase"), filter: "Number", value: (r) => r.result?.salesBase || 0, component: (r) => <>{f.money(r.result?.salesBase)}</> },
              collectionBase: { name: t("crmsCollectionBase"), filter: "Number", value: (r) => r.result?.collectionBase || 0, component: (r) => <>{f.money(r.result?.collectionBase)}</> },
              total: { name: t("crmsCommission"), filter: "Number", value: (r) => r.result?.total || 0, component: (r) => <strong>{f.money(r.result?.total)}</strong> },
              active: { name: t("crmsStatus"), filter: "Set", value: (r) => t(r.active ? "crmsActive" : "crmsInactive") },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      component: (r) => (
                        <TableActions>
                          <button type="button" className={crm.linkButton} onClick={() => open(r)}>
                            {t("crmsEdit")}
                          </button>
                          <button
                            type="button"
                            className={crm.linkDanger}
                            onClick={async () => {
                              if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/commissions/${r._id}`))) mutate();
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

const DayPlan = ({ meta }: { meta?: SalesMeta }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { panel, canWrite } = useCrm();
  const { run, busy } = useAction();
  const [user, setUser] = useState("me");
  const { data, error, mutate } = useList<Task>(`/day-plan?user=${user}`);
  const isOwner = meta?.me && meta.me === meta.ownerUser;
  const done = async (task: Task) => {
    const note = window.prompt(t("crmsTaskNote")) ?? null;
    if (note === null) return;
    if (await run("POST", "/day-plan/done", { kind: task.kind, id: task.id, note })) mutate();
  };
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>{t("crmsDayPlanHint")}</p>
        {isOwner && (
          <select value={user} onChange={(e) => setUser(e.target.value)} aria-label={t("crmsStaffMember")}>
            <option value="me">{t("crmsMine")}</option>
            <option value="all">{t("crmsEveryone")}</option>
            {meta?.staff.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsDayPlanEmpty")}</p>
        ) : (
          <ul className={crm.followUps}>
            {(data || []).map((task) => (
              <li key={`${task.kind}:${task.id}`} className={`${crm.followUp} ${task.priority === 1 ? crm.overdue : ""}`}>
                <div className={crm.fuMain}>
                  <span className={crm.fuText}>
                    {task.kind === "lead" || task.kind === "overdueClose" ? (
                      <Link href={`${panel}/crm/leads/${task.id}`} className={crm.linkButton}>
                        {task.title}
                      </Link>
                    ) : (
                      task.title
                    )}
                  </span>
                  <span className={classes.muted}>
                    {t(`crmsTask_${task.kind}`, [f.money(task.meta?.idle ?? task.meta?.cadence ?? 0)])}
                    {task.contact?._id ? (
                      <>
                        {" · "}
                        <Link href={`${panel}/crm/contacts/${task.contact._id}`} className={crm.linkButton}>
                          {task.contact.name || phoneText(task.contact.phone || "")}
                        </Link>
                      </>
                    ) : task.contact?.phone ? (
                      <>
                        {" · "}
                        <bdi dir="ltr">{phoneText(task.contact.phone)}</bdi>
                      </>
                    ) : null}
                  </span>
                </div>
                <span className={`${classes.badge} ${task.priority === 1 ? crm.badgeWarn : ""}`}>{t(`crmsPriority_${4 - task.priority}`)}</span>
                {canWrite && (
                  <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => done(task)}>
                    {t("crmMarkDone")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </HandleLoading>
    </section>
  );
};

// Targets, commission and today's plan (Nexxa crm/goals, commission,
// plan): progress from the real records against the time already gone,
// commission from the invoices and receipts each person brought in.
const SalesTargets = () => {
  const t = useSalesText();
  const pf = useProfile();
  const { data: meta } = useSalesMeta();
  return (
    <ClientTabSystem
      items={[
        { id: "plan", title: t("crmsTabDayPlan"), content: <DayPlan meta={meta} /> },
        { id: "goals", title: t("crmsTabGoals"), content: <Goals meta={meta} /> },
        { id: "commission", title: t("crmsTabCommission"), content: <Commissions meta={meta} />, exclude: !pf.commission },
      ]}
    />
  );
};

export default SalesTargets;
