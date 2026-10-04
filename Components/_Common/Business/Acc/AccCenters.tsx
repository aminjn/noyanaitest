"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, isoDay, useBiz, useBizFormat } from "../bizShared";
import { CostCenters } from "../AccountingReports";
import { ConfirmButton, monthStart, RangeFilter, SimplePopup, SubNav, useAccCall, useAccGet, useAccPopup, useAccText, useView } from "./accShared";

// Cost centres and cost allocation (2026-10), after Nexxa's
// accounting/cost-centers (a tree with codes from 50001, no loops, no
// delete with history or children) and accounting/cost-allocation (a
// source centre's net expense moved to target centres by percent, in one
// voucher per period - each account's total unchanged). The income /
// expense / profit report of every centre is the third view.

type Center = { _id: string; name: string; code?: string; parent?: string | null; description?: string; isActive: boolean };
type Alloc = { _id: string; title: string; source: string; lines: { target: string; percent: number }[]; lastRunAt?: string };

const CenterForm = ({ center, centers, onDone }: { center?: Center; centers: Center[]; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [name, setName] = useState(center?.name || "");
  const [code, setCode] = useState(center?.code || "");
  const [parent, setParent] = useState(center?.parent || "");
  const [description, setDescription] = useState(center?.description || "");
  const [isActive, setActive] = useState(center?.isActive !== false);
  const save = async () => {
    const payload = { name: name.trim(), code: code.trim() || undefined, parent: parent || null, description, isActive };
    const res = center ? await call(`/acc/centers/${center._id}`, "PATCH", payload) : await call("/acc/centers", "POST", payload);
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={center ? center.name : t("bizNewCostCenter")}>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("bizName")}</span>
          <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accCodeOptional")}</span>
          <input value={code} dir="ltr" maxLength={20} onChange={(e) => setCode(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accParentCenter")}</span>
          <select value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">{t("accNoParent")}</option>
            {centers
              .filter((c) => c._id !== center?._id)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code ? `${c.code} · ` : ""}
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accAccountDescription")}</span>
          <input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      {center && (
        <label className={fin.check} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} />
          {t("accActive")}
        </label>
      )}
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={name.trim().length < 2} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const Tree = () => {
  const t = useAccText();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = useAccGet<Center[]>("/acc/centers", (d) => asArray<Center>(d));
  const centers = asArray<Center>(data);
  // depth-first, a parent before its children
  const ordered: { c: Center; depth: number }[] = [];
  const walk = (pid: string | null, depth: number, seen: Set<string>) => {
    for (const c of centers.filter((x) => (x.parent || null) === pid)) {
      if (seen.has(c._id)) continue;
      seen.add(c._id);
      ordered.push({ c, depth });
      walk(c._id, depth + 1, seen);
    }
  };
  walk(null, 0, new Set());
  for (const c of centers) if (!ordered.some((o) => o.c._id === c._id)) ordered.push({ c, depth: 0 });
  return (
    <HandleLoading data={!!data} error={error}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accCentersTreeHint")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open("AccCenterForm", <CenterForm centers={centers} onDone={() => mutate()} />)}>
            {t("bizNewCostCenter")}
          </button>
        )}
      </div>
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("bizCode")}</th>
              <th>{t("bizName")}</th>
              <th>{t("accAccountDescription")}</th>
              {canWrite && <th />}
            </tr>
          </thead>
          <tbody>
            {!ordered.length && (
              <tr>
                <td colSpan={4} className={classes.empty}>
                  {t("bizEmpty")}
                </td>
              </tr>
            )}
            {ordered.map(({ c, depth }) => (
              <tr key={c._id} style={{ opacity: c.isActive ? 1 : 0.55 }}>
                <td>{c.code || "—"}</td>
                <td className={`${classes.wrap} ${depth === 1 ? acc.depth1 : depth >= 2 ? acc.depth2 : ""}`}>{c.name}</td>
                <td className={classes.wrap}>{c.description || "—"}</td>
                {canWrite && (
                  <td>
                    <div className={fin.rowActions}>
                      <button type="button" onClick={() => open("AccCenterForm", <CenterForm center={c} centers={centers} onDone={() => mutate()} />)}>
                        {t("bizEdit")}
                      </button>
                      <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/centers/${c._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HandleLoading>
  );
};

const AllocForm = ({ alloc, centers, onDone }: { alloc?: Alloc; centers: Center[]; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [title, setTitle] = useState(alloc?.title || "");
  const [source, setSource] = useState(alloc?.source || "");
  const [lines, setLines] = useState<{ target: string; percent: string }[]>(alloc?.lines.map((l) => ({ target: String(l.target), percent: String(l.percent) })) || [{ target: "", percent: "" }]);
  const sum = lines.reduce((s, l) => s + (Number(l.percent) || 0), 0);
  const save = async () => {
    const res = await call("/acc/allocations", "POST", { id: alloc?._id, title, source, lines: lines.map((l) => ({ target: l.target, percent: Number(l.percent) || 0 })) });
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={alloc ? alloc.title : t("accNewAllocation")}>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("accAllocTitle")}</span>
          <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accAllocSource")}</span>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {centers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {lines.map((l, i) => (
        <div key={i} className={classes.form}>
          <label className={classes.field}>
            <span>{t("accAllocTarget")}</span>
            <select value={l.target} onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))}>
              <option value="">{t("bizSelect")}</option>
              {centers
                .filter((c) => c._id !== source)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <label className={classes.field}>
            <span>{t("accPercent")}</span>
            <input value={l.percent} dir="ltr" inputMode="decimal" onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, percent: e.target.value } : x)))} />
          </label>
        </div>
      ))}
      <div className={acc.tools}>
        <button type="button" onClick={() => setLines((p) => [...p, { target: "", percent: "" }])}>
          {t("bizAddLine")}
        </button>
        <span className={Math.abs(sum - 100) < 0.01 ? classes.statusOk : classes.statusBad}>{t("accPercentSum", [String(sum)])}</span>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={!title.trim() || !source} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const Allocations = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data: cData } = useAccGet<Center[]>("/acc/centers", (d) => asArray<Center>(d));
  const centers = asArray<Center>(cData).filter((c) => c.isActive);
  const { data, error, mutate } = useAccGet<Alloc[]>("/acc/allocations", (d) => asArray<Alloc>(d));
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(new Date());
  const name = (id: string) => centers.find((c) => c._id === String(id))?.name || "—";
  return (
    <HandleLoading data={!!data} error={error}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accAllocHint")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} disabled={centers.length < 2} onClick={() => open("AccAllocForm", <AllocForm centers={centers} onDone={() => mutate()} />)}>
            {t("accNewAllocation")}
          </button>
        )}
      </div>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("accAllocTitle")}</th>
              <th>{t("accAllocSource")}</th>
              <th>{t("accAllocTargets")}</th>
              <th>{t("accLastRun")}</th>
              {canWrite && <th />}
            </tr>
          </thead>
          <tbody>
            {!asArray(data).length && (
              <tr>
                <td colSpan={5} className={classes.empty}>
                  {t("bizEmpty")}
                </td>
              </tr>
            )}
            {asArray<Alloc>(data).map((a) => (
              <tr key={a._id}>
                <td className={classes.wrap}>{a.title}</td>
                <td>{name(a.source)}</td>
                <td className={classes.wrap}>{a.lines.map((l) => `${name(l.target)} ${f.money(l.percent)}٪`).join("، ")}</td>
                <td>{a.lastRunAt ? f.date(a.lastRunAt) : "—"}</td>
                {canWrite && (
                  <td>
                    <div className={fin.rowActions}>
                      <button type="button" onClick={async () => (await call(`/acc/allocations/${a._id}/run`, "POST", { from: from ? isoDay(from) : undefined, to: to ? isoDay(to) : undefined }, t("accAllocDone"))) && mutate()}>
                        {t("accRunAllocation")}
                      </button>
                      <button type="button" onClick={() => open("AccAllocForm", <AllocForm alloc={a} centers={centers} onDone={() => mutate()} />)}>
                        {t("bizEdit")}
                      </button>
                      <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/allocations/${a._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HandleLoading>
  );
};

const Report = ({ refreshKey }: { refreshKey: number }) => {
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(null);
  return (
    <>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <CostCenters from={from} to={to} refreshKey={refreshKey} />
    </>
  );
};

const VIEWS = ["report", "tree", "allocation"] as const;

const AccCenters = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const [view, setView] = useView(VIEWS, "report");
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["report", t("accCentersReport")],
          ["tree", t("bizCostCenters")],
          ["allocation", t("accAllocation")],
        ]}
      />
      {view === "report" && <Report refreshKey={refreshKey} />}
      {view === "tree" && <Tree />}
      {view === "allocation" && <Allocations />}
    </section>
  );
};

export default AccCenters;
