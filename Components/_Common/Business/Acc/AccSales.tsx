"use client";

import { ReactNode, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { parseAmount, StockItem, useFin, useStockItems } from "../Finance/finShared";
import { AccountSelect, AmountInput, ConfirmButton, ExportBar, MoneySelect, SimplePopup, SubNav, useAccCall, useAccGet, useAccPopup, useAccText, useView } from "./accShared";

// The sales tools beside the invoices (2026-10), after Nexxa's price-list,
// proforma (pre-invoice → invoice) and quick-invoice pages: the practice's
// own tariff of services and goods (with the insurers' tariff beside the
// free price and the income account each books to), pre-invoices that are
// converted into invoices with the next invoice number, and one screen
// that issues an invoice and takes its payment at the desk.

type Price = { _id: string; code?: string; title: string; group?: string; unit?: string; price: number; insurancePrice?: number; taxRate: number; account?: string; isActive: boolean };
// item: a stock item sold on the line (2026-10): the sale takes it out of
// stock FEFO with its cost of sales, voiding the invoice brings it back
type Line = { title: string; qty: string; unitPrice: string; discount: string; taxRate: string; account: string; item: string };
const emptyLine = (): Line => ({ title: "", qty: "1", unitPrice: "", discount: "", taxRate: "0", account: "", item: "" });

const usePrices = (all = false) => useAccGet<Price[]>(`/acc/prices${all ? "?all=1" : ""}`, (d) => asArray<Price>(d));

const PriceForm = ({ price, onDone }: { price?: Price; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: accounts } = useBizAccounts();
  const [d, setD] = useState({ code: price?.code || "", title: price?.title || "", group: price?.group || "", unit: price?.unit || "" });
  const [p, setP] = useState(price ? String(price.price) : "");
  const [ip, setIp] = useState(price?.insurancePrice ? String(price.insurancePrice) : "");
  const [tax, setTax] = useState(String(price?.taxRate ?? 0));
  const [account, setAccount] = useState(price?.account || "");
  const field = (k: keyof typeof d, label: string) => (
    <label className={classes.field}>
      <span>{label}</span>
      <input value={d[k]} onChange={(e) => setD((x) => ({ ...x, [k]: e.target.value }))} />
    </label>
  );
  return (
    <SimplePopup title={price ? price.title : t("accNewPrice")}>
      <div className={classes.form}>
        {field("title", t("accPriceTitle"))}
        {field("code", t("accCodeOptional"))}
        {field("group", t("accPriceGroup"))}
        {field("unit", t("accUnit"))}
        <AmountInput label={t("accPriceFree")} value={p} onChange={setP} />
        <AmountInput label={t("accPriceInsurance")} value={ip} onChange={setIp} />
        <label className={classes.field}>
          <span>{t("accTaxRate")}</span>
          <input value={tax} dir="ltr" inputMode="decimal" onChange={(e) => setTax(e.target.value)} />
        </label>
        <AccountSelect accounts={asArray<BizAccount>(accounts).filter((a) => a.type === "income")} value={account} onChange={setAccount} label={t("accIncomeAccount")} empty={t("accDefaultIncome")} />
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={d.title.trim().length < 2}
          onClick={async () => {
            if (await call("/acc/prices", "POST", { id: price?._id, ...d, price: parseAmount(p), insurancePrice: ip ? parseAmount(ip) : null, taxRate: Number(tax) || 0, account: account || undefined })) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const PriceList = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = usePrices(true);
  const [q, setQ] = useState("");
  const rows = asArray<Price>(data).filter((p) => !q.trim() || p.title.includes(q.trim()) || (p.code || "").includes(q.trim()) || (p.group || "").includes(q.trim()));
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bizSearch")} aria-label={t("bizSearch")} />
        </div>
        <div className={acc.tools}>
          <ExportBar
            sheet={() => ({
              title: t("accPriceList"),
              head: [t("bizCode"), t("accPriceTitle"), t("accPriceGroup"), t("accUnit"), t("accPriceFree"), t("accPriceInsurance"), t("accTaxRate")],
              rows: rows.map((p) => [p.code || "", p.title, p.group || "", p.unit || "", p.price, p.insurancePrice ?? "", p.taxRate]),
            })}
          />
          {canWrite && (
            <button type="button" className={classes.primary} onClick={() => open("AccPriceForm", <PriceForm onDone={() => mutate()} />)}>
              {t("accNewPrice")}
            </button>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("accPriceTitle")}</th>
                <th>{t("accPriceGroup")}</th>
                <th className={classes.num}>{t("accPriceFree")}</th>
                <th className={classes.num}>{t("accPriceInsurance")}</th>
                <th className={classes.num}>{t("accTaxRate")}</th>
                {canWrite && <th />}
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
              {rows.map((p) => (
                <tr key={p._id} style={{ opacity: p.isActive ? 1 : 0.55 }}>
                  <td>{p.code || "—"}</td>
                  <td className={classes.wrap}>{p.title}</td>
                  <td>{p.group || "—"}</td>
                  <td className={classes.num}>{f.money(p.price)}</td>
                  <td className={classes.num}>{p.insurancePrice ? f.money(p.insurancePrice) : "—"}</td>
                  <td className={classes.num}>{f.money(p.taxRate)}</td>
                  {canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccPriceForm", <PriceForm price={p} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                        <button type="button" onClick={async () => (await call("/acc/prices", "POST", { id: p._id, title: p.title, price: p.price, taxRate: p.taxRate, isActive: !p.isActive })) && mutate()}>
                          {p.isActive ? t("accDeactivate") : t("accActivate")}
                        </button>
                        <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/prices/${p._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
                      </div>
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

// the lines of a sale, picked from the price list or typed
const SaleLines = ({ lines, setLines }: { lines: Line[]; setLines: (fn: (l: Line[]) => Line[]) => void }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { data } = usePrices();
  const prices = asArray<Price>(data);
  const { node } = useFin();
  const { data: stockData } = useStockItems(node);
  const stock = asArray<StockItem>(stockData);
  const set = (i: number, patch: Partial<Line>) => setLines((p) => p.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  // the title follows the item unless it was typed by hand; an item's sale
  // books to its class's income account, so a price-list account is dropped
  const pickItem = (i: number, id: string) =>
    setLines((ls) =>
      ls.map((l, j) => {
        if (j !== i) return l;
        const before = stock.find((x) => x._id === l.item);
        const it = stock.find((x) => x._id === id);
        const title = !l.title.trim() || (before && l.title === before.name) ? it?.name || "" : l.title;
        return { ...l, item: id, title, account: id ? "" : l.account };
      }),
    );
  const total = lines.reduce((s, l) => {
    const net = parseAmount(l.qty) * parseAmount(l.unitPrice) - parseAmount(l.discount);
    return s + net + Math.round((net * (Number(l.taxRate) || 0)) / 100);
  }, 0);
  return (
    <div className={classes.lines}>
      {lines.map((l, i) => (
        <div key={i} className={`${acc.editLine} ${acc.saleLine}`}>
          <div className={`${acc.pick} ${fin.invItemCell}`}>
            <input
              list="acc-price-list"
              value={l.title}
              placeholder={t("accPriceTitle")}
              aria-label={t("accPriceTitle")}
              onChange={(e) => {
                const hit = prices.find((p) => p.title === e.target.value);
                set(i, hit ? { title: hit.title, unitPrice: String(hit.price), taxRate: String(hit.taxRate), account: l.item ? "" : hit.account || "" } : { title: e.target.value });
              }}
            />
            {stock.length > 0 && (
              <select aria-label={t("finStockItem")} value={l.item} onChange={(e) => pickItem(i, e.target.value)}>
                <option value="">{t("finNoStockItem")}</option>
                {stock.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name} · {f.money(x.stock)} {x.unit || ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <input inputMode="decimal" dir="ltr" value={l.qty} aria-label={t("accQty")} onChange={(e) => set(i, { qty: e.target.value })} />
          <input inputMode="numeric" dir="ltr" value={l.unitPrice} placeholder={t("accUnitPrice")} aria-label={t("accUnitPrice")} onChange={(e) => set(i, { unitPrice: e.target.value })} />
          <input inputMode="numeric" dir="ltr" value={l.discount} placeholder={t("accDiscount")} aria-label={t("accDiscount")} onChange={(e) => set(i, { discount: e.target.value })} />
          <input inputMode="decimal" dir="ltr" value={l.taxRate} aria-label={t("accTaxRate")} onChange={(e) => set(i, { taxRate: e.target.value })} />
          <button type="button" className={classes.removeLine} disabled={lines.length <= 1} aria-label={t("bizDelete")} onClick={() => setLines((p) => p.filter((_, j) => j !== i))}>
            ×
          </button>
        </div>
      ))}
      <datalist id="acc-price-list">
        {prices.map((p) => (
          <option key={p._id} value={p.title} />
        ))}
      </datalist>
      <div className={acc.bar}>
        <button type="button" className={classes.ghost} onClick={() => setLines((p) => [...p, emptyLine()])}>
          {t("bizAddLine")}
        </button>
        <span className={classes.cardTitle}>
          {t("bizTotal")}: {f.money(total)}
        </span>
      </div>
    </div>
  );
};

const payloadOf = (party: { name: string; phone: string; nationalId: string }, lines: Line[]) => ({
  party,
  lines: lines
    .filter((l) => l.title.trim() && parseAmount(l.unitPrice) > 0)
    .map((l) => ({
      title: l.title.trim(),
      qty: parseAmount(l.qty) || 1,
      unitPrice: parseAmount(l.unitPrice),
      discount: parseAmount(l.discount),
      taxRate: Number(l.taxRate) || 0,
      account: l.account || undefined,
      item: l.item || undefined,
    })),
});

const PartyFields = ({ v, set }: { v: { name: string; phone: string; nationalId: string }; set: (v: { name: string; phone: string; nationalId: string }) => void }) => {
  const t = useAccText();
  return (
    <div className={classes.form}>
      <label className={classes.field}>
        <span>{t("finPatientName")}</span>
        <input value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} />
      </label>
      <label className={classes.field}>
        <span>{t("accPhone")}</span>
        <input value={v.phone} dir="ltr" onChange={(e) => set({ ...v, phone: e.target.value })} />
      </label>
      <label className={classes.field}>
        <span>{t("accNationalId")}</span>
        <input value={v.nationalId} dir="ltr" onChange={(e) => set({ ...v, nationalId: e.target.value })} />
      </label>
    </div>
  );
};

const ProformaForm = ({ onDone }: { onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [party, setParty] = useState({ name: "", phone: "", nationalId: "" });
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const p = payloadOf(party, lines);
  return (
    <SimplePopup title={t("accNewProforma")} wide>
      <PartyFields v={party} set={setParty} />
      <SaleLines lines={lines} setLines={setLines} />
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!party.name.trim() || !p.lines.length}
          onClick={async () => {
            if (await call("/acc/proformas", "POST", p)) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

type Proforma = { _id: string; proformaNumber?: number; date: string; party: { name: string }; total: number; status: string };

const Proformas = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = useAccGet<Proforma[]>("/acc/proformas", (d) => asArray<Proforma>(d));
  const rows = asArray<Proforma>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accProformaHint")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open("AccProforma", <ProformaForm onDone={() => mutate()} />)}>
            {t("accNewProforma")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizNumber")}</th>
                <th>{t("bizDate")}</th>
                <th>{t("finPatientName")}</th>
                <th className={classes.num}>{t("bizTotal")}</th>
                {canWrite && <th />}
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
                <tr key={r._id}>
                  <td>P-{f.money(r.proformaNumber || 0)}</td>
                  <td>{f.date(r.date)}</td>
                  <td className={classes.wrap}>{r.party?.name || "—"}</td>
                  <td className={classes.num}>{f.money(r.total)}</td>
                  {canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={async () => (await call(`/acc/proformas/${r._id}/convert`, "POST", { issue: false }, t("accConverted"))) && mutate()}>
                          {t("accConvertDraft")}
                        </button>
                        <button type="button" onClick={async () => (await call(`/acc/proformas/${r._id}/convert`, "POST", { issue: true }, t("accConverted"))) && mutate()}>
                          {t("accConvertIssue")}
                        </button>
                      </div>
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

const QuickInvoice = () => {
  const t = useAccText();
  const call = useAccCall();
  const { canWrite } = useBiz();
  const [party, setParty] = useState({ name: "", phone: "", nationalId: "" });
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [money, setMoney] = useState("");
  const [method, setMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [busy, setBusy] = useState(false);
  const p = payloadOf(party, lines);
  return (
    <section className={classes.card}>
      <p className={classes.muted}>{t("accQuickHint")}</p>
      <PartyFields v={party} set={setParty} />
      <SaleLines lines={lines} setLines={setLines} />
      <div className={classes.form}>
        <MoneySelect value={money} onChange={setMoney} label={t("accPaidInto")} />
        <label className={classes.field}>
          <span>{t("finMethod")}</span>
          <select value={method} onChange={(e) => setMethod(e.target.value as "cash")}>
            <option value="cash">{t("finMethodCash")}</option>
            <option value="card">{t("finMethodCard")}</option>
            <option value="transfer">{t("finMethodTransfer")}</option>
          </select>
        </label>
      </div>
      {canWrite && (
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={busy || !party.name.trim() || !p.lines.length}
            onClick={async () => {
              setBusy(true);
              const res = await call("/acc/quick-invoice", "POST", { ...p, pay: money ? { money, method } : null }, t("accQuickDone"));
              setBusy(false);
              if (res) {
                setParty({ name: "", phone: "", nationalId: "" });
                setLines([emptyLine()]);
              }
            }}
          >
            {t("accIssueAndReceive")}
          </button>
        </div>
      )}
    </section>
  );
};

// the invoices page with its sales tools beside it
const AccSales = ({ invoices }: { invoices: ReactNode }) => {
  const t = useAccText();
  const [view, setView] = useView(["invoices", "proforma", "quick", "prices"] as const, "invoices");
  return (
    <div className={classes.main}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["invoices", t("finNavInvoices")],
          ["quick", t("accQuickInvoice")],
          ["proforma", t("accProformas")],
          ["prices", t("accPriceList")],
        ]}
      />
      {view === "invoices" && invoices}
      {view === "proforma" && <Proformas />}
      {view === "quick" && <QuickInvoice />}
      {view === "prices" && <PriceList />}
    </div>
  );
};

export default AccSales;
