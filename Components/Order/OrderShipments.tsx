"use client";

import { useRef, useState } from "react";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { currencize } from "../helpers/currencize";
import useScopedLocale from "../Hooks/useScopedLocale";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import Badge, { BadgeColor } from "../UI/Badge";
import Button from "../UI/Button";
import PopupCard from "../UI/PopupCard";
import AreaInput from "../UI/AreaInput";
import { dateToString } from "../UI/FormatDate";
import Link from "../i18n/Link";
import { useIntlLocale } from "../i18n/navigation";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import { IOrderShipment, ShipmentState, shipmentStateOf } from "./orderShipment";
import { t2xsRegular, tsmRegular } from "../UI/Typography";
import classes from "./OrderShipments.module.css";

const NS: ContentNamespace[] = ["common", "orderConfirmation"];

const stateKey: Record<ShipmentState, ContentKey> = {
  notSent: "shipStateNotSent",
  inTransit: "shipStateInTransit",
  delivered: "shipStateDelivered",
  returned: "shipStateReturned",
  unsentCancelled: "shipStateNotSentCancelled",
};

const stateColor: Record<ShipmentState, BadgeColor> = {
  notSent: "Disabled",
  inTransit: "Info",
  delivered: "Success",
  returned: "Error",
  unsentCancelled: "Error",
};

// «مرسوله نرسیده»: an optional note, then a support ticket opens and the
// auto-confirm stops (backend Services/shipmentDeliveryService.ts)
const ProblemPopup = ({ onSubmit }: { onSubmit: (note: string) => Promise<unknown> }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <PopupCard title={getContent("shipProblem")}>
      <div className={classes.popupBody}>
        <p className={t2xsRegular}>{getContent("shipProblemHint")}</p>
        <AreaInput title={getContent("shipProblemNote")} onChange={(e) => setNote(e.target.value)} />
        <div className={classes.popupActions}>
          <Button
            variant="Error"
            isLoading={busy}
            onClick={async () => {
              if (busy) return;
              setBusy(true);
              try {
                await onSubmit(note.trim());
                closePopup();
              } catch {
                // shown by the caller
              } finally {
                setBusy(false);
              }
            }}
          >
            {getContent("shipProblemSubmit")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// The order's parcels, one per pharmacy (2026-10): how each ships, its
// tracking link, and - for a Tipax parcel on its way - «تحویل گرفتم» and
// «مرسوله نرسیده». The pharmacy is paid, and asked to be rated, only once
// the parcel is confirmed delivered.
const OrderShipments = ({
  orderId,
  shipments,
  canAct,
  onChange,
  closedPharmacies,
}: {
  orderId: string;
  shipments: unknown;
  canAct: boolean;
  onChange: () => unknown;
  // pharmacies whose every line here was cancelled: the parcel won't ship
  closedPharmacies?: string[];
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const { setPopup, closePopup } = usePopup();
  const notify = useNotification();
  const [busy, setBusy] = useState("");
  const busyRef = useRef(false);
  const list = (Array.isArray(shipments) ? shipments : []).filter(
    (el): el is IOrderShipment => !!el && typeof el === "object" && !!(el as IOrderShipment)._id,
  );
  if (!list.length) return null;

  const fmt = (value?: string) => (value ? dateToString({ value: new Date(value), time: false, intlTag }) : "—");

  const received = async (s: IOrderShipment) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(s._id);
    try {
      await fetcher({ url: `${API}/user/order/${orderId}/shipment/${s._id}/received`, method: "POST" });
      closePopup("ShipmentReceived");
      notify(getContent("shipReceivedDone"), "Success");
      await onChange();
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const problem = (s: IOrderShipment) =>
    setPopup(
      "ShipmentProblem",
      <ProblemPopup
        onSubmit={async (note) => {
          try {
            await fetcher({
              url: `${API}/user/order/${orderId}/shipment/${s._id}/problem`,
              method: "POST",
              bodyParser: "JSON",
              payload: note ? { note } : {},
            });
            notify(getContent("shipProblemDone"), "Success");
            await onChange();
          } catch (err) {
            notify((err as Error)?.message || "", "Error");
            throw err;
          }
        }}
      />,
    );

  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${tsmRegular}`}>{getContent("shippingMethod")}</span>
      {list.map((s) => {
        const pharmacyId = s.pharmacy && typeof s.pharmacy === "object" ? s.pharmacy._id : s.pharmacy || "";
        // every line of this parcel was cancelled before it was sent: it is
        // closed, not "being prepared"
        const closed = !s.shippedAt && !!pharmacyId && (closedPharmacies || []).includes(String(pharmacyId));
        const state = shipmentStateOf(s);
        const tipax = s.method === "tipax";
        // a courier link pasted as the "code" is shown as the link only
        const codeIsLink = /^https?:\/\//i.test(String(s.trackingCode || ""));
        const pharmacyName = s.pharmacy && typeof s.pharmacy === "object" ? s.pharmacy.name : "";
        const reported = !!s.problem?.reportedAt;
        return (
          <div key={s._id} className={classes.shipment}>
            <div className={classes.head}>
              <span className={t2xsRegular}>
                {[
                  getContent(tipax ? "shippingTipax" : "shippingTapsi"),
                  pharmacyName,
                  // what the buyer paid, as at checkout (a «پرو» member's
                  // discounted or free courier)
                  s.payOnDelivery
                    ? getContent("shippingTipaxNote")
                    : s.fee > 0 && Math.max(0, Number(s.proDiscount) || 0) >= s.fee
                      ? getContent("proDeliveryFree")
                      : s.fee > 0
                        ? `${currencize(s.fee - Math.max(0, Number(s.proDiscount) || 0))} ${getContent("toman")}`
                        : getContent("shippingFree"),
                ]
                  .filter(Boolean)
                  // each part isolated: a Persian pharmacy name inside an
                  // English line no longer reorders the amount around it
                  .map((part, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <bdi>{part}</bdi>
                    </span>
                  ))}
              </span>
              {closed ? (
                <Badge color="Error" mode="Outline">
                  {getContent("shipLinesCancelled")}
                </Badge>
              ) : /* a Tapsi parcel has no delivery step: only "sent" */ (tipax || state !== "notSent") && (
                <Badge color={tipax ? stateColor[state] : "Info"} mode="Outline">
                  {getContent(tipax ? stateKey[state] : "shipSent")}
                </Badge>
              )}
            </div>
            {!!s.trackingCode && (
              <div className={`${classes.tracking} ${t2xsRegular}`}>
                {!codeIsLink && (
                  <>
                    <span>{getContent("shipTrackingCode")}:</span>
                    <span className={classes.code} dir="ltr">
                      {s.trackingCode}
                    </span>
                  </>
                )}
                {!!s.trackingLink && (
                  <a href={s.trackingLink} target="_blank" rel="noreferrer" className={classes.link}>
                    {getContent("shipTrack")}
                  </a>
                )}
              </div>
            )}
            {tipax && state === "delivered" && (
              <span className={`${classes.muted} ${t2xsRegular}`}>
                {getContent("shipDeliveredOn", [fmt(s.deliveredAt)])}
              </span>
            )}
            {tipax && state === "inTransit" && (
              <>
                {reported ? (
                  <span className={`${classes.warn} ${t2xsRegular}`}>
                    {getContent("shipProblemReported")}{" "}
                    {!!s.problem?.ticket && (
                      <Link href={`/dashboard/support/${s.problem.ticket}`} className={classes.link}>
                        {getContent("shipViewTicket")}
                      </Link>
                    )}
                  </span>
                ) : (
                  !!s.confirmBy && (
                    <span className={`${classes.muted} ${t2xsRegular}`}>
                      {getContent("shipAutoConfirmOn", [fmt(s.confirmBy)])}
                    </span>
                  )
                )}
                {canAct && (
                  <div className={classes.actions}>
                    <Button
                      size="S"
                      isLoading={busy === s._id}
                      onClick={() =>
                        setPopup(
                          "ShipmentReceived",
                          <ConfirmationPopup
                            message={getContent("shipReceivedConfirm")}
                            onConfirm={() => received(s)}
                          />,
                        )
                      }
                    >
                      {getContent("shipReceived")}
                    </Button>
                    {!reported && (
                      <Button size="S" variant="Error" mode="Outline" onClick={() => problem(s)}>
                        {getContent("shipProblem")}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderShipments;
