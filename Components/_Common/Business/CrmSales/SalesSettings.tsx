"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { CrmContext, insurerKey, phoneText, useCrm } from "../Crm/crmShared";
import { CustomField, LeadSource, leadKindKey, Pipeline, SalesMeta, Stage, useAction, useList, useNames, useProfile, useSalesMeta, useSalesText } from "./salesShared";
import { CopyLink } from "./SalesWidgets";

const RULE_POPUP = "CrmsRule";
const TEAM_POPUP = "CrmsTeam";
const FIELD_POPUP = "CrmsField";

const stageFieldKeys = ["title", "value", "expectedClose", "contact", "probability", "assignee", "items"] as const;
const condFields = ["kind", "title", "status", "sourceName", "doctorName", "referrerName", "priority", "value", "probability", "contactVisits", "contactSpent", "contactInsurer", "contactCity", "contactGender", "contactAge"] as const;
const condOps = ["eq", "neq", "contains", "in", "gt", "lt", "empty", "notempty"] as const;
type Cond = { field: string; op: string; value: string };
type Rule = { _id: string; kind: "assign" | "score"; name: string; order: number; active: boolean; conditions: Cond[]; assignType: "user" | "team"; user?: string; team?: string; stopOnMatch: boolean; points: number };
type Team = { _id: string; name: string; manager?: string; members: string[] };
type Chain = { enabled: boolean; approvers: string[]; minAmount: number };
type Settings = {
  autoAssign: { enabled: boolean; users: string[] };
  teamScope: boolean;
  approvals: { plan: Chain; discount: Chain; credit: Chain };
  webform: { enabled: boolean; slug?: string; requests: boolean; pipeline?: string; title?: string; intro?: string; thanks?: string; askEmail: boolean; askCity: boolean; askKind: boolean };
};

// ---------------------------------------------------------------- pipelines

const StageRow = ({ pipe, stage, first, last, onChanged }: { pipe: Pipeline; stage: Stage; first: boolean; last: boolean; onChanged: () => void }) => {
  const t = useSalesText();
  const names = useNames();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const [name, setName] = useState(names.stage(stage));
  const [prob, setProb] = useState(String(stage.probability));
  const [open, setOpen] = useState(false);
  const base = `/pipelines/${pipe._id}/stages/${stage._id}`;
  const patch = async (p: Record<string, unknown>) => {
    if (await run("PATCH", base, p)) onChanged();
  };
  return (
    <li className={crm.followUp}>
      <div className={crm.fuMain}>
        <div className={s.toolbar}>
          <input className={s.grow} value={name} disabled={!canWrite} aria-label={t("crmsStageName")} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== names.stage(stage) && patch({ name: name.trim() })} />
          <input style={{ width: "5rem" }} inputMode="numeric" value={prob} disabled={!canWrite} aria-label={t("crmsProbability")} onChange={(e) => setProb(e.target.value.replace(/\D/g, ""))} onBlur={() => Number(prob) !== stage.probability && patch({ probability: Math.min(100, Number(prob) || 0) })} />
          <span className={classes.muted}>%</span>
        </div>
        {(stage.requiredFields.length > 0 || stage.requireActivity) && !open && (
          <span className={classes.muted}>
            {t("crmsBlueprint")}: {[...stage.requiredFields.map((f) => t(`crmsField_${f}`)), ...(stage.requireActivity ? [t("crmsField_activity")] : [])].join("، ")}
          </span>
        )}
        {open && (
          <div className={s.checks}>
            {stageFieldKeys.map((f) => (
              <label key={f}>
                <input
                  type="checkbox"
                  checked={stage.requiredFields.includes(f)}
                  disabled={!canWrite || !!busy}
                  onChange={(e) => patch({ requiredFields: e.target.checked ? [...stage.requiredFields, f] : stage.requiredFields.filter((x) => x !== f) })}
                />
                {t(`crmsField_${f}`)}
              </label>
            ))}
            <label>
              <input type="checkbox" checked={stage.requireActivity} disabled={!canWrite || !!busy} onChange={(e) => patch({ requireActivity: e.target.checked })} />
              {t("crmsField_activity")}
            </label>
          </div>
        )}
      </div>
      {canWrite && (
        <span className={crm.rowActions}>
          <button type="button" className={crm.linkButton} onClick={() => setOpen(!open)}>
            {t("crmsBlueprint")}
          </button>
          <button type="button" className={classes.ghost} disabled={first || !!busy} aria-label={t("crmsMoveUp")} onClick={async () => (await run("POST", `${base}/move`, { dir: "up" }, { quiet: true })) && onChanged()}>
            ↑
          </button>
          <button type="button" className={classes.ghost} disabled={last || !!busy} aria-label={t("crmsMoveDown")} onClick={async () => (await run("POST", `${base}/move`, { dir: "down" }, { quiet: true })) && onChanged()}>
            ↓
          </button>
          <button type="button" className={crm.linkDanger} disabled={!!busy} onClick={async () => window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", base)) && onChanged()}>
            {t("crmsDelete")}
          </button>
        </span>
      )}
    </li>
  );
};

const Pipelines = ({ meta, refresh }: { meta: SalesMeta; refresh: () => void }) => {
  const t = useSalesText();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const pf = useProfile();
  const [newPipe, setNewPipe] = useState("");
  const [tpl, setTpl] = useState(meta.templates[0]?.key || "");
  const [dept, setDept] = useState("");
  const [newStage, setNewStage] = useState<Record<string, string>>({});
  return (
    <div className={s.stack}>
      {meta.pipelines.map((p) => {
        const stages = [...p.stages].sort((a, b) => a.sequence - b.sequence);
        return (
          <section key={p._id} className={classes.card}>
            <div className={classes.cardHead}>
              <div className={s.toolbar}>
                <input
                  defaultValue={p.name}
                  disabled={!canWrite}
                  aria-label={t("crmsPipelineName")}
                  onBlur={async (e) => e.target.value.trim() && e.target.value !== p.name && (await run("PATCH", `/pipelines/${p._id}`, { name: e.target.value.trim() })) && refresh()}
                />
                {p.isDefault ? <span className={classes.badge}>{t("crmsDefault")}</span> : null}
                {p.department?.name ? <span className={classes.badge}>{p.department.name}</span> : null}
              </div>
              {canWrite && (
                <div className={classes.actions}>
                  {!p.isDefault && (
                    <button type="button" className={classes.ghost} disabled={!!busy} onClick={async () => (await run("PATCH", `/pipelines/${p._id}`, { isDefault: true })) && refresh()}>
                      {t("crmsMakeDefault")}
                    </button>
                  )}
                  {!p.isDefault && (
                    <button type="button" className={crm.linkDanger} disabled={!!busy} onClick={async () => window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/pipelines/${p._id}`)) && refresh()}>
                      {t("crmsDelete")}
                    </button>
                  )}
                </div>
              )}
            </div>
            <ul className={crm.followUps}>
              {stages.map((st, i) => (
                <StageRow key={`${st._id}:${st.sequence}:${st.name}`} pipe={p} stage={st} first={i === 0} last={i === stages.length - 1} onChanged={refresh} />
              ))}
            </ul>
            {canWrite && (
              <div className={s.toolbar}>
                <input className={s.grow} value={newStage[p._id] || ""} placeholder={t("crmsNewStage")} aria-label={t("crmsNewStage")} onChange={(e) => setNewStage({ ...newStage, [p._id]: e.target.value })} />
                <button
                  type="button"
                  className={classes.ghost}
                  disabled={!!busy || !(newStage[p._id] || "").trim()}
                  onClick={async () => {
                    if (await run("POST", `/pipelines/${p._id}/stages`, { name: newStage[p._id].trim(), probability: 50 })) {
                      setNewStage({ ...newStage, [p._id]: "" });
                      refresh();
                    }
                  }}
                >
                  {t("crmsAddStage")}
                </button>
              </div>
            )}
          </section>
        );
      })}
      {canWrite && (
        <section className={classes.card}>
          <div className={s.toolbar}>
            <input className={s.grow} value={newPipe} placeholder={t("crmsNewPipeline")} aria-label={t("crmsNewPipeline")} onChange={(e) => setNewPipe(e.target.value)} />
            {meta.templates.length > 1 && (
              <select value={tpl} onChange={(e) => setTpl(e.target.value)} aria-label={t("crmsPipelineTemplate")}>
                {meta.templates.map((x) => (
                  <option key={x.key} value={x.key}>
                    {t(`crmsTpl_${x.key}`)}
                  </option>
                ))}
              </select>
            )}
            {pf.doctors && meta.departments.length > 0 && (
              <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label={t("crmsDepartment")}>
                <option value="">{t("crmsAllDepartments")}</option>
                {meta.departments.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className={classes.primary}
              disabled={!!busy || (!newPipe.trim() && !tpl)}
              onClick={async () => {
                if (await run("POST", "/pipelines", { name: newPipe.trim() || undefined, template: tpl || undefined, department: dept || null })) {
                  setNewPipe("");
                  refresh();
                }
              }}
            >
              {t("crmsAddPipeline")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- sources

const SourceList = ({ kind, rows, refresh }: { kind: LeadSource["kind"]; rows: LeadSource[]; refresh: () => void }) => {
  const t = useSalesText();
  const names = useNames();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const [name, setName] = useState("");
  return (
    <section className={classes.card}>
      <h3 className={classes.cardTitle}>{t(kind === "source" ? "crmsSources" : kind === "referrer" ? "crmsReferrers" : "crmsLossReasons")}</h3>
      {kind === "referrer" && <p className={classes.muted}>{t("crmsReferrersHint")}</p>}
      <ul className={crm.followUps}>
        {rows.map((x) => (
          <li key={x._id} className={crm.followUp}>
            <div className={crm.fuMain}>
              <input
                className={s.input}
                defaultValue={names.source(x)}
                disabled={!canWrite}
                aria-label={t("crmsName")}
                onBlur={async (e) => e.target.value.trim() && e.target.value !== names.source(x) && (await run("PATCH", `/lead-sources/${x._id}`, { name: e.target.value.trim() })) && refresh()}
              />
            </div>
            {canWrite && (
              <span className={crm.rowActions}>
                <label className={crm.checkField}>
                  <input type="checkbox" checked={x.active} disabled={!!busy} onChange={async (e) => (await run("PATCH", `/lead-sources/${x._id}`, { active: e.target.checked }, { quiet: true })) && refresh()} />
                  {t("crmsActive")}
                </label>
                {x.system !== "webform" && (
                  <button type="button" className={crm.linkDanger} disabled={!!busy} onClick={async () => window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/lead-sources/${x._id}`)) && refresh()}>
                    {t("crmsDelete")}
                  </button>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
      {canWrite && (
        <div className={s.toolbar}>
          <input className={s.grow} value={name} placeholder={t(kind === "source" ? "crmsNewSource" : kind === "referrer" ? "crmsNewReferrer" : "crmsNewLossReason")} aria-label={t("crmsName")} onChange={(e) => setName(e.target.value)} />
          <button
            type="button"
            className={classes.ghost}
            disabled={!!busy || !name.trim()}
            onClick={async () => {
              if (await run("POST", "/lead-sources", { kind, name: name.trim() })) {
                setName("");
                refresh();
              }
            }}
          >
            {t("crmsAdd")}
          </button>
        </div>
      )}
    </section>
  );
};

// ---------------------------------------------------------------- rules

const CondEditor = ({ conds, onChange, single }: { conds: Cond[]; onChange: (c: Cond[]) => void; single?: boolean }) => {
  const t = useSalesText();
  const pf = useProfile();
  const fieldsHere = condFields.filter((f) => (f !== "doctorName" || pf.doctors) && (f !== "referrerName" || pf.referrers));
  const valueInput = (c: Cond, i: number) => {
    const set = (value: string) => onChange(conds.map((x, k) => (k === i ? { ...x, value } : x)));
    if (c.op === "empty" || c.op === "notempty") return <span />;
    if (c.field === "kind" && c.op !== "in" && c.op !== "contains")
      return (
        <select value={c.value} onChange={(e) => set(e.target.value)} aria-label={t("crmsCondValue")}>
          <option value="">—</option>
          {pf.kinds.map((k) => (
            <option key={k} value={k}>
              {t(leadKindKey(k))}
            </option>
          ))}
        </select>
      );
    if (c.field === "contactInsurer")
      return (
        <select value={c.value} onChange={(e) => set(e.target.value)} aria-label={t("crmsCondValue")}>
          <option value="">—</option>
          {Object.entries(insurerKey).map(([k, v]) => (
            <option key={k} value={k}>
              {t(v)}
            </option>
          ))}
        </select>
      );
    if (c.field === "contactGender")
      return (
        <select value={c.value} onChange={(e) => set(e.target.value)} aria-label={t("crmsCondValue")}>
          <option value="">—</option>
          <option value="male">{t("crmsMale")}</option>
          <option value="female">{t("crmsFemale")}</option>
        </select>
      );
    if (c.field === "status")
      return (
        <select value={c.value} onChange={(e) => set(e.target.value)} aria-label={t("crmsCondValue")}>
          <option value="">—</option>
          {(["open", "won", "lost"] as const).map((k) => (
            <option key={k} value={k}>
              {t(`crmsLead${k[0].toUpperCase()}${k.slice(1)}`)}
            </option>
          ))}
        </select>
      );
    return <input value={c.value} onChange={(e) => set(e.target.value)} aria-label={t("crmsCondValue")} />;
  };
  return (
    <div className={s.lines}>
      {conds.map((c, i) => (
        <div key={i} className={s.condRow}>
          <select value={c.field} aria-label={t("crmsCondField")} onChange={(e) => onChange(conds.map((x, k) => (k === i ? { ...x, field: e.target.value, value: "" } : x)))}>
            {fieldsHere.map((f) => (
              <option key={f} value={f}>
                {t(`crmsCf_${f}`)}
              </option>
            ))}
          </select>
          <select value={c.op} aria-label={t("crmsCondOp")} onChange={(e) => onChange(conds.map((x, k) => (k === i ? { ...x, op: e.target.value } : x)))}>
            {condOps.map((o) => (
              <option key={o} value={o}>
                {t(`crmsOp_${o}`)}
              </option>
            ))}
          </select>
          {valueInput(c, i)}
          {!single && (
            <button type="button" className={crm.linkDanger} aria-label={t("crmsRemoveLine")} onClick={() => onChange(conds.filter((_, k) => k !== i))}>
              ×
            </button>
          )}
        </div>
      ))}
      {!single && (
        <button type="button" className={crm.linkButton} onClick={() => onChange([...conds, { field: "kind", op: "eq", value: "" }])}>
          {t("crmsAddCondition")}
        </button>
      )}
    </div>
  );
};

const RuleForm = ({ kind, rule, meta, teams, onDone }: { kind: Rule["kind"]; rule?: Rule; meta: SalesMeta; teams: Team[]; onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [r, setR] = useState<Omit<Rule, "_id" | "order">>(
    rule || { kind, name: "", active: true, conditions: [{ field: "kind", op: "eq", value: "" }], assignType: "user", user: meta.staff[0]?._id, team: teams[0]?._id, stopOnMatch: true, points: 10 },
  );
  const set = (p: Partial<Rule>) => setR({ ...r, ...p });
  const save = async () => {
    const payload = { name: r.name, active: r.active, conditions: r.conditions, ...(kind === "score" ? { points: r.points } : { assignType: r.assignType, user: r.user || null, team: r.team || null, stopOnMatch: r.stopOnMatch }) };
    if (await run(rule ? "PATCH" : "POST", rule ? `/rules/${rule._id}` : "/rules", rule ? payload : { ...payload, kind })) {
      closePopup(RULE_POPUP);
      onDone();
    }
  };
  return (
    <PopupCard title={t(rule ? "crmsEdit" : kind === "score" ? "crmsNewScoreRule" : "crmsNewAssignRule")} size="wide">
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsName")}
          <input value={r.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </label>
        <h4 className={classes.cardTitle}>{t(kind === "score" ? "crmsWhen" : "crmsWhenAll")}</h4>
        <CondEditor conds={r.conditions} onChange={(conditions) => set({ conditions })} single={kind === "score"} />
        {kind === "score" ? (
          <label className={classes.field}>
            {t("crmsPoints")}
            <input inputMode="numeric" value={r.points} onChange={(e) => set({ points: Number(e.target.value.replace(/[^\d-]/g, "")) || 0 })} />
          </label>
        ) : (
          <div className={s.formGrid}>
            <label className={classes.field}>
              {t("crmsAssignTo")}
              <select value={r.assignType} onChange={(e) => set({ assignType: e.target.value as Rule["assignType"] })}>
                <option value="user">{t("crmsAssignUser")}</option>
                <option value="team">{t("crmsAssignTeam")}</option>
              </select>
            </label>
            {r.assignType === "user" ? (
              <label className={classes.field}>
                {t("crmsStaffMember")}
                <select value={r.user || ""} onChange={(e) => set({ user: e.target.value })}>
                  {meta.staff.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className={classes.field}>
                {t("crmsTeam")}
                <select value={r.team || ""} onChange={(e) => set({ team: e.target.value })}>
                  <option value="">—</option>
                  {teams.map((x) => (
                    <option key={x._id} value={x._id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className={crm.checkField}>
              <input type="checkbox" checked={r.stopOnMatch} onChange={(e) => set({ stopOnMatch: e.target.checked })} />
              {t("crmsStopOnMatch")}
            </label>
          </div>
        )}
        <label className={crm.checkField}>
          <input type="checkbox" checked={r.active} onChange={(e) => set({ active: e.target.checked })} />
          {t("crmsActive")}
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !r.name.trim()} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const RuleList = ({ kind, meta }: { kind: Rule["kind"]; meta: SalesMeta }) => {
  const t = useSalesText();
  const names = useNames();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run, busy } = useAction();
  const { data, error, mutate } = useList<Rule>(`/rules?kind=${kind}`);
  const { data: teams } = useList<Team>("/teams");
  const open = (rule?: Rule) => setPopup(RULE_POPUP, <CrmContext.Provider value={ctx}><RuleForm kind={kind} rule={rule} meta={meta} teams={teams || []} onDone={() => mutate()} /></CrmContext.Provider>);
  const condText = (c: Cond) => `${t(`crmsCf_${c.field}`)} ${t(`crmsOp_${c.op}`)} ${c.field === "kind" ? t(leadKindKey(c.value)) : c.value}`;
  const rows = data || [];
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>{t(kind === "score" ? "crmsScoreHint" : "crmsAssignRulesHint")}</p>
        {canWrite && (
          <div className={classes.actions}>
            {kind === "score" && (
              <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => run("POST", "/rules/recompute", {})}>
                {t("crmsRecompute")}
              </button>
            )}
            <button type="button" className={classes.primary} onClick={() => open()}>
              {t(kind === "score" ? "crmsNewScoreRule" : "crmsNewAssignRule")}
            </button>
          </div>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!rows.length ? (
          <p className={classes.empty}>{t("crmsNothingYet")}</p>
        ) : (
          <ul className={crm.followUps}>
            {rows.map((r, i) => (
              <li key={r._id} className={crm.followUp}>
                <div className={crm.fuMain}>
                  <span className={`${crm.fuText} ${r.active ? "" : crm.fuDone}`}>{r.name}</span>
                  <span className={classes.muted}>
                    {r.conditions.map(condText).join(" · ") || t("crmsAlways")}
                    {" → "}
                    {kind === "score" ? t("crmsPointsN", [String(r.points)]) : r.assignType === "user" ? names.staff(meta, r.user) : asArray<Team>(teams).find((x) => x._id === r.team)?.name || "—"}
                  </span>
                </div>
                {canWrite && (
                  <span className={crm.rowActions}>
                    {kind === "assign" && (
                      <>
                        <button type="button" className={classes.ghost} disabled={i === 0 || !!busy} aria-label={t("crmsMoveUp")} onClick={async () => (await run("POST", `/rules/${r._id}/move`, { dir: "up" }, { quiet: true })) && mutate()}>
                          ↑
                        </button>
                        <button type="button" className={classes.ghost} disabled={i === rows.length - 1 || !!busy} aria-label={t("crmsMoveDown")} onClick={async () => (await run("POST", `/rules/${r._id}/move`, { dir: "down" }, { quiet: true })) && mutate()}>
                          ↓
                        </button>
                      </>
                    )}
                    <label className={crm.checkField}>
                      <input type="checkbox" checked={r.active} disabled={!!busy} onChange={async (e) => (await run("PATCH", `/rules/${r._id}`, { active: e.target.checked }, { quiet: true })) && mutate()} />
                      {t("crmsActive")}
                    </label>
                    <button type="button" className={crm.linkButton} onClick={() => open(r)}>
                      {t("crmsEdit")}
                    </button>
                    <button type="button" className={crm.linkDanger} onClick={async () => window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/rules/${r._id}`)) && mutate()}>
                      {t("crmsDelete")}
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </HandleLoading>
    </section>
  );
};

const PeoplePicker = ({ meta, value, onChange }: { meta: SalesMeta; value: string[]; onChange: (v: string[]) => void }) => (
  <div className={s.checks}>
    {meta.staff.map((m) => (
      <label key={m._id}>
        <input type="checkbox" checked={value.includes(m._id)} onChange={(e) => onChange(e.target.checked ? [...value, m._id] : value.filter((x) => x !== m._id))} />
        {m.name}
      </label>
    ))}
  </div>
);

const useSettings = () => {
  const { api } = useCrm();
  return useSWR<Settings>(`${API}${api}/sales/settings`, (url: string) => fetcher({ url }).then((res) => res.data as Settings));
};

const Assignment = ({ meta, refresh }: { meta: SalesMeta; refresh: () => void }) => {
  const t = useSalesText();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const { data, mutate } = useSettings();
  const [pool, setPool] = useState<string[] | null>(null);
  const users = pool ?? asArray<string>(data?.autoAssign?.users).map(String);
  const patch = async (p: Record<string, unknown>) => {
    if (await run("PATCH", "/sales/settings", p)) {
      mutate();
      refresh();
    }
  };
  return (
    <div className={s.stack}>
      <section className={classes.card}>
        <h3 className={classes.cardTitle}>{t("crmsRoundRobin")}</h3>
        <p className={classes.muted}>{t("crmsRoundRobinHint")}</p>
        <label className={crm.checkField}>
          <input type="checkbox" checked={!!data?.autoAssign?.enabled} disabled={!canWrite || !!busy} onChange={(e) => patch({ autoAssign: { enabled: e.target.checked } })} />
          {t("crmsRoundRobinOn")}
        </label>
        <PeoplePicker meta={meta} value={users} onChange={setPool} />
        {canWrite && pool && (
          <button type="button" className={classes.primary} disabled={!!busy} onClick={() => patch({ autoAssign: { users: pool } }).then(() => setPool(null))}>
            {t("crmsSave")}
          </button>
        )}
        <label className={crm.checkField}>
          <input type="checkbox" checked={!!data?.teamScope} disabled={!canWrite || !!busy} onChange={(e) => patch({ teamScope: e.target.checked })} />
          {t("crmsTeamScope")}
        </label>
        <p className={classes.muted}>{t("crmsTeamScopeHint")}</p>
      </section>
      <RuleList kind="assign" meta={meta} />
    </div>
  );
};

// ---------------------------------------------------------------- teams

const TeamForm = ({ meta, team, onDone }: { meta: SalesMeta; team?: Team; onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [name, setName] = useState(team?.name || "");
  const [manager, setManager] = useState(team?.manager || "");
  const [members, setMembers] = useState<string[]>(team?.members.map(String) || []);
  return (
    <PopupCard title={t(team ? "crmsEdit" : "crmsNewTeam")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsName")}
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className={classes.field}>
          {t("crmsManager")}
          <select value={manager} onChange={(e) => setManager(e.target.value)}>
            <option value="">—</option>
            {meta.staff.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <h4 className={classes.cardTitle}>{t("crmsMembers")}</h4>
        <PeoplePicker meta={meta} value={members} onChange={setMembers} />
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!!busy || !name.trim()}
            onClick={async () => {
              if (await run(team ? "PATCH" : "POST", team ? `/teams/${team._id}` : "/teams", { name, manager: manager || null, members })) {
                closePopup(TEAM_POPUP);
                onDone();
              }
            }}
          >
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const Teams = ({ meta }: { meta: SalesMeta }) => {
  const t = useSalesText();
  const names = useNames();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run } = useAction();
  const { data, error, mutate } = useList<Team>("/teams");
  const open = (team?: Team) => setPopup(TEAM_POPUP, <CrmContext.Provider value={ctx}><TeamForm meta={meta} team={team} onDone={() => mutate()} /></CrmContext.Provider>);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>
          {t("crmsTeamsHint")}{" "}
          <Link href={`${panel}/secretary`} className={crm.linkButton}>
            {t("crmsManageStaff")}
          </Link>
        </p>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmsNewTeam")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNothingYet")}</p>
        ) : (
          <Table<Team>
            data={data || []}
            name="CrmSalesTeams"
            renderer={{
              name: { name: t("crmsName"), filter: "Text", value: (x) => x.name },
              manager: { name: t("crmsManager"), filter: "Set", value: (x) => names.staff(meta, x.manager) },
              members: { name: t("crmsMembers"), value: (x) => x.members.map((m) => names.staff(meta, String(m))).join("، ") },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      component: (x) => (
                        <TableActions>
                          <button type="button" className={crm.linkButton} onClick={() => open(x)}>
                            {t("crmsEdit")}
                          </button>
                          <button type="button" className={crm.linkDanger} onClick={async () => window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/teams/${x._id}`)) && mutate()}>
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

// ---------------------------------------------------------------- custom fields

const Fields = ({ refresh }: { refresh: () => void }) => {
  const t = useSalesText();
  const { api, canWrite } = useCrm();
  const { setPopup, closePopup } = usePopup();
  const { run } = useAction();
  const [entity, setEntity] = useState<CustomField["entity"]>("contact");
  const { data, error, mutate } = useList<CustomField>(`/custom-fields?entity=${entity}`);
  const types = ["text", "textarea", "number", "date", "select", "checkbox"];
  const done = () => {
    mutate();
    refresh();
    closePopup(FIELD_POPUP);
  };
  const open = (f?: CustomField) =>
    setPopup(
      FIELD_POPUP,
      <PopupCard title={t(f ? "crmsEdit" : "crmsNewField")}>
        <CreateForm<Partial<CustomField>>
          defaultValue={f || { type: "text", required: false, options: [] }}
          renderer={{
            label: { type: "text", title: t("crmsFieldLabel"), required: true },
            type: { type: "select", title: t("crmsFieldType"), options: Object.fromEntries(types.map((x) => [x, t(`crmsFt_${x}`)])) },
            options: { type: "strings", title: t("crmsFieldOptions"), hint: t("crmsFieldOptionsHint") },
            required: { type: "bool", title: t("crmsRequired") },
          }}
          onCancel={() => closePopup(FIELD_POPUP)}
          hookProps={{
            path: f ? `${API}${api}/custom-fields/${f._id}` : `${API}${api}/custom-fields`,
            method: f ? "PATCH" : "POST",
            parser: "JSON",
            mutator: (inp) => (f ? inp : { entity, type: "text", ...inp }),
            successCb: done,
          }}
        />
      </PopupCard>,
    );
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["contact", "lead"] as const).map((x) => (
            <button key={x} type="button" role="tab" aria-selected={entity === x} className={entity === x ? classes.on : ""} onClick={() => setEntity(x)}>
              {t(`crmsEntity_${x}`)}
            </button>
          ))}
        </div>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmsNewField")}
          </button>
        )}
      </div>
      <p className={classes.muted}>{t("crmsFieldsHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNothingYet")}</p>
        ) : (
          <Table<CustomField>
            data={data || []}
            name={`CrmSalesFields_${entity}`}
            renderer={{
              label: { name: t("crmsFieldLabel"), filter: "Text", value: (x) => x.label },
              key: { name: t("crmsFieldKey"), value: (x) => x.key },
              type: { name: t("crmsFieldType"), filter: "Set", value: (x) => t(`crmsFt_${x.type}`) },
              required: { name: t("crmsRequired"), filter: "Set", value: (x) => t(x.required ? "crmsYes" : "crmsNo") },
              active: { name: t("crmsStatus"), filter: "Set", value: (x) => t(x.active ? "crmsActive" : "crmsInactive") },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      width: 220,
                      component: (x) => (
                        <TableActions>
                          <button type="button" className={crm.linkButton} onClick={async () => (await run("PATCH", `/custom-fields/${x._id}`, { active: !x.active }, { quiet: true })) && done()}>
                            {t(x.active ? "crmsDisable" : "crmsEnable")}
                          </button>
                          <button type="button" className={crm.linkButton} onClick={() => open(x)}>
                            {t("crmsEdit")}
                          </button>
                          <button type="button" className={crm.linkDanger} onClick={async () => window.confirm(t("crmsConfirmDeleteField")) && (await run("DELETE", `/custom-fields/${x._id}`)) && done()}>
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

// ---------------------------------------------------------------- approvals

const Approvals = ({ meta, refresh }: { meta: SalesMeta; refresh: () => void }) => {
  const t = useSalesText();
  const pf = useProfile();
  const f = useBizFormat();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const { data, mutate } = useSettings();
  const [draft, setDraft] = useState<Settings["approvals"] | null>(null);
  useEffect(() => setDraft(null), [data]);
  const cur = draft || data?.approvals;
  if (!cur) return null;
  const set = (k: keyof Settings["approvals"], p: Partial<Chain>) => setDraft({ ...cur, [k]: { ...cur[k], ...p } });
  return (
    <section className={classes.card}>
      <p className={classes.muted}>{t("crmsApprovalSettingsHint")}</p>
      {(["plan", "discount", "credit"] as const).filter((k) => pf.approvals.includes(k)).map((k) => (
        <div key={k} className={s.stack}>
          <h3 className={classes.cardTitle}>{t(`crmsApKind_${k}`)}</h3>
          {k !== "discount" && (
            <label className={crm.checkField}>
              <input type="checkbox" checked={!!cur[k].enabled} disabled={!canWrite} onChange={(e) => set(k, { enabled: e.target.checked })} />
              {t(`crmsApOn_${k}`)}
            </label>
          )}
          {k === "plan" && (
            <label className={classes.field}>
              {t("crmsApMinAmount")}
              <input inputMode="numeric" value={cur.plan.minAmount || ""} disabled={!canWrite} onChange={(e) => set("plan", { minAmount: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
            </label>
          )}
          <span className={classes.muted}>{t("crmsApproversInOrder")}</span>
          <ol className={s.history}>
            {cur[k].approvers.map((id, i) => (
              <li key={id}>
                <span>
                  {f.money(i + 1)}. {meta.staff.find((m) => m._id === String(id))?.name || "—"}
                </span>
                {canWrite && (
                  <button type="button" className={crm.linkDanger} onClick={() => set(k, { approvers: cur[k].approvers.filter((x) => x !== id) })}>
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
          {canWrite && (
            <select value="" aria-label={t("crmsAddApprover")} onChange={(e) => e.target.value && set(k, { approvers: [...cur[k].approvers.map(String), e.target.value] })}>
              <option value="">{t("crmsAddApprover")}</option>
              {meta.staff
                .filter((m) => !cur[k].approvers.map(String).includes(m._id))
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
            </select>
          )}
          {!cur[k].approvers.length && <span className={classes.muted}>{t("crmsApOwnerOnly")}</span>}
        </div>
      ))}
      {canWrite && (
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!draft || !!busy}
            onClick={async () => {
              if (await run("PATCH", "/sales/settings", { approvals: draft })) {
                mutate();
                refresh();
              }
            }}
          >
            {t("crmsSave")}
          </button>
        </div>
      )}
    </section>
  );
};

// ---------------------------------------------------------------- web form

const WebForm = ({ meta }: { meta: SalesMeta }) => {
  const t = useSalesText();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const { data, mutate } = useSettings();
  const [w, setW] = useState<Settings["webform"] | null>(null);
  useEffect(() => setW(null), [data]);
  const cur = w || data?.webform;
  if (!cur) return null;
  const set = (p: Partial<Settings["webform"]>) => setW({ ...cur, ...p });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const saved = data?.webform;
  return (
    <section className={classes.card}>
      <p className={classes.muted}>{t("crmsWebformHint")}</p>
      <label className={crm.checkField}>
        <input type="checkbox" checked={!!cur.enabled} disabled={!canWrite} onChange={(e) => set({ enabled: e.target.checked })} />
        {t("crmsWebformOn")}
      </label>
      <div className={s.formGrid}>
        <label className={classes.field}>
          {t("crmsWebformSlug")}
          <input dir="ltr" value={cur.slug || ""} disabled={!canWrite} onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
        </label>
        <label className={classes.field}>
          {t("crmsWebformPipeline")}
          <select value={cur.pipeline || ""} disabled={!canWrite} onChange={(e) => set({ pipeline: e.target.value })}>
            <option value="">{t("crmsDefault")}</option>
            {meta.pipelines.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          {t("crmsWebformTitle")}
          <input value={cur.title || ""} disabled={!canWrite} onChange={(e) => set({ title: e.target.value })} />
        </label>
      </div>
      <label className={classes.field}>
        {t("crmsWebformIntro")}
        <textarea value={cur.intro || ""} disabled={!canWrite} onChange={(e) => set({ intro: e.target.value })} />
      </label>
      <label className={classes.field}>
        {t("crmsWebformThanks")}
        <input value={cur.thanks || ""} disabled={!canWrite} onChange={(e) => set({ thanks: e.target.value })} />
      </label>
      <div className={s.checks}>
        {(["askKind", "askCity", "askEmail", "requests"] as const).map((k) => (
          <label key={k}>
            <input type="checkbox" checked={!!cur[k]} disabled={!canWrite} onChange={(e) => set({ [k]: e.target.checked })} />
            {t(`crmsWf_${k}`)}
          </label>
        ))}
      </div>
      {canWrite && (
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!w || !!busy}
            onClick={async () => {
              const { pipeline, ...rest } = cur;
              if (await run("PATCH", "/sales/settings", { webform: { ...rest, pipeline: pipeline || null } })) mutate();
            }}
          >
            {t("crmsSave")}
          </button>
        </div>
      )}
      {saved?.enabled && saved.slug && (
        <div className={s.stack}>
          <span className={classes.muted}>{t("crmsWebformLink")}</span>
          <CopyLink text={`${origin}/f/${saved.slug}`} />
          {saved.requests && (
            <>
              <span className={classes.muted}>{t("crmsEstimateLink")}</span>
              <CopyLink text={`${origin}/r/${saved.slug}`} />
            </>
          )}
          <span className={classes.muted}>{t("crmsEmbedCode")}</span>
          <CopyLink text={`<iframe src="${origin}/f/${saved.slug}" style="width:100%;min-height:640px;border:0" loading="lazy"></iframe>`} />
        </div>
      )}
    </section>
  );
};

// ---------------------------------------------------------------- duplicates

type DupContact = { _id: string; name?: string; phone: string; user?: string; visits?: number; orders?: number; spent?: number; lastSeenAt?: string; nationalId?: string; source?: string };
type DupGroup = { reason: "nationalId" | "user" | "name"; key: string; ids: string[]; contacts: DupContact[] };

const DupCard = ({ g, onDone }: { g: DupGroup; onDone: () => void }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { panel, canWrite } = useCrm();
  const { run, busy } = useAction();
  // the one with the most history is the natural primary
  const best = [...g.contacts].sort((a, b) => (b.visits || 0) + (b.orders || 0) - ((a.visits || 0) + (a.orders || 0)))[0]?._id;
  const [primary, setPrimary] = useState(best || "");
  const [dups, setDups] = useState<string[]>(g.contacts.map((c) => c._id).filter((x) => x !== best));
  return (
    <section className={classes.card}>
      <span className={classes.badge}>{t(`crmsDup_${g.reason}`)}</span>
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("crmsPrimary")}</th>
              <th>{t("crmsMergeIt")}</th>
              <th>{t("crmsPatientName")}</th>
              <th>{t("crmsMobile")}</th>
              <th>{t("crmsVisits")}</th>
              <th>{t("crmsSpent")}</th>
            </tr>
          </thead>
          <tbody>
            {g.contacts.map((c) => (
              <tr key={c._id}>
                <td>
                  <input
                    type="radio"
                    name={`p-${g.key}`}
                    checked={primary === c._id}
                    aria-label={t("crmsPrimary")}
                    onChange={() => {
                      setPrimary(c._id);
                      setDups(g.contacts.map((x) => x._id).filter((x) => x !== c._id));
                    }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    disabled={primary === c._id}
                    checked={dups.includes(c._id)}
                    aria-label={t("crmsMergeIt")}
                    onChange={(e) => setDups(e.target.checked ? [...dups, c._id] : dups.filter((x) => x !== c._id))}
                  />
                </td>
                <td>
                  <Link href={`${panel}/crm/contacts/${c._id}`} className={crm.linkButton}>
                    {c.name || "—"}
                  </Link>
                </td>
                <td>
                  <bdi dir="ltr">{phoneText(c.phone)}</bdi>
                </td>
                <td className={classes.num}>{f.money((c.visits || 0) + (c.orders || 0))}</td>
                <td className={classes.num}>{f.money(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canWrite && (
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!!busy || !primary || !dups.length}
            onClick={async () => {
              if (window.confirm(t("crmsConfirmMerge")) && (await run("POST", "/duplicates/merge", { primary, duplicates: dups }))) onDone();
            }}
          >
            {t("crmsMerge")}
          </button>
        </div>
      )}
    </section>
  );
};

const Duplicates = () => {
  const t = useSalesText();
  const { data, error, mutate } = useList<DupGroup>("/duplicates");
  return (
    <div className={s.stack}>
      <p className={classes.muted}>{t("crmsDupHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? <p className={classes.empty}>{t("crmsNoDuplicates")}</p> : (data || []).map((g) => <DupCard key={`${g.reason}:${g.key}`} g={g} onDone={() => mutate()} />)}
      </HandleLoading>
    </div>
  );
};

// The sales settings (Nexxa crm/stages, sources, scoring, assignment,
// teams, custom-fields, webform, duplicates and the approval chains): one
// page, each concern a tab.
const SalesSettings = () => {
  const t = useSalesText();
  const { data: meta, error, mutate } = useSalesMeta();
  const pf = useProfile();
  const funnel = pf.funnel;
  return (
    <HandleLoading data={!!meta} error={error}>
      {meta && (
        <ClientTabSystem
          items={[
            { id: "pipelines", title: t("crmsTabPipelines"), content: <Pipelines meta={meta} refresh={() => mutate()} />, exclude: !funnel },
            {
              id: "sources",
              title: t("crmsTabSources"),
              exclude: !funnel,
              content: (
                <div className={s.twoCol}>
                  <SourceList kind="source" rows={meta.sources} refresh={() => mutate()} />
                  <div className={s.stack}>
                    {pf.referrers && <SourceList kind="referrer" rows={meta.referrers} refresh={() => mutate()} />}
                    <SourceList kind="lossReason" rows={meta.lossReasons} refresh={() => mutate()} />
                  </div>
                </div>
              ),
            },
            { id: "scoring", title: t("crmsTabScoring"), content: <RuleList kind="score" meta={meta} />, exclude: !pf.scoring },
            { id: "assignment", title: t("crmsTabAssignment"), content: <Assignment meta={meta} refresh={() => mutate()} />, exclude: !pf.assignment },
            { id: "teams", title: t("crmsTabTeams"), content: <Teams meta={meta} />, exclude: !pf.teams },
            { id: "fields", title: t("crmsTabFields"), content: <Fields refresh={() => mutate()} /> },
            { id: "approvals", title: t("crmsTabApprovals"), content: <Approvals meta={meta} refresh={() => mutate()} />, exclude: !pf.approvals.length },
            { id: "webform", title: t("crmsTabWebform"), content: <WebForm meta={meta} />, exclude: !pf.webform },
            { id: "duplicates", title: t("crmsTabDuplicates"), content: <Duplicates /> },
          ]}
        />
      )}
    </HandleLoading>
  );
};

export default SalesSettings;
