"use client";

import { useRef, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, useBiz, useBizFormat } from "../bizShared";
import { parseAmount } from "../Finance/finShared";
import { ExportBar, MoneySelect, SimplePopup, SubNav, useAccCall, useAccGet, useAccPopup, useAccText, useView } from "./accShared";
import { LedgerView } from "./AccBooks";

// Settlements (لیست تسویه, 2026-10), after Nexxa's accounting/settlements:
// the open invoices with their age past due (current, 1-30, 31-60, older)
// and one receipt spread over a patient's invoices (Nexxa
// recordCustomerReceipt); and what is owed to each supplier, distributor,
// doctor or provider (the تفصیلی balances of the payables), each opening
// its own ledger.

type Rec = { _id: string; number: number; date: string; dueDate?: string; name: string; phone?: string; total: number; paid: number; remaining: number; days: number; bucket: string };
type Pay = { _id: string; name: string; code?: string; balance: number };
type Data = { receivables: Rec[]; totalReceivable: number; overdue: number; payables: Pay[]; totalPayable: number };

const ReceiptForm = ({ rows, onDone }: { rows: Rec[]; onDone: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [money, setMoney] = useState("");
  const [method, setMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [total, setTotal] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  // the total spread oldest first (Nexxa's default allocation)
  const spread = (v: string) => {
    setTotal(v);
    let left = parseAmount(v);
    const next: Record<string, string> = {};
    for (const r of rows) {
      const a = Math.min(left, r.remaining);
      next[r._id] = a > 0 ? String(a) : "";
      left -= a;
    }
    setAmounts(next);
  };
  const allocated = rows.reduce((s, r) => s + parseAmount(amounts[r._id] || ""), 0);
  return (
    <SimplePopup title={t("accReceiptFor", [rows[0]?.name || ""])} wide>
      <div className={classes.form}>
        <MoneySelect value={money} onChange={setMoney} />
        <label className={classes.field}>
          <span>{t("finMethod")}</span>
          <select value={method} onChange={(e) => setMethod(e.target.value as "cash")}>
            <option value="cash">{t("finMethodCash")}</option>
            <option value="card">{t("finMethodCard")}</option>
            <option value="transfer">{t("finMethodTransfer")}</option>
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accReceiptTotal")}</span>
          <input inputMode="numeric" dir="ltr" value={total} onChange={(e) => spread(e.target.value)} />
        </label>
      </div>
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("bizNumber")}</th>
              <th>{t("bizDate")}</th>
              <th className={classes.num}>{t("accRemaining")}</th>
              <th className={classes.num}>{t("accAllocate")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>{f.money(r.number)}</td>
                <td>{f.date(r.date)}</td>
                <td className={classes.num}>{f.money(r.remaining)}</td>
                <td className={classes.num}>
                  <input style={{ width: "8rem" }} inputMode="numeric" dir="ltr" value={amounts[r._id] || ""} onChange={(e) => setAmounts((p) => ({ ...p, [r._id]: e.target.value }))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={classes.cardHead}>
        <span className={classes.muted}>{t("accAllocated", [f.money(allocated)])}</span>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup()}>
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={!money || !allocated}
            onClick={async () => {
              const res = await call("/acc/settlements/receipt", "POST", {
                money,
                method,
                allocations: rows.map((r) => ({ invoice: r._id, amount: Math.min(r.remaining, parseAmount(amounts[r._id] || "")) })).filter((a) => a.amount > 0),
              });
              if (res) {
                closePopup();
                onDone();
              }
            }}
          >
            {t("bizSave")}
          </button>
        </div>
      </div>
    </SimplePopup>
  );
};

const AccSettlements = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useView(["receivables", "payables"] as const, "receivables");
  const { data, error, mutate } = useAccGet<Data | null>("/acc/settlements", (d) => (d && typeof d === "object" ? (d as Data) : null));
  const rec = asArray<Rec>(data?.receivables);
  const pay = asArray<Pay>(data?.payables);
  const tone = (b: string) => (b === "current" ? fin.toneMuted : b === "d30" ? fin.toneWarn : fin.toneBad);
  const byPatient = (name: string) => rec.filter((r) => r.name === name);
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["receivables", t("accReceivables")],
          ["payables", t("accPayables")],
        ]}
      />
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accTotalReceivable")}</span>
                <span className={classes.tileValue}>{f.money(data.totalReceivable)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accOverdueInvoices")}</span>
                <span className={classes.tileValue}>{f.money(data.overdue)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accTotalPayable")}</span>
                <span className={classes.tileValue}>{f.money(data.totalPayable)}</span>
              </div>
            </div>
            {view === "receivables" ? (
              <>
                <ExportBar
                  printRef={ref}
                  sheet={() => ({
                    title: t("accReceivables"),
                    head: [t("bizNumber"), t("bizDate"), t("accParty"), t("bizTotal"), t("accPaid"), t("accRemaining"), t("accAge")],
                    rows: rec.map((r) => [r.number, f.date(r.date), r.name, r.total, r.paid, r.remaining, t(`accAge_${r.bucket}`)]),
                  })}
                />
                <div className={classes.tableWrap} ref={ref}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizNumber")}</th>
                        <th>{t("bizDate")}</th>
                        <th>{t("accParty")}</th>
                        <th className={classes.num}>{t("accRemaining")}</th>
                        <th>{t("accAge")}</th>
                        {canWrite && <th />}
                      </tr>
                    </thead>
                    <tbody>
                      {!rec.length && (
                        <tr>
                          <td colSpan={6} className={classes.empty}>
                            {t("bizEmpty")}
                          </td>
                        </tr>
                      )}
                      {rec.map((r) => (
                        <tr key={r._id}>
                          <td>{f.money(r.number)}</td>
                          <td>{f.date(r.date)}</td>
                          <td className={classes.wrap}>{r.name}</td>
                          <td className={classes.num}>{f.money(r.remaining)}</td>
                          <td>
                            <span className={`${fin.pill} ${tone(r.bucket)}`}>{t(`accAge_${r.bucket}`)}</span>
                          </td>
                          {canWrite && (
                            <td>
                              <div className={fin.rowActions}>
                                <button type="button" onClick={() => open("AccReceipt", <ReceiptForm rows={byPatient(r.name)} onDone={() => mutate()} />)}>
                                  {t("accReceive")}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <ExportBar printRef={ref} sheet={() => ({ title: t("accPayables"), head: [t("bizCode"), t("accParty"), t("bizBalance")], rows: pay.map((p) => [p.code || "", p.name, p.balance]) })} />
                <div className={classes.tableWrap} ref={ref}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizCode")}</th>
                        <th>{t("accParty")}</th>
                        <th className={classes.num}>{t("accOwed")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!pay.length && (
                        <tr>
                          <td colSpan={3} className={classes.empty}>
                            {t("bizEmpty")}
                          </td>
                        </tr>
                      )}
                      {pay.map((p) => (
                        <tr key={p._id} className={classes.rowLink} onClick={() => open("AccLedger", <SimplePopup title={t("accStatementOf", [p.name])} wide><LedgerView fixed={{ party: p._id, partyName: p.name }} /></SimplePopup>)}>
                          <td>{p.code || "—"}</td>
                          <td className={classes.wrap}>{p.name}</td>
                          <td className={classes.num}>{f.money(p.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={acc.mutedSmall}>{t("accPayablesHint")}</p>
              </>
            )}
          </>
        )}
      </HandleLoading>
    </section>
  );
};

export default AccSettlements;
