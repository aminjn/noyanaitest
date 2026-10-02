"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "./Accounting.module.css";
import { asArray, BizAccount, BizContext, isoDay, useBiz, useBizFormat, useBizText } from "./bizShared";
import { useBizAccounts } from "./AccountingSummary";

type LedgerData = {
  account: BizAccount;
  opening: number;
  closing: number;
  total: number;
  items: {
    _id: string;
    number: number;
    date: string;
    description: string;
    label?: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
};

const LIMIT = 30;

// One account's lines with the running balance, over a period.
export const Ledger = ({ account }: { account: BizAccount }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { api } = useBiz();
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ account: account._id, page: String(page), limit: String(LIMIT) });
  if (from) params.set("from", isoDay(from));
  if (to) params.set("to", isoDay(to));
  const { data, error } = useSWR<LedgerData>(`${API}${api}/ledger?${params}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as LedgerData),
  );
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));

  return (
    <div className={classes.popup}>
      <div className={classes.form}>
        <div className={classes.field}>
          <DateInput title={t("bizFrom")} defaultValue={from || undefined} onChange={(d) => { setFrom(d); setPage(1); }} />
        </div>
        <div className={classes.field}>
          <DateInput title={t("bizTo")} defaultValue={to || undefined} onChange={(d) => { setTo(d); setPage(1); }} />
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("bizOpening")}</span>
                <span className={classes.tileValue}>{f.signed(data.opening)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("bizClosing")}</span>
                <span className={classes.tileValue}>{f.signed(data.closing)}</span>
              </div>
            </div>
            {asArray(data.items).length === 0 ? (
              <p className={classes.empty}>{t("bizEmpty")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizDate")}</th>
                      <th>{t("bizNumber")}</th>
                      <th>{t("bizDescription")}</th>
                      <th className={classes.num}>{t("bizDebit")}</th>
                      <th className={classes.num}>{t("bizCredit")}</th>
                      <th className={classes.num}>{t("bizBalance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((l, i) => (
                      <tr key={`${l._id}-${i}`}>
                        <td>{f.date(l.date)}</td>
                        <td>{f.money(l.number)}</td>
                        <td className={classes.wrap}>{l.label || l.description}</td>
                        <td className={classes.num}>{l.debit ? f.money(l.debit) : ""}</td>
                        <td className={classes.num}>{l.credit ? f.money(l.credit) : ""}</td>
                        <td className={classes.num}>{f.signed(l.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
          </>
        )}
      </HandleLoading>
    </div>
  );
};

const LedgerPopup = ({ ctx, account }: { ctx: { api: string; canWrite: boolean }; account: BizAccount }) => {
  const t = useBizText();
  return (
    <BizContext.Provider value={ctx}>
      <PopupCard title={t("bizLedgerTitle", [`${account.code} · ${account.name}`])}>
        <Ledger account={account} />
      </PopupCard>
    </BizContext.Provider>
  );
};

// add a detail account under a total, or rename one
const AccountFormPopup = ({
  ctx,
  totals,
  account,
  onDone,
}: {
  ctx: { api: string; canWrite: boolean };
  totals: BizAccount[];
  account?: BizAccount;
  onDone: () => unknown;
}) => {
  const t = useBizText();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState(account?.name || "");
  const [parent, setParent] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const call = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      pushNotification(t("bizSaved"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={account ? t("bizRename") : t("bizAddAccount")}>
      <div className={classes.popup} style={{ width: "min(32rem, 92vw)" }}>
        {!account && (
          <label className={classes.field}>
            <span>{t("bizParent")}</span>
            <select value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {totals.map((a) => (
                <option key={a._id} value={a.code}>
                  {a.code} · {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={classes.field}>
          <span>{t("bizName")}</span>
          <input value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className={classes.actions}>
          {!!account && !account.role && (
            confirm ? (
              <button
                type="button"
                className={classes.danger}
                disabled={busy}
                onClick={() => call(() => fetcher({ url: `${API}${ctx.api}/accounts/${account._id}`, method: "DELETE" }))}
              >
                {t("bizDeleteAccountConfirm")}
              </button>
            ) : (
              <button type="button" className={classes.danger} onClick={() => setConfirm(true)}>
                {t("bizDelete")}
              </button>
            )
          )}
          <button type="button" className={classes.ghost} onClick={() => closePopup()}>
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={busy || name.trim().length < 2 || (!account && !parent)}
            onClick={() =>
              call(() =>
                account
                  ? fetcher({ url: `${API}${ctx.api}/accounts/${account._id}`, method: "PATCH", payload: { name: name.trim() } })
                  : fetcher({ url: `${API}${ctx.api}/accounts`, method: "POST", payload: { parentCode: parent, name: name.trim() } }),
              )
            }
          >
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// The chart of accounts with each account's balance; a click opens its
// ledger. Group and total rows roll up their children.
const AccountingAccounts = ({ refreshKey }: { refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const ctx = useBiz();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useBizAccounts();
  const [hideEmpty, setHideEmpty] = useState(false);
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const rows = asArray<BizAccount>(data);
  const totals = rows.filter((a) => a.level === "total");
  const shown = hideEmpty ? rows.filter((a) => a.level !== "detail" || a.balance !== 0 || a.pD || a.pC) : rows;

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <label className={classes.muted} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
          {t("bizHideEmpty")}
        </label>
        {ctx.canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() => setPopup("BizAccountForm", <AccountFormPopup ctx={ctx} totals={totals} onDone={() => mutate()} />)}
          >
            {t("bizAddAccount")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("bizName")}</th>
                <th className={classes.num}>{t("bizBalance")}</th>
                {ctx.canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr
                  key={a._id}
                  className={`${a.level === "group" ? classes.groupRow : a.level === "total" ? classes.totalRow : ""} ${classes.rowLink}`}
                  onClick={() => setPopup("BizLedger", <LedgerPopup ctx={ctx} account={a} />)}
                >
                  <td>{a.code}</td>
                  <td className={`${classes.wrap} ${a.level === "total" ? classes.indent1 : a.level === "detail" ? classes.indent2 : ""}`}>
                    {a.name}
                    {!!a.role && a.level === "detail" && <span className={classes.badge} style={{ marginInlineStart: "0.5rem" }}>{t("bizSystem")}</span>}
                  </td>
                  <td className={classes.num}>{f.signed(a.balance)}</td>
                  {ctx.canWrite && (
                    <td>
                      {a.level === "detail" && (
                        <button
                          type="button"
                          className={classes.ghost}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopup("BizAccountForm", <AccountFormPopup ctx={ctx} totals={totals} account={a} onDone={() => mutate()} />);
                          }}
                        >
                          {t("bizEdit")}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

export default AccountingAccounts;
