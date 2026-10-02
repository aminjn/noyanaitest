"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "../Accounting.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { InvMove, qtyText, useInv, useInvItems, useInvText } from "./invShared";

export const moveKindKey: Record<string, ContentKey> = {
  opening: "invMvOpening",
  purchase: "invMvPurchase",
  sale: "invMvSale",
  use: "invMvUse",
  adjustIn: "invMvAdjustIn",
  adjustOut: "invMvAdjustOut",
  purchaseReturn: "invMvPurchaseReturn",
  saleReturn: "invMvSaleReturn",
};

const LIMIT = 30;

// The kardex: every movement in and out, with its cost - what nexxacrm and
// every Iranian accounting package call «کاردکس کالا».
const InventoryMoves = ({ refreshKey }: { refreshKey: number }) => {
  const t = useInvText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const { api } = useInv();
  const { data: items } = useInvItems();
  const [page, setPage] = useState(1);
  const [item, setItem] = useState("");
  const [kind, setKind] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (item) params.set("item", item);
  if (kind) params.set("kind", kind);
  const { data, error, mutate, isValidating } = useSWR<{ items: InvMove[]; total: number }>(
    `${API}${api}/moves?${params}`,
    (url: string) =>
      fetcher({ url }).then((res) => ({ items: asArray<InvMove>(res.data?.items), total: Number(res.data?.total) || 0 })),
    { keepPreviousData: true },
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  return (
    <section className={classes.card}>
      <div className={classes.filters}>
        <select value={item} onChange={(e) => { setItem(e.target.value); setPage(1); }} aria-label={t("invItem")}>
          <option value="">{t("invAllItems")}</option>
          {asArray<{ _id: string; name: string }>(items).map((i) => (
            <option key={i._id} value={i._id}>
              {i.name}
            </option>
          ))}
        </select>
        <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label={t("bizKind")}>
          <option value="">{t("invAllMoves")}</option>
          {Object.entries(moveKindKey).map(([k, label]) => (
            <option key={k} value={k}>
              {t(label)}
            </option>
          ))}
        </select>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (data.items.length === 0 ? (
            <p className={classes.empty}>{t("invNoMoves")}</p>
          ) : (
            <div className={classes.tableWrap} style={{ opacity: isValidating ? 0.6 : 1 }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizDate")}</th>
                    <th>{t("invItem")}</th>
                    <th>{t("bizKind")}</th>
                    <th className={classes.num}>{t("invQty")}</th>
                    <th className={classes.num}>{t("invUnitCost")}</th>
                    <th className={classes.num}>{t("invValue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((m) => (
                    <tr key={m._id}>
                      <td>{f.date(m.date)}</td>
                      <td className={classes.wrap}>
                        {m.item?.name || "—"}
                        {!!m.shortage && <span className={classes.muted}> · {t("invShortage", [qtyText(m.shortage, tag)])}</span>}
                      </td>
                      <td>
                        <span className={classes.badge}>{moveKindKey[m.kind] ? t(moveKindKey[m.kind]) : m.kind}</span>
                      </td>
                      <td className={`${classes.num} ${m.qty < 0 ? classes.negative : classes.positive}`} dir="ltr">
                        {m.qty > 0 ? "+" : ""}
                        {qtyText(m.qty, tag)}
                      </td>
                      <td className={classes.num}>{f.money(m.unitCost)}</td>
                      <td className={classes.num}>{f.signed(m.value)}</td>
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

export default InventoryMoves;
