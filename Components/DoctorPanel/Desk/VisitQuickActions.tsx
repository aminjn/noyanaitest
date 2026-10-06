"use client";

import { useState } from "react";
import classes from "./VisitQuickActions.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

// same window the API enforces: check-in from an hour before the start
export const CHECK_IN_EARLY_MINUTES = 60;

export type QuickVisit = {
  _id: string;
  sessionType?: string;
  status?: string;
  date: string | Date;
  start: number;
  patientPresentAt?: string | Date;
};

const startsAt = (v: QuickVisit) => new Date(v.date).getTime() + v.start * 60000;

// what the front desk can do with an in-person visit right now
export const visitActions = (v: QuickVisit, now = Date.now()) => {
  const open = v.sessionType === "inPerson" && ["pending", "active"].includes(v.status || "") && !v.patientPresentAt;
  return {
    checkIn: open && now >= startsAt(v) - CHECK_IN_EARLY_MINUTES * 60000,
    noShow: open && now >= startsAt(v),
    arrived: v.sessionType === "inPerson" && !!v.patientPresentAt && ["pending", "active"].includes(v.status || ""),
  };
};

const NoShowConfirm = ({ name, onConfirm }: { name: string; onConfirm: () => Promise<unknown> }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const [busy, setBusy] = useState(false);
  return (
    <PopupCard title={getContent("vqNoShowTitle")}>
      <div className={classes.confirm}>
        <p>{getContent("vqNoShowConfirm", [name])}</p>
        <div className={classes.confirmActions}>
          <Button variant="Neutral" mode="Outline" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
          <Button
            variant="Error"
            isLoading={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
              closePopup();
            }}
          >
            {getContent("vqNoShow")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// Doctolib-style arrival buttons on a visit row: "arrived" (check-in) and
// "didn't come" (no-show, asks first: the patient is told and it counts in
// their history). Renders nothing when neither applies.
const VisitQuickActions = ({
  visit,
  name,
  onDone,
  size = "S",
}: {
  visit: QuickVisit;
  name: string;
  onDone: () => unknown;
  size?: "S" | "M";
}) => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useDoctorAcl();
  const pushNotification = useNotification();
  const { setPopup } = usePopup();
  const [busy, setBusy] = useState<"" | "in">("");
  const can = visitActions(visit);
  if (!hasAccess("mutateCalendar")) return can.arrived ? <ArrivedPill /> : null;

  const call = async (path: "check-in" | "no-show", ok: string) => {
    try {
      await fetcher({ url: `${API}/doctor/reservation/${visit._id}/${path}`, method: "PATCH" });
      pushNotification(ok, "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    }
  };

  if (can.arrived) return <ArrivedPill />;
  if (!can.checkIn && !can.noShow) return null;
  return (
    <span className={classes.main} onClick={(e) => e.stopPropagation()}>
      {can.checkIn && (
        <Button
          size={size}
          variant="Success"
          mode="Outline"
          isLoading={busy === "in"}
          leadIcon={<CheckCircleIcon />}
          onClick={async (e) => {
            e?.preventDefault?.();
            setBusy("in");
            await call("check-in", getContent("vqArrivedToast", [name]));
            setBusy("");
          }}
        >
          {getContent("vqArrived")}
        </Button>
      )}
      {can.noShow && (
        <Button
          size={size}
          variant="Neutral"
          mode="Outline"
          leadIcon={<XMarkIcon />}
          onClick={(e) => {
            e?.preventDefault?.();
            setPopup(
              "VisitNoShow",
              <NoShowConfirm name={name} onConfirm={() => call("no-show", getContent("vqNoShowToast"))} />,
            );
          }}
        >
          {getContent("vqNoShow")}
        </Button>
      )}
    </span>
  );
};

const ArrivedPill = () => {
  const getContent = useScopedLocale(NS);
  return (
    <span className={classes.arrived}>
      <Ixon width="0.875rem">
        <CheckCircleIcon />
      </Ixon>
      {getContent("vqInClinic")}
    </span>
  );
};

export default VisitQuickActions;
