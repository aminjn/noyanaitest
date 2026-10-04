"use client";

import { useEffect, useRef, useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import SparkIcon from "@/Components/Icons/SparkIcon";
import classes from "../../Accounting.module.css";
import { useBizFormat } from "../../bizShared";
import { useFinPopup, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { AiOff, errorText, FinAiWarning, isAiOff, useFinAiPost, useFinAiStatus, Warnings } from "./finAi";

// What the receipt reader returns (Lib/business/financeAi.ts receiptDraft):
// the expense form's values, what was read, and what to check.
export type ReceiptDraft = {
  needsText?: boolean;
  attachment?: string;
  expense?: {
    date: string;
    account: string;
    vendor: string;
    description: string;
    amount: number;
    tax: number;
    center: string;
    attachment: string;
    payNow: boolean;
    method?: string;
  };
  extracted?: {
    vendor: string;
    vendorEconomicCode: string;
    invoiceNumber: string;
    printedDate: string;
    currency: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    lines: { title: string; qty: number; unitPrice: number; total: number }[];
    isStock: boolean;
  };
  suggestion?: { source: string; confidence: number };
  warnings?: FinAiWarning[];
};

export const RECEIPT_POPUP = "FinReceiptOcr";

// Nexxa's ReceiptOcr: a receipt's photo or PDF -> vendor, date, amounts,
// VAT, lines and a suggested expense kind; the expense form opens filled and
// the user confirms. A text-only model asks for the receipt's text instead.
const ReceiptOcr = ({ onDraft }: { onDraft: (d: ReceiptDraft) => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const post = useFinAiPost();
  const { data: status } = useFinAiStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [off, setOff] = useState(false);
  const [draft, setDraft] = useState<ReceiptDraft | null>(null);
  const [text, setText] = useState("");

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const pick = (fl?: File | null) => {
    if (!fl) return;
    setErr(null);
    setDraft(null);
    setFile(fl);
    setPreview(fl.type.startsWith("image/") ? URL.createObjectURL(fl) : null);
  };
  const run = async (payload: Record<string, unknown>, form: boolean) => {
    setBusy(true);
    setErr(null);
    try {
      setDraft(await post<ReceiptDraft>("receipt", payload, form));
    } catch (e) {
      if (isAiOff(e)) setOff(true);
      else setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const extract = () => file && run({ file }, true);
  const fromText = () => text.trim().length > 5 && run({ text: text.trim(), attachment: draft?.attachment }, false);

  if (off || (status && !status.enabled)) return <AiOff status={status} />;
  const x = draft?.extracted;
  return (
    <div className={ai.ocrGrid}>
      <section className={classes.card}>
        <span className={classes.cardTitle}>{t("faiReceiptImage")}</span>
        <div className={classes.actions} style={{ justifyContent: "flex-start" }}>
          <button type="button" className={classes.ghost} onClick={() => fileRef.current?.click()}>
            {t("faiChooseFile")}
          </button>
          <button type="button" className={`${ai.aiButton} ${ai.aiSolid}`} onClick={extract} disabled={!file || busy} aria-busy={busy}>
            <SparkIcon />
            {busy ? t("faiReading") : t("faiExtract")}
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        {status?.vision === "maybe" && <p className={classes.muted}>{t("faiVisionMaybe")}</p>}
        {!!err && <p className={classes.negative}>{err}</p>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt={t("faiReceiptImage")} className={ai.preview} /> : <div className={ai.drop}>{file ? file.name : t("faiDropHint")}</div>}
      </section>

      <section className={classes.card}>
        <span className={classes.cardTitle}>{t("faiReceiptResult")}</span>
        {!draft ? (
          <p className={classes.empty}>{t("faiReceiptEmpty")}</p>
        ) : draft.needsText ? (
          <>
            <Warnings list={draft.warnings} />
            <p className={classes.muted}>{t("faiTypeReceipt")}</p>
            <textarea className={ai.textarea} value={text} maxLength={6000} onChange={(e) => setText(e.target.value)} placeholder={t("faiTypeReceiptPh")} />
            <div className={classes.actions}>
              <button type="button" className={`${ai.aiButton} ${ai.aiSolid}`} disabled={busy || text.trim().length < 6} onClick={fromText}>
                <SparkIcon />
                {busy ? t("faiReading") : t("faiExtract")}
              </button>
            </div>
          </>
        ) : (
          <>
            <dl className={ai.kv}>
              <div>
                <dt>{t("finVendor")}</dt>
                <dd>{x?.vendor || "—"}</dd>
              </div>
              <div>
                <dt>{t("faiPrintedDate")}</dt>
                <dd>{x?.printedDate || "—"}</dd>
              </div>
              <div>
                <dt>{t("finNetAmount")}</dt>
                <dd>
                  {f.money(draft.expense?.amount)} {t("toman")}
                </dd>
              </div>
              <div>
                <dt>{t("finVatPaid")}</dt>
                <dd>{f.money(draft.expense?.tax)}</dd>
              </div>
              <div>
                <dt>{t("bizTotal")}</dt>
                <dd>{f.money(x?.total)}</dd>
              </div>
              {!!x?.invoiceNumber && (
                <div>
                  <dt>{t("faiInvoiceNo")}</dt>
                  <dd dir="ltr">{x.invoiceNumber}</dd>
                </div>
              )}
              {!!x?.vendorEconomicCode && (
                <div>
                  <dt>{t("faiEconomicCode")}</dt>
                  <dd dir="ltr">{x.vendorEconomicCode}</dd>
                </div>
              )}
            </dl>
            {x?.currency === "rial" && <p className={classes.muted}>{t("faiRialConverted")}</p>}
            {!!x?.lines?.length && (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("faiItem")}</th>
                      <th className={classes.num}>{t("faiQty")}</th>
                      <th className={classes.num}>{t("faiUnitPrice")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {x.lines.map((l, i) => (
                      <tr key={i}>
                        <td className={classes.wrap}>{l.title || "—"}</td>
                        <td className={classes.num}>{f.money(l.qty)}</td>
                        <td className={classes.num}>{f.money(l.unitPrice)}</td>
                        <td className={classes.num}>{f.money(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!!draft.suggestion && (
              <p className={classes.muted}>
                {t(
                  draft.suggestion.source === "memory" || draft.suggestion.source === "history"
                    ? "faiSuggestedFromHistory"
                    : draft.suggestion.source === "ai"
                      ? "faiSuggestedByAi"
                      : "faiSuggestedDefault",
                )}
              </p>
            )}
            <Warnings list={draft.warnings} />
            <div className={classes.actions}>
              <button type="button" className={classes.primary} disabled={!draft.expense} onClick={() => onDraft(draft)}>
                {t("faiReviewExpense")}
              </button>
            </div>
            <p className={classes.muted}>{t("faiReviewNote")}</p>
          </>
        )}
      </section>
    </div>
  );
};

export const ReceiptOcrPopup = ({ onDraft }: { onDraft: (d: ReceiptDraft) => unknown }) => {
  const t = useFinText();
  const { close } = useFinPopup();
  return (
    <PopupCard title={t("faiReceiptTitle")}>
      <div className={classes.popup} style={{ maxWidth: "64rem" }}>
        <ReceiptOcr
          onDraft={(d) => {
            close(RECEIPT_POPUP);
            onDraft(d);
          }}
        />
      </div>
    </PopupCard>
  );
};

export default ReceiptOcr;
