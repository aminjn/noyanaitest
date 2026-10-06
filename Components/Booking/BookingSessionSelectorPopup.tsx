"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import PopupCard from "../UI/PopupCard";
import BottomSheet from "../UI/BottomSheet";
import Button from "../UI/Button";
import ClockIcon from "../Icons/ClockIcon";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { DoctorSessionType } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import { DoctorConfig } from "../Dr/PublicDrSessions";
import SlotPicker, { SlotPick } from "./Flow/SlotPicker";
import { VisitTypePicker } from "./Flow/BookingChoices";
import { clock, finalizeHref, visitTypeOrder } from "./Flow/bookingFlow";
import { tehranYmd } from "@/Components/helpers/tehranTime";
import classes from "./BookingSessionSelectorPopup.module.css";

const NS: ContentNamespace[] = ["common", "bookingSessionSelectorPopup", "bookingFlow"];

// Quick booking from a doctor card (the search list, the old profile
// widget): visit type and a time with the shared picker, then the
// details step. As a bottom sheet when opened with `open` (phone-first),
// else inside the site popup.
const BookingSessionSelectorPopup = ({
  node,
  initialDate,
  open,
  onClose,
}: {
  node: IDoctorProfile;
  initialDate?: Date;
  standalone?: boolean;
  open?: boolean;
  onClose?: () => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { closePopup } = usePopup();
  const push = useProgress();
  const { data: config } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${node._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const types = useMemo(
    () => (config ? visitTypeOrder.filter((t) => config[t]?.active && !!config[t]?.price) : []),
    [config],
  );
  const [type, setType] = useState<DoctorSessionType | null>(null);
  useEffect(() => {
    if (!type && types.length) setType(types[0]);
  }, [type, types]);
  const [pick, setPick] = useState<SlotPick | null>(null);
  useEffect(() => setPick(null), [type]);

  const close = () => (onClose ? onClose() : closePopup());
  const go = () => {
    if (!pick) return;
    close();
    push(finalizeHref(node._id, { ...pick, sessionType: type }));
  };

  const body = (
    <div className={classes.main}>
      {types.length > 1 && <VisitTypePicker settings={config} value={type} onChange={setType} />}
      <SlotPicker
        doctorId={node._id}
        sessionType={type}
        value={pick}
        onChange={setPick}
        initialDay={initialDate ? tehranYmd(initialDate) : undefined}
      />
    </div>
  );
  const actions = (
    <div className={classes.actions}>
      <Button
        variant="Primary"
        mode="Outline"
        size="M"
        radius="High"
        href={`/dr/${node.slug || node._id}`}
        onClick={() => close()}
      >
        {getContent("seeDoctorProfile")}
      </Button>
      <Button variant={pick ? "Primary" : "Disable"} size="M" radius="High" onClick={go}>
        {pick ? `${getContent("bfContinue")} · ${clock(pick.start, nf)}` : getContent("bfPickATime")}
      </Button>
    </div>
  );

  if (open !== undefined)
    return (
      <BottomSheet
        open={open}
        onClose={close}
        title={getDoctorProfileLabel(node)}
        subtitle={getContent("bfStepOf", [nf.format(1), nf.format(3)])}
        closeLabel={getContent("bfClose")}
        footer={actions}
      >
        {open && body}
      </BottomSheet>
    );
  return (
    <PopupCard title={getContent("selectSessionTime")} icon={<ClockIcon />} className={classes.popup}>
      {body}
      {actions}
    </PopupCard>
  );
};

export default BookingSessionSelectorPopup;
