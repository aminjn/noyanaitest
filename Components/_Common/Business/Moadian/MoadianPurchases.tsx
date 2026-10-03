"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "../Accounting.module.css";
import moa from "./Moadian.module.css";
import { BizAccount, asArray, useBizFormat } from "../bizShared";
import { MoadianContext, subjectKey, useMoadian, useMoadianText } from "./moadianShared";

type Match = "open" | "purchase" | "expense" | "ignored";
type PurchaseInvoice = {
  _id: string;
  taxId: string;
  subject: 1 | 2 | 3 | 4;
  sellerName?: string;
  sellerCode?: string;
  issuedAt: string;
  base: number;
  vat: number;
  total: number;
  portalStatus?: string;
  rejected: boolean;
  match: Match;
  purchase?: { _id: string; invoiceNo?: string; date: string; total: number; supplier?: { name?: string } } | string | null;
  account?: { _id: string; code: string; name: string } | string | null;
};
type ListData = { rows: PurchaseInvoice[]; total: number; counts: Partial<Record<Match, number>> };
type Candidate = { _id: string; invoiceNo?: string; date: string; total: number; tax: number; supplierName: string };

const POPUP = "MoaPurchaseInvoice";
const FILTERS: (Match | "")[] = ["", "open", "purchase", "expense", "ignored"];
const MATCH_KEY: Record<Match, ContentKey> = {
  open: "moaPinvOpen",
  purchase: "moaPinvPurchase",
  expense: "moaPinvExpense",
  ignored: "moaPinvIgnored",
};
const PER = 30;

// One purchase invoice: pair it with a received purchase, book it as an
// expense, set it aside, or undo what was done.
const Pairing = ({ inv, onDone }: { inv: PurchaseInvoice; onDone: () => unknown }) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const { api } = useMoadian();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [account, setAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: candidates } = useSWR<Candidate[]>(inv.match === "open" ? `${API}${api}/purchases/${inv._id}/candidates` : null, (url: string) =>
    fetcher({ url }).then((res) => asArray<Candidate>(res.data)),
  );
  const { data: accounts } = useSWR<Pick<BizAccount, "_id" | "code" | "name">[]>(inv.match === "open" ? `${API}${api}/purchases/expense-accounts` : null, (url: string) =>
    fetcher({ url }).then((res) => asArray<Pick<BizAccount, "_id" | "code" | "name">>(res.data)),
  );
  const expenses = asArray<Pick<BizAccount, "_id" | "code" | "name">>(accounts);
  const act = async (payload: Record<string, string>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/purchases/${inv._id}/match`, method: "POST", payload });
      pushNotification(t("moaPinvSaved"), "Success");
      closePopup(POPUP);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  const paired = typeof inv.purchase === "object" && inv.purchase ? inv.purchase : null;
  const acc = typeof inv.account === "object" && inv.account ? inv.account : null;
  return (
    <PopupCard size="wide" title={inv.sellerName || t("moaPinvTitle")}>
      <div className={classes.popup}>
        <dl className={moa.facts}>
          <dt>{t("moaTaxId")}</dt>
          <dd>
            <span className={moa.mono} dir="ltr">
              {inv.taxId}
            </span>
          </dd>
          <dt>{t("moaPinvSellerCode")}</dt>
          <dd>
            <span className={moa.mono} dir="ltr">
              {inv.sellerCode || "—"}
            </span>
          </dd>
          <dt>{t("bizDate")}</dt>
          <dd>{f.tehranDate(inv.issuedAt)}</dd>
          <dt>{t("moaPinvBase")}</dt>
          <dd>{f.money(inv.base)}</dd>
          <dt>{t("moaPinvVat")}</dt>
          <dd>{f.money(inv.vat)}</dd>
          <dt>{t("moaAmount")}</dt>
          <dd>
            {f.money(inv.total)} <span className={classes.muted}>{t("toman")}</span>
          </dd>
          {!!inv.portalStatus && (
            <>
              <dt>{t("moaPinvPortalStatus")}</dt>
              <dd>{inv.portalStatus}</dd>
            </>
          )}
        </dl>
        {inv.rejected && <p className={moa.error}>{t("moaPinvRejectedNote")}</p>}
        {inv.match === "open" ? (
          <>
            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("moaPinvLinkTitle")}</span>
              <p className={classes.muted}>{t("moaPinvLinkHint")}</p>
              {asArray<Candidate>(candidates).length ? (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizDate")}</th>
                        <th>{t("moaPinvSupplier")}</th>
                        <th className={classes.num}>{t("moaAmount")}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<Candidate>(candidates).map((c) => (
                        <tr key={c._id}>
                          <td>{f.date(c.date)}</td>
                          <td className={classes.wrap}>
                            {c.supplierName || "—"}
                            {c.invoiceNo ? <span className={classes.muted}> · {c.invoiceNo}</span> : null}
                          </td>
                          <td className={classes.num}>{f.money(c.total)}</td>
                          <td>
                            <button type="button" className={classes.ghost} disabled={busy} onClick={() => act({ as: "purchase", purchase: c._id })}>
                              {t("moaPinvLink")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={classes.empty}>{t("moaPinvNoCandidates")}</p>
              )}
            </section>
            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("moaPinvExpenseTitle")}</span>
              <p className={classes.muted}>{t("moaPinvExpenseHint")}</p>
              <div className={classes.form}>
                <label className={classes.field}>
                  {t("moaPinvAccount")}
                  <select value={account} onChange={(e) => setAccount(e.target.value)}>
                    <option value="">{t("bizSelect")}</option>
                    {expenses.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.code} · {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={classes.actions}>
                  <button type="button" className={classes.primary} disabled={busy || !account} onClick={() => act({ as: "expense", account })}>
                    {t("moaPinvBook")}
                  </button>
                </div>
              </div>
            </section>
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} disabled={busy} onClick={() => act({ as: "ignored" })}>
                {t("moaPinvIgnore")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={classes.muted}>
              {inv.match === "purchase" && paired
                ? t("moaPinvPairedWith", [paired.supplier?.name || "—", f.date(paired.date), f.money(paired.total)])
                : inv.match === "expense" && acc
                  ? t("moaPinvBookedAs", [`${acc.code} · ${acc.name}`])
                  : t(MATCH_KEY[inv.match])}
            </p>
            {inv.subject !== 3 && inv.subject !== 4 && (
              <div className={classes.actions}>
                <button type="button" className={classes.ghost} disabled={busy} onClick={() => act({ as: "open" })}>
                  {t("moaPinvUndo")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PopupCard>
  );
};

// Purchase invoices other sellers registered for this centre, brought in
// from the کارپوشه's Excel export and paired with the books (2026-10,
// Lib/business/purchaseInvoices.ts). Only a paired invoice makes its VAT
// creditable in the quarterly return.
const MoadianPurchases = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const ctx = useMoadian();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const fileRef = useRef<HTMLInputElement>(null);
  const [match, setMatch] = useState<Match | "">("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const qs = new URLSearchParams({ page: String(page), limit: String(PER), ...(match ? { match } : {}) });
  const { data, error, mutate } = useSWR<ListData | null>(`${API}${ctx.api}/purchases?${qs}`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as ListData) : null)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => setPage(1), [match]);
  const changed = () => {
    mutate();
    onChanged();
  };

  const upload = async (file?: File | null) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${ctx.api}/purchases/import`, method: "POST", bodyParser: "FORM", payload: { file } });
      const d = (res?.data || {}) as { added?: number; updated?: number; matched?: number };
      pushNotification(t("moaPinvImported", [f.money(d.added), f.money(d.updated), f.money(d.matched)]), "Success");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const open = (inv: PurchaseInvoice) =>
    ctx.canWrite &&
    setPopup(
      POPUP,
      <MoadianContext.Provider value={ctx}>
        <Pairing inv={inv} onDone={changed} />
      </MoadianContext.Provider>,
    );

  const rows = asArray<PurchaseInvoice>(data?.rows);
  const counts = data?.counts || {};
  const all = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
  const pages = data ? Math.max(1, Math.ceil(data.total / PER)) : 1;
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("moaTabPurchases")}</span>
        {ctx.canWrite && (
          <>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" hidden onChange={(e) => upload(e.target.files?.[0])} />
            <button type="button" className={classes.primary} disabled={busy} onClick={() => fileRef.current?.click()}>
              {t("moaPinvUpload")}
            </button>
          </>
        )}
      </div>
      <p className={classes.muted}>{t("moaPinvHint")}</p>
      <div className={moa.scroll}>
        <div className={classes.segmented}>
          {FILTERS.map((m) => (
            <button key={m || "all"} type="button" className={match === m ? classes.on : ""} onClick={() => setMatch(m)}>
              {m ? t(MATCH_KEY[m]) : t("moaAll")} ({f.money(m ? counts[m] || 0 : all)})
            </button>
          ))}
        </div>
      </div>
      <HandleLoading data={data !== undefined} error={error}>
        {rows.length === 0 ? (
          <p className={classes.empty}>{t("moaPinvNone")}</p>
        ) : (
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("bizDate")}</th>
                  <th>{t("moaPinvSeller")}</th>
                  <th>{t("moaKind")}</th>
                  <th className={classes.num}>{t("moaPinvVat")}</th>
                  <th className={classes.num}>{t("moaAmount")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className={ctx.canWrite ? classes.rowLink : ""} onClick={() => open(r)}>
                    <td>{f.tehranDate(r.issuedAt)}</td>
                    <td className={classes.wrap}>
                      {r.sellerName || "—"}
                      {r.sellerCode ? (
                        <span className={classes.muted}>
                          {" · "}
                          <bdi className={moa.mono}>{r.sellerCode}</bdi>
                        </span>
                      ) : null}
                    </td>
                    <td>{t(subjectKey[r.subject] || "moaSubjectOriginal")}</td>
                    <td className={classes.num}>{f.money(r.vat)}</td>
                    <td className={classes.num}>{f.money(r.total)}</td>
                    <td>
                      <span className={`${moa.badge} ${r.match === "open" ? moa.badgeWarn : r.match === "ignored" ? moa.badgeMuted : moa.badgeOk}`}>
                        {t(MATCH_KEY[r.match])}
                      </span>
                      {r.rejected && <span className={`${moa.badge} ${moa.badgeBad}`}>{t("moaPinvRejected")}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HandleLoading>
      {pages > 1 && (
        <div className={classes.pagination}>
          <button type="button" className={classes.ghost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("moaPrev")}
          </button>
          <span className={classes.muted}>
            {f.money(page)} / {f.money(pages)}
          </span>
          <button type="button" className={classes.ghost} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            {t("moaNext")}
          </button>
        </div>
      )}
    </section>
  );
};

export default MoadianPurchases;
