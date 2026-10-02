"use client";

import { useEffect, useMemo, useState } from "react";
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
import { InvContext, InvItem, InvLot, qtyText, toNum, useInv, useInvItems, useInvText } from "./invShared";

type Ctx = React.ContextType<typeof InvContext>;

// the expiry state of an item's nearest batch, as a badge
export const ExpiryBadge = ({ item }: { item: Pick<InvItem, "expiredQty" | "nearQty"> }) => {
  const t = useInvText();
  if (item.expiredQty > 0) return <span className={`${classes.badge} ${inv.badgeBad}`}>{t("invExpiredBadge")}</span>;
  if (item.nearQty > 0) return <span className={`${classes.badge} ${inv.badgeWarn}`}>{t("invNearBadge")}</span>;
  return null;
};

// New item (or edit): a lab's kit, a clinic's consumable; a pharmacy only
// adds supplies here - its goods are its own products.
const ItemForm = ({ item, onDone, onClose }: { item?: InvItem; onDone: () => unknown; onClose?: () => unknown }) => {
  const t = useInvText();
  const { api, kind: panelKind } = useInv();
  const popup = usePopup();
  // inside the item's own popup the form folds back instead of closing it
  const closePopup = onClose || (() => popup.closePopup("InvItemForm"));
  const pushNotification = useNotification();
  const fromCatalog = !!item?.product;
  const [name, setName] = useState(item?.name || "");
  const [kind, setKind] = useState<InvItem["kind"]>(item?.kind || "supply");
  const [unit, setUnit] = useState(item?.unit || "");
  const [sku, setSku] = useState(item?.sku || "");
  const [barcode, setBarcode] = useState(item?.barcode || "");
  const [reorderPoint, setReorderPoint] = useState(item?.reorderPoint ? String(item.reorderPoint) : "");
  const [maxStock, setMaxStock] = useState(item?.maxStock ? String(item.maxStock) : "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const kindLocked = fromCatalog || !!item?.tracked || panelKind === "pharmacy";

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: item ? `${API}${api}/items/${item._id}` : `${API}${api}/items`,
        method: item ? "PATCH" : "POST",
        payload: {
          ...(fromCatalog ? {} : { name: name.trim() }),
          ...(kindLocked && item ? {} : { kind: panelKind === "pharmacy" ? "supply" : kind }),
          unit: unit.trim(),
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          reorderPoint: toNum(reorderPoint),
          maxStock: toNum(maxStock),
          isActive,
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
    <div className={classes.form}>
      <label className={`${classes.field} ${classes.wide}`}>
        {t("invName")}
        <input value={name} onChange={(e) => setName(e.target.value)} disabled={fromCatalog} maxLength={200} />
      </label>
      {panelKind !== "pharmacy" && (
        <label className={classes.field}>
          {t("bizKind")}
          <select value={kind} onChange={(e) => setKind(e.target.value as InvItem["kind"])} disabled={kindLocked && !!item}>
            <option value="supply">{t("invKindSupply")}</option>
            <option value="goods">{t("invKindGoods")}</option>
          </select>
        </label>
      )}
      <label className={classes.field}>
        {t("invUnit")}
        <input value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={30} placeholder={t("invUnitHint")} />
      </label>
      <label className={classes.field}>
        {t("invSku")}
        <input value={sku} onChange={(e) => setSku(e.target.value)} maxLength={60} dir="ltr" />
      </label>
      <label className={classes.field}>
        {t("invBarcode")}
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={60} dir="ltr" inputMode="numeric" />
      </label>
      <label className={classes.field}>
        {t("invReorderPoint")}
        <input value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} inputMode="decimal" />
      </label>
      <label className={classes.field}>
        {t("invMaxStock")}
        <input value={maxStock} onChange={(e) => setMaxStock(e.target.value)} inputMode="decimal" />
      </label>
      <p className={`${classes.muted} ${classes.wide}`}>{t("invReorderHint")}</p>
      {!!item && (
        <label className={`${inv.check} ${classes.wide}`}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {t("invActive")}
        </label>
      )}
      <div className={`${classes.actions} ${classes.wide}`}>
        <button type="button" className={classes.ghost} onClick={closePopup}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={busy || (!fromCatalog && name.trim().length < 2)} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </div>
  );
};

// Opening stock, use of supplies and the stock count of one item.
const StockEntry = ({ item, onDone }: { item: InvItem; onDone: () => unknown }) => {
  const t = useInvText();
  const { api } = useInv();
  const pushNotification = useNotification();
  const [kind, setKind] = useState<"opening" | "use" | "count">(item.kind === "supply" && item.tracked ? "use" : item.tracked ? "count" : "opening");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState(item.lastCost ? String(item.lastCost) : "");
  const [lotNo, setLotNo] = useState("");
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [busy, setBusy] = useState(false);
  const kinds = (["opening", "use", "count"] as const).filter((k) => k !== "use" || item.kind === "supply");
  const receives = kind === "opening" || kind === "count";

  const save = async () => {
    if (busy || qty === "") return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/stock`,
        method: "POST",
        payload: {
          kind,
          item: item._id,
          qty: toNum(qty),
          ...(receives && unitCost !== "" ? { unitCost: toNum(unitCost) } : {}),
          ...(receives && lotNo.trim() ? { lotNo: lotNo.trim() } : {}),
          ...(receives && expiry ? { expiry: isoDay(expiry) } : {}),
          date: isoDay(date),
        },
      });
      pushNotification(t("bizSaved"), "Success");
      setQty("");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={inv.subCard}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("invEntry")}</span>
        <div className={classes.segmented} role="tablist">
          {kinds.map((k) => (
            <button key={k} type="button" className={kind === k ? classes.on : ""} onClick={() => setKind(k)}>
              {t(k === "opening" ? "invEntryOpening" : k === "use" ? "invEntryUse" : "invEntryCount")}
            </button>
          ))}
        </div>
      </div>
      <p className={classes.muted}>{t(kind === "opening" ? "invOpeningHint" : kind === "use" ? "invUseHint" : "invCountHint")}</p>
      <div className={classes.form}>
        <label className={classes.field}>
          {kind === "count" ? t("invCounted") : t("invQty")}
          <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
        </label>
        {receives && (
          <>
            <label className={classes.field}>
              {t("invUnitCost")}
              <input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} inputMode="numeric" />
            </label>
            <label className={classes.field}>
              {t("invLotNo")}
              <input value={lotNo} onChange={(e) => setLotNo(e.target.value)} maxLength={60} dir="ltr" />
            </label>
            <div className={classes.field}>
              <DateInput title={t("invExpiry")} onChange={(d) => setExpiry(d)} />
            </div>
          </>
        )}
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || qty === ""} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </section>
  );
};

// One item: its batches (earliest expiry first, the order they leave in),
// the stock entry and the settings.
const ItemDetail = ({ itemId, onChanged }: { itemId: string; onChanged: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const { api, canWrite } = useInv();
  const { data: items, mutate: mutateItems } = useInvItems();
  const item = items?.find((i) => i._id === itemId);
  const { data: lots, error, mutate } = useSWR<InvLot[]>(`${API}${api}/items/${itemId}/lots`, (url: string) =>
    fetcher({ url }).then((res) => asArray<InvLot>(res.data)),
  );
  const [editing, setEditing] = useState(false);
  const now = Date.now();
  const changed = () => {
    mutate();
    mutateItems();
    onChanged();
  };
  return (
    <PopupCard title={item?.name || t("invItem")}>
      <div className={classes.popup}>
        {!!item && (
          <div className={classes.tiles}>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("invStock")}</span>
              <span className={classes.tileValue}>
                {qtyText(item.stock, tag)}
                <span className={classes.tileUnit}>{item.unit}</span>
              </span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("invValue")}</span>
              <span className={classes.tileValue}>
                {f.money(item.value)}
                <span className={classes.tileUnit}>{t("toman")}</span>
              </span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("invDemand")}</span>
              <span className={classes.tileValue}>{qtyText(item.monthlyDemand, tag)}</span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("invSuggested")}</span>
              <span className={classes.tileValue}>{item.suggested ? qtyText(item.suggested, tag) : "—"}</span>
            </div>
          </div>
        )}
        <section className={inv.subCard}>
          <span className={classes.cardTitle}>{t("invLots")}</span>
          <HandleLoading data={!!lots} error={error}>
            {!!lots &&
              (lots.length === 0 ? (
                <p className={classes.empty}>{t("invNoLots")}</p>
              ) : (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("invLotNo")}</th>
                        <th>{t("invExpiry")}</th>
                        <th className={classes.num}>{t("invQty")}</th>
                        <th className={classes.num}>{t("invUnitCost")}</th>
                        <th>{t("invReceivedAt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lots.map((l) => {
                        const exp = l.expiry ? new Date(l.expiry).getTime() : null;
                        return (
                          <tr key={l._id}>
                            <td dir="ltr" className={inv.start}>{l.lotNo || "—"}</td>
                            <td>
                              {f.date(l.expiry)}{" "}
                              {exp != null && exp < now && <span className={`${classes.badge} ${inv.badgeBad}`}>{t("invExpiredBadge")}</span>}
                              {exp != null && exp >= now && exp - now <= 90 * 864e5 && (
                                <span className={`${classes.badge} ${inv.badgeWarn}`}>{t("invNearBadge")}</span>
                              )}
                            </td>
                            <td className={classes.num}>
                              {qtyText(l.qty, tag)} / {qtyText(l.received, tag)}
                            </td>
                            <td className={classes.num}>{f.money(l.unitCost)}</td>
                            <td>{f.date(l.receivedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
          </HandleLoading>
        </section>
        {canWrite && !!item && <StockEntry item={item} onDone={changed} />}
        {canWrite && !!item && (
          <section className={inv.subCard}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("invSettings")}</span>
              {!editing && (
                <button type="button" className={classes.ghost} onClick={() => setEditing(true)}>
                  {t("bizEdit")}
                </button>
              )}
            </div>
            {editing ? (
              <ItemForm item={item} onClose={() => setEditing(false)} onDone={changed} />
            ) : (
              <p className={classes.muted}>
                {t("invReorderPoint")}: {item.reorderPoint ? qtyText(item.reorderPoint, tag) : "—"} · {t("invMaxStock")}:{" "}
                {item.maxStock ? qtyText(item.maxStock, tag) : "—"}
              </p>
            )}
          </section>
        )}
      </div>
    </PopupCard>
  );
};

const withCtx = (ctx: Ctx, node: React.ReactNode) => <InvContext.Provider value={ctx}>{node}</InvContext.Provider>;

type Filter = "all" | "low" | "expiry";

const InventoryItems = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const ctx = useInv();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useInvItems();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return asArray<InvItem>(data).filter((i) => {
      if (s && !`${i.name} ${i.sku || ""} ${i.barcode || ""}`.toLowerCase().includes(s)) return false;
      if (filter === "low") return i.low || i.suggested > 0;
      if (filter === "expiry") return i.expiredQty > 0 || i.nearQty > 0;
      return true;
    });
  }, [data, q, filter]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (i: InvItem) => setPopup("InvItemDetail", withCtx(ctx, <ItemDetail itemId={i._id} onChanged={changed} />));

  return (
    <section className={classes.card}>
      {ctx.kind === "pharmacy" && <p className={classes.muted}>{t("invPharmacyHint")}</p>}
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("invSearch")} aria-label={t("invSearch")} />
          <div className={classes.segmented} role="tablist">
            {(
              [
                ["all", "invFilterAll"],
                ["low", "invFilterLow"],
                ["expiry", "invFilterExpiry"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" className={filter === k ? classes.on : ""} onClick={() => setFilter(k)}>
                {t(label)}
              </button>
            ))}
          </div>
        </div>
        {ctx.canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() =>
              setPopup(
                "InvItemForm",
                withCtx(
                  ctx,
                  <PopupCard title={t(ctx.kind === "pharmacy" ? "invAddSupply" : "invAddItem")}>
                    <div className={classes.popup}>
                      <ItemForm onDone={changed} />
                    </div>
                  </PopupCard>,
                ),
              )
            }
          >
            {t(ctx.kind === "pharmacy" ? "invAddSupply" : "invAddItem")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t(asArray(data).length ? "bizEmpty" : "invNoItems")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("invItem")}</th>
                    <th>{t("bizKind")}</th>
                    <th className={classes.num}>{t("invStock")}</th>
                    <th className={classes.num}>{t("invValue")}</th>
                    <th>{t("invNextExpiry")}</th>
                    <th className={classes.num}>{t("invDemand")}</th>
                    <th className={classes.num}>{t("invSuggested")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((i) => (
                    <tr
                      key={i._id}
                      className={`${classes.rowLink} ${i.isActive ? "" : inv.inactive}`}
                      tabIndex={0}
                      onClick={() => open(i)}
                      onKeyDown={(e) => e.key === "Enter" && open(i)}
                    >
                      <td className={classes.wrap}>
                        {i.name} {i.low && <span className={`${classes.badge} ${inv.badgeWarn}`}>{t("invLow")}</span>}
                      </td>
                      <td>
                        <span className={classes.badge}>{t(i.kind === "supply" ? "invKindSupply" : "invKindGoods")}</span>
                      </td>
                      <td className={classes.num}>
                        {i.tracked ? (
                          <>
                            {qtyText(i.stock, tag)} <span className={classes.muted}>{i.unit}</span>
                          </>
                        ) : (
                          <span className={classes.muted}>{t("invNotTracked")}</span>
                        )}
                      </td>
                      <td className={classes.num}>{i.tracked ? f.money(i.value) : "—"}</td>
                      <td>
                        {i.nextExpiry ? f.date(i.nextExpiry) : "—"} <ExpiryBadge item={i} />
                      </td>
                      <td className={classes.num}>{i.monthlyDemand ? qtyText(i.monthlyDemand, tag) : "—"}</td>
                      <td className={classes.num}>{i.suggested ? <strong>{qtyText(i.suggested, tag)}</strong> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default InventoryItems;
