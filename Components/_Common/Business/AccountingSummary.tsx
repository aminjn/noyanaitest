"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "./Accounting.module.css";
import CostCenterSelect from "./CostCenterSelect";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat, useBizText } from "./bizShared";

type Summary = {
  cash: number;
  noyanWallet: number;
  noyanPending: number;
  receivable: number;
  payable: number;
  monthIncome: number;
  monthExpense: number;
  monthProfit: number;
  months: { month: string; income: number; expense: number }[];
};

export const useBizAccounts = () => {
  const { api } = useBiz();
  return useSWR<BizAccount[]>(`${API}${api}/accounts`, (url: string) =>
    fetcher({ url }).then((res) => asArray<BizAccount>(res.data)),
  );
};

// The everyday entry (2026-10): an expense paid, an income received or money
// moved between cash, bank and the Noyan wallet - one balanced voucher, no
// debit/credit knowledge needed. The full voucher form is for the rest.
const QuickEntry = ({ accounts, onDone }: { accounts: BizAccount[]; onDone: () => unknown }) => {
  const t = useBizText();
  const { api } = useBiz();
  const pushNotification = useNotification();
  const [kind, setKind] = useState<"expense" | "income" | "transfer">("expense");
  const [account, setAccount] = useState("");
  const [via, setVia] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [center, setCenter] = useState("");
  const [busy, setBusy] = useState(false);

  const details = accounts.filter((a) => a.level === "detail");
  const money = details.filter((a) => a.type === "asset" && ["cash", "bank", "noyanWallet"].includes(a.role || ""));
  const targets =
    kind === "transfer"
      ? money
      : details.filter((a) => a.type === (kind === "expense" ? "expense" : "income"));

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/quick`,
        method: "POST",
        payload: {
          // a transfer is an "expense" of the target paid from the source:
          // the API books it as debit target / credit source
          kind: kind === "transfer" ? "transfer" : kind,
          account,
          via,
          amount: Number(amount.replace(/[^\d.]/g, "")),
          date: isoDay(date),
          description: description.trim(),
          center: kind === "transfer" ? undefined : center || undefined,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      setAmount("");
      setDescription("");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("bizQuickTitle")}</span>
        <div className={classes.segmented} role="tablist">
          {(["expense", "income", "transfer"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={kind === k ? classes.on : ""}
              onClick={() => {
                setKind(k);
                setAccount("");
              }}
            >
              {t(k === "expense" ? "bizQuickExpense" : k === "income" ? "bizQuickIncome" : "bizQuickTransfer")}
            </button>
          ))}
        </div>
      </div>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t(kind === "transfer" ? "bizTransferTo" : "bizAccount")}</span>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {targets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} · {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          <span>{t(kind === "income" ? "bizReceivedIn" : kind === "transfer" ? "bizTransferFrom" : "bizPaidFrom")}</span>
          <select value={via} onChange={(e) => setVia(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {money.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("bizAmount")}</span>
          <input inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        {kind !== "transfer" && <CostCenterSelect value={center} onChange={setCenter} />}
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className={classes.actions}>
        <button
          type="button"
          className={classes.primary}
          disabled={busy || !account || !via || !Number(amount.replace(/[^\d.]/g, "")) || description.trim().length < 2}
          onClick={submit}
        >
          {t("bizSave")}
        </button>
      </div>
    </section>
  );
};

const AccountingSummary = ({ onChanged }: { onChanged: () => unknown }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { api, canWrite } = useBiz();
  const { data, error, mutate } = useSWR<Summary>(`${API}${api}/summary`, (url: string) =>
    fetcher({ url }).then((res) => res.data as Summary),
  );
  const { data: accounts, mutate: refreshAccounts } = useBizAccounts();
  const max = useMemo(
    () => Math.max(1, ...asArray<Summary["months"][number]>(data?.months).flatMap((m) => [m.income, m.expense])),
    [data],
  );
  const toman = t("toman");

  const tile = (label: string, value: number, opts?: { primary?: boolean; sign?: boolean }) => (
    <div className={`${classes.tile} ${opts?.primary ? classes.primaryTile : ""}`}>
      <span className={classes.tileLabel}>{label}</span>
      <span className={`${classes.tileValue} ${opts?.sign ? (value < 0 ? classes.negative : classes.positive) : ""}`}>
        {f.signed(value)}
        <span className={classes.tileUnit}>{toman}</span>
      </span>
    </div>
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.tiles}>
            {tile(t("bizMonthProfit"), data.monthProfit, { primary: true })}
            {tile(t("bizMonthIncome"), data.monthIncome)}
            {tile(t("bizMonthExpense"), data.monthExpense)}
            {tile(t("bizCash"), data.cash)}
            {api.includes("/admin/") ? null : tile(t("bizNoyanWallet"), data.noyanWallet)}
            {api.includes("/admin/") ? null : tile(t("bizNoyanPending"), data.noyanPending)}
          </div>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("bizChartTitle")}</span>
              <span className={classes.legend}>
                <span>
                  <i className={classes.dot} style={{ background: "var(--primary6)" }} />
                  {t("bizIncome")}
                </span>
                <span>
                  <i className={classes.dot} style={{ background: "var(--warningS2, var(--warning))" }} />
                  {t("bizExpense")}
                </span>
              </span>
            </div>
            <div className={classes.chart} role="img" aria-label={t("bizChartTitle")}>
              {asArray<Summary["months"][number]>(data.months).map((m) => (
                <div key={m.month} className={classes.barCol}>
                  <div className={classes.bars}>
                    <div
                      className={classes.barIncome}
                      title={`${t("bizIncome")}: ${f.money(m.income)}`}
                      style={{ height: `${(Math.max(0, m.income) / max) * 100}%` }}
                    />
                    <div
                      className={classes.barExpense}
                      title={`${t("bizExpense")}: ${f.money(m.expense)}`}
                      style={{ height: `${(Math.max(0, m.expense) / max) * 100}%` }}
                    />
                  </div>
                  <span className={classes.barLabel}>{f.month(m.month)}</span>
                </div>
              ))}
            </div>
          </section>

          {canWrite && !!accounts && (
            <QuickEntry
              accounts={accounts}
              onDone={() => {
                mutate();
                refreshAccounts();
                onChanged();
              }}
            />
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default AccountingSummary;
