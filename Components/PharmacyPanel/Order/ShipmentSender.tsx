"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useAcl from "@/Components/Hooks/useAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import FormatDate from "@/Components/UI/FormatDate";
import classes from "./ShipmentSender.module.css";

const NS: ContentNamespace[] = ["common", "pharmacyPanelOrder"];

// The pharmacy marks its part of the order sent (2026-10) with the Tipax
// waybill number or the courier's ride code / link; the buyer is told and
// sees it on their order page.
const ShipmentSender = ({
  orderId,
  shipment,
  onDone,
}: {
  orderId: string;
  shipment: { trackingCode?: string; shippedAt?: string };
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const canAct = useAcl("pharmacy")("mutateOrders");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  if (shipment.shippedAt)
    return (
      <div className={classes.sent}>
        <strong>{getContent("shipSent")}</strong>
        <FormatDate value={new Date(shipment.shippedAt)} />
        {!!shipment.trackingCode && (
          <span className={classes.code} dir="ltr">
            {shipment.trackingCode}
          </span>
        )}
      </div>
    );
  if (!canAct) return null;

  const submit = async () => {
    if (code.trim().length < 3) return pushNotification(getContent("shipTrackingCode"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/pharmacy/order/${orderId}/shipment`,
        method: "POST",
        bodyParser: "JSON",
        payload: { trackingCode: code.trim() },
      });
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.main}>
      <p className={classes.hint}>{getContent("shipTrackingHint")}</p>
      <div className={classes.row}>
        <Input title={getContent("shipTrackingCode")} onChange={(e) => setCode(e.target.value)} />
        <Button onClick={submit} isLoading={busy}>
          {getContent("shipMark")}
        </Button>
      </div>
    </div>
  );
};

export default ShipmentSender;
