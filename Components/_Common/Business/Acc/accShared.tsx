"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useLocale } from "@/Components/i18n/navigation";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, BizContext, isoDay, useBiz, useBizFormat } from "../bizShared";
import { downloadCsv, parseAmount } from "../Finance/finShared";

// Shared bits of the Nexxa-parity accounting pages (2026-10): the texts
// (string keys until the handoff is merged into contentKeys), the popup
// that carries the page's context, the Excel / CSV / print bar of every
// list, the account / party / till pickers and the voucher drill-down.

export const ACC_NS = ["common", "bizAccounting", "bizFinance" as ContentNamespace] as ContentNamespace[];

export const useAccText = () => {
  const t = useScopedLocale(ACC_NS);
  return useCallback((key: string, vars?: string[]) => t(key as ContentKey, vars), [t]);
};

export const errText = (err: unknown) => (err as Error)?.message || String(err);

// a popup drawn outside the page tree, with the page's context
export const useAccPopup = () => {
  const biz = useBiz();
  const { setPopup, closePopup } = usePopup();
  const open = useCallback((key: string, node: ReactNode) => setPopup(key, <BizContext.Provider value={biz}>{node}</BizContext.Provider>), [biz, setPopup]);
  return { open, close: closePopup };
};

// GET <api><path>, data or a safe empty value
export const useAccGet = <T,>(path: string | null, pick: (d: unknown) => T) => {
  const { api } = useBiz();
  return useSWR<T>(path && api ? `${API}${api}${path}` : null, (url: string) => fetcher({ url }).then((res) => pick(res.data)), { keepPreviousData: true });
};

// a write with its success / error notice; returns the data or null
export const useAccCall = () => {
  const { api } = useBiz();
  const t = useAccText();
  const push = useNotification();
  return useCallback(
    async (path: string, method: "POST" | "PATCH" | "PUT" | "DELETE", payload?: Record<string, unknown>, okText?: string) => {
      try {
        const res = await fetcher({ url: `${API}${api}${path}`, method, payload });
        // "" = silent (a step of a longer action)
        if (okText !== "") push(okText || t("bizSaved"), "Success");
        return (res?.data ?? true) as unknown;
      } catch (err) {
        push(errText(err), "Error");
        return null;
      }
    },
    [api, push, t],
  );
};

// a multipart upload (bank statements, opening balances, coding files)
export const useAccUpload = () => {
  const { api } = useBiz();
  const push = useNotification();
  return useCallback(
    async (path: string, payload: Record<string, unknown>) => {
      try {
        const res = await fetcher({ url: `${API}${api}${path}`, method: "POST", payload, bodyParser: "FORM" });
        return res?.data as unknown;
      } catch (err) {
        push(errText(err), "Error");
        return null;
      }
    },
    [api, push],
  );
};

const RTL = new Set(["fa", "ar", "ur"]);

// Excel (.xlsx from the server), CSV and print of what the list shows
export type Sheet = { title: string; head: string[]; rows: (string | number | null | undefined)[][] };
export const ExportBar = ({ sheet, printRef, extra }: { sheet: () => Sheet; printRef?: React.RefObject<HTMLElement | null>; extra?: ReactNode }) => {
  const t = useAccText();
  const { api } = useBiz();
  const locale = useLocale();
  const push = useNotification();
  const [busy, setBusy] = useState(false);
  const excel = async () => {
    const s = sheet();
    setBusy(true);
    try {
      const res = await fetch(`${API}${api}/acc/xlsx`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-locale": locale },
        body: JSON.stringify({ title: s.title, head: s.head, rows: s.rows.map((r) => r.map((c) => (c === undefined ? null : c))), rtl: RTL.has(locale) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || res.statusText);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${s.title}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      push(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={acc.tools}>
      {extra}
      <button type="button" disabled={busy} onClick={excel}>
        {t("accExcel")}
      </button>
      <button
        type="button"
        onClick={() => {
          const s = sheet();
          downloadCsv(s.title, [s.head, ...s.rows]);
        }}
      >
        {t("accCsv")}
      </button>
      <button type="button" onClick={() => printElement(printRef?.current || null, sheet().title, RTL.has(locale))}>
        {t("accPrint")}
      </button>
    </div>
  );
};

// Prints one element on its own sheet: a new window with its HTML and a
// plain table style, so the panel's menu and popups stay out of the print.
export const printElement = (el: HTMLElement | null, title: string, rtl: boolean) => {
  if (!el) return window.print();
  const w = window.open("", "_blank", "width=1000,height=700");
  if (!w) return window.print();
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
  w.document.write(`<!doctype html><html dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:Vazirmatn,Tahoma,sans-serif;font-size:12px;color:#111;margin:24px}h1{font-size:16px;margin:0 0 12px}
table{width:100%;border-collapse:collapse;margin-bottom:12px}th,td{border:1px solid #bbb;padding:4px 6px;text-align:start}
th{background:#f1f1f1}button,select,input,[data-noprint]{display:none!important}td:has(>button){display:none}</style></head>
<body><h1>${esc(title)}</h1>${el.innerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 300);
};

// one row of sub-views, the current one in the URL's "view"
export const SubNav = <K extends string>({ items, value, onChange }: { items: [K, string][]; value: K; onChange: (k: K) => void }) => (
  <div className={acc.subnav} role="tablist">
    {items.map(([k, label]) => (
      <button key={k} type="button" role="tab" aria-selected={value === k} className={value === k ? acc.on : ""} onClick={() => onChange(k)}>
        {label}
      </button>
    ))}
  </div>
);

// a page's tab ("tab") or a tab's sub-view ("view") kept in the URL, so a
// link opens it; read from window (no Suspense boundary needed)
export const useView = <K extends string>(keys: readonly K[], fallback: K, param = "view"): [K, (k: K) => void] => {
  const [v, setV] = useState<K>(fallback);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get(param) as K | null;
    if (q && keys.includes(q)) setV(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const set = useCallback(
    (k: K) => {
      setV(k);
      try {
        const u = new URL(window.location.href);
        u.searchParams.set(param, k);
        if (param === "tab") u.searchParams.delete("view");
        window.history.replaceState(window.history.state, "", u.toString());
      } catch {
        /* the URL is a convenience */
      }
    },
    [param],
  );
  return [v, set];
};

// from / to filters
export const RangeFilter = ({
  from,
  to,
  setFrom,
  setTo,
  children,
}: {
  from: Date | null;
  to: Date | null;
  setFrom: (d: Date | null) => void;
  setTo: (d: Date | null) => void;
  children?: ReactNode;
}) => {
  const t = useAccText();
  return (
    <div className={classes.form}>
      <div className={classes.field}>
        <DateInput title={t("bizFrom")} defaultValue={from || undefined} onChange={(d) => setFrom(d)} onClear={() => setFrom(null)} />
      </div>
      <div className={classes.field}>
        <DateInput title={t("bizTo")} defaultValue={to || undefined} onChange={(d) => setTo(d)} onClear={() => setTo(null)} />
      </div>
      {children}
    </div>
  );
};

export const rangeQs = (from: Date | null, to: Date | null, extra: Record<string, string | undefined> = {}) => {
  const p = new URLSearchParams();
  if (from) p.set("from", isoDay(from));
  if (to) p.set("to", isoDay(to));
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  return p.toString();
};

export const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

// an amount typed with any digits
export const AmountInput = ({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label?: string; placeholder?: string }) => {
  const f = useBizFormat();
  const input = (
    <input
      inputMode="numeric"
      dir="ltr"
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => value && onChange(f.money(parseAmount(value)))}
    />
  );
  return label ? (
    <label className={classes.field}>
      <span>{label}</span>
      {input}
    </label>
  ) : (
    input
  );
};
export const amount = (s: string) => parseAmount(s);

// ------------------------------------------------------------ pickers

export const PARTY_KINDS = ["patient", "supplier", "insurer", "person", "doctor", "bank", "project", "custom"] as const;
export type PartyKind = (typeof PARTY_KINDS)[number];
export const partyKindKey = (k: string) => `accPartyKind_${k}`;

export type AccParty = { _id: string; code: string; kind: PartyKind; name: string; phone?: string; nationalId?: string; economicCode?: string; isActive?: boolean };

// detail accounts that take lines (active ones, or the one already chosen)
export const useDetailAccounts = (accounts?: BizAccount[]) =>
  useMemo(() => asArray<BizAccount>(accounts).filter((a) => a.level === "detail"), [accounts]);

export const AccountSelect = ({
  accounts,
  value,
  onChange,
  filter,
  label,
  allLevels,
  empty,
}: {
  accounts: BizAccount[];
  value: string;
  onChange: (id: string) => void;
  filter?: (a: BizAccount) => boolean;
  label?: string;
  allLevels?: boolean;
  empty?: string;
}) => {
  const t = useAccText();
  const list = accounts.filter((a) => (allLevels || a.level === "detail") && (a.isActive !== false || a._id === value) && (!filter || filter(a)));
  const select = (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label || t("bizAccount")}>
      <option value="">{empty || t("bizSelect")}</option>
      {list.map((a) => (
        <option key={a._id} value={a._id}>
          {a.level !== "detail" ? (a.level === "group" ? "■ " : "▪ ") : ""}
          {a.code} · {a.name}
        </option>
      ))}
    </select>
  );
  return label ? (
    <label className={classes.field}>
      <span>{label}</span>
      {select}
    </label>
  ) : (
    select
  );
};

// a party searched by name / code / phone, or made right here
export const PartyPicker = ({
  value,
  onChange,
  kinds,
  label,
  placeholder,
}: {
  value: AccParty | null;
  onChange: (p: AccParty | null) => void;
  kinds?: string[];
  label?: string;
  placeholder?: string;
}) => {
  const t = useAccText();
  const { api, canWrite } = useBiz();
  const push = useNotification();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AccParty[]>([]);
  const [newKind, setNewKind] = useState<string>(kinds?.[0] || "patient");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = setTimeout(async () => {
      try {
        const res = await fetcher({ url: `${API}${api}/acc/parties?active=1&limit=30&q=${encodeURIComponent(q.trim())}` });
        const list = asArray<AccParty>(res.data?.items);
        setItems(kinds?.length ? list.filter((p) => kinds.includes(p.kind)) : list);
      } catch {
        setItems([]);
      }
    }, 250);
    return () => clearTimeout(h);
  }, [q, open, api, kinds]);
  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const create = async () => {
    if (q.trim().length < 2) return;
    try {
      const res = await fetcher({ url: `${API}${api}/acc/parties`, method: "POST", payload: { kind: newKind, name: q.trim() } });
      onChange(res.data as AccParty);
      setOpen(false);
      setQ("");
    } catch (err) {
      push(errText(err), "Error");
    }
  };
  const inner = (
    <div className={acc.pick} ref={box}>
      {value ? (
        <div className={classes.inlineAdd} style={{ display: "flex", gap: "0.25rem" }}>
          <input readOnly value={`${value.code} · ${value.name}`} aria-label={label || t("accParty")} onFocus={() => setOpen(false)} />
          <button type="button" className={classes.ghost} aria-label={t("bizDelete")} onClick={() => onChange(null)}>
            ×
          </button>
        </div>
      ) : (
        <input value={q} placeholder={placeholder || t("accPartySearch")} aria-label={label || t("accParty")} onFocus={() => setOpen(true)} onChange={(e) => setQ(e.target.value)} />
      )}
      {open && !value && (
        <div className={acc.pickList}>
          {items.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
            >
              <span>{p.name}</span>
              <span className={acc.mutedSmall}>
                {p.code} · {t(partyKindKey(p.kind))}
              </span>
            </button>
          ))}
          {canWrite && q.trim().length >= 2 && (
            <div className={classes.inlineAdd} style={{ display: "flex", gap: "0.25rem", padding: "0.375rem" }}>
              <select value={newKind} onChange={(e) => setNewKind(e.target.value)} aria-label={t("accPartyKind")}>
                {(kinds?.length ? kinds : PARTY_KINDS).map((k) => (
                  <option key={k} value={k}>
                    {t(partyKindKey(k))}
                  </option>
                ))}
              </select>
              <button type="button" className={classes.primary} onClick={create}>
                {t("accPartyCreate", [q.trim()])}
              </button>
            </div>
          )}
          {!items.length && q.trim().length < 2 && <p className={acc.mutedSmall} style={{ padding: "0.5rem 0.75rem" }}>{t("accPartyTypeHint")}</p>}
        </div>
      )}
    </div>
  );
  return label ? (
    <div className={classes.field}>
      <span>{label}</span>
      {inner}
    </div>
  ) : (
    inner
  );
};

export type TreasuryRow = { _id: string; account: string; kind: string; name: string; code: string; bankName?: string; holder?: string; pettyLimit?: number; isActive: boolean; balance: number; lastReplenishedAt?: string; statementBalance?: number; statementDate?: string };

export const useTreasury = () => useAccGet<TreasuryRow[]>("/acc/treasury", (d) => asArray<TreasuryRow>(d));

export const treasuryKindKey = (k: string) => ({ cash: "finKindCash", bank: "finKindBank", pos: "finKindPos", wallet: "finKindWallet", petty: "accKindPetty" })[k] || k;

export const MoneySelect = ({ value, onChange, label, kinds, exclude }: { value: string; onChange: (id: string) => void; label?: string; kinds?: string[]; exclude?: string }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { data } = useTreasury();
  const list = asArray<TreasuryRow>(data).filter((m) => (m.isActive || m._id === value) && (!kinds || kinds.includes(m.kind)) && m._id !== exclude);
  return (
    <label className={classes.field}>
      <span>{label || t("accMoney")}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t("bizSelect")}</option>
        {list.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name} ({t(treasuryKindKey(m.kind))}) · {f.money(m.balance)}
          </option>
        ))}
      </select>
    </label>
  );
};

// --------------------------------------------------------- drill-down

export type JLine = {
  account: string;
  code: string;
  accountName?: string;
  label?: string;
  debit: number;
  credit: number;
  party?: { _id: string; code: string; name: string; kind: string } | null;
  center?: string;
};
export type JVoucher = {
  _id: string;
  number: number;
  date: string;
  kind: "auto" | "manual" | "opening" | "closing";
  state: "draft" | "final";
  manual: boolean;
  description: string;
  reference?: string;
  total: number;
  lines: JLine[];
  center?: string;
  phase?: string;
  source?: { type: string; id: string };
  attachments?: string[];
  approvedAt?: string;
  actualDate?: string;
  history?: { _id: string; action: string; createdAt: string; by?: { firstName?: string; lastName?: string; phone?: string } | null; before?: { total?: number; state?: string }; after?: { total?: number; state?: string } }[];
};

// any figure of any report opens the voucher it came from
export const useOpenVoucher = () => {
  const { open } = useAccPopup();
  return useCallback(
    (id: string, onChanged?: () => unknown) => {
      // lazily imported: the journal module imports this file
      import("./AccJournal").then((m) => open("AccVoucher", <m.VoucherPopup id={id} onChanged={onChanged} />));
    },
    [open],
  );
};

export const SimplePopup = ({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) => (
  <PopupCard title={title} size={wide ? "wide" : "normal"}>
    <div className={classes.popup}>{children}</div>
  </PopupCard>
);

// a confirm with a reason or none, inside a popup
export const ConfirmButton = ({ label, confirm, onConfirm, danger, disabled }: { label: string; confirm: string; onConfirm: () => unknown; danger?: boolean; disabled?: boolean }) => {
  const [ask, setAsk] = useState(false);
  const t = useAccText();
  return ask ? (
    <span className={acc.tools}>
      <span className={acc.mutedSmall}>{confirm}</span>
      <button type="button" onClick={() => setAsk(false)}>
        {t("bizCancel")}
      </button>
      <button
        type="button"
        className={danger ? classes.danger : classes.primary}
        onClick={async () => {
          await onConfirm();
          setAsk(false);
        }}
      >
        {label}
      </button>
    </span>
  ) : (
    <button type="button" className={danger ? classes.danger : classes.ghost} disabled={disabled} onClick={() => setAsk(true)}>
      {label}
    </button>
  );
};

export const userName = (u?: { firstName?: string; lastName?: string; phone?: string } | null) => [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.phone || "—";
