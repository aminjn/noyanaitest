"use client";

import { useEffect, useRef, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, isoDay, useBiz, useBizFormat } from "../bizShared";
import { parseAmount } from "../Finance/finShared";
import {
  AccParty,
  AmountInput,
  ConfirmButton,
  ExportBar,
  PARTY_KINDS,
  partyKindKey,
  SimplePopup,
  SubNav,
  useAccCall,
  useAccGet,
  useAccPopup,
  useAccText,
  useView,
} from "./accShared";
import { LedgerView, Statements } from "./AccBooks";

// The تفصیلی register (2026-10), after Nexxa's accounting/tafsili (by kind,
// codes in a range per kind, made by hand or found by automatic vouchers),
// phonebook (the same people with their numbers) and statements (each
// party's balance and ledger). A party with history is deactivated, not
// deleted. A new party can carry its opening balance (Nexxa
// contact-opening: Dr its receivable / Cr 5103, or the other way round).

type Party = AccParty & { postalCode?: string; address?: string; note?: string; openingPosted?: boolean };

const PartyForm = ({ party, onDone }: { party?: Party; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { canApprove } = useBiz();
  const { closePopup } = usePopup();
  const [d, setD] = useState({
    kind: party?.kind || "patient",
    name: party?.name || "",
    code: party?.code || "",
    phone: party?.phone || "",
    nationalId: party?.nationalId || "",
    economicCode: party?.economicCode || "",
    postalCode: party?.postalCode || "",
    address: party?.address || "",
    note: party?.note || "",
  });
  const [opening, setOpening] = useState("");
  const [side, setSide] = useState<"debit" | "credit">("debit");
  const [date, setDate] = useState<Date>(new Date());
  const [busy, setBusy] = useState(false);
  const field = (k: keyof typeof d, label: string, ltr?: boolean) => (
    <label className={classes.field}>
      <span>{label}</span>
      <input value={d[k]} dir={ltr ? "ltr" : undefined} onChange={(e) => setD((p) => ({ ...p, [k]: e.target.value }))} />
    </label>
  );
  const save = async () => {
    setBusy(true);
    const payload: Record<string, unknown> = { ...d };
    if (!party && parseAmount(opening) > 0) Object.assign(payload, { opening: parseAmount(opening), openingSide: side, openingDate: isoDay(date) });
    const res = party ? await call(`/acc/parties/${party._id}`, "PATCH", payload) : await call("/acc/parties", "POST", payload);
    setBusy(false);
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={party ? `${party.code} · ${party.name}` : t("accNewParty")}>
      <div className={classes.form}>
        {!party && (
          <label className={classes.field}>
            <span>{t("accPartyKind")}</span>
            <select value={d.kind} onChange={(e) => setD((p) => ({ ...p, kind: e.target.value as Party["kind"] }))}>
              {PARTY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(partyKindKey(k))}
                </option>
              ))}
            </select>
          </label>
        )}
        {field("name", t("bizName"))}
        {!party && field("code", t("accCodeOptional"), true)}
        {field("phone", t("accPhone"), true)}
        {field("nationalId", t("accNationalId"), true)}
        {field("economicCode", t("accEconomicCode"), true)}
        {field("postalCode", t("accPostalCode"), true)}
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accAddress")}</span>
          <input value={d.address} onChange={(e) => setD((p) => ({ ...p, address: e.target.value }))} />
        </label>
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accNote")}</span>
          <input value={d.note} onChange={(e) => setD((p) => ({ ...p, note: e.target.value }))} />
        </label>
      </div>
      {!party && canApprove && (
        <div className={classes.form}>
          <AmountInput label={t("accPartyOpening")} value={opening} onChange={setOpening} />
          <label className={classes.field}>
            <span>{t("accOpeningSide")}</span>
            <select value={side} onChange={(e) => setSide(e.target.value as "debit" | "credit")}>
              <option value="debit">{t("accOpeningOwesUs")}</option>
              <option value="credit">{t("accOpeningWeOwe")}</option>
            </select>
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
          </div>
        </div>
      )}
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={busy || d.name.trim().length < 2} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const Register = ({ phonebook }: { phonebook?: boolean }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const h = setTimeout(() => (setQuery(q.trim()), setPage(1)), 300);
    return () => clearTimeout(h);
  }, [q]);
  const LIMIT = 50;
  const { data, error, mutate } = useAccGet<{ items: Party[]; total: number; counts: Record<string, number> }>(
    `/acc/parties?page=${page}&limit=${LIMIT}${kind ? `&kind=${kind}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
    (d) => {
      const x = (d || {}) as { items?: unknown; total?: number; counts?: Record<string, number> };
      return { items: asArray<Party>(x.items), total: Number(x.total) || 0, counts: x.counts && typeof x.counts === "object" ? x.counts : {} };
    },
  );
  const items = asArray<Party>(data?.items);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const all = Object.values(data?.counts || {}).reduce((s, n) => s + Number(n || 0), 0);
  return (
    <div className={classes.main}>
      <SubNav
        value={kind}
        onChange={(k) => (setKind(k), setPage(1))}
        items={[["", t("accAllN", [f.money(all)])], ...PARTY_KINDS.map((k) => [k, `${t(partyKindKey(k))} (${f.money(data?.counts?.[k] || 0)})`] as [string, string])]}
      />
      <div className={acc.bar}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("accPartySearchLong")} aria-label={t("bizSearch")} />
        </div>
        <div className={acc.tools}>
          <ExportBar
            printRef={ref}
            sheet={() => ({
              title: phonebook ? t("accPhonebook") : t("accParties"),
              head: [t("bizCode"), t("bizName"), t("accPartyKind"), t("accPhone"), t("accNationalId"), t("accEconomicCode"), t("accAddress")],
              rows: items.map((p) => [p.code, p.name, t(partyKindKey(p.kind)), p.phone || "", p.nationalId || "", p.economicCode || "", p.address || ""]),
            })}
          />
          {canWrite && (
            <button type="button" className={classes.primary} onClick={() => open("AccPartyForm", <PartyForm onDone={() => mutate()} />)}>
              {t("accNewParty")}
            </button>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("bizName")}</th>
                <th>{t("accPartyKind")}</th>
                <th>{t("accPhone")}</th>
                {!phonebook && <th>{t("accNationalId")}</th>}
                {!phonebook && canWrite && <th />}
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
              {items.map((p) => (
                <tr key={p._id} style={{ opacity: p.isActive === false ? 0.55 : 1 }}>
                  <td>{p.code}</td>
                  <td className={classes.wrap}>
                    <button type="button" className={fin.link} onClick={() => open("AccLedger", <SimplePopup title={t("accStatementOf", [p.name])} wide><LedgerView fixed={{ party: p._id, partyName: p.name }} /></SimplePopup>)}>
                      {p.name}
                    </button>
                    {p.isActive === false && <span className={classes.badge} style={{ marginInlineStart: "0.5rem" }}>{t("accInactive")}</span>}
                  </td>
                  <td>{t(partyKindKey(p.kind))}</td>
                  <td dir="ltr">{p.phone ? <a href={`tel:${p.phone}`} className={fin.link}>{p.phone}</a> : "—"}</td>
                  {!phonebook && <td dir="ltr">{p.nationalId || "—"}</td>}
                  {!phonebook && canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccPartyForm", <PartyForm party={p} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                        <button type="button" onClick={async () => (await call(`/acc/parties/${p._id}`, "PATCH", { isActive: p.isActive === false })) && mutate()}>
                          {p.isActive === false ? t("accActivate") : t("accDeactivate")}
                        </button>
                        <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/parties/${p._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
                      </div>
                    </td>
                  )}
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

const VIEWS = ["register", "statements", "phonebook"] as const;

const AccParties = () => {
  const t = useAccText();
  const [view, setView] = useView(VIEWS, "register");
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["register", t("accParties")],
          ["statements", t("accStatements")],
          ["phonebook", t("accPhonebook")],
        ]}
      />
      {view === "register" && <Register />}
      {view === "statements" && <Statements />}
      {view === "phonebook" && <Register phonebook />}
    </section>
  );
};

export default AccParties;
