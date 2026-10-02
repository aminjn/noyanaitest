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
import {
  asArray,
  BizAccount,
  BizContext,
  BizVoucher,
  isoDay,
  useBiz,
  useBizFormat,
  useBizText,
} from "./bizShared";
import { useBizAccounts } from "./AccountingSummary";

type Line = { account: string; label: string; debit: string; credit: string };
const emptyLine = (): Line => ({ account: "", label: "", debit: "", credit: "" });
const toNum = (s: string) => Number(String(s).replace(/[^\d.]/g, "")) || 0;

const kindBadge = (kind: BizVoucher["kind"]) =>
  kind === "manual" ? "badgeManual" : kind === "auto" ? "badgeAuto" : "";

// The full voucher form: any number of lines, each on a detail account,
// saved only when debits equal credits (the API checks again).
const VoucherFormPopup = ({
  ctx,
  accounts,
  voucher,
  onDone,
}: {
  ctx: { api: string; canWrite: boolean };
  accounts: BizAccount[];
  voucher?: BizVoucher;
  onDone: () => unknown;
}) => (
  // the popup renders outside the page tree: give it the page's context
  <BizContext.Provider value={ctx}>
    <VoucherForm accounts={accounts} voucher={voucher} onDone={onDone} />
  </BizContext.Provider>
);

const VoucherForm = ({
  accounts,
  voucher,
  onDone,
}: {
  accounts: BizAccount[];
  voucher?: BizVoucher;
  onDone: () => unknown;
}) => {
  const t = useBizText();
  const f = useBizFormat();
  const { api } = useBiz();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const details = accounts.filter((a) => a.level === "detail");
  const [date, setDate] = useState<Date>(voucher ? new Date(voucher.date) : new Date());
  const [description, setDescription] = useState(voucher?.description || "");
  const [lines, setLines] = useState<Line[]>(
    voucher
      ? voucher.lines.map((l) => ({
          account: typeof l.account === "object" && l.account ? l.account._id : String(l.account || ""),
          label: l.label || "",
          debit: l.debit ? String(l.debit) : "",
          credit: l.credit ? String(l.credit) : "",
        }))
      : [emptyLine(), emptyLine()],
  );
  const [busy, setBusy] = useState(false);
  const debit = lines.reduce((s, l) => s + toNum(l.debit), 0);
  const credit = lines.reduce((s, l) => s + toNum(l.credit), 0);
  const balanced = debit > 0 && Math.abs(debit - credit) < 0.01;

  const set = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const save = async () => {
    if (busy || !balanced) return;
    setBusy(true);
    try {
      await fetcher({
        url: voucher ? `${API}${api}/vouchers/${voucher._id}` : `${API}${api}/vouchers`,
        method: voucher ? "PATCH" : "POST",
        payload: {
          date: isoDay(date),
          description: description.trim(),
          lines: lines
            .filter((l) => l.account && (toNum(l.debit) || toNum(l.credit)))
            .map((l) => ({ account: l.account, label: l.label.trim() || undefined, debit: toNum(l.debit), credit: toNum(l.credit) })),
        },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={voucher ? t("bizVoucherTitle", [f.money(voucher.number)]) : t("bizNewVoucher")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
          <label className={`${classes.field} ${classes.wide}`}>
            <span>{t("bizDescription")}</span>
            <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <div className={classes.lines}>
          <div className={`${classes.lineRow} ${classes.lineHead}`}>
            <span>{t("bizAccount")}</span>
            <span>{t("bizLabel")}</span>
            <span>{t("bizDebit")}</span>
            <span>{t("bizCredit")}</span>
            <span />
          </div>
          {lines.map((l, i) => (
            <div key={i} className={classes.lineRow}>
              <select value={l.account} onChange={(e) => set(i, { account: e.target.value })} aria-label={t("bizAccount")}>
                <option value="">{t("bizSelect")}</option>
                {details.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
              <input value={l.label} maxLength={300} onChange={(e) => set(i, { label: e.target.value })} aria-label={t("bizLabel")} />
              <input
                inputMode="numeric"
                dir="ltr"
                value={l.debit}
                aria-label={t("bizDebit")}
                onChange={(e) => set(i, { debit: e.target.value, credit: e.target.value ? "" : l.credit })}
              />
              <input
                inputMode="numeric"
                dir="ltr"
                value={l.credit}
                aria-label={t("bizCredit")}
                onChange={(e) => set(i, { credit: e.target.value, debit: e.target.value ? "" : l.debit })}
              />
              <button
                type="button"
                className={classes.removeLine}
                disabled={lines.length <= 2}
                aria-label={t("bizDelete")}
                onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <div>
            <button type="button" className={classes.ghost} onClick={() => setLines((p) => [...p, emptyLine()])}>
              {t("bizAddLine")}
            </button>
          </div>
        </div>
        <div className={classes.cardHead}>
          <span className={balanced ? classes.statusOk : classes.statusBad}>
            {t("bizDebit")}: {f.money(debit)} · {t("bizCredit")}: {f.money(credit)} ·{" "}
            {balanced ? t("bizBalanced") : t("bizDiff", [f.money(Math.abs(debit - credit))])}
          </span>
          <div className={classes.actions}>
            <button type="button" className={classes.ghost} onClick={() => closePopup()}>
              {t("bizCancel")}
            </button>
            <button
              type="button"
              className={classes.primary}
              disabled={busy || !balanced || description.trim().length < 2}
              onClick={save}
            >
              {t("bizSave")}
            </button>
          </div>
        </div>
      </div>
    </PopupCard>
  );
};

const VoucherDetailPopup = ({
  ctx,
  id,
  accounts,
  onChanged,
}: {
  ctx: { api: string; canWrite: boolean };
  id: string;
  accounts: BizAccount[];
  onChanged: () => unknown;
}) => (
  <BizContext.Provider value={ctx}>
    <VoucherDetail id={id} accounts={accounts} onChanged={onChanged} />
  </BizContext.Provider>
);

const VoucherDetail = ({
  id,
  accounts,
  onChanged,
}: {
  id: string;
  accounts: BizAccount[];
  onChanged: () => unknown;
}) => {
  const t = useBizText();
  const f = useBizFormat();
  const ctx = useBiz();
  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error } = useSWR<BizVoucher>(`${API}${ctx.api}/vouchers/${id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as BizVoucher),
  );
  const [confirm, setConfirm] = useState(false);

  const remove = async () => {
    try {
      await fetcher({ url: `${API}${ctx.api}/vouchers/${id}`, method: "DELETE" });
      pushNotification(t("bizDeleted"), "Success");
      closePopup();
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };

  return (
    <PopupCard title={data ? t("bizVoucherTitle", [f.money(data.number)]) : t("bizTabVouchers")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{data.description}</span>
                <span className={classes.muted}>{f.date(data.date)}</span>
              </div>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizCode")}</th>
                      <th>{t("bizAccount")}</th>
                      <th>{t("bizLabel")}</th>
                      <th className={classes.num}>{t("bizDebit")}</th>
                      <th className={classes.num}>{t("bizCredit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asArray<BizVoucher["lines"][number]>(data.lines).map((l, i) => (
                      <tr key={i}>
                        <td>{l.code}</td>
                        <td className={classes.wrap}>{typeof l.account === "object" && l.account ? l.account.name : "—"}</td>
                        <td className={classes.wrap}>{l.label || "—"}</td>
                        <td className={classes.num}>{l.debit ? f.money(l.debit) : ""}</td>
                        <td className={classes.num}>{l.credit ? f.money(l.credit) : ""}</td>
                      </tr>
                    ))}
                    <tr className={classes.footRow}>
                      <td colSpan={3}>{t("bizTotal")}</td>
                      <td className={classes.num}>{f.money(data.total)}</td>
                      <td className={classes.num}>{f.money(data.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {data.kind !== "manual" ? (
                <p className={classes.muted}>{t("bizAutoNote")}</p>
              ) : (
                ctx.canWrite && (
                  <div className={classes.actions}>
                    {confirm ? (
                      <>
                        <span className={classes.muted}>{t("bizDeleteConfirm")}</span>
                        <button type="button" className={classes.ghost} onClick={() => setConfirm(false)}>
                          {t("bizCancel")}
                        </button>
                        <button type="button" className={classes.danger} onClick={remove}>
                          {t("bizDelete")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={classes.danger} onClick={() => setConfirm(true)}>
                          {t("bizDelete")}
                        </button>
                        <button
                          type="button"
                          className={classes.primary}
                          onClick={() =>
                            setPopup(
                              "BizVoucherForm",
                              <VoucherFormPopup ctx={ctx} accounts={accounts} voucher={data} onDone={onChanged} />,
                            )
                          }
                        >
                          {t("bizEdit")}
                        </button>
                      </>
                    )}
                  </div>
                )
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const LIMIT = 20;

const AccountingVouchers = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useBizText();
  const f = useBizFormat();
  const ctx = useBiz();
  const { setPopup } = usePopup();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const { data: accounts } = useBizAccounts();
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (query) params.set("q", query);
  if (kind) params.set("kind", kind);
  const { data, error, mutate, isValidating } = useSWR<{ items: BizVoucher[]; total: number }>(
    `${API}${ctx.api}/vouchers?${params}`,
    (url: string) =>
      fetcher({ url }).then((res) => ({
        items: asArray<BizVoucher>(res.data?.items),
        total: Number(res.data?.total) || 0,
      })),
    { keepPreviousData: true },
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => {
    const h = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [q]);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const changed = () => {
    mutate();
    onChanged();
  };

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bizSearch")} aria-label={t("bizSearch")} />
          <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label={t("bizKind")}>
            <option value="">{t("bizAllKinds")}</option>
            <option value="auto">{t("bizKindAuto")}</option>
            <option value="manual">{t("bizKindManual")}</option>
          </select>
        </div>
        {ctx.canWrite && !!accounts && (
          <button
            type="button"
            className={classes.primary}
            onClick={() =>
              setPopup("BizVoucherForm", <VoucherFormPopup ctx={ctx} accounts={accounts} onDone={changed} />)
            }
          >
            {t("bizNewVoucher")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (data.items.length === 0 ? (
            <p className={classes.empty}>{t("bizNoVouchers")}</p>
          ) : (
            <div className={classes.tableWrap} style={{ opacity: isValidating ? 0.6 : 1 }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizNumber")}</th>
                    <th>{t("bizDate")}</th>
                    <th>{t("bizDescription")}</th>
                    <th>{t("bizKind")}</th>
                    <th className={classes.num}>{t("bizTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((v) => (
                    <tr
                      key={v._id}
                      className={classes.rowLink}
                      tabIndex={0}
                      onClick={() =>
                        setPopup(
                          "BizVoucherDetail",
                          <VoucherDetailPopup ctx={ctx} id={v._id} accounts={accounts || []} onChanged={changed} />,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          setPopup(
                            "BizVoucherDetail",
                            <VoucherDetailPopup ctx={ctx} id={v._id} accounts={accounts || []} onChanged={changed} />,
                          );
                      }}
                    >
                      <td>{f.money(v.number)}</td>
                      <td>{f.date(v.date)}</td>
                      <td className={classes.wrap}>{v.description}</td>
                      <td>
                        <span className={`${classes.badge} ${classes[kindBadge(v.kind)] || ""}`}>
                          {t(v.kind === "manual" ? "bizKindManual" : v.kind === "opening" ? "bizKindOpening" : "bizKindAuto")}
                        </span>
                      </td>
                      <td className={classes.num}>{f.money(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
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
    </section>
  );
};

export default AccountingVouchers;
