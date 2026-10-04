"use client";

import { useMemo, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { useIntlLocale } from "@/Components/i18n/navigation";
import SparkIcon from "@/Components/Icons/SparkIcon";
import classes from "../../Accounting.module.css";
import { asArray, useBizFormat } from "../../bizShared";
import { useBizAccounts } from "../../AccountingSummary";
import { FinMoney, useFin, useFinText, useMoneyAccounts } from "../finShared";
import ai from "./FinAi.module.css";
import { errorText, isAiOff, useFinAiPost } from "./finAi";

type Line = { id: string; date?: string; amount: number; direction: "in" | "out"; description: string };
type Suggestion = { id: string; account: string; accountName: string; party: string; source: string; confidence: number; matched?: { number: number; date: string } };

// A bank statement (the bank's CSV export or lines pasted from it) ->
// each line with an account suggested from the panel's own past choices
// first, the AI second; a line the books already hold is marked. The lines
// ticked are posted one by one as ordinary receipts and payments.
const BankLines = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const post = useFinAiPost();
  const pushNotification = useNotification();
  const pct = new Intl.NumberFormat(useIntlLocale(), { style: "percent" });
  const { data: money } = useMoneyAccounts();
  const { data: accounts } = useBizAccounts();
  const banks = asArray<FinMoney>(money).filter((m) => m.isActive && (m.kind === "bank" || m.kind === "pos"));
  const [bank, setBank] = useState("");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [sug, setSug] = useState<Record<string, Suggestion>>({});
  const [pick, setPick] = useState<Record<string, string>>({});
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const moneyId = banks.find((b) => b._id === bank) ? bank : banks[0]?._id || "";
  const counters = useMemo(() => asArray<{ _id: string; code: string; name: string; level: string; parentCode?: string; type: string }>(accounts).filter((a) => a.level === "detail" && a.parentCode !== "11"), [accounts]);

  const readFile = (file?: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setCsv(String(r.result || ""));
    r.readAsText(file);
  };
  const suggest = async () => {
    if (!csv.trim()) return;
    setBusy(true);
    try {
      const d = await post<{ lines: Line[]; suggestions: Suggestion[] }>("categorize", { csv, money: moneyId || undefined });
      const ls = asArray<Line>(d?.lines);
      const ss = asArray<Suggestion>(d?.suggestions);
      setLines(ls);
      setSug(Object.fromEntries(ss.map((s) => [s.id, s])));
      setPick(Object.fromEntries(ss.filter((s) => s.account).map((s) => [s.id, s.account])));
      setOn(Object.fromEntries(ss.map((s) => [s.id, !!s.account && !s.matched])));
    } catch (err) {
      pushNotification(isAiOff(err) ? t("faiOff") : errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const postAll = async () => {
    const todo = lines.filter((l) => on[l.id] && pick[l.id]);
    if (!todo.length || !moneyId || saving) return;
    setSaving(true);
    let done = 0;
    for (const l of todo) {
      try {
        await fetcher({
          url: `${API}${api}/payments`,
          method: "POST",
          payload: {
            direction: l.direction,
            date: l.date,
            amount: l.amount,
            method: "transfer",
            money: moneyId,
            against: "account",
            account: pick[l.id],
            party: sug[l.id]?.party || undefined,
            description: l.description.slice(0, 500) || undefined,
          },
        });
        post("learn", { text: l.description, account: pick[l.id] }).catch(() => undefined);
        done++;
        setLines((list) => list.filter((x) => x.id !== l.id));
      } catch (err) {
        pushNotification(`${l.description}: ${errorText(err)}`, "Error");
      }
    }
    setSaving(false);
    if (done) pushNotification(t("faiPostedN", [f.money(done)]), "Success");
  };

  return (
    <section className={classes.card}>
      <span className={classes.cardTitle}>{t("faiBankTitle")}</span>
      <p className={classes.muted}>{t("faiBankHint")}</p>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("faiBankAccount")}</span>
          <select value={moneyId} onChange={(e) => setBank(e.target.value)}>
            {banks.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("faiCsvFile")}</span>
          <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(e) => readFile(e.target.files?.[0])} />
        </label>
      </div>
      <textarea className={ai.textarea} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={t("faiCsvPh")} aria-label={t("faiCsvFile")} dir="auto" />
      <div className={classes.actions} style={{ justifyContent: "flex-start" }}>
        <button type="button" className={`${ai.aiButton} ${ai.aiSolid}`} onClick={suggest} disabled={busy || !csv.trim()} aria-busy={busy}>
          <SparkIcon />
          {busy ? t("faiThinking") : t("faiSuggestAccounts")}
        </button>
      </div>
      {lines.length > 0 && (
        <>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th />
                  <th>{t("bizDate")}</th>
                  <th>{t("bizDescription")}</th>
                  <th className={classes.num}>{t("bizAmount")}</th>
                  <th>{t("faiSuggestedAccount")}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const s = sug[l.id];
                  return (
                    <tr key={l.id}>
                      <td>
                        <input type="checkbox" checked={!!on[l.id]} onChange={(e) => setOn((o) => ({ ...o, [l.id]: e.target.checked }))} aria-label={l.description} />
                      </td>
                      <td>{l.date ? f.date(l.date) : "—"}</td>
                      <td className={classes.wrap}>
                        {l.description || "—"}
                        {!!s?.matched && <div className={ai.note}>{t("faiInBooks", [f.year(s.matched.number), f.date(s.matched.date)])}</div>}
                      </td>
                      <td className={`${classes.num} ${l.direction === "out" ? classes.negative : classes.positive}`}>
                        {l.direction === "out" ? "−" : "+"}
                        {f.money(l.amount)}
                      </td>
                      <td>
                        <select value={pick[l.id] || ""} onChange={(e) => setPick((p) => ({ ...p, [l.id]: e.target.value }))} aria-label={t("faiSuggestedAccount")}>
                          <option value="">{t("bizSelect")}</option>
                          {counters
                            .filter((a) => (l.direction === "in" ? a.type !== "expense" : a.type !== "income"))
                            .map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.code} · {a.name}
                              </option>
                            ))}
                        </select>
                        {!!s && s.source !== "none" && (
                          <div className={ai.note}>
                            {t(s.source === "ai" ? "faiSrcAi" : "faiSrcHistory")} · {pct.format(s.confidence || 0)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canWrite && (
            <div className={classes.actions}>
              <button type="button" className={classes.primary} disabled={saving || !lines.some((l) => on[l.id] && pick[l.id])} onClick={postAll}>
                {t("faiPostSelected")}
              </button>
            </div>
          )}
          <p className={ai.note}>{t("faiReviewNote")}</p>
        </>
      )}
    </section>
  );
};

export default BankLines;
