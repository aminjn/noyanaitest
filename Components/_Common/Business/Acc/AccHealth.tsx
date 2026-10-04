"use client";

import { useEffect, useRef, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { ExportBar, RangeFilter, rangeQs, SubNav, useAccGet, useAccText, useOpenVoucher, userName, useView } from "./accShared";

// Control (2026-10), after Nexxa's data-health / review / audit: the
// invariants the books must keep (every voucher balanced, the trial
// balance zero, lines only on detail accounts, the balance sheet balanced,
// invoices not overpaid, the asset register within cost) each with how
// many records break it; the audit trail of every change to a hand-typed
// voucher; and Nexxa's calculator.

type Check = { key: string; module: string; ok: boolean; severity: "error" | "warning"; count: number; total: number };
type Audit = { _id: string; voucher: string; number: number; action: string; createdAt: string; by?: { firstName?: string; lastName?: string; phone?: string } | null; before?: { total?: number; description?: string }; after?: { total?: number; description?: string } };

const Health = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { data, error, mutate } = useAccGet<Check[]>("/acc/health", (d) => asArray<Check>(d));
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const list = asArray<Check>(data);
  const bad = list.filter((c) => !c.ok && c.severity === "error").length;
  return (
    <HandleLoading data={!!data} error={error}>
      <div className={acc.bar}>
        <span className={bad ? classes.statusBad : classes.statusOk}>{bad ? t("accHealthBad", [f.money(bad)]) : t("accHealthOk")}</span>
        <button type="button" className={classes.ghost} onClick={() => mutate()}>
          {t("accRecheck")}
        </button>
      </div>
      <div className={acc.health}>
        {list.map((c) => (
          <div key={c.key} className={acc.healthItem}>
            <span className={c.ok ? acc.dotOk : c.severity === "error" ? acc.dotBad : acc.dotWarn} />
            <div>
              <div>{t(`accHealth_${c.key}`)}</div>
              <div className={acc.mutedSmall}>{c.ok ? t("accHealthPass", [f.money(c.total)]) : t("accHealthFail", [f.money(c.count), f.money(c.total)])}</div>
            </div>
          </div>
        ))}
      </div>
    </HandleLoading>
  );
};

const AuditLog = () => {
  const t = useAccText();
  const f = useBizFormat();
  const openVoucher = useOpenVoucher();
  const ref = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 30;
  const { data, error } = useAccGet<{ items: Audit[]; total: number }>(`/acc/audit?${rangeQs(from, to, { action: action || undefined, page: String(page), limit: String(LIMIT) })}`, (d) => {
    const x = (d || {}) as { items?: unknown; total?: number };
    return { items: asArray<Audit>(x.items), total: Number(x.total) || 0 };
  });
  const items = asArray<Audit>(data?.items);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  return (
    <div className={classes.main}>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}>
        <label className={classes.field}>
          <span>{t("accAuditAction")}</span>
          <select value={action} onChange={(e) => (setAction(e.target.value), setPage(1))}>
            <option value="">{t("accAll")}</option>
            {["create", "update", "finalize", "revert", "delete", "attach", "import"].map((a) => (
              <option key={a} value={a}>
                {t(`accAudit_${a}`)}
              </option>
            ))}
          </select>
        </label>
      </RangeFilter>
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: t("accAuditLog"),
          head: [t("accAuditWhen"), t("bizNumber"), t("accAuditAction"), t("accAuditBy"), t("accAuditBefore"), t("accAuditAfter")],
          rows: items.map((a) => [f.date(a.createdAt), a.number, t(`accAudit_${a.action}`), userName(a.by), a.before?.total ?? "", a.after?.total ?? ""]),
        })}
      />
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("accAuditWhen")}</th>
                <th>{t("bizNumber")}</th>
                <th>{t("accAuditAction")}</th>
                <th>{t("accAuditBy")}</th>
                <th className={classes.num}>{t("accAuditBefore")}</th>
                <th className={classes.num}>{t("accAuditAfter")}</th>
              </tr>
            </thead>
            <tbody>
              {!items.length && (
                <tr>
                  <td colSpan={6} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {items.map((a) => (
                <tr key={a._id} className={a.action !== "delete" ? classes.rowLink : undefined} onClick={() => a.action !== "delete" && openVoucher(String(a.voucher))}>
                  <td>{f.date(a.createdAt)}</td>
                  <td>{f.money(a.number)}</td>
                  <td>
                    <span className={`${fin.pill} ${a.action === "delete" ? fin.toneBad : a.action === "finalize" ? fin.toneOk : fin.toneInfo}`}>{t(`accAudit_${a.action}`)}</span>
                  </td>
                  <td>{userName(a.by)}</td>
                  <td className={classes.num}>{a.before?.total !== undefined ? f.money(a.before.total) : "—"}</td>
                  <td className={classes.num}>{a.after?.total !== undefined ? f.money(a.after.total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
      {pages > 1 && (
        <div className={classes.pagination}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("bizPrev")}
          </button>
          <span>{t("bizPage", [f.money(page), f.money(pages)])}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            {t("bizNext")}
          </button>
        </div>
      )}
    </div>
  );
};

// Nexxa's calculator: + − × ÷ and percent, the result copied to the clipboard
export const Calculator = () => {
  const t = useAccText();
  const f = useBizFormat();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const evaluate = (s: string) => {
    // a small parser: numbers and + - * / ( ) only, never eval
    const tokens = s.replace(/[×x]/g, "*").replace(/÷/g, "/").match(/\d+(\.\d+)?|[-+*/()%]/g) || [];
    let i = 0;
    const peek = () => tokens[i];
    const take = () => tokens[i++];
    const factor = (): number => {
      const tk = take();
      if (tk === "(") {
        const v = sum();
        take();
        return v;
      }
      if (tk === "-") return -factor();
      const n = Number(tk);
      if (peek() === "%") {
        take();
        return n / 100;
      }
      return Number.isFinite(n) ? n : 0;
    };
    const product = (): number => {
      let v = factor();
      while (peek() === "*" || peek() === "/") v = take() === "*" ? v * factor() : v / factor();
      return v;
    };
    const sum = (): number => {
      let v = product();
      while (peek() === "+" || peek() === "-") v = take() === "+" ? v + product() : v - product();
      return v;
    };
    try {
      const v = sum();
      return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;
    } catch {
      return null;
    }
  };
  const press = (k: string) => {
    if (k === "C") {
      setExpr("");
      setResult(null);
      return;
    }
    if (k === "=") {
      const v = evaluate(expr);
      setResult(v);
      if (v !== null) navigator.clipboard?.writeText(String(v)).catch(() => undefined);
      return;
    }
    setExpr((e) => e + k);
  };
  const keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "0", "000", "%", "+", "(", ")", "C", "="];
  return (
    <div className={classes.main} style={{ alignItems: "center" }}>
      <div className={acc.calc}>
        <output>{expr || "0"}</output>
        {result !== null && <output>{f.money(result)}</output>}
        {keys.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className={k === "=" ? classes.primary : undefined}>
            {k}
          </button>
        ))}
      </div>
      <p className={acc.mutedSmall}>{t("accCalcHint")}</p>
    </div>
  );
};

const VIEWS = ["health", "audit", "calculator"] as const;

const AccHealth = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const [view, setView] = useView(VIEWS, "health");
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["health", t("accDataHealth")],
          ["audit", t("accAuditLog")],
          ["calculator", t("accCalculator")],
        ]}
      />
      {view === "health" && <Health refreshKey={refreshKey} />}
      {view === "audit" && <AuditLog />}
      {view === "calculator" && <Calculator />}
    </section>
  );
};

export default AccHealth;
