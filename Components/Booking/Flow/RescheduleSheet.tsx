"use client";
import { useMemo, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import BottomSheet from "@/Components/UI/BottomSheet";
import Button from "@/Components/UI/Button";
import SlotPicker, { SlotPick } from "./SlotPicker";
import { clock } from "./bookingFlow";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

// Move a pending visit to another free time of the same visit type
// (POST /user/reservation/:id/reschedule), Doctolib's "move appointment":
// the same picker as booking, the price paid is kept.
const RescheduleSheet = ({
  open,
  onClose,
  reservationId,
  doctorId,
  sessionType,
  office,
  hoursText,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  doctorId: string;
  sessionType: DoctorSessionType;
  // an in-person visit moves within its office (the API keeps it too)
  office?: string | null;
  hoursText: string;
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const notify = useNotification();
  const [pick, setPick] = useState<SlotPick | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!pick || busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/user/reservation/${reservationId}/reschedule`,
        method: "POST",
        payload: { date: pick.ymd, start: pick.start, end: pick.end },
      });
      notify(getContent("bfRescheduled"), "Success");
      setPick(null);
      onClose();
      await onDone();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={getContent("bfReschedule")}
      subtitle={getContent("bfRescheduleHint", [hoursText])}
      closeLabel={getContent("bfClose")}
      footer={
        <Button
          size="L"
          radius="High"
          style={{ width: "100%" }}
          variant={pick ? "Primary" : "Disable"}
          isLoading={busy}
          onClick={save}
        >
          {pick ? getContent("bfMoveTo", [clock(pick.start, nf)]) : getContent("bfPickATime")}
        </Button>
      }
    >
      {open && (
        <SlotPicker
          doctorId={doctorId}
          sessionType={sessionType}
          office={sessionType === "inPerson" ? office : null}
          value={pick}
          onChange={setPick}
        />
      )}
    </BottomSheet>
  );
};

export default RescheduleSheet;
