"use client";

import { useState } from "react";
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
import { asArray, isoDay, useBizFormat } from "../bizShared";
import { CrmContext, useCrm, useCrmText, usePercent } from "../Crm/crmShared";
import { contactName, Lead, leadKindKey, leadKinds, Pipeline, SalesMeta, useAction, useNames, useSalesMeta } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload, emptyLine, LineEditor, Totals } from "./SalesWidgets";
import { Line } from "./salesShared";

const NEW_LEAD = "CrmsNewLead";
const SAVE_VIEW = "CrmsSaveView";
// a lead untouched this long is "rotting" (Nexxa ROTTING_DAYS)
const ROT_DAYS = 14;

type Board = {
  pipeline: Pipeline | null;
  leads: Lead[];
  forecast: { open: number; openCount: number; weighted: number; won: number; winRate: number };
};
type View = { _id: string; name: string; shared: boolean; createdBy?: string; config: Record<string, string> };

// a new treatment inquiry: who, what, which stage; the assignee is the
// rules' (or the round-robin's) unless picked
export const NewLead = ({ meta, pipeline, onDone }: { meta: SalesMeta; pipeline?: Pipeline | null; onDone: (id: string) => void }) => {
  const t = useCrmText();
  const names = useNames();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const pipe = pipeline || meta.pipelines.find((p) => p.isDefault) || meta.pipelines[0];
  const [who, setWho] = useState<ContactChoice>({});
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<string>("other");
  const [stage, setStage] = useState(pipe?.stages[0]?._id || "");
  const [source, setSource] = useState("");
  const [assignee, setAssignee] = useState("");
  const [expectedClose, setExpectedClose] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const save = async () => {
    const r = await run<{ _id: string }>("POST", "/leads", {
      title,
      kind,
      pipeline: pipe?._id,
      stage,
      source: source || null,
      assignee: assignee || null,
      expectedClose: expectedClose || null,
      items: lines.filter((l) => l.title.trim()),
      ...contactPayload(who),
    });
    if (r?._id) {
      closePopup(NEW_LEAD);
      onDone(r._id);
    }
  };
  return (
    <PopupCard title={t("crmsNewLead")} size="wide">
      <div className={classes.popup}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsLeadTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </label>
          <label className={classes.field}>
            {t("crmsKind")}
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {leadKinds.map((k) => (
                <option key={k} value={k}>
                  {t(leadKindKey(k))}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsStage")}
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              {pipe?.stages.map((st) => (
                <option key={st._id} value={st._id}>
                  {names.stage(st)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsSource")}
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">—</option>
              {meta.sources
                .filter((x) => x.active)
                .map((x) => (
                  <option key={x._id} value={x._id}>
                    {names.source(x)}
                  </option>
                ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsAssignee")}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">{t("crmsAssignAuto")}</option>
              {meta.staff.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsExpectedClose")}
            <input type="date" value={expectedClose} min={isoDay(new Date())} onChange={(e) => setExpectedClose(e.target.value)} />
          </label>
        </div>
        <h3 className={classes.cardTitle}>{t("crmsPatient")}</h3>
        <ContactPicker value={who} onChange={setWho} />
        <h3 className={classes.cardTitle}>{t("crmsItems")}</h3>
        <LineEditor lines={lines} onChange={setLines} />
        <Totals lines={lines} />
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !title.trim()} onClick={save}>
            {t("crmsCreate")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const SaveView = ({ config, onDone }: { config: Record<string, string>; onDone: () => void }) => {
  const t = useCrmText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  return (
    <PopupCard title={t("crmsSaveView")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsViewName")}
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className={crm.checkField}>
          <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
          {t("crmsViewShared")}
        </label>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!!busy || !name.trim()}
            onClick={async () => {
              if (await run("POST", "/lead-views", { name, shared, config })) {
                closePopup(SAVE_VIEW);
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

// The treatment funnel (Nexxa crm/pipeline): one column per stage, a card
// per inquiry; dragged (or moved from its menu) to the next stage, which
// checks the stage's blueprint. Above it, the funnel's figures.
const SalesPipeline = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const pct = usePercent();
  const names = useNames();
  const router = useRouter();
  const ctx = useCrm();
  const { api, panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { data: meta } = useSalesMeta();
  const { run, busy } = useAction();
  const [pipe, setPipe] = useState("");
  const [q, setQ] = useState("");
  const [assignee, setAssignee] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("open");
  const [over, setOver] = useState("");
  const params = new URLSearchParams({ ...(pipe ? { pipeline: pipe } : {}), ...(q.trim() ? { q: q.trim() } : {}), ...(assignee ? { assignee } : {}), ...(kind ? { kind } : {}), ...(status ? { status } : {}) });
  const { data, error, mutate } = useSWR<Board>(`${API}${api}/leads?${params}`, (url: string) =>
    fetcher({ url }).then((res) => ({
      pipeline: res.data?.pipeline || null,
      leads: asArray<Lead>(res.data?.leads),
      forecast: res.data?.forecast || { open: 0, openCount: 0, weighted: 0, won: 0, winRate: 0 },
    })),
  );
  const { data: views, mutate: mutViews } = useSWR<View[]>(`${API}${api}/lead-views`, (url: string) => fetcher({ url }).then((res) => asArray<View>(res.data)));
  const board = data?.pipeline;
  const stages = board?.stages || [];
  const leads = data?.leads || [];
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const move = async (lead: Lead, stage: string) => {
    if (stage === lead.stage) return;
    // the card moves at once; a refused move (blueprint) comes back
    mutate((d) => (d ? { ...d, leads: d.leads.map((l) => (l._id === lead._id ? { ...l, stage } : l)) } : d), false);
    await run("POST", `/leads/${lead._id}/move`, { stage, pipeline: board?._id }, { quiet: true });
    mutate();
  };
  const config = { pipeline: pipe, q, assignee, kind, status };
  const apply = (v: View) => {
    setPipe(v.config.pipeline || "");
    setQ(v.config.q || "");
    setAssignee(v.config.assignee || "");
    setKind(v.config.kind || "");
    setStatus(v.config.status ?? "open");
  };
  const now = Date.now();
  return (
    <div className={s.stack}>
      <div className={classes.tiles}>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("crmsOpenFunnel")}</span>
          <span className={classes.tileValue}>{f.money(data?.forecast.open)}</span>
          <span className={classes.muted}>{t("crmsLeadsN", [f.money(data?.forecast.openCount)])}</span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("crmsWeighted")}</span>
          <span className={classes.tileValue}>{f.money(data?.forecast.weighted)}</span>
          <span className={classes.muted}>{t("crmsWeightedHint")}</span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("crmsWonValue")}</span>
          <span className={classes.tileValue}>{f.money(data?.forecast.won)}</span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("crmsWinRate")}</span>
          <span className={classes.tileValue}>{pct(Math.round((data?.forecast.winRate || 0) * 1000), 1000)}</span>
        </div>
      </div>
      <section className={classes.card}>
        <div className={s.pipeTabs} role="tablist" aria-label={t("crmsPipelines")}>
          {meta?.pipelines.map((p) => (
            <button
              key={p._id}
              type="button"
              role="tab"
              aria-selected={(board?._id || "") === p._id}
              className={`${s.pipeTab} ${(board?._id || "") === p._id ? s.pipeTabOn : ""}`}
              onClick={() => setPipe(p._id)}
            >
              {p.name}
            </button>
          ))}
          <Link href={`${panel}/crm/sales-settings`} className={s.pipeTab}>
            {t("crmsManageStages")}
          </Link>
        </div>
        <div className={s.toolbar}>
          <input className={s.grow} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmsSearchLeads")} aria-label={t("crmsSearchLeads")} />
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label={t("crmsAssignee")}>
            <option value="">{t("crmsEveryone")}</option>
            <option value="me">{t("crmsMine")}</option>
            <option value="none">{t("crmsUnassigned")}</option>
            {meta?.staff.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label={t("crmsKind")}>
            <option value="">{t("crmsAllKinds")}</option>
            {leadKinds.map((k) => (
              <option key={k} value={k}>
                {t(leadKindKey(k))}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("crmsStatus")}>
            <option value="open">{t("crmsLeadOpen")}</option>
            <option value="won">{t("crmsLeadWon")}</option>
            <option value="lost">{t("crmsLeadLost")}</option>
            <option value="">{t("crmsAllStatuses")}</option>
          </select>
          {asArray<View>(views).length > 0 && (
            <select
              value=""
              aria-label={t("crmsViews")}
              onChange={(e) => {
                const v = asArray<View>(views).find((x) => x._id === e.target.value);
                if (v) apply(v);
              }}
            >
              <option value="">{t("crmsViews")}</option>
              {asArray<View>(views).map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
          <button type="button" className={classes.ghost} onClick={() => setPopup(SAVE_VIEW, withCtx(<SaveView config={config} onDone={() => mutViews()} />))}>
            {t("crmsSaveView")}
          </button>
          {canWrite && meta && (
            <button
              type="button"
              className={classes.primary}
              onClick={() => setPopup(NEW_LEAD, withCtx(<NewLead meta={meta} pipeline={board} onDone={(id) => router.push(`${panel}/crm/leads/${id}`)} />))}
            >
              {t("crmsNewLead")}
            </button>
          )}
        </div>
        <HandleLoading data={!!data} error={error}>
          <div className={s.board}>
            {stages.map((st) => {
              const col = leads.filter((l) => l.stage === st._id);
              return (
                <div
                  key={st._id}
                  className={`${s.column} ${over === st._id ? s.columnOver : ""}`}
                  onDragOver={(e) => {
                    if (!canWrite) return;
                    e.preventDefault();
                    setOver(st._id);
                  }}
                  onDragLeave={() => setOver("")}
                  onDrop={(e) => {
                    setOver("");
                    const lead = leads.find((l) => l._id === e.dataTransfer.getData("text/plain"));
                    if (lead) move(lead, st._id);
                  }}
                >
                  <div className={s.colHead}>
                    <span className={s.colName}>{names.stage(st)}</span>
                    <span className={s.colSum}>
                      {f.money(col.length)} · {f.money(col.reduce((x, l) => x + (l.value || 0), 0))}
                    </span>
                  </div>
                  {col.map((l) => {
                    const idle = (now - +new Date(l.lastActivityAt || l.updatedAt)) / 864e5;
                    const late = l.status === "open" && l.expectedClose && +new Date(l.expectedClose) < now;
                    return (
                      <div
                        key={l._id}
                        draggable={canWrite}
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", l._id)}
                        className={`${s.leadCard} ${l.status === "open" && idle > ROT_DAYS ? s.rotting : ""} ${l.status === "won" ? s.won : ""} ${l.status === "lost" ? s.lost : ""}`}
                      >
                        <Link href={`${panel}/crm/leads/${l._id}`} className={s.leadTitle}>
                          {l.title}
                        </Link>
                        <span className={s.leadMeta}>
                          <span>{contactName(l.contact)}</span>
                          <span className={classes.badge}>{t(leadKindKey(l.kind))}</span>
                        </span>
                        <span className={s.leadMeta}>
                          <strong>{f.money(l.value)}</strong>
                          <span>{pct(l.probability, 100)}</span>
                          {l.ruleScore ? <span className={crm.badgeOk}>{t("crmsScoreN", [f.money(l.ruleScore)])}</span> : null}
                          {l.assignee && <span>{names.staff(meta, l.assignee)}</span>}
                        </span>
                        {(late || (l.status === "open" && idle > ROT_DAYS)) && (
                          <span className={`${s.leadMeta} ${s.late}`}>{late ? t("crmsCloseOverdue", [f.date(l.expectedClose)]) : t("crmsRotting", [f.money(Math.floor(idle))])}</span>
                        )}
                        {canWrite && (
                          <select
                            className={crm.inlineSelect}
                            value={l.stage}
                            disabled={!!busy}
                            aria-label={t("crmsMoveTo")}
                            onChange={(e) => move(l, e.target.value)}
                          >
                            {stages.map((x) => (
                              <option key={x._id} value={x._id}>
                                {names.stage(x)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                  {!col.length && <p className={classes.muted}>{t("crmsEmptyStage")}</p>}
                </div>
              );
            })}
          </div>
        </HandleLoading>
      </section>
    </div>
  );
};

export default SalesPipeline;
