"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { ReactNode, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import PopupCard from "@/Components/UI/PopupCard";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import CloseIcon from "@/Components/Icons/CloseIcon";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import {
  IFinanceUser,
  adminNoteActionDict,
  lineModelDict,
  lineStatusDict,
  orderLedgerKindDict,
  orderStatusDict,
  paymentMethodDict,
  paymentStatusDict,
  failureReasonLabel,
  rxInsurerDict,
  rxKindDict,
  rxStatusDict,
  samplingActorDict,
  samplingKindDict,
  samplingStateDict,
  samplingStateOf,
  samplingWhenLabel,
  shipmentMethodDict,
  snappStateLabel,
  userLabel,
} from "./adminFinance";
import classes from "./AdminFinanceOrderPage.module.css";
import AdminSamplingReschedulePopup, {
  AdminBuyerAddress,
  IAdminSampling,
} from "./AdminSamplingReschedulePopup";

type Seller = { _id: string; name: string; kind?: string } | null;

interface IOrderLine {
  _id: string;
  model: string;
  itemId: string;
  name: string;
  qty: number;
  price: number;
  tax: number | null;
  lineTotal: number;
  status: "pending" | "fulfilled" | "cancelled";
  seller: Seller;
  // prescription-only line (2026-10)
  requiresPrescription?: boolean;
  prescription?: {
    kind: string;
    insurer: string;
    trackingCode: string;
    nationalCode: string;
    files: string[];
    note: string;
    status: string;
    reason: string;
    reviewedAt?: string | null;
  } | null;
}

interface IRide {
  _id: string;
  hri: string;
  state: number | null;
  stateName: string | null;
  finalPrice: number | null;
  driverName: string;
  driverCellphone: string;
  shareUrl: string;
  requestedAt?: string;
  lastRefreshedAt?: string | null;
  cancelledAt?: string | null;
}

interface IShipment {
  _id: string;
  pharmacy: { _id: string; name: string } | null;
  method: string | null;
  fee: number;
  payOnDelivery: boolean;
  originCity: string;
  destinationCity: string;
  ride: IRide | null;
}

interface IOrderDetail {
  _id: string;
  user: IFinanceUser | null;
  status: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  submittedAt?: string;
  paidAt?: string | null;
  address: {
    displayName: string;
    address: string;
    receiverPhone: string;
    postalCode: string;
    city: string;
  } | null;
  lines: IOrderLine[];
  shipments: IShipment[];
  transactions: {
    _id: string;
    user: IFinanceUser | null;
    amount: number;
    createdAt?: string;
    kind: string;
    line: string;
    grossAmount?: number;
    commission?: number;
  }[];
  payments: {
    _id: string;
    amount: number;
    status: string;
    rrn: string;
    maskedPan: string;
    failureReason: string;
    createdAt?: string;
  }[];
  totals: { refunded: number; paidOut: number; commission: number };
  adminNotes: {
    action: string;
    model: string;
    line: string;
    reason: string;
    by: string;
    at?: string;
  }[];
  canCancel: boolean;
  // lab sampling appointments (2026-10) and the buyer's addresses for a
  // switch to home
  samplings?: IAdminSampling[];
  buyerAddresses?: AdminBuyerAddress[];
}

const errorText = (err: unknown) => (err as Error)?.message || ta("خطایی رخ داد");

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

// A written reason is required for every money-moving admin action; it is
// kept on the order and in the audit log.
const ReasonPopup = ({
  title,
  hint,
  confirm,
  danger,
  onSubmit,
}: {
  title: string;
  hint: string;
  confirm: string;
  danger?: boolean;
  onSubmit: (reason: string) => Promise<unknown>;
}) => {
  const { closePopup } = usePopup();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = reason.trim().length >= 3;
  return (
    <PopupCard title={title}>
      <div className={classes.popupBody}>
        <p className={classes.hint}>{hint}</p>
        <AreaInput
          title={ta("دلیل (الزامی، روی سفارش و در لاگ ثبت می‌شود)")}
          required
          onChange={(e) => setReason(e.target.value)}
        />
        <div className={classes.popupActions}>
          <Button
            variant={!ok ? "Disable" : danger ? "Error" : "Primary"}
            isLoading={busy}
            onClick={async () => {
              if (!ok || busy) return;
              setBusy(true);
              try {
                await onSubmit(reason.trim());
                closePopup();
              } catch {
                // the caller already showed the error
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirm}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={classes.field}>
    <span className={classes.label}>{label}</span>
    <span className={classes.value}>{children}</span>
  </div>
);

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={classes.card}>
    <h2 className={classes.cardTitle}>{title}</h2>
    {children}
  </section>
);

// Order back office (2026-10): everything about one store order in one
// place - lines with their seller, shipments and the Snapp courier, the
// gateway payment, the wallet ledger (charge, refunds, payouts), and
// support's actions: cancel the order, cancel a line or mark a stuck line
// delivered. Money moves only through the server's per-line settlement, so
// nothing is refunded or paid twice.
const AdminFinanceOrderPage = () => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId;
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { user: viewer } = useUser();
  const hasAccess = useAccessLevel();
  // the actions need Order "update" (adminFinanceRouter): staff who may
  // only read orders don't get buttons that would answer 403
  const canAct = viewer?.role === "admin" || hasAccess("Order", "update");
  const [busyShipment, setBusyShipment] = useState("");
  const { data, error, mutate } = useSWR<IOrderDetail | null>(
    nodeId ? `${API}/admin/finance/orders/${nodeId}` : null,
    (url: string) =>
      fetcher({ url }).then((res) =>
        res?.data && typeof res.data === "object" ? res.data : null,
      ),
  );

  const dateFormat = new Intl.DateTimeFormat(adminIntlTag(), {
    timeZone: TEHRAN_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
  const fmtDate = (value?: string | null) =>
    value && !isNaN(new Date(value).getTime()) ? dateFormat.format(new Date(value)) : "—";

  const post = async (url: string, payload: Record<string, unknown>, okText: string) => {
    try {
      await fetcher({ url, method: "POST", payload, bodyParser: "JSON" });
      pushNotification(okText, "Success");
      mutate();
    } catch (err) {
      pushNotification(errorText(err), "Error");
      throw err;
    }
  };

  const base = `${API}/admin/finance/orders/${nodeId}`;

  const cancelOrder = () =>
    setPopup(
      "AdminCancelOrder",
      <ReasonPopup
        title={ta("لغو سفارش")}
        hint={ta("همه‌ی اقلامی که هنوز فروشنده آماده نکرده لغو می‌شوند و مبلغشان (با مالیات و هزینه‌ی ارسال مربوط) به کیف پول خریدار برمی‌گردد. اقلام تحویل‌شده دست نمی‌خورند. به خریدار و فروشنده‌ها اعلان می‌رود.")}
        confirm={ta("لغو سفارش")}
        danger
        onSubmit={(reason) => post(`${base}/cancel`, { reason }, ta("سفارش لغو شد"))}
      />,
    );

  const lineAction = (line: IOrderLine, status: "fulfilled" | "cancelled") =>
    setPopup(
      "AdminOrderLineStatus",
      <ReasonPopup
        title={status === "cancelled" ? ta("لغو قلم") : ta("ثبت تحویل قلم")}
        hint={
          status === "cancelled"
            ? ta("«${1}» لغو و مبلغش با مالیاتش به کیف پول خریدار برمی‌گردد؛ به فروشنده گفته می‌شود آن را ارسال نکند.", [line.name || "—"])
            : ta("«${1}» تحویل‌شده ثبت می‌شود و سهم فروشنده (پس از کمیسیون) به کیف پولش واریز می‌شود. فقط وقتی تحویل را تأیید کرده‌اید انجام دهید.", [line.name || "—"])
        }
        confirm={status === "cancelled" ? ta("لغو قلم") : ta("ثبت تحویل")}
        danger={status === "cancelled"}
        onSubmit={(reason) =>
          post(
            `${base}/lines/${line._id}/status`,
            { model: line.model, status, reason },
            status === "cancelled" ? ta("قلم لغو شد") : ta("تحویل قلم ثبت شد"),
          )
        }
      />,
    );

  const rescheduleSampling = (sampling: IAdminSampling) =>
    setPopup(
      "AdminRescheduleSampling",
      <AdminSamplingReschedulePopup
        sampling={sampling}
        addresses={asArray<AdminBuyerAddress>(data?.buyerAddresses)}
        onSubmit={(payload) =>
          post(`${base}/samplings/${sampling._id}/reschedule`, payload, ta("نوبت نمونه‌گیری جابه‌جا شد"))
        }
      />,
    );

  const cancelSampling = (sampling: IAdminSampling) =>
    setPopup(
      "AdminCancelSampling",
      <ReasonPopup
        title={ta("لغو نوبت نمونه‌گیری")}
        hint={ta("آزمایش‌های در انتظارِ این نوبت لغو و مبلغشان (با مالیات و هزینه‌ی نمونه‌گیری در منزل) به کیف پول خریدار برمی‌گردد؛ ظرفیت آزمایشگاه آزاد می‌شود و به آزمایشگاه گفته می‌شود.")}
        confirm={ta("لغو نوبت")}
        danger
        onSubmit={(reason) =>
          post(`${base}/samplings/${sampling._id}/cancel`, { reason }, ta("نوبت نمونه‌گیری لغو شد"))
        }
      />,
    );

  const delivery = async (pharmacyId: string, refresh: boolean) => {
    setBusyShipment(pharmacyId);
    try {
      await post(
        `${base}/delivery${refresh ? "/refresh" : ""}`,
        { pharmacyId },
        refresh ? ta("وضعیت پیک به‌روز شد") : ta("درخواست پیک اسنپ ثبت شد"),
      );
    } catch {
      // shown by post()
    } finally {
      setBusyShipment("");
    }
  };

  const lines = asArray<IOrderLine>(data?.lines);
  const shipments = asArray<IShipment>(data?.shipments);
  const ledger = asArray<IOrderDetail["transactions"][number]>(data?.transactions);
  const payments = asArray<IOrderDetail["payments"][number]>(data?.payments);
  const notes = asArray<IOrderDetail["adminNotes"][number]>(data?.adminNotes);
  const paid = data?.status === "paid";
  const lineName = (id: string) => lines.find((l) => l._id === id)?.name || "";
  const rxLines = lines.filter((l) => !!l.requiresPrescription);
  const samplings = asArray<IAdminSampling>(data?.samplings).filter((s) => !!s?._id && !!s.ymd);

  const sellerLink = (seller: Seller) =>
    seller ? (
      seller.kind ? (
        <InlineLink href={adminPath(`/${seller.kind}/${seller._id}`)}>
          {seller.name || "—"}
        </InlineLink>
      ) : (
        seller.name || "—"
      )
    ) : (
      "—"
    );

  return (
    <HandleLoading data={data !== undefined} error={error}>
      {data === null && <p className={classes.hint}>{ta("سفارش پیدا نشد")}</p>}
      {!!data && (
        <WithTitle
          title={ta("سفارش ${1}", [data._id.slice(-8)])}
          actions={
            data.canCancel && canAct
              ? [
                  {
                    title: ta("لغو سفارش"),
                    danger: true,
                    icon: <CloseIcon />,
                    action: cancelOrder,
                  },
                ]
              : []
          }
        >
          <div className={classes.main}>
            <Card title={ta("خلاصه")}>
              <div className={classes.grid}>
                <Field label={ta("خریدار")}>
                  {data.user ? (
                    <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                      {userLabel(data.user)}
                    </InlineLink>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label={ta("وضعیت پرداخت")}>
                  <span className={`${classes.badge} ${classes[`badge_${data.status}`] || ""}`}>
                    {orderStatusDict[data.status] || data.status}
                  </span>
                </Field>
                <Field label={ta("روش پرداخت")}>
                  {paymentMethodDict[data.paymentMethod] || data.paymentMethod || "—"}
                </Field>
                <Field label={ta("تاریخ ثبت")}>{fmtDate(data.submittedAt)}</Field>
                <Field label={ta("تاریخ پرداخت")}>{fmtDate(data.paidAt)}</Field>
                <Field label={ta("جمع اقلام (تومان)")}>{currencize(data.subtotal || 0)}</Field>
                <Field label={ta("مالیات (تومان)")}>{currencize(data.tax || 0)}</Field>
                <Field label={ta("هزینه‌ی ارسال (تومان)")}>{currencize(data.deliveryFee || 0)}</Field>
                <Field label={ta("مبلغ کل (تومان)")}>
                  <strong>{currencize(data.total || 0)}</strong>
                </Field>
                <Field label={ta("بازپرداخت به خریدار (تومان)")}>
                  {currencize(data.totals?.refunded || 0)}
                </Field>
                <Field label={ta("تسویه با فروشندگان (تومان)")}>
                  {currencize(data.totals?.paidOut || 0)}
                </Field>
                <Field label={ta("کمیسیون نویان (تومان)")}>
                  {currencize(data.totals?.commission || 0)}
                </Field>
              </div>
              {data.address && (
                <div className={classes.address}>
                  <span className={classes.label}>{ta("نشانی تحویل")}</span>
                  <span>
                    {[data.address.displayName, data.address.city, data.address.address]
                      .filter(Boolean)
                      .join(" - ")}
                  </span>
                  <span className={classes.muted}>
                    {[
                      data.address.receiverPhone &&
                        ta("گیرنده: ${1}", [data.address.receiverPhone]),
                      data.address.postalCode &&
                        ta("کد پستی: ${1}", [data.address.postalCode]),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              )}
            </Card>

            <Card title={ta("اقلام سفارش")}>
              <Table
                name="AdminFinanceOrderLines"
                data={lines}
                renderer={{
                  name: {
                    name: ta("قلم"),
                    value: (line) => line.name || "—",
                  },
                  model: {
                    name: ta("نوع"),
                    value: (line) => lineModelDict[line.model] || line.model,
                  },
                  seller: {
                    name: ta("فروشنده"),
                    value: (line) => line.seller?.name || "—",
                    component: (line) => sellerLink(line.seller),
                  },
                  qty: { name: ta("تعداد"), value: (line) => line.qty },
                  price: {
                    name: ta("قیمت واحد (تومان)"),
                    value: (line) => line.price,
                    component: (line) => currencize(line.price || 0),
                  },
                  tax: {
                    name: ta("مالیات (تومان)"),
                    value: (line) => line.tax ?? "",
                    component: (line) =>
                      line.tax === null ? "—" : currencize(line.tax || 0),
                  },
                  status: {
                    name: ta("وضعیت"),
                    value: (line) => lineStatusDict[line.status] || line.status,
                    component: (line) => (
                      <span className={`${classes.badge} ${classes[`badge_${line.status}`] || ""}`}>
                        {lineStatusDict[line.status] || line.status}
                      </span>
                    ),
                  },
                  prescription: {
                    name: ta("نسخه"),
                    value: (line) =>
                      line.requiresPrescription
                        ? rxStatusDict[line.prescription?.status || "pending"] || ""
                        : "",
                    component: (line) =>
                      line.requiresPrescription ? (
                        <span
                          className={`${classes.badge} ${classes[`badge_${line.prescription?.status || "pending"}`] || ""}`}
                        >
                          {rxStatusDict[line.prescription?.status || "pending"] ||
                            line.prescription?.status}
                        </span>
                      ) : (
                        "—"
                      ),
                  },
                  actions: {
                    name: ta("عملیات"),
                    width: 210,
                    component: (line) =>
                      canAct && paid && line.status === "pending" ? (
                        <TableActions>
                          <Button size="S" variant="Neutral" onClick={() => lineAction(line, "fulfilled")}>
                            {ta("ثبت تحویل")}
                          </Button>
                          <Button size="S" variant="Error" mode="Outline" onClick={() => lineAction(line, "cancelled")}>
                            {ta("لغو")}
                          </Button>
                        </TableActions>
                      ) : null,
                  },
                }}
              />
            </Card>

            {samplings.length > 0 && (
              <Card title={ta("نوبت‌های نمونه‌گیری")}>
                <div className={classes.shipments}>
                  {samplings.map((s) => {
                    const state = samplingStateOf(s);
                    const tests = asArray<IAdminSampling["tests"][number]>(s.tests);
                    const moves = asArray<IAdminSampling["moves"][number]>(s.moves);
                    const canCancelSampling =
                      canAct &&
                      s.status === "active" &&
                      s.orderStatus === "paid" &&
                      tests.some((l) => l.status === "pending");
                    return (
                      <div key={s._id} className={classes.shipment}>
                        <div className={classes.shipmentHead}>
                          {s.paraClinic ? (
                            <InlineLink href={adminPath(`/paraClinic/${s.paraClinic._id}`)}>
                              {s.paraClinic.name || "—"}
                            </InlineLink>
                          ) : (
                            "—"
                          )}
                          <span className={`${classes.badge} ${classes[`badge_${state === "cancelled" ? "cancelled" : state === "done" || state === "collected" ? "fulfilled" : "pending"}`] || ""}`}>
                            {samplingStateDict[state] || state}
                          </span>
                        </div>
                        <div className={classes.grid}>
                          <Field label={ta("زمان")}>{samplingWhenLabel(s)}</Field>
                          <Field label={ta("محل")}>{samplingKindDict[s.kind] || s.kind}</Field>
                          <Field label={ta("آزمایش‌ها")}>
                            {tests.map((l) => l.name).filter(Boolean).join(" · ") || "—"}
                          </Field>
                          {s.fee > 0 && (
                            <Field label={ta("هزینه‌ی نمونه‌گیری در منزل (تومان)")}>{currencize(s.fee)}</Field>
                          )}
                          <Field label={ta("تأیید آزمایشگاه")}>{fmtDate(s.confirmedAt)}</Field>
                          <Field label={ta("نمونه‌گیری انجام شد")}>{fmtDate(s.collectedAt)}</Field>
                          <Field label={ta("یادآوری ارسال شد")}>{fmtDate(s.remindedAt)}</Field>
                          {s.status === "cancelled" && (
                            <Field label={ta("زمان لغو")}>{fmtDate(s.cancelledAt)}</Field>
                          )}
                        </div>
                        {s.kind === "home" && s.address && (
                          <div className={classes.address}>
                            <span className={classes.label}>{ta("نشانی نمونه‌گیری")}</span>
                            <span>
                              {[s.address.displayName, s.address.city, s.address.district, s.address.address]
                                .filter(Boolean)
                                .join(" - ")}
                            </span>
                            {!!s.address.receiverPhone && (
                              <span className={classes.muted}>
                                {ta("گیرنده: ${1}", [s.address.receiverPhone])}
                              </span>
                            )}
                          </div>
                        )}
                        {moves.length > 0 && (
                          <div className={classes.address}>
                            <span className={classes.label}>{ta("سابقه‌ی جابه‌جایی")}</span>
                            <ul className={classes.notes}>
                              {[...moves].reverse().map((m) => (
                                <li key={m._id}>
                                  <strong>{samplingActorDict[m.by] || m.by}</strong>
                                  <span className={classes.muted}>
                                    {" "}
                                    {[m.byUser, fmtDate(m.at)].filter(Boolean).join(" · ")}
                                  </span>
                                  <p>
                                    {ta("از ${1} به ${2}", [
                                      `${samplingWhenLabel(m.from)} (${samplingKindDict[m.from?.kind || ""] || "—"})`,
                                      `${samplingWhenLabel(m.to)} (${samplingKindDict[m.to?.kind || ""] || "—"})`,
                                    ])}
                                    {m.feeDelta
                                      ? ` · ${
                                          m.feeDelta > 0
                                            ? ta("${1} تومان از خریدار گرفته شد", [currencize(m.feeDelta)])
                                            : ta("${1} تومان به خریدار برگشت", [currencize(-m.feeDelta)])
                                        }`
                                      : ""}
                                  </p>
                                  {!!m.reason && <p className={classes.muted}>{m.reason}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {!s.move?.canMove && s.status === "active" && s.move?.block === "collected" && (
                          <p className={classes.hint}>{ta("نمونه گرفته شده؛ این نوبت دیگر جابه‌جا نمی‌شود.")}</p>
                        )}
                        {canAct && (s.move?.canMove || canCancelSampling) && (
                          <div className={classes.shipmentActions}>
                            {s.move?.canMove && (
                              <Button size="S" variant="Neutral" onClick={() => rescheduleSampling(s)}>
                                {ta("جابه‌جایی نوبت")}
                              </Button>
                            )}
                            {canCancelSampling && (
                              <Button size="S" variant="Error" mode="Outline" onClick={() => cancelSampling(s)}>
                                {ta("لغو نوبت")}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {rxLines.length > 0 && (
              <Card title={ta("نسخه‌ها")}>
                <p className={classes.hint}>
                  {ta("این اقلام نسخه‌ای‌اند؛ داروخانه‌ی فروشنده باید نسخه را تأیید کند تا قلم آماده و ارسال شود. رد نسخه، قلم را لغو و مبلغش را به خریدار برمی‌گرداند.")}
                </p>
                <div className={classes.shipments}>
                  {rxLines.map((line) => {
                    const p = line.prescription;
                    const files = Array.isArray(p?.files) ? p.files : [];
                    return (
                      <div key={`rx-${line._id}`} className={classes.shipment}>
                        <div className={classes.shipmentHead}>
                          <span>{line.name || "—"}</span>
                          <span className={`${classes.badge} ${classes[`badge_${p?.status || "pending"}`] || ""}`}>
                            {rxStatusDict[p?.status || "pending"] || p?.status}
                          </span>
                        </div>
                        <div className={classes.grid}>
                          <Field label={ta("فروشنده")}>{sellerLink(line.seller)}</Field>
                          <Field label={ta("نوع نسخه")}>
                            {p ? rxKindDict[p.kind] || p.kind : ta("ثبت نشده")}
                          </Field>
                          {p?.kind === "erx" && (
                            <>
                              <Field label={ta("بیمه")}>{rxInsurerDict[p.insurer] || p.insurer || "—"}</Field>
                              <Field label={ta("کد رهگیری نسخه")}>
                                <bdi dir="ltr">{p.trackingCode || "—"}</bdi>
                              </Field>
                              <Field label={ta("کد ملی بیمار")}>
                                <bdi dir="ltr">{p.nationalCode || "—"}</bdi>
                              </Field>
                            </>
                          )}
                          {files.length > 0 && (
                            <Field label={ta("تصویر نسخه")}>
                              {files.map((id, i) => (
                                <a
                                  key={id}
                                  href={`/api/v1/notpublic/${id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {ta("فایل ${1}", [String(i + 1)])}{" "}
                                </a>
                              ))}
                            </Field>
                          )}
                          {!!p?.note && <Field label={ta("توضیح خریدار")}>{p.note}</Field>}
                          {!!p?.reviewedAt && (
                            <Field label={ta("زمان بررسی")}>{fmtDate(p.reviewedAt)}</Field>
                          )}
                          {p?.status === "rejected" && !!p.reason && (
                            <Field label={ta("دلیل رد")}>{p.reason}</Field>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {shipments.length > 0 && (
              <Card title={ta("ارسال")}>
                <div className={classes.shipments}>
                  {shipments.map((s) => {
                    const pharmacyId = s.pharmacy?._id || "";
                    return (
                      <div key={pharmacyId || s._id} className={classes.shipment}>
                        <div className={classes.shipmentHead}>
                          {s.pharmacy ? (
                            <InlineLink href={adminPath(`/pharmacy/${s.pharmacy._id}`)}>
                              {s.pharmacy.name || "—"}
                            </InlineLink>
                          ) : (
                            "—"
                          )}
                          <span className={classes.muted}>
                            {s.method
                              ? shipmentMethodDict[s.method] || s.method
                              : ta("بدون برنامه‌ی ارسال")}
                          </span>
                        </div>
                        <div className={classes.grid}>
                          <Field label={ta("هزینه‌ی ارسال (تومان)")}>
                            {s.payOnDelivery ? ta("پس‌کرایه") : currencize(s.fee || 0)}
                          </Field>
                          <Field label={ta("مسیر")}>
                            {[s.originCity, s.destinationCity].filter(Boolean).join(" ← ") || "—"}
                          </Field>
                          <Field label={ta("پیک اسنپ")}>
                            {s.ride ? snappStateLabel(s.ride.stateName, s.ride.state) : ta("درخواست نشده")}
                          </Field>
                          {s.ride && (
                            <>
                              <Field label={ta("شناسه‌ی سفر")}>{s.ride.hri}</Field>
                              <Field label={ta("پیک")}>
                                {[s.ride.driverName, s.ride.driverCellphone].filter(Boolean).join(" · ") || "—"}
                              </Field>
                              <Field label={ta("هزینه‌ی نهایی اسنپ (تومان)")}>
                                {s.ride.finalPrice === null ? "—" : currencize(s.ride.finalPrice)}
                              </Field>
                              <Field label={ta("آخرین به‌روزرسانی")}>
                                {fmtDate(s.ride.lastRefreshedAt || s.ride.requestedAt)}
                              </Field>
                            </>
                          )}
                        </div>
                        {pharmacyId && (
                          <div className={classes.shipmentActions}>
                            {s.ride ? (
                              <>
                                {canAct && (
                                  <Button
                                    size="S"
                                    variant="Neutral"
                                    isLoading={busyShipment === pharmacyId}
                                    onClick={() => delivery(pharmacyId, true)}
                                  >
                                    {ta("به‌روزرسانی وضعیت پیک")}
                                  </Button>
                                )}
                                {s.ride.shareUrl && (
                                  <a
                                    className={classes.link}
                                    href={s.ride.shareUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {ta("پیگیری زنده")}
                                  </a>
                                )}
                              </>
                            ) : (
                              paid && canAct && (
                                <Button
                                  size="S"
                                  isLoading={busyShipment === pharmacyId}
                                  onClick={() => delivery(pharmacyId, false)}
                                >
                                  {ta("درخواست پیک اسنپ")}
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card title={ta("پرداخت‌ها و بازپرداخت‌ها")}>
              {payments.length > 0 && (
                <Table
                  name="AdminFinanceOrderPayments"
                  data={payments}
                  renderer={{
                    amount: {
                      name: ta("پرداخت درگاه (تومان)"),
                      value: (p) => p.amount,
                      component: (p) => currencize(p.amount || 0),
                    },
                    status: {
                      name: ta("وضعیت"),
                      value: (p) => paymentStatusDict[p.status] || p.status,
                    },
                    rrn: { name: ta("کد پیگیری"), value: (p) => p.rrn || "—" },
                    maskedPan: { name: ta("کارت"), value: (p) => p.maskedPan || "—" },
                    failureReason: {
                      name: ta("علت"),
                      value: (p) => failureReasonLabel(p.failureReason),
                    },
                    createdAt: {
                      name: ta("تاریخ"),
                      value: (p) => (p.createdAt ? new Date(p.createdAt) : undefined),
                    },
                  }}
                />
              )}
              <Table
                name="AdminFinanceOrderLedger"
                data={ledger}
                renderer={{
                  kind: {
                    name: ta("نوع"),
                    value: (t) => orderLedgerKindDict[t.kind] || t.kind,
                  },
                  user: {
                    name: ta("حساب"),
                    value: (t) => userLabel(t.user),
                    component: (t) =>
                      t.user ? (
                        <InlineLink href={adminPath(`/user/${t.user._id}`)}>
                          {userLabel(t.user)}
                        </InlineLink>
                      ) : (
                        "—"
                      ),
                  },
                  amount: {
                    name: ta("مبلغ (تومان)"),
                    value: (t) => t.amount,
                    component: (t) =>
                      `${t.amount > 0 ? "+" : t.amount < 0 ? "−" : ""}${currencize(Math.abs(t.amount || 0))}`,
                  },
                  line: {
                    name: ta("قلم"),
                    value: (t) =>
                      t.line === "delivery"
                        ? ta("ارسال")
                        : t.line === "sampling"
                          ? ta("نمونه‌گیری")
                          : t.line || "—",
                  },
                  commission: {
                    name: ta("کمیسیون (تومان)"),
                    value: (t) => t.commission || 0,
                    component: (t) => (t.commission ? currencize(t.commission) : "—"),
                  },
                  createdAt: {
                    name: ta("تاریخ"),
                    value: (t) => (t.createdAt ? new Date(t.createdAt) : undefined),
                  },
                }}
              />
            </Card>

            {notes.length > 0 && (
              <Card title={ta("اقدامات پشتیبانی")}>
                <ul className={classes.notes}>
                  {notes.map((n, i) => (
                    <li key={`${n.at}-${i}`}>
                      <strong>{adminNoteActionDict[n.action] || n.action}</strong>
                      {n.line && lineName(n.line) ? ` · ${lineName(n.line)}` : ""}
                      <span className={classes.muted}>
                        {" "}
                        {[n.by, fmtDate(n.at)].filter(Boolean).join(" · ")}
                      </span>
                      <p>{n.reason}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinanceOrderPage;
