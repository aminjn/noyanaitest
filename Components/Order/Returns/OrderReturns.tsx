"use client";

import { useRef, useState } from "react";
import classes from "./OrderReturns.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { useIntlLocale } from "@/Components/i18n/navigation";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import AreaInput from "@/Components/UI/AreaInput";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "@/Components/UI/Typography";

// Returns of delivered goods and refunds of done services (2026-10, backend
// Services/orderReturnService.ts). Benchmark: Digikala «مرجوعی» (a request
// per item and quantity within days of delivery, with a reason and photos;
// the seller decides, support arbitrates; the money comes back once the
// item is back), Snapp Pharmacy / Halodoc (prescription and cold-chain
// medicines only for the pharmacy's error), Amazon (the seller pays the way
// back for its own error). One component for the buyer's order page and
// the pharmacy / lab order pages, so both sides read the same states.

const NS: ContentNamespace[] = ["common", "orderReturns"];

export type ReturnReason = "wrongItem" | "damaged" | "expired" | "notAsDescribed" | "changedMind";
export type RefundReason = "serviceIssue" | "sellerError" | "goodwill" | "other";
export type ReturnStatus = "requested" | "approved" | "rejected" | "escalated" | "declined" | "shipped" | "refunded" | "cancelled";

export interface IOrderReturn {
  _id: string;
  model: "products" | "productPackages" | "tests";
  line: string;
  qty: number;
  kind: "return" | "refund";
  initiatedBy?: "buyer" | "seller" | "admin";
  reason: ReturnReason | RefundReason;
  note?: string;
  photos?: string[];
  sellerFault?: boolean;
  status: ReturnStatus;
  rejectReason?: string;
  shipping?: { method: "tapsi" | "tipax" | "inPerson"; fee?: number; paidBy: "seller" | "buyer"; trackingCode?: string; shippedAt?: string | null } | null;
  condition?: "resellable" | "damaged" | null;
  // deliveryRefund (2026-10): the parcel's delivery fee given back when a
  // seller-error return left the buyer nothing of it
  money?: { refund: number; shippingDeduction: number; promoClawback: number; sellerReversal: number; deliveryRefund?: number } | null;
  refundedAt?: string | null;
  createdAt?: string;
  escalation?: { status?: string; rejectReason?: string } | null;
}

export interface IReturnOption {
  model: "products" | "productPackages";
  line: string;
  qty: number;
  available: number;
  returnedQty?: number;
  until?: string | null;
  blocked?: "notDelivered" | "windowClosed" | "allReturned" | "noWindow" | null;
  restricted?: "rx" | "category" | null;
  reasons?: ReturnReason[];
}

const reasonKey: Record<string, ContentKey> = {
  wrongItem: "retReasonWrongItem",
  damaged: "retReasonDamaged",
  expired: "retReasonExpired",
  notAsDescribed: "retReasonNotAsDescribed",
  changedMind: "retReasonChangedMind",
  serviceIssue: "retReasonServiceIssue",
  sellerError: "retReasonSellerError",
  goodwill: "retReasonGoodwill",
  other: "retReasonOther",
};

const statusKey: Record<ReturnStatus, ContentKey> = {
  requested: "retStRequested",
  approved: "retStApproved",
  rejected: "retStRejected",
  escalated: "retStEscalated",
  declined: "retStDeclined",
  shipped: "retStShipped",
  refunded: "retStRefunded",
  cancelled: "retStCancelled",
};

const statusColor: Record<ReturnStatus, BadgeColor> = {
  requested: "Warning",
  approved: "Info",
  rejected: "Error",
  escalated: "Warning",
  declined: "Error",
  shipped: "Info",
  refunded: "Success",
  cancelled: "Disabled",
};

const SELLER_FAULT: ReturnReason[] = ["wrongItem", "damaged", "expired", "notAsDescribed"];
const MAX_PHOTOS = 6;

const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const isList = <T,>(v: unknown): v is T[] => Array.isArray(v);

const useT = () => {
  const getContent = useScopedLocale(NS);
  return (key: ContentKey, params?: (string | number)[]) => getContent(key, params?.map(String));
};

// ------------------------------------------------------------- one card

const ReturnCard = ({
  ret,
  name,
  viewer,
  children,
}: {
  ret: IOrderReturn;
  name: string;
  viewer: "buyer" | "seller";
  children?: React.ReactNode;
}) => {
  const t = useT();
  const status = statusKey[ret.status] ? ret.status : "requested";
  return (
    <li className={classes.card}>
      <div className={classes.cardHead}>
        <span className={`${classes.name} ${tsmDemiBold}`}>{name || "-"}</span>
        <Badge color={statusColor[status]} size="S">
          {t(statusKey[status])}
        </Badge>
      </div>
      <div className={`${classes.meta} ${t2xsRegular}`}>
        <span>{t(ret.kind === "refund" ? "retKindRefund" : "retKindReturn")}</span>
        <span>{t("retQtyOf", [currencize(n(ret.qty))])}</span>
        <span>{t(reasonKey[ret.reason] || "retReasonOther")}</span>
        {ret.kind === "return" && (
          <span>{t(ret.sellerFault ? "retSellerFaultBadge" : "retBuyerChoiceBadge")}</span>
        )}
      </div>
      {!!ret.note && <p className={`${classes.hint} ${t2xsRegular}`}>{ret.note}</p>}
      {isList<string>(ret.photos) && ret.photos.length > 0 && (
        <div className={`${classes.photos} ${t2xsRegular}`}>
          <span>{t("retPhotosLabel")}</span>
          {ret.photos.filter(Boolean).map((id, i) => (
            <a key={id} className={classes.photoLink} href={`${API}/notpublic/${id}`} target="_blank" rel="noreferrer">
              {t("retPhoto", [currencize(i + 1)])}
            </a>
          ))}
        </div>
      )}
      {(ret.status === "rejected" || ret.status === "declined") && !!(ret.rejectReason || ret.escalation?.rejectReason) && (
        <p className={`${classes.reason} ${t2xsRegular}`}>
          {t("retRejectReasonLabel", [ret.rejectReason || ret.escalation?.rejectReason || ""])}
        </p>
      )}
      {ret.status === "approved" && !!ret.shipping && (
        <p className={`${classes.hint} ${t2xsRegular}`}>
          {ret.shipping.method === "tapsi"
            ? t(viewer === "buyer" ? "retShipTapsiHint" : "retPickupHint")
            : viewer === "buyer"
              ? t(ret.shipping.paidBy === "seller" ? "retShipTipaxSellerPays" : "retShipTipaxHint")
              : t("retWaitBuyerShip")}
        </p>
      )}
      {!!ret.shipping?.trackingCode && (
        <span className={`${classes.meta} ${t2xsRegular}`}>
          {t("retTrackingCode")}: <bdi className={classes.ltr}>{ret.shipping.trackingCode}</bdi>
        </span>
      )}
      {!!ret.money && (
        <div className={`${classes.money} ${t2xsRegular}`}>
          <strong className={`${classes.refund} ${tsmRegular}`}>{t("retRefundAmount", [currencize(n(ret.money.refund))])}</strong>
          {n(ret.money.shippingDeduction) > 0 && <span>{t("retDeductShipping", [currencize(n(ret.money.shippingDeduction))])}</span>}
          {n(ret.money.promoClawback) > 0 && <span>{t("retDeductPromo", [currencize(n(ret.money.promoClawback))])}</span>}
          {n(ret.money.deliveryRefund) > 0 && <span>{t("retDeliveryRefund", [currencize(n(ret.money.deliveryRefund))])}</span>}
          {viewer === "seller" && n(ret.money.sellerReversal) > 0 && (
            <span>{t("retSellerReversal", [currencize(n(ret.money.sellerReversal))])}</span>
          )}
        </div>
      )}
      {ret.status === "escalated" && <p className={`${classes.hint} ${t2xsRegular}`}>{t("retEscalationPending")}</p>}
      {!!children && <div className={classes.actions}>{children}</div>}
    </li>
  );
};

// ------------------------------------------------------------ the buyer

const RequestReturnPopup = ({
  orderId,
  options,
  names,
  onDone,
}: {
  orderId: string;
  options: IReturnOption[];
  names: Record<string, string>;
  onDone: () => unknown;
}) => {
  const t = useT();
  const { closePopup } = usePopup();
  const notify = useNotification();
  const open = options.filter((o) => !o.blocked && o.available > 0);
  const [line, setLine] = useState(open[0]?.line || "");
  const option = open.find((o) => o.line === line) || open[0];
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [note, setNote] = useState("");
  const [unopened, setUnopened] = useState(false);
  const [photos, setPhotos] = useState<{ _id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const reasons = (isList<ReturnReason>(option?.reasons) ? option!.reasons : []).filter((r) => !!reasonKey[r]);
  const needsPhoto = !!reason && SELLER_FAULT.includes(reason);
  const valid =
    !!option &&
    qty >= 1 &&
    qty <= option.available &&
    !!reason &&
    reasons.includes(reason) &&
    (!needsPhoto || photos.length > 0) &&
    (reason !== "changedMind" || unopened);

  const upload = async (list: File[]) => {
    const picked = list.slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    if (!picked.length) return;
    setUploading(true);
    const added: { _id: string; name: string }[] = [];
    try {
      for (const file of picked) {
        const res = await fetcher<{ data?: { _id?: string } }>({
          url: `${API}/user/returns/photo`,
          method: "POST",
          bodyParser: "FORM",
          payload: { file },
        });
        if (res?.data?._id) added.push({ _id: res.data._id, name: file.name });
      }
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setUploading(false);
      if (added.length) setPhotos((prev) => [...prev, ...added].slice(0, MAX_PHOTOS));
    }
  };

  const submit = async () => {
    if (busy || !valid || !option) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/user/order/${orderId}/returns`,
        method: "POST",
        payload: {
          model: option.model,
          line: option.line,
          qty,
          reason,
          ...(note.trim() ? { note: note.trim() } : {}),
          photos: photos.map((p) => p._id),
          ...(reason === "changedMind" ? { unopened } : {}),
        },
      });
      notify(t("retSubmitted"), "Success");
      closePopup();
      await onDone();
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={t("retRequestTitle")}>
      <div className={classes.form}>
        <SelectInput
          title={t("retItem")}
          defaultValue={option?.line}
          options={Object.fromEntries(open.map((o) => [o.line, names[o.line] || o.line]))}
          onChange={(e) => {
            setLine(e.target.value);
            setQty(1);
            setReason("");
          }}
        />
        {!!option && (
          <Input
            title={`${t("retQty")} (${t("retMaxOf", [currencize(option.available)])})`}
            type="number"
            min={1}
            max={option.available}
            defaultValue="1"
            inputMode="numeric"
            onChange={(e) => setQty(Math.max(1, Math.min(option.available, Math.round(Number(e.target.value) || 1))))}
          />
        )}
        {option?.restricted && (
          <p className={`${classes.hint} ${t2xsRegular}`}>
            {t(option.restricted === "rx" ? "retRestrictedRx" : "retRestrictedCategory")}
          </p>
        )}
        <span className={`${classes.title} ${tsmRegular}`}>{t("retReason")}</span>
        <div className={classes.choices} role="radiogroup" aria-label={t("retReason")}>
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={reason === r}
              className={`${classes.choice} ${reason === r ? classes.choiceActive : ""} ${t2xsRegular}`}
              onClick={() => setReason(r)}
            >
              {t(reasonKey[r])}
            </button>
          ))}
        </div>
        {!!reason && (
          <p className={`${classes.hint} ${t2xsRegular}`}>
            {t(SELLER_FAULT.includes(reason) ? "retShippingSellerFault" : "retShippingBuyerFault")}
          </p>
        )}
        {reason === "changedMind" && (
          <label className={`${classes.check} ${t2xsRegular}`}>
            <input type="checkbox" checked={unopened} onChange={(e) => setUnopened(e.target.checked)} />
            <span>{t("retUnopened")}</span>
          </label>
        )}
        <label className={classes.file}>
          <input
            className={classes.fileInput}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading || photos.length >= MAX_PHOTOS}
            onChange={(e) => {
              const list = Array.from(e.target.files || []);
              e.target.value = "";
              upload(list);
            }}
          />
          <span className={`${classes.fileButton} ${tsmRegular}`}>{uploading ? t("retUploading") : t("retChoosePhotos")}</span>
          <span className={`${classes.hint} ${t2xsRegular}`}>{t("retPhotosHint")}</span>
        </label>
        {!!photos.length && (
          <ul className={classes.fileList}>
            {photos.map((p) => (
              <li key={p._id} className={classes.fileRow}>
                <span className={t2xsRegular} dir="auto">
                  {p.name}
                </span>
                <button
                  type="button"
                  className={`${classes.remove} ${t2xsRegular}`}
                  onClick={() => setPhotos((prev) => prev.filter((x) => x._id !== p._id))}
                >
                  {t("retRemovePhoto")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <AreaInput title={t("retNote")} onChange={(e) => setNote(e.target.value.slice(0, 1000))} />
        <div className={classes.actions}>
          <Button variant={valid ? "Primary" : "Disable"} isLoading={busy} onClick={submit}>
            {t("retSubmit")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// a short text and one action (a tracking code, a note for support)
const TextActionPopup = ({
  title,
  hint,
  field,
  required,
  submitLabel,
  onSubmit,
  area,
}: {
  title: string;
  hint?: string;
  field: string;
  required?: boolean;
  submitLabel: string;
  onSubmit: (value: string) => Promise<unknown>;
  area?: boolean;
}) => {
  const { closePopup } = usePopup();
  const notify = useNotification();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = !required || value.trim().length >= 3;
  const submit = async () => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      await onSubmit(value.trim());
      closePopup();
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={title}>
      <div className={classes.form}>
        {!!hint && <p className={`${classes.hint} ${t2xsRegular}`}>{hint}</p>}
        {area ? (
          <AreaInput title={field} required={required} onChange={(e) => setValue(e.target.value.slice(0, 1000))} />
        ) : (
          <Input title={field} inputClass={classes.ltr} autoComplete="off" onChange={(e) => setValue(e.target.value.slice(0, 200))} />
        )}
        <div className={classes.actions}>
          <Button variant={valid ? "Primary" : "Disable"} isLoading={busy} onClick={submit}>
            {submitLabel}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {/* the shared "cancel" lives in the common namespace */}
            <CancelText />
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

const CancelText = () => {
  const t = useT();
  return <>{t("cancel")}</>;
};

export const BuyerReturns = ({
  orderId,
  returns,
  options,
  names,
  windowDays,
  onChange,
}: {
  orderId: string;
  returns?: IOrderReturn[] | null;
  options?: IReturnOption[] | null;
  // line id -> its name
  names: Record<string, string>;
  windowDays?: number;
  onChange: () => unknown;
}) => {
  const t = useT();
  const { setPopup, closePopup } = usePopup();
  const notify = useNotification();
  const intlTag = useIntlLocale();
  const busy = useRef(false);
  const list = (isList<IOrderReturn>(returns) ? returns : []).filter((r) => !!r?._id);
  const opts = (isList<IReturnOption>(options) ? options : []).filter((o) => !!o?.line);
  const open = opts.filter((o) => !o.blocked && o.available > 0);
  const until = open
    .map((o) => (o.until ? new Date(o.until) : null))
    .filter((d): d is Date => !!d && !Number.isNaN(+d))
    .sort((a, b) => +b - +a)[0];
  if (!list.length && !open.length) return null;
  const dateText = until
    ? new Intl.DateTimeFormat(intlTag, { dateStyle: "medium", timeZone: "Asia/Tehran" }).format(until)
    : "";

  const post = async (url: string, payload: Record<string, unknown> | undefined, done: ContentKey) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await fetcher({ url, method: "POST", ...(payload ? { payload } : {}) });
      notify(t(done), "Success");
      await onChange();
    } finally {
      busy.current = false;
    }
  };

  return (
    <section className={classes.main} aria-label={t("retSectionTitle")}>
      <div className={classes.head}>
        <span className={`${classes.title} ${tsmDemiBold}`}>{t("retSectionTitle")}</span>
        {!!open.length && (
          <Button
            size="S"
            mode="Outline"
            onClick={() =>
              setPopup("RequestReturn", <RequestReturnPopup orderId={orderId} options={opts} names={names} onDone={onChange} />)
            }
          >
            {t("retRequestButton")}
          </Button>
        )}
      </div>
      {!!open.length && (
        <p className={`${classes.hint} ${t2xsRegular}`}>
          {dateText ? t("retWindowHint", [dateText]) : t("retWindowDaysHint", [currencize(n(windowDays))])}
        </p>
      )}
      {!!list.length && (
        <ul className={classes.list}>
          {list.map((ret) => (
            <ReturnCard key={ret._id} ret={ret} name={names[ret.line] || ""} viewer="buyer">
              {ret.status === "approved" && ret.shipping?.method !== "tapsi" && (
                <Button
                  size="S"
                  onClick={() =>
                    setPopup(
                      "ReturnShip",
                      <TextActionPopup
                        title={t("retShipSubmit")}
                        hint={t(ret.shipping?.paidBy === "seller" ? "retShipTipaxSellerPays" : "retShipTipaxHint")}
                        field={t("retTrackingCode")}
                        submitLabel={t("retShipSubmit")}
                        onSubmit={(code) => post(`${API}/user/returns/${ret._id}/ship`, { trackingCode: code }, "retShippedDone")}
                      />,
                    )
                  }
                >
                  {t("retShipSubmit")}
                </Button>
              )}
              {ret.status === "rejected" && (
                <Button
                  size="S"
                  onClick={() =>
                    setPopup(
                      "ReturnEscalate",
                      <TextActionPopup
                        title={t("retEscalate")}
                        hint={t("retEscalateHint")}
                        field={t("retEscalateNote")}
                        area
                        submitLabel={t("retEscalate")}
                        onSubmit={(note) => post(`${API}/user/returns/${ret._id}/escalate`, note ? { note } : undefined, "retEscalatedDone")}
                      />,
                    )
                  }
                >
                  {t("retEscalate")}
                </Button>
              )}
              {(ret.status === "requested" || ret.status === "approved" || ret.status === "rejected") && (
                <Button
                  size="S"
                  variant="Error"
                  mode="Outline"
                  onClick={() =>
                    setPopup(
                      "ReturnCancel",
                      <ConfirmationPopup
                        message={t("retCancelConfirm")}
                        onConfirm={async () => {
                          try {
                            await post(`${API}/user/returns/${ret._id}/cancel`, undefined, "retCancelledDone");
                          } catch (err) {
                            notify(errText(err), "Error");
                          } finally {
                            closePopup("ReturnCancel");
                          }
                        }}
                      />,
                    )
                  }
                >
                  {t("retCancel")}
                </Button>
              )}
            </ReturnCard>
          ))}
        </ul>
      )}
    </section>
  );
};

// ----------------------------------------------------------- the seller

const ReceivePopup = ({ ret, base, onDone }: { ret: IOrderReturn; base: string; onDone: () => unknown }) => {
  const t = useT();
  const { closePopup } = usePopup();
  const notify = useNotification();
  const initial: "resellable" | "damaged" = ret.reason === "damaged" || ret.reason === "expired" ? "damaged" : "resellable";
  const [condition, setCondition] = useState<"resellable" | "damaged">(initial);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${base}/returns/${ret._id}/receive`, method: "POST", payload: { condition } });
      notify(t("retReceivedDone"), "Success");
      closePopup();
      await onDone();
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("retReceive")}>
      <div className={classes.form}>
        <p className={`${classes.hint} ${t2xsRegular}`}>{t("retReceiveHint")}</p>
        <span className={`${classes.title} ${tsmRegular}`}>{t("retCondition")}</span>
        <div className={classes.choices} role="radiogroup" aria-label={t("retCondition")}>
          {(["resellable", "damaged"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={condition === c}
              className={`${classes.choice} ${condition === c ? classes.choiceActive : ""} ${t2xsRegular}`}
              onClick={() => setCondition(c)}
            >
              {t(c === "resellable" ? "retCondResellable" : "retCondDamaged")}
            </button>
          ))}
        </div>
        <div className={classes.actions}>
          <Button isLoading={busy} onClick={submit}>
            {t("retReceive")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export const SellerReturns = ({
  base,
  returns,
  names,
  onChange,
  canAct,
}: {
  // "/pharmacy" or "/paraClinic" (the panel's own API)
  base: "/pharmacy" | "/paraClinic";
  returns?: IOrderReturn[] | null;
  names: Record<string, string>;
  onChange: () => unknown;
  canAct: boolean;
}) => {
  const t = useT();
  const { setPopup } = usePopup();
  const notify = useNotification();
  const [busy, setBusy] = useState("");
  const list = (isList<IOrderReturn>(returns) ? returns : []).filter((r) => !!r?._id);
  if (!list.length) return null;
  const api = `${API}${base}`;
  const decide = async (ret: IOrderReturn) => {
    if (busy) return;
    setBusy(ret._id);
    try {
      await fetcher({ url: `${api}/returns/${ret._id}/decide`, method: "POST", payload: { decision: "approve" } });
      notify(t("retApprovedDone"), "Success");
      await onChange();
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setBusy("");
    }
  };
  return (
    <section className={classes.main} aria-label={t("retSellerTitle")}>
      <span className={`${classes.title} ${tsmDemiBold}`}>{t("retSellerTitle")}</span>
      <ul className={classes.list}>
        {list.map((ret) => (
          <ReturnCard key={ret._id} ret={ret} name={names[ret.line] || ""} viewer="seller">
            {canAct && ret.status === "requested" && (
              <>
                <Button size="S" variant="Success" isLoading={busy === ret._id} onClick={() => decide(ret)}>
                  {t("retApprove")}
                </Button>
                <Button
                  size="S"
                  variant="Error"
                  mode="Outline"
                  onClick={() =>
                    setPopup(
                      "ReturnReject",
                      <TextActionPopup
                        title={t("retReject")}
                        field={t("retRejectReason")}
                        area
                        required
                        submitLabel={t("retReject")}
                        onSubmit={async (reason) => {
                          await fetcher({
                            url: `${api}/returns/${ret._id}/decide`,
                            method: "POST",
                            payload: { decision: "reject", reason },
                          });
                          notify(t("retRejectedDone"), "Success");
                          await onChange();
                        }}
                      />,
                    )
                  }
                >
                  {t("retReject")}
                </Button>
              </>
            )}
            {canAct && ret.status === "approved" && ret.shipping?.method === "tapsi" && (
              <Button
                size="S"
                mode="Outline"
                onClick={() =>
                  setPopup(
                    "ReturnPickup",
                    <TextActionPopup
                      title={t("retPickup")}
                      hint={t("retPickupHint")}
                      field={t("retPickupCode")}
                      submitLabel={t("retPickup")}
                      onSubmit={async (code) => {
                        await fetcher({
                          url: `${api}/returns/${ret._id}/pickup`,
                          method: "POST",
                          payload: code ? { trackingCode: code } : {},
                        });
                        notify(t("retPickupDone"), "Success");
                        await onChange();
                      }}
                    />,
                  )
                }
              >
                {t("retPickup")}
              </Button>
            )}
            {canAct && (ret.status === "approved" || ret.status === "shipped") && ret.kind === "return" && (
              <Button
                size="S"
                onClick={() => setPopup("ReturnReceive", <ReceivePopup ret={ret} base={api} onDone={onChange} />)}
              >
                {t("retReceive")}
              </Button>
            )}
          </ReturnCard>
        ))}
      </ul>
    </section>
  );
};

// ---------------------------------------------- the lab's own refund

const RefundPopup = ({
  orderId,
  lines,
  onDone,
}: {
  orderId: string;
  lines: { line: string; name: string; free: number }[];
  onDone: () => unknown;
}) => {
  const t = useT();
  const { closePopup } = usePopup();
  const notify = useNotification();
  const [line, setLine] = useState(lines[0]?.line || "");
  const picked = lines.find((l) => l.line === line) || lines[0];
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<RefundReason>("serviceIssue");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = !!picked && qty >= 1 && qty <= picked.free && note.trim().length >= 3;
  const submit = async () => {
    if (busy || !valid || !picked) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/paraClinic/order/${orderId}/refund`,
        method: "POST",
        payload: { model: "tests", line: picked.line, qty, reason, note: note.trim() },
      });
      notify(t("retRefundDone"), "Success");
      closePopup();
      await onDone();
    } catch (err) {
      notify(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("retRefundTitle")}>
      <div className={classes.form}>
        <p className={`${classes.hint} ${t2xsRegular}`}>{t("retRefundHint")}</p>
        <SelectInput
          title={t("retItem")}
          defaultValue={picked?.line}
          options={Object.fromEntries(lines.map((l) => [l.line, l.name || l.line]))}
          onChange={(e) => {
            setLine(e.target.value);
            setQty(1);
          }}
        />
        {!!picked && (
          <Input
            title={`${t("retQty")} (${t("retMaxOf", [currencize(picked.free)])})`}
            type="number"
            min={1}
            max={picked.free}
            defaultValue="1"
            inputMode="numeric"
            onChange={(e) => setQty(Math.max(1, Math.min(picked.free, Math.round(Number(e.target.value) || 1))))}
          />
        )}
        <SelectInput
          title={t("retRefundReasonField")}
          defaultValue={reason}
          options={Object.fromEntries((["serviceIssue", "sellerError", "goodwill", "other"] as RefundReason[]).map((r) => [r, t(reasonKey[r])]))}
          onChange={(e) => setReason((e.target.value || "serviceIssue") as RefundReason)}
        />
        <AreaInput title={t("retRefundNote")} required onChange={(e) => setNote(e.target.value.slice(0, 1000))} />
        <div className={classes.actions}>
          <Button variant={valid ? "Error" : "Disable"} isLoading={busy} onClick={submit}>
            {t("retRefundSubmit")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {t("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// a lab's done tests it may refund (a performed test is not returned)
export const LabRefundButton = ({
  orderId,
  lines,
  onDone,
}: {
  orderId: string;
  lines: { line: string; name: string; free: number }[];
  onDone: () => unknown;
}) => {
  const t = useT();
  const { setPopup } = usePopup();
  const open = lines.filter((l) => l.free > 0);
  if (!open.length) return null;
  return (
    <Button
      size="S"
      variant="Error"
      mode="Outline"
      onClick={() => setPopup("LabRefund", <RefundPopup orderId={orderId} lines={open} onDone={onDone} />)}
    >
      {t("retRefundLine")}
    </Button>
  );
};
