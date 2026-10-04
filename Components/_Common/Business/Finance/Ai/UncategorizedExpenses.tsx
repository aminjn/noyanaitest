"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useNotification from "@/Components/Hooks/useNotification";
import SparkIcon from "@/Components/Icons/SparkIcon";
import classes from "../../Accounting.module.css";
import { asArray, useBizFormat } from "../../bizShared";
import { useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { errorText, isAiOff, useFinAiPost } from "./finAi";

type Acc = { _id: string; code: string; name: string; role?: string };
type Row = { _id: string; number: number; date: string; vendor?: string; description?: string; total: number };
type Suggestion = { id: string; account: string; accountName: string; source: "memory" | "history" | "ai" | "none"; confidence: number };

// Expenses booked to «سایر هزینه‌ها», each with a kind suggested from the
// panel's own past choices first and the AI second; «اعمال» moves it (a
// small voucher from «سایر» to the kind chosen), row by row.
const UncategorizedExpenses = ({ onChanged }: { onChanged: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const post = useFinAiPost();
  const pushNotification = useNotification();
  const pct = new Intl.NumberFormat(useIntlLocale(), { style: "percent" });
  const { data: accounts } = useSWR<Acc[]>(`${API}${api}/expense-accounts`, (url: string) => fetcher({ url }).then((res) => asArray<Acc>(res.data)));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [src, setSrc] = useState<Record<string, Suggestion>>({});
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState("");
  const kinds = asArray<Acc>(accounts).filter((a) => a.role !== "otherExpense");

  const load = async () => {
    setBusy(true);
    try {
      const d = await post<{ items: Row[]; suggestions: Suggestion[] }>("uncategorized", { ai: true });
      const items = asArray<Row>(d?.items);
      const sug = asArray<Suggestion>(d?.suggestions);
      setRows(items);
      setPick(Object.fromEntries(sug.filter((s) => s.account).map((s) => [s.id, s.account])));
      setSrc(Object.fromEntries(sug.map((s) => [s.id, s])));
    } catch (err) {
      pushNotification(isAiOff(err) ? t("faiOff") : errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const apply = async (r: Row) => {
    const account = pick[r._id];
    if (!account) return;
    setSaving(r._id);
    try {
      await post("reclassify", { expense: r._id, account });
      pushNotification(t("bizSaved"), "Success");
      setRows((list) => (list || []).filter((x) => x._id !== r._id));
      onChanged();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setSaving("");
    }
  };

  if (rows === null)
    return (
      <div className={classes.actions} style={{ justifyContent: "flex-start" }}>
        <button type="button" className={ai.aiButton} onClick={load} disabled={busy} aria-busy={busy}>
          <SparkIcon />
          {busy ? t("faiThinking") : t("faiSuggestKinds")}
        </button>
      </div>
    );
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("faiUncatTitle")}</span>
        <button type="button" className={classes.ghost} onClick={() => setRows(null)}>
          {t("faiClose")}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className={classes.empty}>{t("faiUncatEmpty")}</p>
      ) : (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizDate")}</th>
                <th>{t("finVendor")}</th>
                <th className={classes.num}>{t("bizTotal")}</th>
                <th>{t("faiSuggestedKind")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = src[r._id];
                return (
                  <tr key={r._id}>
                    <td>{f.date(r.date)}</td>
                    <td className={classes.wrap}>
                      {r.vendor || "—"}
                      {!!r.description && <span className={classes.muted}> · {r.description}</span>}
                    </td>
                    <td className={classes.num}>{f.money(r.total)}</td>
                    <td>
                      <select value={pick[r._id] || ""} onChange={(e) => setPick((p) => ({ ...p, [r._id]: e.target.value }))} aria-label={t("faiSuggestedKind")}>
                        <option value="">{t("bizSelect")}</option>
                        {kinds.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      {!!s && s.source !== "none" && (
                        <div className={classes.muted} style={{ fontSize: "0.6875rem" }}>
                          {t(s.source === "ai" ? "faiSrcAi" : "faiSrcHistory")} · {pct.format(s.confidence || 0)}
                        </div>
                      )}
                    </td>
                    <td>
                      <button type="button" className={classes.ghost} disabled={!pick[r._id] || saving === r._id} onClick={() => apply(r)}>
                        {t("faiApply")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className={classes.muted}>{t("faiUncatNote")}</p>
    </section>
  );
};

export default UncategorizedExpenses;
