"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { useCostCenters } from "../CostCenterSelect";
import {
  AccountSelect,
  AccParty,
  ExportBar,
  monthStart,
  PARTY_KINDS,
  PartyPicker,
  partyKindKey,
  RangeFilter,
  rangeQs,
  SimplePopup,
  SubNav,
  useAccGet,
  useAccPopup,
  useAccText,
  useOpenVoucher,
  useTreasury,
  useView,
} from "./accShared";

// The books (2026-10), after Nexxa's general-ledger (دفتر معین: one
// account's lines, by تفصیلی and cost centre, with the running balance),
// total-ledger (دفتر کل), statements (each party's turnover and balance,
// and its own ledger), treasury-ledger (a till or bank) and review (مرور
// حساب‌ها: the tree down to تفصیلی). Every line opens its voucher.

type LedgerLine = {
  _id: string;
  number: number;
  date: string;
  description: string;
  reference?: string;
  label?: string;
  code: string;
  accountName?: string;
  party?: { _id: string; code: string; name: string } | null;
  debit: number;
  credit: number;
  balance: number;
};
type LedgerData = { opening: number; closing: number; totalDebit: number; totalCredit: number; total: number; items: LedgerLine[] };

const LIMIT = 100;

// one account and/or party with filters - the ledger of every book
export const LedgerView = ({ fixed }: { fixed?: { account?: string; party?: string; partyName?: string } }) => {
  const t = useAccText();
  const f = useBizFormat();
  const openVoucher = useOpenVoucher();
  const ref = useRef<HTMLDivElement>(null);
  const { data: accountsData } = useBizAccounts();
  const { data: centersData } = useCostCenters();
  const accounts = asArray<BizAccount>(accountsData);
  const [account, setAccount] = useState(fixed?.account || "");
  const [party, setParty] = useState<AccParty | null>(null);
  const [center, setCenter] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const partyId = fixed?.party || party?._id;
  const qs = rangeQs(from, to, { account: account || undefined, party: partyId, center: center || undefined, page: String(page), limit: String(LIMIT) });
  const { data, error } = useAccGet<LedgerData | null>(account || partyId ? `/acc/ledger?${qs}` : null, (d) => (d && typeof d === "object" ? (d as LedgerData) : null));
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const title = [accounts.find((a) => a._id === account)?.name, fixed?.partyName || party?.name].filter(Boolean).join(" · ") || t("accLedger");
  return (
    <div className={classes.main}>
      <RangeFilter from={from} to={to} setFrom={(d) => (setFrom(d), setPage(1))} setTo={(d) => (setTo(d), setPage(1))}>
        {!fixed?.account && <AccountSelect accounts={accounts} allLevels value={account} onChange={(v) => (setAccount(v), setPage(1))} label={t("bizAccount")} empty={fixed?.party ? t("accAllAccounts") : undefined} />}
        {!fixed?.party && <PartyPicker value={party} onChange={(p) => (setParty(p), setPage(1))} label={t("accParty")} />}
        <label className={classes.field}>
          <span>{t("bizCostCenter")}</span>
          <select value={center} onChange={(e) => (setCenter(e.target.value), setPage(1))}>
            <option value="">{t("accAll")}</option>
            {asArray<{ _id: string; name: string }>(centersData).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </RangeFilter>
      {!account && !partyId ? (
        <p className={classes.empty}>{t("accPickAccount")}</p>
      ) : (
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={acc.bar}>
                <div className={classes.tiles} style={{ flex: 1 }}>
                  <div className={classes.tile}>
                    <span className={classes.tileLabel}>{t("bizOpening")}</span>
                    <span className={classes.tileValue}>{f.signed(data.opening)}</span>
                  </div>
                  <div className={classes.tile}>
                    <span className={classes.tileLabel}>{t("bizPeriodDebit")}</span>
                    <span className={classes.tileValue}>{f.money(data.totalDebit)}</span>
                  </div>
                  <div className={classes.tile}>
                    <span className={classes.tileLabel}>{t("bizPeriodCredit")}</span>
                    <span className={classes.tileValue}>{f.money(data.totalCredit)}</span>
                  </div>
                  <div className={classes.tile}>
                    <span className={classes.tileLabel}>{t("bizClosing")}</span>
                    <span className={classes.tileValue}>{f.signed(data.closing)}</span>
                  </div>
                </div>
              </div>
              <ExportBar
                printRef={ref}
                sheet={() => ({
                  title,
                  head: [t("bizDate"), t("bizNumber"), t("bizAccount"), t("accParty"), t("bizDescription"), t("bizDebit"), t("bizCredit"), t("bizBalance")],
                  rows: asArray<LedgerLine>(data.items).map((l) => [f.date(l.date), l.number, `${l.code} ${l.accountName || ""}`, l.party?.name || "", l.label || l.description, l.debit, l.credit, Math.round(l.balance)]),
                })}
              />
              <div className={classes.tableWrap} ref={ref}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizDate")}</th>
                      <th>{t("bizNumber")}</th>
                      <th>{t("bizAccount")}</th>
                      <th>{t("accParty")}</th>
                      <th>{t("bizDescription")}</th>
                      <th className={classes.num}>{t("bizDebit")}</th>
                      <th className={classes.num}>{t("bizCredit")}</th>
                      <th className={classes.num}>{t("bizBalance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={classes.groupRow}>
                      <td colSpan={7}>{t("bizOpening")}</td>
                      <td className={classes.num}>{f.signed(data.opening)}</td>
                    </tr>
                    {asArray<LedgerLine>(data.items).map((l, i) => (
                      <tr key={`${l._id}-${i}`} className={classes.rowLink} onClick={() => openVoucher(l._id)}>
                        <td>{f.date(l.date)}</td>
                        <td>{f.money(l.number)}</td>
                        <td className={classes.wrap}>{l.code} · {l.accountName}</td>
                        <td className={classes.wrap}>{l.party?.name || "—"}</td>
                        <td className={classes.wrap}>{l.label || l.description}</td>
                        <td className={classes.num}>{l.debit ? f.money(l.debit) : ""}</td>
                        <td className={classes.num}>{l.credit ? f.money(l.credit) : ""}</td>
                        <td className={classes.num}>{f.signed(l.balance)}</td>
                      </tr>
                    ))}
                    <tr className={classes.footRow}>
                      <td colSpan={5}>{t("bizTotal")}</td>
                      <td className={classes.num}>{f.money(data.totalDebit)}</td>
                      <td className={classes.num}>{f.money(data.totalCredit)}</td>
                      <td className={classes.num}>{f.signed(data.closing)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
      )}
    </div>
  );
};

type TotalRow = { _id: string; code: string; name: string; type: string; opening: number; debit: number; credit: number; closing: number };

// دفتر کل: each کل account's opening, turnover and closing
const TotalLedger = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(null);
  const [level, setLevel] = useState<"total" | "group">("total");
  const { data, error } = useAccGet<TotalRow[]>(`/acc/total-ledger?${rangeQs(from, to, { level })}`, (d) => asArray<TotalRow>(d));
  const rows = asArray<TotalRow>(data);
  const side = (n: number) => (Math.abs(n) < 0.5 ? "" : n > 0 ? t("accSideDebit") : t("accSideCredit"));
  const sum = rows.reduce((s, r) => ({ d: s.d + r.debit, c: s.c + r.credit }), { d: 0, c: 0 });
  return (
    <div className={classes.main}>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}>
        <label className={classes.field}>
          <span>{t("accLevel")}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as "total" | "group")}>
            <option value="total">{t("accLevelTotal")}</option>
            <option value="group">{t("accLevelGroup")}</option>
          </select>
        </label>
      </RangeFilter>
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: t("accTotalLedger"),
          head: [t("bizCode"), t("bizName"), t("bizOpening"), t("bizDebit"), t("bizCredit"), t("bizClosing")],
          rows: rows.map((r) => [r.code, r.name, Math.round(r.opening), Math.round(r.debit), Math.round(r.credit), Math.round(r.closing)]),
        })}
      />
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("bizName")}</th>
                <th className={classes.num}>{t("bizOpening")}</th>
                <th className={classes.num}>{t("bizDebit")}</th>
                <th className={classes.num}>{t("bizCredit")}</th>
                <th className={classes.num}>{t("bizClosing")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={7} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className={classes.rowLink} onClick={() => open("AccLedger", <SimplePopup title={`${r.code} · ${r.name}`} wide><LedgerView fixed={{ account: r._id }} /></SimplePopup>)}>
                  <td>{r.code}</td>
                  <td className={classes.wrap}>{r.name}</td>
                  <td className={classes.num}>{f.money(Math.abs(r.opening))}</td>
                  <td className={classes.num}>{f.money(r.debit)}</td>
                  <td className={classes.num}>{f.money(r.credit)}</td>
                  <td className={classes.num}>{f.money(Math.abs(r.closing))}</td>
                  <td className={acc.mutedSmall}>{side(r.closing)}</td>
                </tr>
              ))}
              <tr className={classes.footRow}>
                <td colSpan={3}>{t("bizTotal")}</td>
                <td className={classes.num}>{f.money(sum.d)}</td>
                <td className={classes.num}>{f.money(sum.c)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </div>
  );
};

type PartyBal = { _id: string; code: string; name: string; kind: string; phone?: string; opening: number; periodD: number; periodC: number; closing: number; count: number };

// گردش و مانده‌ی اشخاص (Nexxa statements) and each party's own ledger
export const Statements = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const { data, error } = useAccGet<{ rows: PartyBal[]; totalDebit: number; totalCredit: number }>(
    `/acc/parties/balances?${rangeQs(from, to, { kind: kind || undefined, status: status || undefined, q: q.trim() || undefined })}`,
    (d) => {
      const x = (d || {}) as { rows?: unknown; totalDebit?: number; totalCredit?: number };
      return { rows: asArray<PartyBal>(x.rows), totalDebit: Number(x.totalDebit) || 0, totalCredit: Number(x.totalCredit) || 0 };
    },
  );
  const rows = asArray<PartyBal>(data?.rows);
  return (
    <div className={classes.main}>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}>
        <label className={classes.field}>
          <span>{t("accPartyKind")}</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">{t("accAll")}</option>
            {PARTY_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(partyKindKey(k))}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accBalanceStatus")}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("accAll")}</option>
            <option value="debit">{t("accStDebit")}</option>
            <option value="credit">{t("accStCredit")}</option>
            <option value="settled">{t("accStSettled")}</option>
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("bizSearch")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </RangeFilter>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={acc.bar}>
              <div className={classes.tiles} style={{ flex: 1 }}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accTotalDebtors")}</span>
                  <span className={classes.tileValue}>{f.money(data.totalDebit)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accTotalCreditors")}</span>
                  <span className={classes.tileValue}>{f.money(data.totalCredit)}</span>
                </div>
              </div>
            </div>
            <ExportBar
              printRef={ref}
              sheet={() => ({
                title: t("accStatements"),
                head: [t("bizCode"), t("accParty"), t("accPartyKind"), t("bizOpening"), t("bizDebit"), t("bizCredit"), t("bizClosing")],
                rows: rows.map((r) => [r.code, r.name, t(partyKindKey(r.kind)), Math.round(r.opening), Math.round(r.periodD), Math.round(r.periodC), Math.round(r.closing)]),
              })}
            />
            <div className={classes.tableWrap} ref={ref}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizCode")}</th>
                    <th>{t("accParty")}</th>
                    <th>{t("accPartyKind")}</th>
                    <th className={classes.num}>{t("bizOpening")}</th>
                    <th className={classes.num}>{t("bizDebit")}</th>
                    <th className={classes.num}>{t("bizCredit")}</th>
                    <th className={classes.num}>{t("bizClosing")}</th>
                  </tr>
                </thead>
                <tbody>
                  {!rows.length && (
                    <tr>
                      <td colSpan={7} className={classes.empty}>
                        {t("bizEmpty")}
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => (
                    <tr
                      key={r._id}
                      className={classes.rowLink}
                      onClick={() => open("AccLedger", <SimplePopup title={t("accStatementOf", [r.name])} wide><LedgerView fixed={{ party: r._id, partyName: r.name }} /></SimplePopup>)}
                    >
                      <td>{r.code}</td>
                      <td className={classes.wrap}>{r.name}</td>
                      <td>{t(partyKindKey(r.kind))}</td>
                      <td className={classes.num}>{f.signed(r.opening)}</td>
                      <td className={classes.num}>{f.money(r.periodD)}</td>
                      <td className={classes.num}>{f.money(r.periodC)}</td>
                      <td className={`${classes.num} ${r.closing < 0 ? classes.negative : ""}`}>{f.signed(r.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </HandleLoading>
    </div>
  );
};

// a till / bank / petty fund's own ledger (Nexxa treasury-ledger)
export const TreasuryLedger = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { data } = useTreasury();
  const list = asArray(data);
  const [sel, setSel] = useState("");
  useEffect(() => {
    if (!sel && list[0]) setSel(String(list[0].account));
  }, [list, sel]);
  return (
    <div className={classes.main}>
      <div className={acc.subnav}>
        {list.map((m) => (
          <button key={m._id} type="button" className={sel === String(m.account) ? acc.on : ""} onClick={() => setSel(String(m.account))}>
            {m.name} · {f.money(m.balance)}
          </button>
        ))}
      </div>
      {sel ? <LedgerView key={sel} fixed={{ account: sel }} /> : <p className={classes.empty}>{t("bizEmpty")}</p>}
    </div>
  );
};

type ReviewRow = { _id: string; code: string; name: string; level: string; parentCode?: string; type: string; debit: number; credit: number; balance: number; parties?: { _id: string; code: string; name: string; debit: number; credit: number; balance: number }[] };

// مرور حساب‌ها: the tree with turnover, a detail account opens to its parties
const Review = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const { data, error } = useAccGet<ReviewRow[]>(`/acc/review?${rangeQs(from, to)}`, (d) => asArray<ReviewRow>(d));
  const rows = asArray<ReviewRow>(data);
  const toggle = (id: string) => setOpenRows((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set([...s, id])));
  return (
    <div className={classes.main}>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: t("accReview"),
          head: [t("bizCode"), t("bizName"), t("bizDebit"), t("bizCredit"), t("bizBalance")],
          rows: rows.flatMap((r) => [[r.code, r.name, Math.round(r.debit), Math.round(r.credit), Math.round(r.balance)], ...asArray<NonNullable<ReviewRow["parties"]>[number]>(r.parties).map((p) => [`${r.code}-${p.code}`, `  ${p.name}`, Math.round(p.debit), Math.round(p.credit), Math.round(p.balance)])]),
        })}
      />
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={`${classes.table} ${acc.tree}`}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("bizName")}</th>
                <th className={classes.num}>{t("bizDebit")}</th>
                <th className={classes.num}>{t("bizCredit")}</th>
                <th className={classes.num}>{t("bizBalance")}</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={5} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <Fragment key={r._id}>
                  <tr className={`${r.level === "group" ? classes.groupRow : r.level === "total" ? classes.totalRow : ""} ${r.level === "detail" ? classes.rowLink : ""}`} onClick={() => r.level === "detail" && toggle(r._id)}>
                    <td>{r.code}</td>
                    <td className={`${classes.wrap} ${r.level === "total" ? acc.depth1 : r.level === "detail" ? acc.depth2 : ""}`}>
                      {r.level === "detail" && !!asArray(r.parties).length ? (openRows.has(r._id) ? "▾ " : "▸ ") : ""}
                      {r.name}
                    </td>
                    <td className={classes.num}>{f.money(r.debit)}</td>
                    <td className={classes.num}>{f.money(r.credit)}</td>
                    <td className={classes.num}>{f.signed(r.balance)}</td>
                  </tr>
                  {openRows.has(r._id) &&
                    asArray<NonNullable<ReviewRow["parties"]>[number]>(r.parties).map((p) => (
                      <tr key={`${r._id}-${p._id}`} className={classes.rowLink} onClick={() => open("AccLedger", <SimplePopup title={`${r.name} · ${p.name}`} wide><LedgerView fixed={{ account: r._id, party: p._id, partyName: p.name }} /></SimplePopup>)}>
                        <td className={acc.mutedSmall}>{p.code}</td>
                        <td className={`${classes.wrap} ${acc.depth3}`}>{p.name}</td>
                        <td className={classes.num}>{f.money(p.debit)}</td>
                        <td className={classes.num}>{f.money(p.credit)}</td>
                        <td className={classes.num}>{f.signed(p.balance)}</td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </div>
  );
};

const VIEWS = ["total", "moein", "statements", "treasury", "review"] as const;

const AccBooks = () => {
  const t = useAccText();
  const { platform } = useBiz();
  const [view, setView] = useView(VIEWS, "total");
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["total", t("accTotalLedger")],
          ["moein", t("accSubLedger")],
          ["statements", t("accStatements")],
          ...(platform ? [] : ([["treasury", t("accTreasuryLedger")]] as [(typeof VIEWS)[number], string][])),
          ["review", t("accReview")],
        ]}
      />
      {view === "total" && <TotalLedger />}
      {view === "moein" && <LedgerView />}
      {view === "statements" && <Statements />}
      {view === "treasury" && <TreasuryLedger />}
      {view === "review" && <Review />}
      <p className={`${classes.muted} ${fin.small}`}>{t("accBooksHint")}</p>
    </section>
  );
};

export default AccBooks;
