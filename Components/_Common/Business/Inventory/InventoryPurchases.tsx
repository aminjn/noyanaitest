"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import { useIntlLocale } from "@/Components/i18n/navigation";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import inv from "./Inventory.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import {
  InvContext,
  InvItem,
  InvPurchase,
  InvSupplier,
  qtyText,
  toNum,
  useInv,
  useInvItems,
  useInvSuppliers,
  useInvText,
} from "./invShared";
import { SupplierForm } from "./InventorySuppliers";

type Ctx = React.ContextType<typeof InvContext>;
type Line = { item: string; qty: string; unitCost: string; lotNo: string; expiry: Date | null };
const emptyLine = (): Line => ({ item: "", qty: "", unitCost: "", lotNo: "", expiry: null });
const refId = (v: { _id: string } | string | null | undefined) => (v && typeof v === "object" ? v._id : v || "");

const statusClass = (s: InvPurchase["status"]) =>
  s === "received" ? inv.badgeOk : s === "cancelled" ? inv.badgeBad : classes.badgeManual;
const statusKey = (s: InvPurchase["status"]) =>
  s === "received" ? "invStatusReceived" : s === "cancelled" ? "invStatusCancelled" : "invStatusDraft";

// A purchase invoice: supplier, lines with batch number and expiry (what
// FEFO and the expiry alerts run on), discount and VAT. Saved as a draft;
// "receive" puts it in stock and books the payable.
const PurchaseForm = ({ purchase, onDone }: { purchase?: InvPurchase; onDone: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const ctx = useInv();
  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data: items } = useInvItems();
  const { data: suppliers, mutate: mutateSuppliers } = useInvSuppliers();
  const [supplier, setSupplier] = useState(refId(purchase?.supplier));
  const [invoiceNo, setInvoiceNo] = useState(purchase?.invoiceNo || "");
  const [date, setDate] = useState<Date>(purchase ? new Date(purchase.date) : new Date());
  const [discount, setDiscount] = useState(purchase?.discount ? String(purchase.discount) : "");
  const [tax, setTax] = useState(purchase?.tax ? String(purchase.tax) : "");
  const [lines, setLines] = useState<Line[]>(
    purchase?.lines.length
      ? purchase.lines.map((l) => ({
          item: refId(l.item),
          qty: String(l.qty),
          unitCost: String(l.unitCost),
          lotNo: l.lotNo || "",
          expiry: l.expiry ? new Date(l.expiry) : null,
        }))
      : [emptyLine()],
  );
  const [busy, setBusy] = useState(false);
  const active = asArray<InvItem>(items).filter((i) => i.isActive);
  const subtotal = lines.reduce((s, l) => s + toNum(l.qty) * toNum(l.unitCost), 0);
  const total = subtotal - Math.min(toNum(discount), subtotal) + toNum(tax);
  const valid = !!supplier && lines.some((l) => l.item && toNum(l.qty) > 0);
  const set = (i: number, patch: Partial<Line>) => setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const close = () => closePopup("InvPurchaseForm");

  const newSupplier = () =>
    setPopup(
      "InvSupplierForm",
      <InvContext.Provider value={ctx}>
        <SupplierForm
          onDone={(s) => {
            mutateSuppliers();
            if (s?._id) setSupplier(s._id);
          }}
        />
      </InvContext.Provider>,
    );

  const save = async (receive: boolean) => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: purchase ? `${API}${ctx.api}/purchases/${purchase._id}` : `${API}${ctx.api}/purchases`,
        method: purchase ? "PATCH" : "POST",
        payload: {
          supplier,
          invoiceNo: invoiceNo.trim() || undefined,
          date: isoDay(date),
          discount: toNum(discount),
          tax: toNum(tax),
          lines: lines
            .filter((l) => l.item && toNum(l.qty) > 0)
            .map((l) => ({
              item: l.item,
              qty: toNum(l.qty),
              unitCost: toNum(l.unitCost),
              lotNo: l.lotNo.trim() || undefined,
              expiry: l.expiry ? isoDay(l.expiry) : undefined,
            })),
        },
      });
      const id = (res.data as { _id?: string })?._id || purchase?._id;
      // the draft is saved either way: a failed receipt leaves it in the list
      // to fix and receive again, never a second copy
      close();
      onDone();
      if (receive && id) await fetcher({ url: `${API}${ctx.api}/purchases/${id}/receive`, method: "POST" });
      pushNotification(t(receive ? "invReceived" : "bizSaved"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={purchase ? t("invPurchaseTitle", [f.money(purchase.number)]) : t("invNewPurchase")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("invSupplier")}
            <span className={inv.inline}>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                <option value="">{t("bizSelect")}</option>
                {asArray<InvSupplier>(suppliers)
                  .filter((s) => s.isActive || s._id === supplier)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <button type="button" className={classes.ghost} onClick={newSupplier} aria-label={t("invAddSupplier")} title={t("invAddSupplier")}>
                +
              </button>
            </span>
          </label>
          <label className={classes.field}>
            {t("invInvoiceNo")}
            <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} maxLength={60} dir="ltr" />
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
        </div>

        <div className={inv.lines}>
          {lines.map((l, i) => (
            <div key={i} className={inv.lineRow}>
              <label className={`${classes.field} ${inv.lineItem}`}>
                {t("invItem")}
                <select value={l.item} onChange={(e) => set(i, { item: e.target.value, unitCost: l.unitCost || String(active.find((x) => x._id === e.target.value)?.lastCost || "") })}>
                  <option value="">{t("bizSelect")}</option>
                  {active.map((x) => (
                    <option key={x._id} value={x._id}>
                      {x.name}
                      {x.unit ? ` (${x.unit})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className={classes.field}>
                {t("invQty")}
                <input value={l.qty} onChange={(e) => set(i, { qty: e.target.value })} inputMode="decimal" />
              </label>
              <label className={classes.field}>
                {t("invUnitCost")}
                <input value={l.unitCost} onChange={(e) => set(i, { unitCost: e.target.value })} inputMode="numeric" />
              </label>
              <label className={classes.field}>
                {t("invLotNo")}
                <input value={l.lotNo} onChange={(e) => set(i, { lotNo: e.target.value })} maxLength={60} dir="ltr" />
              </label>
              <div className={classes.field}>
                <DateInput title={t("invExpiry")} defaultValue={l.expiry || undefined} onChange={(d) => set(i, { expiry: d })} />
              </div>
              <button
                type="button"
                className={classes.removeLine}
                onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [emptyLine()]))}
                aria-label={t("bizDelete")}
              >
                ×
              </button>
            </div>
          ))}
          <div>
            <button type="button" className={classes.ghost} onClick={() => setLines((prev) => [...prev, emptyLine()])}>
              {t("bizAddLine")}
            </button>
          </div>
        </div>

        <div className={classes.form}>
          <label className={classes.field}>
            {t("invDiscount")}
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("invTax")}
            <input value={tax} onChange={(e) => setTax(e.target.value)} inputMode="numeric" />
          </label>
        </div>
        <div className={inv.totals}>
          <span>
            {t("invSubtotal")}: <strong>{f.money(subtotal)}</strong>
          </span>
          <span>
            {t("invGrand")}: <strong>{f.money(total)}</strong> {t("toman")}
          </span>
        </div>
        <p className={classes.muted}>{t("invReceiveHint")}</p>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={close}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.ghost} disabled={busy || !valid} onClick={() => save(false)}>
            {t("invSaveDraft")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || !valid} onClick={() => save(true)}>
            {t("invReceive")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

type PayAccount = { _id: string; code: string; name: string };

const PayForm = ({ purchase, onDone }: { purchase: InvPurchase; onDone: () => unknown }) => {
  const t = useInvText();
  const { api } = useInv();
  const pushNotification = useNotification();
  const { data: accounts } = useSWR<PayAccount[]>(`${API}${api}/pay-accounts`, (url: string) =>
    fetcher({ url }).then((res) => asArray<PayAccount>(res.data)),
  );
  const due = purchase.total - purchase.paid;
  const [amount, setAmount] = useState(String(due));
  const [via, setVia] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    if (busy || !via) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/purchases/${purchase._id}/pay`,
        method: "POST",
        payload: { amount: toNum(amount), via, date: isoDay(date) },
      });
      pushNotification(t("bizSaved"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={inv.subCard}>
      <span className={classes.cardTitle}>{t("invPay")}</span>
      <div className={classes.form}>
        <label className={classes.field}>
          {t("bizAmount")}
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
        </label>
        <label className={classes.field}>
          {t("invPayFrom")}
          <select value={via} onChange={(e) => setVia(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {asArray<PayAccount>(accounts).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || !via || !(toNum(amount) > 0)} onClick={pay}>
            {t("invPay")}
          </button>
        </div>
      </div>
    </section>
  );
};

const PurchaseDetail = ({ ctx, id, onChanged }: { ctx: Ctx; id: string; onChanged: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<InvPurchase>(`${API}${ctx.api}/purchases/${id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as InvPurchase),
  );
  const [confirm, setConfirm] = useState<"" | "receive" | "cancel">("");
  const [busy, setBusy] = useState(false);
  // (2026-10) a payment to the supplier voided: reversed, the payable open again
  const [voiding, setVoiding] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const voidPayment = async (paymentId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${ctx.api}/purchases/${id}/payments/${paymentId}/void`, method: "POST", payload: { reason: voidReason.trim() || undefined } });
      pushNotification(t("invPaymentVoided"), "Success");
      setVoiding("");
      setVoidReason("");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const changed = () => {
    mutate();
    onChanged();
  };
  const act = async (action: "receive" | "cancel") => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${ctx.api}/purchases/${id}/${action}`, method: "POST" });
      pushNotification(t(action === "receive" ? "invReceived" : "invCancelled"), "Success");
      setConfirm("");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const due = data ? data.total - data.paid : 0;
  return (
    <PopupCard title={data ? t("invPurchaseTitle", [f.money(data.number)]) : t("invTabPurchases")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>
                  {data.supplier?.name || "—"}
                  {data.invoiceNo ? ` · ${data.invoiceNo}` : ""}
                </span>
                <span className={`${classes.badge} ${statusClass(data.status)}`}>{t(statusKey(data.status))}</span>
              </div>
              <span className={classes.muted}>{f.date(data.date)}</span>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("invItem")}</th>
                      <th>{t("invLotNo")}</th>
                      <th>{t("invExpiry")}</th>
                      <th className={classes.num}>{t("invQty")}</th>
                      <th className={classes.num}>{t("invUnitCost")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asArray<InvPurchase["lines"][number]>(data.lines).map((l, i) => (
                      <tr key={i}>
                        <td className={classes.wrap}>{l.item?.name || "—"}</td>
                        <td dir="ltr" className={inv.start}>
                          {l.lotNo || "—"}
                        </td>
                        <td>{l.expiry ? f.date(l.expiry) : "—"}</td>
                        <td className={classes.num}>
                          {qtyText(l.qty, tag)} {l.item?.unit || ""}
                        </td>
                        <td className={classes.num}>{f.money(l.unitCost)}</td>
                        <td className={classes.num}>{f.money(l.qty * l.unitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={inv.totals}>
                <span>
                  {t("invSubtotal")}: <strong>{f.money(data.subtotal)}</strong>
                </span>
                {!!data.discount && (
                  <span>
                    {t("invDiscount")}: <strong>{f.money(data.discount)}</strong>
                  </span>
                )}
                {!!data.tax && (
                  <span>
                    {t("invTax")}: <strong>{f.money(data.tax)}</strong>
                  </span>
                )}
                <span>
                  {t("invGrand")}: <strong>{f.money(data.total)}</strong>
                </span>
                {data.status === "received" && (
                  <>
                    <span>
                      {t("invPaid")}: <strong>{f.money(data.paid)}</strong>
                    </span>
                    <span className={due > 0 ? classes.negative : classes.positive}>
                      {t("invDue")}: <strong>{f.money(due)}</strong>
                    </span>
                  </>
                )}
              </div>
              {asArray(data.payments).length > 0 && (
                <section className={inv.subCard}>
                  <span className={classes.cardTitle}>{t("invPayments")}</span>
                  <div className={classes.tableWrap}>
                    <table className={classes.table}>
                      <tbody>
                        {asArray<InvPurchase["payments"][number]>(data.payments).map((p) => (
                          <tr key={p._id} style={p.voidedAt ? { opacity: 0.6 } : undefined}>
                            <td>{f.date(p.date)}</td>
                            <td className={classes.wrap}>
                              {p.via?.name || "—"}
                              {p.voidedAt && (
                                <span className={classes.muted}>
                                  {" "}
                                  · {t("invPaymentVoid")}
                                  {p.voidReason ? `: ${p.voidReason}` : ""}
                                </span>
                              )}
                            </td>
                            <td className={classes.num} style={p.voidedAt ? { textDecoration: "line-through" } : undefined}>
                              {f.money(p.amount)}
                            </td>
                            {ctx.canWrite && data.status === "received" && (
                              <td>
                                {!p.voidedAt &&
                                  (voiding === p._id ? (
                                    <div className={inv.voidRow}>
                                      <input
                                        value={voidReason}
                                        maxLength={500}
                                        placeholder={t("invVoidReason")}
                                        aria-label={t("invVoidReason")}
                                        onChange={(e) => setVoidReason(e.target.value)}
                                      />
                                      <button type="button" className={classes.ghost} onClick={() => setVoiding("")}>
                                        {t("bizCancel")}
                                      </button>
                                      <button type="button" className={classes.danger} disabled={busy} onClick={() => voidPayment(p._id)}>
                                        {t("invVoidPayment")}
                                      </button>
                                    </div>
                                  ) : (
                                    <button type="button" className={classes.ghost} onClick={() => (setVoiding(p._id), setVoidReason(""))}>
                                      {t("invVoidPayment")}
                                    </button>
                                  ))}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {ctx.canWrite && data.status === "received" && due > 0 && <PayForm purchase={data} onDone={changed} />}
              {ctx.canWrite && data.status !== "cancelled" && (
                <>
                  {confirm && (
                    <p className={classes.muted}>{t(confirm === "receive" ? "invReceiveConfirm" : "invCancelConfirm")}</p>
                  )}
                  <div className={classes.actions}>
                    {confirm ? (
                      <>
                        <button type="button" className={classes.ghost} onClick={() => setConfirm("")}>
                          {t("bizCancel")}
                        </button>
                        <button
                          type="button"
                          className={confirm === "cancel" ? classes.danger : classes.primary}
                          disabled={busy}
                          onClick={() => act(confirm)}
                        >
                          {t(confirm === "receive" ? "invReceive" : "invCancelPurchase")}
                        </button>
                      </>
                    ) : (
                      <>
                        {(data.status === "draft" || data.paid === 0) && (
                          <button type="button" className={classes.danger} onClick={() => setConfirm("cancel")}>
                            {t("invCancelPurchase")}
                          </button>
                        )}
                        {data.status === "received" && data.paid > 0 && <span className={classes.muted}>{t("invCancelNeedsVoid")}</span>}
                        {data.status === "draft" && (
                          <>
                            <button
                              type="button"
                              className={classes.ghost}
                              onClick={() => {
                                closePopup("InvPurchaseDetail");
                                setPopup(
                                  "InvPurchaseForm",
                                  <InvContext.Provider value={ctx}>
                                    <PurchaseForm purchase={data} onDone={onChanged} />
                                  </InvContext.Provider>,
                                );
                              }}
                            >
                              {t("bizEdit")}
                            </button>
                            <button type="button" className={classes.primary} onClick={() => setConfirm("receive")}>
                              {t("invReceive")}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const LIMIT = 20;

const InventoryPurchases = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const ctx = useInv();
  const { setPopup } = usePopup();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status) params.set("status", status);
  const { data, error, mutate, isValidating } = useSWR<{ items: InvPurchase[]; total: number }>(
    `${API}${ctx.api}/purchases?${params}`,
    (url: string) =>
      fetcher({ url }).then((res) => ({ items: asArray<InvPurchase>(res.data?.items), total: Number(res.data?.total) || 0 })),
    { keepPreviousData: true },
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (p: InvPurchase) =>
    setPopup(
      "InvPurchaseDetail",
      <InvContext.Provider value={ctx}>
        <PurchaseDetail ctx={ctx} id={p._id} onChanged={changed} />
      </InvContext.Provider>,
    );

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label={t("status")}>
            <option value="">{t("invAllStatuses")}</option>
            <option value="draft">{t("invStatusDraft")}</option>
            <option value="received">{t("invStatusReceived")}</option>
            <option value="cancelled">{t("invStatusCancelled")}</option>
          </select>
        </div>
        {ctx.canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() =>
              setPopup(
                "InvPurchaseForm",
                <InvContext.Provider value={ctx}>
                  <PurchaseForm onDone={changed} />
                </InvContext.Provider>,
              )
            }
          >
            {t("invNewPurchase")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (data.items.length === 0 ? (
            <p className={classes.empty}>{t("invNoPurchases")}</p>
          ) : (
            <div className={classes.tableWrap} style={{ opacity: isValidating ? 0.6 : 1 }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizNumber")}</th>
                    <th>{t("bizDate")}</th>
                    <th>{t("invSupplier")}</th>
                    <th>{t("status")}</th>
                    <th className={classes.num}>{t("invGrand")}</th>
                    <th className={classes.num}>{t("invDue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p._id} className={classes.rowLink} tabIndex={0} onClick={() => open(p)} onKeyDown={(e) => e.key === "Enter" && open(p)}>
                      <td>{f.money(p.number)}</td>
                      <td>{f.date(p.date)}</td>
                      <td className={classes.wrap}>
                        {p.supplier?.name || "—"}
                        {p.invoiceNo ? <span className={classes.muted}> · {p.invoiceNo}</span> : null}
                      </td>
                      <td>
                        <span className={`${classes.badge} ${statusClass(p.status)}`}>{t(statusKey(p.status))}</span>
                      </td>
                      <td className={classes.num}>{f.money(p.total)}</td>
                      <td className={`${classes.num} ${p.status === "received" && p.total > p.paid ? classes.negative : ""}`}>
                        {p.status === "received" ? f.money(p.total - p.paid) : "—"}
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

export default InventoryPurchases;
