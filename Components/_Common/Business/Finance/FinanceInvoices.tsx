"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import FinanceShell from "./FinanceShell";
import AccSales from "../Acc/AccSales";
import PaymentForm, { POPUP_KEY as PAY_KEY } from "./PaymentForm";
import {
  FinInvoice,
  idOf,
  InsurerKinds,
  insurerKey,
  methodKey,
  nameOf,
  parseAmount,
  Pill,
  statusKey,
  useFin,
  useFinPopup,
  useFinText,
} from "./finShared";

const FORM_KEY = "FinInvoiceForm";
const VIEW_KEY = "FinInvoiceView";

type Line = { title: string; qty: string; unitPrice: string; discount: string; taxRate: string; account: string };
const emptyLine = (): Line => ({ title: "", qty: "1", unitPrice: "", discount: "", taxRate: "0", account: "" });

// New invoice or a draft's edit: the patient, the lines (service, quantity,
// price, discount, VAT, income account), the insurer's share and a note.
// Saved as a draft, or issued at once (which books it).
const InvoiceForm = ({ invoice, onDone }: { invoice?: FinInvoice; onDone: (inv?: FinInvoice) => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, node } = useFin();
  const { close } = useFinPopup();
  const pushNotification = useNotification();
  const { data: accounts } = useBizAccounts();
  const income = asArray<{ _id: string; code: string; name: string; type: string; level: string }>(accounts).filter(
    (a) => a.type === "income" && a.level === "detail",
  );
  const [name, setName] = useState(invoice?.party?.name || "");
  const [phone, setPhone] = useState(invoice?.party?.phone || "");
  const [nationalId, setNationalId] = useState(invoice?.party?.nationalId || "");
  const [doctorName, setDoctorName] = useState(invoice?.doctorName || "");
  const [date, setDate] = useState<Date>(invoice?.date ? new Date(invoice.date) : new Date());
  const [dueDate, setDueDate] = useState<Date | null>(invoice?.dueDate ? new Date(invoice.dueDate) : null);
  const [lines, setLines] = useState<Line[]>(
    invoice?.lines?.length
      ? invoice.lines.map((l) => ({
          title: l.title,
          qty: String(l.qty),
          unitPrice: String(l.unitPrice),
          discount: l.discount ? String(l.discount) : "",
          taxRate: String(l.taxRate || 0),
          account: idOf(l.account),
        }))
      : [emptyLine()],
  );
  const [hasInsurer, setHasInsurer] = useState(!!invoice?.insurer);
  const [insKind, setInsKind] = useState<(typeof InsurerKinds)[number]>(invoice?.insurer?.kind || "tamin");
  const [insName, setInsName] = useState(invoice?.insurer?.name || "");
  const [insShare, setInsShare] = useState(invoice?.insurer?.share ? String(invoice.insurer.share) : "");
  const [note, setNote] = useState(invoice?.note || "");
  const [busy, setBusy] = useState(false);

  const priced = lines.map((l) => {
    const gross = Math.round(parseAmount(l.qty) * parseAmount(l.unitPrice));
    const discount = Math.min(gross, parseAmount(l.discount));
    const net = gross - discount;
    return { gross, discount, net, tax: Math.round((net * Math.min(100, parseAmount(l.taxRate))) / 100) };
  });
  const total = priced.reduce((s, l) => s + l.net + l.tax, 0);
  const share = hasInsurer ? Math.min(total, parseAmount(insShare)) : 0;
  const set = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const ready = name.trim().length >= 2 && total > 0 && lines.every((l) => l.title.trim()) && (!hasInsurer || insName.trim());

  const save = async (issue: boolean) => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: invoice ? `${API}${api}/invoices/${invoice._id}` : `${API}${api}/invoices`,
        method: invoice ? "PATCH" : "POST",
        payload: {
          date: isoDay(date),
          dueDate: dueDate ? isoDay(dueDate) : null,
          party: { name: name.trim(), phone: phone.trim() || undefined, nationalId: nationalId.trim() || undefined },
          doctorName: doctorName.trim() || undefined,
          lines: lines.map((l) => ({
            title: l.title.trim(),
            qty: parseAmount(l.qty) || 1,
            unitPrice: parseAmount(l.unitPrice),
            discount: parseAmount(l.discount),
            taxRate: parseAmount(l.taxRate),
            account: l.account || undefined,
          })),
          insurer: hasInsurer ? { kind: insKind, name: insName.trim(), share } : null,
          note: note.trim() || undefined,
          issue,
        },
      });
      pushNotification(t(issue ? "finIssued" : "bizSaved"), "Success");
      close(FORM_KEY);
      onDone(res.data as FinInvoice);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={invoice ? t("finInvoiceN", [f.year(invoice.number)]) : t("finNewInvoice")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={classes.field}>
            <span>{t("finPatientName")}</span>
            <input value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={classes.field}>
            <span>{t("finMobile")}</span>
            <input value={phone} maxLength={20} dir="ltr" inputMode="tel" onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className={classes.field}>
            <span>{t("finNationalId")}</span>
            <input value={nationalId} maxLength={10} dir="ltr" inputMode="numeric" onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))} />
          </label>
          {node !== "doctor" && (
            <label className={classes.field}>
              <span>{t("finDoctorName")}</span>
              <input value={doctorName} maxLength={200} onChange={(e) => setDoctorName(e.target.value)} />
            </label>
          )}
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
          <div className={classes.field}>
            <DateInput title={t("finDueDate")} defaultValue={dueDate || undefined} onChange={(d) => setDueDate(d)} onClear={() => setDueDate(null)} />
          </div>
        </div>

        <div className={classes.lines}>
          <div className={`${fin.invLine} ${fin.invLineHead}`} aria-hidden>
            <span>{t("finService")}</span>
            <span>{t("finQty")}</span>
            <span>{t("finUnitPrice")}</span>
            <span>{t("finDiscount")}</span>
            <span>{t("finTaxRate")}</span>
            <span>{t("finIncomeAccount")}</span>
            <span />
          </div>
          {lines.map((l, i) => (
            <div key={i} className={fin.invLine}>
              <input aria-label={t("finService")} placeholder={t("finService")} value={l.title} maxLength={300} onChange={(e) => set(i, { title: e.target.value })} />
              <input aria-label={t("finQty")} placeholder={t("finQty")} value={l.qty} dir="ltr" inputMode="decimal" onChange={(e) => set(i, { qty: e.target.value })} />
              <input aria-label={t("finUnitPrice")} placeholder={t("finUnitPrice")} value={l.unitPrice} dir="ltr" inputMode="numeric" onChange={(e) => set(i, { unitPrice: e.target.value })} />
              <input aria-label={t("finDiscount")} placeholder={t("finDiscount")} value={l.discount} dir="ltr" inputMode="numeric" onChange={(e) => set(i, { discount: e.target.value })} />
              <input aria-label={t("finTaxRate")} placeholder="%" value={l.taxRate} dir="ltr" inputMode="decimal" onChange={(e) => set(i, { taxRate: e.target.value })} />
              <select aria-label={t("finIncomeAccount")} value={l.account} onChange={(e) => set(i, { account: e.target.value })}>
                <option value="">{t("finDefaultIncome")}</option>
                {income.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={classes.removeLine}
                aria-label={t("bizDelete")}
                disabled={lines.length < 2}
                onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <div className={classes.actions} style={{ justifyContent: "flex-start" }}>
            <button type="button" className={classes.ghost} onClick={() => setLines((ls) => [...ls, emptyLine()])}>
              {t("finAddLine")}
            </button>
          </div>
        </div>

        {node !== "insurance" && (
          <>
            <label className={fin.check}>
              <input type="checkbox" checked={hasInsurer} onChange={(e) => setHasInsurer(e.target.checked)} />
              {t("finHasInsurer")}
            </label>
            {hasInsurer && (
              <div className={classes.form}>
                <label className={classes.field}>
                  <span>{t("finInsurerKind")}</span>
                  <select value={insKind} onChange={(e) => setInsKind(e.target.value as typeof insKind)}>
                    {InsurerKinds.map((k) => (
                      <option key={k} value={k}>
                        {t(insurerKey(k))}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={classes.field}>
                  <span>{t("finInsurerName")}</span>
                  <input value={insName} maxLength={120} onChange={(e) => setInsName(e.target.value)} placeholder={t(insurerKey(insKind))} />
                </label>
                <label className={classes.field}>
                  <span>{t("finInsurerShare")}</span>
                  <input value={insShare} dir="ltr" inputMode="numeric" onChange={(e) => setInsShare(e.target.value)} />
                </label>
              </div>
            )}
          </>
        )}

        <label className={classes.field}>
          <span>{t("finNote")}</span>
          <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className={fin.summaryBar}>
          <span>
            {t("finSubtotal")}: <b>{f.money(priced.reduce((s, l) => s + l.gross, 0))}</b>
          </span>
          <span>
            {t("finDiscount")}: <b>{f.money(priced.reduce((s, l) => s + l.discount, 0))}</b>
          </span>
          <span>
            {t("finTax")}: <b>{f.money(priced.reduce((s, l) => s + l.tax, 0))}</b>
          </span>
          {share > 0 && (
            <span>
              {t("finInsurerShare")}: <b>{f.money(share)}</b>
            </span>
          )}
          <span>
            {t("finPatientShare")}: <b>{f.money(total - share)}</b> {t("toman")}
          </span>
        </div>

        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => close(FORM_KEY)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.ghost} disabled={busy || !ready} onClick={() => save(false)}>
            {t("finSaveDraft")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || !ready} onClick={() => save(true)}>
            {t("finIssue")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// One invoice as it prints, with what can be done with it.
const InvoiceView = ({ id, onChanged }: { id: string; onChanged: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open, close } = useFinPopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<FinInvoice>(`${API}${api}/invoices/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as FinInvoice));
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"" | "sms" | "void">("");
  const sheet = useRef<HTMLDivElement>(null);
  const changed = () => {
    mutate();
    onChanged();
  };
  const act = async (path: string, payload?: Record<string, unknown>, done?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${api}/invoices/${id}/${path}`, method: "POST", payload: payload || {} });
      if (path === "sms" && res.data && !res.data.sent) pushNotification(t("finSmsNotSent"), "Error");
      else pushNotification(t(done || "bizSaved"), "Success");
      setMode("");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (busy || !window.confirm(t("bizDeleteConfirm"))) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/invoices/${id}`, method: "DELETE" });
      pushNotification(t("bizDeleted"), "Success");
      close(VIEW_KEY);
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  // the sheet alone, in a print window
  const print = () => {
    if (!sheet.current) return;
    const w = window.open("", "_blank", "width=820,height=960");
    if (!w) return;
    const dir = document.documentElement.dir || "rtl";
    w.document.write(
      `<!doctype html><html dir="${dir}" lang="${document.documentElement.lang}"><head><meta charset="utf-8"><title>${t("finInvoiceN", [String(data?.number || "")])}</title>` +
        `<style>body{font-family:Vazirmatn,Tahoma,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:6px;border-bottom:1px solid #ddd;text-align:start}td.n,th.n{text-align:end}h2{margin:0 0 8px}.m{color:#555;font-size:13px}.t{margin-top:12px;margin-inline-start:auto;max-width:320px}.t div{display:flex;justify-content:space-between;padding:3px 0}.g{font-weight:800;border-top:1px solid #999}</style></head><body>` +
        sheet.current.innerHTML +
        `</body></html>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };
  const due = data ? Math.max(0, data.patientShare - data.paid) : 0;
  const manual = data?.origin === "manual";
  return (
    <PopupCard title={data ? t("finInvoiceN", [f.year(data.number)]) : t("finInvoice")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={fin.sheet} ref={sheet}>
                <div className={fin.sheetHead}>
                  <div className={fin.sheetMeta}>
                    <h2 className={fin.sheetTitle}>{t("finInvoiceN", [f.year(data.number)])}</h2>
                    <span className="m">
                      {t("bizDate")}: {f.date(data.date)}
                      {data.dueDate ? ` · ${t("finDueDate")}: ${f.date(data.dueDate)}` : ""}
                    </span>
                    <span className="m">
                      {t("finPatientName")}: {data.party?.name || "—"}
                      {data.party?.phone ? ` · ${data.party.phone}` : ""}
                    </span>
                    {!!data.doctorName && (
                      <span className="m">
                        {t("finDoctorName")}: {data.doctorName}
                      </span>
                    )}
                  </div>
                  <Pill status={data.status}>{t(statusKey(data.status))}</Pill>
                </div>
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("finService")}</th>
                        <th className={`${classes.num} n`}>{t("finQty")}</th>
                        <th className={`${classes.num} n`}>{t("finUnitPrice")}</th>
                        <th className={`${classes.num} n`}>{t("finDiscount")}</th>
                        <th className={`${classes.num} n`}>{t("finTax")}</th>
                        <th className={`${classes.num} n`}>{t("bizTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<FinInvoice["lines"][number]>(data.lines).map((l, i) => (
                        <tr key={i}>
                          <td className={classes.wrap}>{l.title}</td>
                          <td className={`${classes.num} n`}>{f.money(l.qty)}</td>
                          <td className={`${classes.num} n`}>{f.money(l.unitPrice)}</td>
                          <td className={`${classes.num} n`}>{f.money(l.discount)}</td>
                          <td className={`${classes.num} n`}>{f.money(l.tax)}</td>
                          <td className={`${classes.num} n`}>{f.money(l.net + l.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={`${fin.sheetTotals} t`}>
                  <div>
                    <span>{t("finSubtotal")}</span>
                    <span>{f.money(data.subtotal)}</span>
                  </div>
                  <div>
                    <span>{t("finDiscount")}</span>
                    <span>{f.money(data.discount)}</span>
                  </div>
                  <div>
                    <span>{t("finTax")}</span>
                    <span>{f.money(data.tax)}</span>
                  </div>
                  <div className={`${fin.sheetGrand} g`}>
                    <span>{t("bizTotal")}</span>
                    <span>
                      {f.money(data.total)} {t("toman")}
                    </span>
                  </div>
                  {!!data.insurer && (
                    <div>
                      <span>
                        {t("finInsurerShare")} ({data.insurer.name})
                      </span>
                      <span>{f.money(data.insurer.share)}</span>
                    </div>
                  )}
                  <div>
                    <span>{t("finPatientShare")}</span>
                    <span>{f.money(data.patientShare)}</span>
                  </div>
                  <div>
                    <span>{t("invPaid")}</span>
                    <span>{f.money(data.paid)}</span>
                  </div>
                  <div className="g">
                    <span>{t("invDue")}</span>
                    <span>{f.money(due)}</span>
                  </div>
                </div>
                {!!data.note && <p className={classes.muted}>{data.note}</p>}
              </div>

              {!manual && <p className={classes.muted}>{t("finPlatformInvoiceNote")}</p>}
              {data.status === "void" && !!data.voidReason && (
                <p className={fin.notice}>
                  {t("finVoidReason")}: {data.voidReason}
                </p>
              )}

              {asArray<NonNullable<FinInvoice["payments"]>[number]>(data.payments).length > 0 && (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizDate")}</th>
                        <th>{t("finMethod")}</th>
                        <th>{t("finTill")}</th>
                        <th className={classes.num}>{t("bizAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<NonNullable<FinInvoice["payments"]>[number]>(data.payments).map((p) => (
                        <tr key={p._id} className={p.isVoid ? fin.small : ""}>
                          <td>{f.date(p.date)}</td>
                          <td>
                            {t(methodKey(p.method))}
                            {p.cheque ? ` · ${p.cheque.number} ` : " "}
                            {p.cheque && <Pill status={p.cheque.status}>{t(statusKey(p.cheque.status))}</Pill>}
                            {p.isVoid && <Pill status="void">{t("finStVoid")}</Pill>}
                          </td>
                          <td>{nameOf(p.money)}</td>
                          <td className={classes.num}>{f.money(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {mode === "sms" && (
                <div className={classes.form}>
                  <label className={classes.field}>
                    <span>{t("finMobile")}</span>
                    <input value={phone || data.party?.phone || ""} dir="ltr" inputMode="tel" onChange={(e) => setPhone(e.target.value)} />
                  </label>
                  <div className={classes.actions}>
                    <button type="button" className={classes.primary} disabled={busy} onClick={() => act("sms", { phone: (phone || data.party?.phone || "").trim() }, "finSmsSent")}>
                      {t("finSendSms")}
                    </button>
                  </div>
                </div>
              )}
              {mode === "void" && (
                <div className={classes.form}>
                  <label className={`${classes.field} ${classes.wide}`}>
                    <span>{t("finVoidReason")}</span>
                    <input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <div className={classes.actions}>
                    <button type="button" className={classes.danger} disabled={busy || reason.trim().length < 2} onClick={() => act("void", { reason: reason.trim() }, "finVoided")}>
                      {t("finVoid")}
                    </button>
                  </div>
                </div>
              )}

              <div className={`${classes.actions} ${fin.noPrint}`}>
                <button type="button" className={classes.ghost} onClick={print}>
                  {t("finPrint")}
                </button>
                {!!data.link && data.status !== "draft" && (
                  <button
                    type="button"
                    className={classes.ghost}
                    onClick={() => {
                      navigator.clipboard?.writeText(data.link || "").then(() => pushNotification(t("finLinkCopied"), "Success"), () => undefined);
                    }}
                  >
                    {t("finCopyLink")}
                  </button>
                )}
                {canWrite && data.status !== "draft" && data.status !== "void" && (
                  <button type="button" className={classes.ghost} onClick={() => setMode(mode === "sms" ? "" : "sms")}>
                    {t("finSendSms")}
                  </button>
                )}
                {canWrite && manual && data.status !== "draft" && data.status !== "void" && !data.moadian && (
                  <button type="button" className={classes.ghost} disabled={busy} onClick={() => act("moadian", {}, "finSentMoadian")}>
                    {t("finSendMoadian")}
                  </button>
                )}
                {!!data.moadian && typeof data.moadian === "object" && <Pill status="issued">{t("finInMoadian")}</Pill>}
                {canWrite && manual && data.status !== "draft" && data.status !== "void" && !data.claim && (
                  <button type="button" className={classes.danger} onClick={() => setMode(mode === "void" ? "" : "void")}>
                    {t("finVoid")}
                  </button>
                )}
                {canWrite && data.status === "draft" && (
                  <>
                    <button type="button" className={classes.danger} disabled={busy} onClick={remove}>
                      {t("bizDelete")}
                    </button>
                    <button
                      type="button"
                      className={classes.ghost}
                      onClick={() => {
                        close(VIEW_KEY);
                        open(FORM_KEY, <InvoiceForm invoice={data} onDone={() => onChanged()} />);
                      }}
                    >
                      {t("bizEdit")}
                    </button>
                    <button type="button" className={classes.primary} disabled={busy} onClick={() => act("issue", {}, "finIssued")}>
                      {t("finIssue")}
                    </button>
                  </>
                )}
                {canWrite && manual && due > 0 && (data.status === "issued" || data.status === "partial") && (
                  <button
                    type="button"
                    className={classes.primary}
                    onClick={() =>
                      open(PAY_KEY, <PaymentForm direction="in" against="invoice" docId={data._id} open={due} party={data.party?.name} onDone={changed} />)
                    }
                  >
                    {t("finRecordPayment")}
                  </button>
                )}
              </div>
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

type List = { items: FinInvoice[]; total: number; sums: { total: number; paid: number; due: number } };
const STATUSES = ["", "open", "paid", "draft", "void"] as const;

const Body = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open } = useFinPopup();
  const params = useSearchParams();
  const [status, setStatus] = useState<string>(STATUSES.includes((params?.get("status") || "") as (typeof STATUSES)[number]) ? params?.get("status") || "" : "");
  const [origin, setOrigin] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) p.set("status", status);
    if (origin) p.set("origin", origin);
    if (q.trim()) p.set("q", q.trim());
    if (from) p.set("from", isoDay(from));
    if (to) p.set("to", isoDay(to));
    return p.toString();
  }, [from, origin, page, q, status, to]);
  const { data, error, mutate } = useSWR<List>(`${API}${api}/invoices?${query}`, (url: string) => fetcher({ url }).then((res) => res.data as List));
  const rows = asArray<FinInvoice>(data?.items);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / limit));
  const view = (inv: FinInvoice) => open(VIEW_KEY, <InvoiceView id={inv._id} onChanged={() => mutate()} />);
  const create = () => open(FORM_KEY, <InvoiceForm onDone={(inv) => (mutate(), inv && view(inv))} />);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current && canWrite && params?.get("new") === "1") {
      opened.current = true;
      create();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWrite, params]);

  return (
    <>
      <div className={classes.tiles}>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finInvoicedTotal")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.sums.total)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finCollected")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.sums.paid)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finOutstanding")}</span>
          <span className={`${classes.tileValue} ${(data?.sums.due || 0) > 0 ? classes.negative : ""}`}>
            {f.money(data?.sums.due)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
      </div>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {STATUSES.map((s) => (
              <button
                key={s || "all"}
                type="button"
                role="tab"
                aria-selected={status === s}
                className={status === s ? classes.on : ""}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
              >
                {t(s ? (s === "open" ? "finStOpen" : statusKey(s)) : "finAll")}
              </button>
            ))}
          </div>
          {canWrite && (
            <button type="button" className={classes.primary} onClick={create}>
              {t("finNewInvoice")}
            </button>
          )}
        </div>
        <div className={classes.filters}>
          <input
            type="search"
            placeholder={t("finSearchInvoices")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setPage(1);
            }}
            aria-label={t("finOrigin")}
          >
            <option value="">{t("finAllOrigins")}</option>
            <option value="platform">{t("finOriginPlatform")}</option>
            <option value="manual">{t("finOriginManual")}</option>
          </select>
          <DateInput title={t("bizFrom")} onChange={(d) => (setFrom(d), setPage(1))} onClear={() => setFrom(null)} />
          <DateInput title={t("bizTo")} onChange={(d) => (setTo(d), setPage(1))} onClear={() => setTo(null)} />
        </div>
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (rows.length === 0 ? (
              <p className={classes.empty}>{t("finNoInvoices")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizNumber")}</th>
                      <th>{t("bizDate")}</th>
                      <th>{t("finPatientName")}</th>
                      <th>{t("finService")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                      <th className={classes.num}>{t("invDue")}</th>
                      <th>{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((inv) => (
                      <tr key={inv._id} className={classes.rowLink} tabIndex={0} onClick={() => view(inv)} onKeyDown={(e) => e.key === "Enter" && view(inv)}>
                        <td>{f.year(inv.number)}</td>
                        <td>{f.date(inv.date)}</td>
                        <td className={classes.wrap}>
                          {inv.party?.name || "—"}
                          {inv.origin === "platform" && (
                            <>
                              {" "}
                              <span className={`${classes.badge} ${classes.badgeAuto}`}>{t("finOriginPlatform")}</span>
                            </>
                          )}
                        </td>
                        <td className={classes.wrap}>{asArray<{ title: string }>(inv.lines).map((l) => l.title).join("، ")}</td>
                        <td className={classes.num}>{f.money(inv.total)}</td>
                        <td className={`${classes.num} ${inv.patientShare - inv.paid > 0 && inv.status !== "void" && inv.status !== "draft" ? classes.negative : ""}`}>
                          {inv.status === "void" || inv.status === "draft" ? "—" : f.money(Math.max(0, inv.patientShare - inv.paid))}
                        </td>
                        <td>
                          <Pill status={inv.status}>{t(statusKey(inv.status))}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </HandleLoading>
        {pages > 1 && (
          <div className={classes.pagination}>
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t("bizPrev")}
            </button>
            <span>{t("bizPage", [f.year(page), f.year(pages)])}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              {t("bizNext")}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

// «مالی و حسابداری» → صورتحساب‌ها (2026-10): every visit and order paid on
// Noyan is an invoice already; the provider adds its own (the desk, a
// procedure, a counter sale) with lines, discount, VAT and the insurer's
// share, prints it, sends its link by SMS, records payments and sends it
// to Moadian.
const FinanceInvoices = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finInvoicesTitle" subtitle="finInvoicesSubtitle" segment="invoices">
    {/* (2026-10) the quick sale, pre-invoices and the price list beside the invoices */}
    <AccSales invoices={<Body />} />
  </FinanceShell>
);

export default FinanceInvoices;
