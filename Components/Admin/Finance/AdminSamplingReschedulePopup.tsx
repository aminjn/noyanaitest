"use client";

import { useState } from "react";
import { currencize } from "@/Components/helpers/currencize";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import SamplingSlotPicker from "@/Components/LabSampling/SamplingSlotPicker";
import { LabSamplingKind, SamplingMoveInfo } from "@/Components/LabSampling/samplingTypes";
import { ta } from "@/Components/Admin/i18n/adminText";
import { samplingKindDict, samplingWhenLabel } from "./adminFinance";
import classes from "./AdminFinanceOrderPage.module.css";

export interface IAdminSampling {
  _id: string;
  paraClinic: { _id: string; name: string } | null;
  kind: LabSamplingKind;
  ymd: string;
  start: number;
  end: number;
  startsAt?: string;
  status: string;
  confirmedAt?: string | null;
  collectedAt?: string | null;
  cancelledAt?: string | null;
  remindedAt?: string | null;
  fee: number;
  feeSettled?: string | null;
  address: {
    _id: string;
    displayName: string;
    address: string;
    receiverPhone: string;
    city: string;
    district: string;
  } | null;
  tests: { _id: string; name: string; status: string }[];
  moves: {
    _id: string;
    at?: string;
    by: string;
    byUser: string;
    from: { kind: string; ymd: string; start: number; end: number; fee: number } | null;
    to: { kind: string; ymd: string; start: number; end: number; fee: number } | null;
    feeDelta: number;
    reason: string;
  }[];
  move: SamplingMoveInfo | null;
  orderStatus?: string;
}

export type AdminBuyerAddress = {
  _id: string;
  displayName: string;
  address: string;
  city: { _id: string; name: string } | null;
};

// Support moves a sampling appointment for the buyer (backend
// Lib/labSamplingReschedule.ts, actor "admin"): any free slot of the lab
// (the lab's notice and the move count do not bind support), in-lab <->
// home when the tests allow it (the fee difference on the buyer's wallet),
// with a written reason. The buyer and the lab are both told.
const AdminSamplingReschedulePopup = ({
  sampling,
  addresses,
  onSubmit,
}: {
  sampling: IAdminSampling;
  addresses: AdminBuyerAddress[];
  onSubmit: (payload: Record<string, unknown>) => Promise<unknown>;
}) => {
  const { closePopup } = usePopup();
  const info = sampling.move;
  const [kind, setKind] = useState<LabSamplingKind>(sampling.kind);
  const [slot, setSlot] = useState<{ ymd: string; start: number } | null>(null);
  const [address, setAddress] = useState<string | undefined>(sampling.address?._id);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const lab = sampling.paraClinic?._id || "";
  const kinds: LabSamplingKind[] =
    info?.canSwitchKind && (info.home || sampling.kind === "home") ? ["lab", "home"] : [sampling.kind];
  const served = (Array.isArray(addresses) ? addresses : []).filter(
    (a) => !!a.city && (info?.homeCities || []).includes(a.city._id),
  );
  const feeNote =
    kind === sampling.kind
      ? ""
      : kind === "home"
        ? (info?.homeFee || 0) > 0
          ? ta("${1} تومان هزینه‌ی نمونه‌گیری در منزل از کیف پول خریدار کم می‌شود (اگر موجودی کافی نباشد، انجام نمی‌شود).", [currencize(info?.homeFee || 0)])
          : ""
        : sampling.fee > 0
          ? ta("${1} تومان هزینه‌ی نمونه‌گیری در منزل به کیف پول خریدار برمی‌گردد.", [currencize(sampling.fee)])
          : "";
  const ready = !!slot && reason.trim().length >= 3 && (kind !== "home" || !!address);

  return (
    <PopupCard title={ta("جابه‌جایی نوبت نمونه‌گیری")}>
      <div className={classes.popupBody}>
        <p className={classes.hint}>
          {ta("زمان فعلی: ${1} · ${2}", [samplingWhenLabel(sampling), samplingKindDict[sampling.kind] || sampling.kind])}
        </p>
        <p className={classes.hint}>
          {ta("پشتیبانی محدود به حداقل فاصله‌ی آزمایشگاه و سقف دفعات جابه‌جایی نیست؛ ظرفیت و ساعت‌های آزمایشگاه رعایت می‌شود. به خریدار و آزمایشگاه اعلان و پیامک می‌رود و خریدار می‌تواند نوبت را با بازپرداخت کامل لغو کند.")}
        </p>
        {kinds.length > 1 && (
          <div className={classes.shipmentActions}>
            {kinds.map((k) => (
              <Button
                key={k}
                size="S"
                variant={kind === k ? "Primary" : "Neutral"}
                mode={kind === k ? "Fill" : "Outline"}
                onClick={() => {
                  if (k === kind) return;
                  setKind(k);
                  setSlot(null);
                  if (k === "home" && !address) setAddress(served[0]?._id);
                }}
              >
                {samplingKindDict[k] || k}
              </Button>
            ))}
          </div>
        )}
        {kind === "home" && (
          <div className={classes.field}>
            <span className={classes.label}>{ta("نشانی نمونه‌گیری")}</span>
            {!served.length && <span className={classes.muted}>{ta("هیچ‌کدام از نشانی‌های خریدار در محدوده‌ی نمونه‌گیری در منزل این آزمایشگاه نیست.")}</span>}
            <div className={classes.shipmentActions}>
              {served.map((a) => (
                <Button
                  key={a._id}
                  size="S"
                  variant={address === a._id ? "Primary" : "Neutral"}
                  mode={address === a._id ? "Fill" : "Outline"}
                  onClick={() => setAddress(a._id)}
                >
                  {[a.displayName, a.city?.name].filter(Boolean).join(" · ") || a.address}
                </Button>
              ))}
            </div>
          </div>
        )}
        {!!lab && (
          <SamplingSlotPicker key={kind} paraClinic={lab} kind={kind} value={slot} onChange={setSlot} />
        )}
        {!!feeNote && <p className={classes.hint}>{feeNote}</p>}
        <AreaInput
          title={ta("دلیل (الزامی، روی سفارش و در لاگ ثبت می‌شود)")}
          required
          onChange={(e) => setReason(e.target.value)}
        />
        <div className={classes.popupActions}>
          <Button
            variant={ready ? "Primary" : "Disable"}
            isLoading={busy}
            onClick={async () => {
              if (!ready || busy || !slot) return;
              setBusy(true);
              try {
                await onSubmit({
                  kind,
                  ymd: slot.ymd,
                  start: slot.start,
                  ...(kind === "home" && address ? { address } : {}),
                  reason: reason.trim(),
                });
                closePopup();
              } catch {
                // the caller showed the error
              } finally {
                setBusy(false);
              }
            }}
          >
            {ta("جابه‌جایی نوبت")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default AdminSamplingReschedulePopup;
