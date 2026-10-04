"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  IOrderLinePrescription,
  RxPrescriptionDetails,
} from "@/Components/Order/RxPrescription";
import classes from "./RxReviewPopup.module.css";

const NS: ContentNamespace[] = ["common", "pharmacyPanelOrder"];

// The pharmacy decides a prescription-only line's prescription (2026-10,
// POST /pharmacy/order/:nodeId/prescription): approve, then prepare and
// fulfill it as usual; or reject with a reason - the line is cancelled and
// the buyer refunded at once. One-way: a decided prescription stays decided.
const RxReviewPopup = ({
  orderId,
  model,
  itemId,
  name,
  prescription,
  decision,
  onDone,
}: {
  orderId: string;
  model: "products" | "productPackages";
  itemId: string;
  name: string;
  prescription?: IOrderLinePrescription;
  decision: "approve" | "reject";
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const reject = decision === "reject";

  const submit = async () => {
    if (busy) return;
    if (reject && reason.trim().length < 3)
      return pushNotification(t("rxRejectReasonRequired"), "Warn");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/pharmacy/order/${orderId}/prescription`,
        method: "POST",
        payload: { model, itemId, decision, ...(reject ? { reason: reason.trim() } : {}) },
      });
      pushNotification(t(reject ? "rxRejectedDone" : "rxApprovedDone"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={t(reject ? "rxReject" : "rxApprove")}>
      <div className={classes.form}>
        <strong className={classes.name}>{name}</strong>
        <RxPrescriptionDetails prescription={prescription} />
        <p className={classes.hint}>{t(reject ? "rxRejectHint" : "rxApproveHint")}</p>
        {reject && (
          <AreaInput
            title={t("rxRejectReason")}
            onChange={(e) => setReason(e.target.value.slice(0, 1000))}
          />
        )}
        <div className={classes.actions}>
          <Button variant={reject ? "Error" : "Primary"} onClick={submit} isLoading={busy}>
            {t(reject ? "rxReject" : "rxApprove")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default RxReviewPopup;
