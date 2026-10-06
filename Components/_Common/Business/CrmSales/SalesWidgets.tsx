"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import DateInput from "@/Components/UI/DateInput";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import { CrmContact, phoneText, useCrm } from "../Crm/crmShared";
import { CustomField, Line, LineRef, MiniContact, SalesMeta, useProfile, useSalesText } from "./salesShared";

// The pieces the sales pages share: finding a patient (or typing a new
// one), the line editor of a lead or a plan (lines picked from the
// provider's own services, packages and stock items, or typed), and the
// centre's custom fields.

export type ContactChoice = { contact?: MiniContact | null; name?: string; phone?: string };

export const ContactPicker = ({ value, onChange, allowNew = true }: { value: ContactChoice; onChange: (v: ContactChoice) => void; allowNew?: boolean }) => {
  const t = useSalesText();
  const { api } = useCrm();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CrmContact[]>([]);
  const [fresh, setFresh] = useState(!value.contact && !!value.phone);
  useEffect(() => {
    if (value.contact || fresh) return;
    const h = setTimeout(() => {
      fetcher({ url: `${API}${api}/contacts?limit=6&q=${encodeURIComponent(q.trim())}` })
        .then((res) => setRows(asArray<CrmContact>(res.data?.items)))
        .catch(() => setRows([]));
    }, 300);
    return () => clearTimeout(h);
  }, [api, q, value.contact, fresh]);
  if (value.contact)
    return (
      <div className={s.copyRow}>
        <span className={classes.badge}>{value.contact.name || phoneText(value.contact.phone || "")}</span>
        <button type="button" className={crm.linkButton} onClick={() => onChange({})}>
          {t("crmsChange")}
        </button>
      </div>
    );
  if (fresh)
    return (
      <div className={s.formGrid}>
        <label className={classes.field}>
          {t("crmsPatientName")}
          <input value={value.name || ""} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </label>
        <label className={classes.field}>
          {t("crmsMobile")}
          <input dir="ltr" inputMode="tel" value={value.phone || ""} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
        </label>
        <button type="button" className={crm.linkButton} onClick={() => (setFresh(false), onChange({}))}>
          {t("crmsPickExisting")}
        </button>
      </div>
    );
  return (
    <div className={classes.popup}>
      <label className={classes.field}>
        {t("crmsFindPatient")}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmSearch")} />
      </label>
      <ul className={crm.miniList}>
        {rows.map((c) => (
          <li key={c._id}>
            <button type="button" className={crm.miniMain} onClick={() => onChange({ contact: { _id: c._id, name: c.name, phone: c.phone } })}>
              <span className={crm.fuText}>{c.name || "—"}</span>
              <bdi dir="ltr" className={classes.muted}>
                {phoneText(c.phone)}
              </bdi>
            </button>
          </li>
        ))}
      </ul>
      {allowNew && (
        <button type="button" className={crm.linkButton} onClick={() => setFresh(true)}>
          {t("crmsNewPatient")}
        </button>
      )}
    </div>
  );
};

// the payload a contact choice sends
export const contactPayload = (c: ContactChoice) =>
  c.contact ? { contact: c.contact._id } : c.phone ? { phone: c.phone, name: c.name || "" } : { contact: null };

type CatalogRow = { kind: LineRef["kind"]; id: string; title: string; price: number };
const useCatalog = () => {
  const { api } = useCrm();
  return useSWR<CatalogRow[]>(`${API}${api}/sales/catalog`, (url: string) => fetcher({ url }).then((res) => asArray<CatalogRow>(res.data)));
};

const LineTitle = ({ line, onChange, catalog }: { line: Line; onChange: (l: Line) => void; catalog: CatalogRow[] }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const [open, setOpen] = useState(false);
  const term = line.title.trim().toLowerCase();
  const hits = useMemo(() => catalog.filter((c) => !term || c.title.toLowerCase().includes(term)).slice(0, 8), [catalog, term]);
  return (
    <div className={s.lineTitle}>
      <input
        value={line.title}
        aria-label={t("crmsLineTitle")}
        placeholder={t("crmsLineTitle")}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => onChange({ ...line, title: e.target.value, ref: null })}
      />
      {open && hits.length > 0 && (
        <div className={s.suggest} role="listbox">
          {hits.map((c) => (
            <button
              key={`${c.kind}:${c.id}`}
              type="button"
              role="option"
              aria-selected={line.ref?.id === c.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange({ ...line, title: c.title, ref: { kind: c.kind, id: c.id }, unitPrice: c.price || line.unitPrice });
                setOpen(false);
              }}
            >
              <span>{c.title}</span>
              <span className={classes.muted}>
                {t(`crmsRef_${c.kind}`)} · {f.money(c.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const emptyLine = (): Line => ({ title: "", qty: 1, unitPrice: 0, discount: 0, taxRate: 0 });

// the lines of a lead (no tax) or a plan (tax and sessions too)
export const LineEditor = ({ lines, onChange, withTax, readOnly }: { lines: Line[]; onChange: (l: Line[]) => void; withTax?: boolean; readOnly?: boolean }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { data } = useCatalog();
  const catalog = asArray<CatalogRow>(data);
  const set = (i: number, l: Line) => onChange(lines.map((x, k) => (k === i ? l : x)));
  const num = (v: string) => Math.max(0, Number(v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0);
  if (readOnly)
    return (
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("crmsLineTitle")}</th>
              <th>{t("crmsQty")}</th>
              <th>{t("crmsUnitPrice")}</th>
              <th>{t("crmsDiscountPct")}</th>
              {withTax && <th>{t("crmsTaxPct")}</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l._id || i}>
                <td className={classes.wrap}>
                  {l.title}
                  {l.sessions ? ` · ${t("crmsSessionsN", [f.money(l.sessions)])}` : ""}
                </td>
                <td className={classes.num}>{f.money(l.qty)}</td>
                <td className={classes.num}>{f.money(l.unitPrice)}</td>
                <td className={classes.num}>{f.money(l.discount)}</td>
                {withTax && <td className={classes.num}>{f.money(l.taxRate)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  // title, qty, price, discount, (tax), sessions, remove
  const cols = { ["--cols" as string]: withTax ? 5 : 4 } as React.CSSProperties;
  return (
    <div className={s.lines}>
      <div className={`${s.lineRow} ${s.lineHeadRow}`} style={cols}>
        <span className={s.lineHead}>{t("crmsLineTitle")}</span>
        <span className={s.lineHead}>{t("crmsQty")}</span>
        <span className={s.lineHead}>{t("crmsUnitPrice")}</span>
        <span className={s.lineHead}>{t("crmsDiscountPct")}</span>
        {withTax && <span className={s.lineHead}>{t("crmsTaxPct")}</span>}
        <span className={s.lineHead}>{t("crmsSessions")}</span>
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={l._id || i} className={s.lineRow} style={cols}>
          <LineTitle line={l} catalog={catalog} onChange={(x) => set(i, x)} />
          <input inputMode="decimal" aria-label={t("crmsQty")} value={l.qty} onChange={(e) => set(i, { ...l, qty: num(e.target.value) })} />
          <input inputMode="numeric" aria-label={t("crmsUnitPrice")} value={l.unitPrice} onChange={(e) => set(i, { ...l, unitPrice: num(e.target.value) })} />
          <input inputMode="decimal" aria-label={t("crmsDiscountPct")} value={l.discount} onChange={(e) => set(i, { ...l, discount: Math.min(100, num(e.target.value)) })} />
          {withTax && (
            <input inputMode="decimal" aria-label={t("crmsTaxPct")} value={l.taxRate || 0} onChange={(e) => set(i, { ...l, taxRate: Math.min(50, num(e.target.value)) })} />
          )}
          <input inputMode="numeric" aria-label={t("crmsSessions")} value={l.sessions || ""} onChange={(e) => set(i, { ...l, sessions: num(e.target.value) || null })} />
          <button type="button" className={crm.linkDanger} aria-label={t("crmsRemoveLine")} onClick={() => onChange(lines.filter((_, k) => k !== i))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className={crm.linkButton} onClick={() => onChange([...lines, emptyLine()])}>
        {t("crmsAddLine")}
      </button>
    </div>
  );
};

// the same totals the backend works out (Lib/business/crmSalesCore.ts
// planTotals), shown while editing
export const lineTotals = (lines: Line[], discountPercent = 0) => {
  const head = Math.min(100, Math.max(0, discountPercent || 0));
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  for (const l of lines) {
    const gross = Math.round((l.qty || 0) * Math.round(l.unitPrice || 0));
    const after = gross - Math.round((gross * Math.min(100, l.discount || 0)) / 100);
    const net = after - Math.round((after * head) / 100);
    subtotal += gross;
    discount += gross - net;
    tax += Math.round((net * Math.min(50, l.taxRate || 0)) / 100);
  }
  return { subtotal, discount, tax, total: subtotal - discount + tax };
};

export const Totals = ({ lines, discountPercent }: { lines: Line[]; discountPercent?: number }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const x = lineTotals(lines, discountPercent);
  return (
    <div className={s.totals}>
      <span>
        {t("crmsSubtotal")}: {f.money(x.subtotal)}
      </span>
      {x.discount > 0 && (
        <span>
          {t("crmsDiscount")}: {f.money(x.discount)}
        </span>
      )}
      {x.tax > 0 && (
        <span>
          {t("crmsTax")}: {f.money(x.tax)}
        </span>
      )}
      <strong>
        {t("crmsTotal")}: {f.money(x.total)}
      </strong>
    </div>
  );
};

// the centre's own fields of a patient or a lead
export const CustomFieldInputs = ({ defs, values, onChange }: { defs: CustomField[]; values: Record<string, string>; onChange: (v: Record<string, string>) => void }) => {
  const t = useSalesText();
  const active = defs.filter((d) => d.active);
  if (!active.length) return <p className={classes.muted}>{t("crmsNoCustomFields")}</p>;
  const set = (k: string, v: string) => onChange({ ...values, [k]: v });
  return (
    <div className={s.formGrid}>
      {active.map((d) => (
        <label key={d._id} className={classes.field}>
          {d.label}
          {d.required ? " *" : ""}
          {d.type === "textarea" ? (
            <textarea value={values[d.key] || ""} onChange={(e) => set(d.key, e.target.value)} />
          ) : d.type === "select" ? (
            <select value={values[d.key] || ""} onChange={(e) => set(d.key, e.target.value)}>
              <option value="">—</option>
              {d.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : d.type === "checkbox" ? (
            <input type="checkbox" checked={values[d.key] === "1"} onChange={(e) => set(d.key, e.target.checked ? "1" : "0")} />
          ) : (
            <input
              type={d.type === "number" ? "number" : d.type === "date" ? "date" : "text"}
              value={values[d.key] || ""}
              onChange={(e) => set(d.key, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
};

// a link to copy (a plan's or a contract's public page, the form's code)
export const CopyLink = ({ text }: { text: string }) => {
  const t = useSalesText();
  const [done, setDone] = useState(false);
  return (
    <div className={s.copyRow}>
      <code>{text}</code>
      <button
        type="button"
        className={classes.ghost}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => setDone(true));
          setTimeout(() => setDone(false), 1500);
        }}
      >
        {t(done ? "crmsCopied" : "crmsCopy")}
      </button>
    </div>
  );
};

// a clinic's / hospital's treating doctor (the pipeline's department
// first) and a lab's referring doctor (picked or typed: a new name joins
// the list)
export const DoctorReferrerFields = ({
  meta,
  department,
  doctor,
  onDoctor,
  referrer,
  onReferrer,
  disabled,
}: {
  meta?: SalesMeta;
  department?: string;
  doctor?: { id?: string; name: string } | null;
  onDoctor: (d: { id?: string; name: string } | null) => void;
  referrer?: { id?: string; name?: string };
  onReferrer: (r: { id?: string; name?: string }) => void;
  disabled?: boolean;
}) => {
  const t = useSalesText();
  const pf = useProfile();
  const docs = (meta?.doctors || []).filter((d) => !department || !d.department || d.department === department);
  return (
    <>
      {pf.doctors && (
        <label className={classes.field}>
          {t("crmsTreatingDoctor")}
          <select
            value={doctor?.name || ""}
            disabled={disabled}
            onChange={(e) => {
              const d = docs.find((x) => x.name === e.target.value);
              onDoctor(e.target.value ? { id: d?._id, name: e.target.value } : null);
            }}
          >
            <option value="">—</option>
            {docs.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
            {doctor?.name && !docs.some((d) => d.name === doctor.name) && <option value={doctor.name}>{doctor.name}</option>}
          </select>
        </label>
      )}
      {pf.referrers && (
        <label className={classes.field}>
          {t("crmsReferrer")}
          <input
            list="crms-referrers"
            value={referrer?.name || ""}
            disabled={disabled}
            onChange={(e) => {
              const r = meta?.referrers.find((x) => x.name === e.target.value);
              onReferrer(r ? { id: r._id, name: r.name } : { name: e.target.value });
            }}
          />
          <datalist id="crms-referrers">
            {meta?.referrers.filter((x) => x.active).map((x) => <option key={x._id} value={x.name} />)}
          </datalist>
        </label>
      )}
    </>
  );
};

// A day field on the panel's own (Jalali) date picker, as the rest of the
// panel: the value stays the API's YYYY-MM-DD; an optional one can be cleared.
export const DayField = ({
  label,
  value,
  onChange,
  disabled,
  optional,
}: {
  label: string;
  value?: string | null;
  onChange: (day: string) => void;
  disabled?: boolean;
  optional?: boolean;
}) => {
  const t = useSalesText();
  const day = value ? String(value).slice(0, 10) : "";
  return (
    <div className={`${classes.field} ${s.dayField}`}>
      <DateInput key={day || "none"} title={label} defaultValue={day || undefined} onChange={(d) => onChange(isoDay(d))} readOnly={disabled} />
      {optional && !!day && !disabled && (
        <button type="button" className={s.dayClear} onClick={() => onChange("")} aria-label={t("clearSelection")} title={t("clearSelection")}>
          ×
        </button>
      )}
    </div>
  );
};
