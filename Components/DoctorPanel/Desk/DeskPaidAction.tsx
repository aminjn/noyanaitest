"use client";
import { useMemo, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import ToggleInput from "@/Components/UI/ToggleInput";
import WalletIcon from "@/Components/Icons/WalletIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./VisitQuickActions.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelBooking"];

export type DeskPaidVisit = {
  _id: string;
  status?: string;
  payAtDesk?: boolean;
  deskFee?: number;
  deskPaidAt?: string | Date | null;
  insuranceQuote?: { insurerShare?: number; lines?: { share?: number; holder?: string; centreName?: string }[] } | null;
};

// the visit paid at the desk whose payment is not recorded yet
export const deskPaidPending = (v?: DeskPaidVisit | null) =>
  !!v?.payAtDesk && !v.deskPaidAt && !["cancelled", "noShow", "error"].includes(v.status || "");

const Confirm = ({ visit, money, onDone }: { visit: DeskPaidVisit; money: (n: number) => string; onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const notify = useNotification();
  const share = Math.max(0, Number(visit.insuranceQuote?.insurerShare) || 0);
  const centre = (visit.insuranceQuote?.lines || []).find((l) => l?.holder === "centre" && l.centreName)?.centreName;
  const [insurer, setInsurer] = useState(share > 0);
  const [busy, setBusy] = useState(false);
  return (
    <PopupCard title={getContent("dpConfirmTitle")}>
      <div className={classes.confirm}>
        <p>{getContent("dpConfirmText", [money(visit.deskFee || 0)])}</p>
        {share > 0 && (
          <>
            <ToggleInput title={getContent("dpBookInsurer", [money(share)])} value={insurer} onChange={() => setInsurer((v) => !v)} />
            <p>{centre ? getContent("dpBookInsurerCentre", [centre]) : getContent("dpBookInsurerHint")}</p>
          </>
        )}
        <div className={classes.confirmActions}>
          <Button variant="Neutral" mode="Outline" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
          <Button
            variant="Success"
            isLoading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await fetcher({
                  url: `${API}/doctor/reservation/${visit._id}/desk-paid`,
                  method: "PATCH",
                  bodyParser: "JSON",
                  payload: { insurer },
                });
                notify(getContent("dpDone"), "Success");
                closePopup();
                onDone();
              } catch (err) {
                notify((err as Error)?.message || "", "Error");
              } finally {
                setBusy(false);
              }
            }}
          >
            {getContent("dpConfirm")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// «پرداخت دریافت شد» (2026-10): the doctor (or their desk) records that the
// patient of a visit paid at the desk paid their part; optionally the
// insurers' estimated shares then go to «مطالبات از بیمه‌ها» of whoever
// holds the contract (backend Lib/business/reservationInsurance.ts).
const DeskPaidAction = ({ visit, onDone }: { visit: DeskPaidVisit; onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const money = (n: number) => getContent("xToman", [nf.format(Math.max(0, Math.round(n)))]);
  const hasAccess = useDoctorAcl();
  const { setPopup } = usePopup();
  if (!deskPaidPending(visit) || !hasAccess("mutateCalendar")) return null;
  return (
    <Button
      variant="Success"
      mode="Outline"
      leadIcon={<WalletIcon />}
      onClick={() => setPopup("DeskPaid", <Confirm visit={visit} money={money} onDone={onDone} />)}
    >
      {getContent("dpConfirm")}
    </Button>
  );
};

export default DeskPaidAction;
