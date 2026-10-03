"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import moa from "./Moadian.module.css";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { asArray, useBizFormat } from "../bizShared";
import {
  issueText,
  kindKey,
  latin,
  MoadianBuyer,
  MoadianContext,
  MoadianInvoice,
  MoadianStatus,
  sourceKey,
  statusKey,
  subjectKey,
  useMoadian,
  useMoadianText,
} from "./moadianShared";

const DETAIL = "MoadianInvoice";
const BUYER = "MoadianBuyer";

const tone = (s: MoadianStatus) =>
  s === "Accepted"
    ? moa.badgeOk
    : s === "Rejected"
      ? moa.badgeBad
      : s === "Dropped"
        ? moa.badgeMuted
        : moa.badgeWarn;

type ListData = {
  rows: MoadianInvoice[];
  total: number;
  per: number;
  counts: Record<MoadianStatus, number>;
};

// the buyer asked for the invoice in their name: their identity, then the
// engine cancels the anonymous one and issues it again as type 1
const BuyerForm = ({
  invoice,
  onDone,
}: {
  invoice: MoadianInvoice;
  onDone: () => unknown;
}) => {
  const t = useMoadianText();
  const { api } = useMoadian();
  const popup = usePopup();
  const pushNotification = useNotification();
  const [type, setType] = useState<MoadianBuyer["type"]>(
    invoice.buyer?.type || "natural",
  );
  const [nationalId, setNationalId] = useState(invoice.buyer?.nationalId || "");
  const [economicCode, setEconomicCode] = useState(
    invoice.buyer?.type === "legal" ? invoice.buyer?.economicCode || "" : "",
  );
  const [name, setName] = useState(invoice.buyer?.name || invoice.party || "");
  const [postalCode, setPostalCode] = useState(invoice.buyer?.postalCode || "");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/invoices/${invoice._id}/buyer`,
        method: "POST",
        payload: {
          type,
          nationalId: latin(nationalId).trim() || undefined,
          economicCode:
            type === "legal"
              ? latin(economicCode).trim() || undefined
              : undefined,
          name: name.trim() || undefined,
          postalCode: latin(postalCode).trim() || undefined,
        },
      });
      pushNotification(t("moaBuyerSaved"), "Success");
      popup.closePopup(BUYER);
      popup.closePopup(DETAIL);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("moaBuyerTitle")}>
      <div className={classes.popup}>
        <p className={classes.muted}>
          {t(
            invoice.status === "Accepted"
              ? "moaBuyerHintAccepted"
              : "moaBuyerHint",
          )}
        </p>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("moaTaxpayerType")}
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MoadianBuyer["type"])}
            >
              <option value="natural">{t("moaNatural")}</option>
              <option value="legal">{t("moaLegal")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t(type === "natural" ? "moaNationalCode" : "moaLegalId")}
            <input
              className={moa.ltr}
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </label>
          {type === "legal" && (
            <label className={classes.field}>
              {t("moaEconomicCode")}
              <input
                className={moa.ltr}
                dir="ltr"
                inputMode="numeric"
                maxLength={14}
                value={economicCode}
                onChange={(e) => setEconomicCode(e.target.value)}
              />
            </label>
          )}
          <label className={classes.field}>
            {t("moaBuyerName")}
            <input
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={classes.field}>
            {t("moaPostalCode")}
            <input
              className={moa.ltr}
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </label>
        </div>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.ghost}
            onClick={() => popup.closePopup(BUYER)}
          >
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={busy}
            onClick={submit}
          >
            {t("moaBuyerSubmit")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const refOf = (v: MoadianInvoice["of"]) =>
  v && typeof v === "object" ? v : null;

// one invoice as the tax organisation sees it: its lines in rials, the
// buyer, the answer, and what can still be done with it
const InvoiceDetail = ({
  id,
  onDone,
}: {
  id: string;
  onDone: () => unknown;
}) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const pct = new Intl.NumberFormat(tag, {
    style: "percent",
    maximumFractionDigits: 1,
  });
  const ctx = useMoadian();
  const popup = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const { data, error, mutate } = useSWR<MoadianInvoice | null>(
    `${API}${ctx.api}/invoices/${id}`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        res?.data && typeof res.data === "object"
          ? (res.data as MoadianInvoice)
          : null,
      ),
  );
  const act = async (path: string, ok: string, confirmText?: string) => {
    if (busy || (confirmText && !window.confirm(confirmText))) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${ctx.api}/invoices/${id}/${path}`,
        method: "POST",
      });
      pushNotification(ok, "Success");
      await mutate();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const inv = data;
  const original =
    inv?.subject === 1 && !inv.replacedBy && inv.status !== "Dropped";
  const of = refOf(inv?.of);
  const replaced = refOf(inv?.replacedBy);
  return (
    <PopupCard size="wide" title={t("moaInvoice")}>
      <HandleLoading data={!!inv} error={error}>
        {!!inv && (
          <div className={classes.popup}>
            <dl className={moa.facts}>
              <dt>{t("moaTaxId")}</dt>
              <dd>
                <span className={moa.mono} dir="ltr">
                  {inv.taxId}
                </span>
              </dd>
              <dt>{t("bizDate")}</dt>
              <dd>{f.date(inv.issuedAt)}</dd>
              <dt>{t("status")}</dt>
              <dd>
                <span className={`${moa.badge} ${tone(inv.status)}`}>
                  {t(statusKey[inv.status])}
                </span>
              </dd>
              <dt>{t("moaKind")}</dt>
              <dd>
                {t(subjectKey[inv.subject])} ·{" "}
                {t(inv.type === 1 ? "moaType1" : "moaType2")} ·{" "}
                {t(sourceKey[inv.source])}
              </dd>
              <dt>{t("moaParty")}</dt>
              <dd>{inv.buyer?.name || inv.party || "—"}</dd>
              {inv.type === 1 && !!inv.buyer && (
                <>
                  <dt>
                    {t(
                      inv.buyer.type === "natural"
                        ? "moaNationalCode"
                        : "moaLegalCode",
                    )}
                  </dt>
                  <dd>
                    <span className={moa.mono} dir="ltr">
                      {inv.buyer.economicCode || inv.buyer.nationalId}
                    </span>
                  </dd>
                </>
              )}
              {!!inv.referenceNumber && (
                <>
                  <dt>{t("moaReference")}</dt>
                  <dd>
                    <span className={moa.mono} dir="ltr">
                      {inv.referenceNumber}
                    </span>
                  </dd>
                </>
              )}
              {!!of && (
                <>
                  <dt>{t("moaRefersTo")}</dt>
                  <dd>
                    <span className={moa.mono} dir="ltr">
                      {of.taxId}
                    </span>
                  </dd>
                </>
              )}
              {!!replaced && (
                <>
                  <dt>{t("moaReplacedBy")}</dt>
                  <dd>
                    <span className={moa.mono} dir="ltr">
                      {replaced.taxId}
                    </span>
                  </dd>
                </>
              )}
            </dl>
            {inv.taxErrors.length > 0 && (
              <ul className={moa.problems}>
                {inv.taxErrors.map((e, i) => (
                  <li key={i}>
                    {e.code && !e.code.includes(":") && e.code !== "buyer" ? (
                      <span className={moa.mono}>{e.code} · </span>
                    ) : null}
                    {issueText(e, t)}
                  </li>
                ))}
              </ul>
            )}
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("moaItem")}</th>
                    <th>{t("moaSstid")}</th>
                    <th className={classes.num}>{t("moaQty")}</th>
                    <th className={classes.num}>{t("moaFee")}</th>
                    <th className={classes.num}>{t("moaVat")}</th>
                    <th className={classes.num}>{t("moaLineTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {asArray<NonNullable<MoadianInvoice["items"]>[number]>(
                    inv.items,
                  ).map((i, n) => (
                    <tr key={n}>
                      <td className={classes.wrap}>
                        {i.sstt}
                        <span className={classes.muted}>
                          {" "}
                          · {t(kindKey[i.kind] || "moaKindService")}
                        </span>
                      </td>
                      <td>
                        <span className={moa.mono} dir="ltr">
                          {i.sstid || "—"}
                        </span>
                      </td>
                      <td className={classes.num}>{f.money(i.am)}</td>
                      <td className={classes.num}>{f.money(i.fee)}</td>
                      <td className={classes.num}>
                        {f.money(i.vam)}{" "}
                        <span className={classes.muted}>
                          ({pct.format((Number(i.vra) || 0) / 100)})
                        </span>
                      </td>
                      <td className={classes.num}>{f.money(i.tsstam)}</td>
                    </tr>
                  ))}
                  <tr className={classes.totalRow}>
                    <td colSpan={4}>{t("moaTotalRial")}</td>
                    <td className={classes.num}>{f.money(inv.total.tvam)}</td>
                    <td className={classes.num}>{f.money(inv.total.tbill)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!!inv.packet && (
              <details className={moa.more}>
                <summary>{t("moaPacket")}</summary>
                <pre className={moa.packet} dir="ltr">
                  {JSON.stringify(inv.packet, null, 2)}
                </pre>
              </details>
            )}
            {ctx.canWrite && (
              <div className={classes.actions}>
                {inv.status === "Rejected" && (
                  <button
                    type="button"
                    className={classes.primary}
                    disabled={busy}
                    onClick={() => act("retry", t("moaRetried"))}
                  >
                    {t("moaRetry")}
                  </button>
                )}
                {original && inv.status !== "Sent" && !ctx.platform && (
                  <button
                    type="button"
                    className={classes.ghost}
                    disabled={busy}
                    onClick={() =>
                      popup.setPopup(
                        BUYER,
                        <MoadianContext.Provider value={ctx}>
                          <BuyerForm invoice={inv} onDone={onDone} />
                        </MoadianContext.Provider>,
                      )
                    }
                  >
                    {t("moaSetBuyer")}
                  </button>
                )}
                {original && inv.status !== "Sent" && (
                  <button
                    type="button"
                    className={classes.danger}
                    disabled={busy}
                    onClick={() =>
                      act(
                        "cancel",
                        t("moaCancelled"),
                        t(
                          inv.status === "Accepted"
                            ? "moaCancelConfirm"
                            : "moaDropConfirm",
                        ),
                      )
                    }
                  >
                    {t(inv.status === "Accepted" ? "moaCancel" : "moaDrop")}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </HandleLoading>
    </PopupCard>
  );
};

const FILTERS: (MoadianStatus | "")[] = [
  "",
  "Queued",
  "Sent",
  "Accepted",
  "Rejected",
  "Dropped",
];

const MoadianInvoices = ({
  refreshKey,
  onChanged,
}: {
  refreshKey: number;
  onChanged: () => unknown;
}) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const ctx = useMoadian();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [status, setStatus] = useState<MoadianStatus | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({
    page: String(page),
    ...(status ? { status } : {}),
    ...(q.trim() ? { q: latin(q.trim()) } : {}),
  });
  const { data, error, mutate } = useSWR<ListData | null>(
    `${API}${ctx.api}/invoices?${qs}`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        res?.data && typeof res.data === "object"
          ? (res.data as ListData)
          : null,
      ),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => setPage(1), [status, q]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (id: string) =>
    setPopup(
      DETAIL,
      <MoadianContext.Provider value={ctx}>
        <InvoiceDetail id={id} onDone={changed} />
      </MoadianContext.Provider>,
    );
  const retryAll = async () => {
    try {
      await fetcher({
        url: `${API}${ctx.api}/invoices/retry-rejected`,
        method: "POST",
      });
      pushNotification(t("moaRetried"), "Success");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };
  const rows = asArray<MoadianInvoice>(data?.rows);
  const pages = data
    ? Math.max(1, Math.ceil(data.total / (data.per || 30)))
    : 1;
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("moaTabInvoices")}</span>
        {ctx.canWrite && !!data?.counts?.Rejected && (
          <button type="button" className={classes.primary} onClick={retryAll}>
            {t("moaRetryAll", [f.money(data.counts.Rejected)])}
          </button>
        )}
      </div>
      <p className={classes.muted}>
        {t(ctx.platform ? "moaInvoicesHintPlatform" : "moaInvoicesHint")}
      </p>
      <div className={moa.scroll}>
        <div className={classes.segmented}>
          {FILTERS.map((s) => (
            <button
              key={s || "all"}
              type="button"
              className={status === s ? classes.on : ""}
              onClick={() => setStatus(s)}
            >
              {s ? t(statusKey[s]) : t("moaAll")}
              {s && data?.counts ? ` (${f.money(data.counts[s])})` : ""}
            </button>
          ))}
        </div>
      </div>
      <div className={classes.filters}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("moaSearch")}
        />
      </div>
      <HandleLoading data={data !== undefined} error={error}>
        {rows.length === 0 ? (
          <p className={classes.empty}>{t("moaNoInvoices")}</p>
        ) : (
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("bizDate")}</th>
                  <th>{t("moaTaxId")}</th>
                  <th>{t("moaParty")}</th>
                  <th>{t("moaKind")}</th>
                  <th className={classes.num}>{t("moaAmount")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r._id}
                    className={classes.rowLink}
                    onClick={() => open(r._id)}
                  >
                    <td>{f.date(r.issuedAt)}</td>
                    <td>
                      <span className={moa.mono} dir="ltr">
                        {r.taxId}
                      </span>
                    </td>
                    <td className={classes.wrap}>{r.party || "—"}</td>
                    <td>
                      {t(sourceKey[r.source] || "moaSrcManual")}
                      <span className={classes.muted}>
                        {" "}
                        · {t(subjectKey[r.subject])} ·{" "}
                        {t(r.type === 1 ? "moaType1" : "moaType2")}
                      </span>
                    </td>
                    <td className={classes.num}>
                      {f.money((r.total?.tbill || 0) / 10)}{" "}
                      <span className={classes.muted}>{t("toman")}</span>
                    </td>
                    <td>
                      <span className={`${moa.badge} ${tone(r.status)}`}>
                        {t(statusKey[r.status] || "moaStQueued")}
                      </span>
                      {r.status === "Rejected" && r.taxErrors?.[0] && (
                        <span className={moa.errorInline}>
                          {" "}
                          {issueText(r.taxErrors[0], t)}
                        </span>
                      )}
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
          <button
            type="button"
            className={classes.ghost}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("moaPrev")}
          </button>
          <span className={classes.muted}>
            {f.money(page)} / {f.money(pages)}
          </span>
          <button
            type="button"
            className={classes.ghost}
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("moaNext")}
          </button>
        </div>
      )}
    </section>
  );
};

export default MoadianInvoices;
