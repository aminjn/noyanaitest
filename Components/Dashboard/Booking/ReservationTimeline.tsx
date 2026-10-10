import { Fragment, ReactNode } from "react";
import classes from "./ReservationTimeline.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Ixon from "@/Components/UI/Ixon";
import FormatDate from "@/Components/UI/FormatDate";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import ErrorIcon from "@/Components/Icons/ErrorIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import {
  patientReservationStatus,
  ReservationParty,
  ReservationStatus,
  reservationStatusContentKeyDict,
} from "./reservationStatus";
import { ContentKey } from "@/Components/Enums/contentKeys";

const NS: ContentNamespace[] = ["common", "dashboardReservationTimeline"];

export type ReservationLifecycleData = {
  status: ReservationStatus;
  createdAt: Date;
  activatedAt?: Date;
  reminderSentAt?: Date;
  patientPresentAt?: Date;
  doctorPresentAt?: Date;
  noShowParty?: ReservationParty;
  finalizedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  // read by the patient's wording (patientReservationStatus)
  sessionType?: string;
  cancelledBy?: ReservationParty | "admin";
  dispute?: { at?: unknown } | null;
};

type StepState = "done" | "pending" | "error" | "skipped";

type Step = {
  key: string;
  state: StepState;
  label: string;
  date?: Date;
  caption?: string;
};

const stepIcon: Record<StepState, ReactNode> = {
  done: <CheckCircleIcon />,
  pending: <ClockIcon />,
  error: <ErrorIcon />,
  skipped: <XMarkIcon />,
};

// glass tile tone per step state (globals.css .tone-*)
const stepTone: Record<StepState, string> = {
  done: "tone-teal",
  pending: "tone-muted",
  error: "tone-rose",
  skipped: "tone-muted",
};

// `patient`: the outcome step in the patient's wording (Confirmed /
// Cancelled by ... / No-show), as the status badge on the same page
const ReservationTimeline = ({ data, patient = false }: { data: ReservationLifecycleData; patient?: boolean }) => {
  const getContent = useScopedLocale(NS);

  const isCancelled = data.status === "cancelled";

  const steps: Step[] = [
    {
      key: "submitted",
      state: "done",
      label: getContent("submittedAt"),
      date: data.createdAt,
    },
  ];

  if (data.reminderSentAt)
    steps.push({
      key: "reminder",
      state: "done",
      label: getContent("reminderSent"),
      date: data.reminderSentAt,
    });

  steps.push({
    key: "activation",
    state: isCancelled ? "skipped" : data.activatedAt ? "done" : "pending",
    label: getContent("sessionActivated"),
    date: data.activatedAt,
  });

  if (!isCancelled) {
    steps.push({
      key: "patientJoined",
      state: data.patientPresentAt ? "done" : "pending",
      label: getContent("patientJoined"),
      date: data.patientPresentAt,
    });
    steps.push({
      key: "doctorJoined",
      state: data.doctorPresentAt ? "done" : "pending",
      label: getContent("doctorJoined"),
      date: data.doctorPresentAt,
    });
  }

  const outcomeStateDict: Record<ReservationStatus, StepState> = {
    pending: "pending",
    active: "pending",
    completed: "done",
    cancelled: "skipped",
    noShow: "error",
    error: "error",
  };

  const noShowCaptionKey: Record<ReservationParty, ContentKey> = {
    patient: "noShowByPatient",
    doctor: "noShowByDoctor",
  };

  steps.push({
    key: "outcome",
    state: outcomeStateDict[data.status],
    label: getContent(
      patient ? patientReservationStatus(data).key : reservationStatusContentKeyDict[data.status],
    ),
    date: data.finalizedAt ?? (isCancelled ? data.cancelledAt : undefined),
    caption:
      isCancelled && data.cancelReason
        ? data.cancelReason
        : data.status === "noShow" && data.noShowParty
        ? getContent(noShowCaptionKey[data.noShowParty])
        : data.status === "error"
          ? getContent("reservationErrorNotice")
          : undefined,
  });

  return (
    <div className={classes.main}>
      {steps.map((step, index) => (
        <Fragment key={step.key}>
          <div className={classes.step}>
            <div className={classes.stepIconCol}>
              <div
                className={`${classes.stepIcon} glassIcon ${stepTone[step.state] || ""}`}
              >
                <Ixon width="0.875rem">{stepIcon[step.state]}</Ixon>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`${classes.stepLine} ${
                    step.state === "done" ? classes.stepLineDone : ""
                  }`}
                />
              )}
            </div>
            <div className={classes.stepBody}>
              <span
                className={`${classes.stepLabel} ${
                  step.state === "pending" ? classes.muted : ""
                }`}
              >
                {step.label}
              </span>
              {!!step.date && (
                <FormatDate className={classes.stepDate} value={step.date} />
              )}
              {!!step.caption && (
                <span
                  className={`${classes.stepCaption} ${classes[step.state]}`}
                >
                  {step.caption}
                </span>
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default ReservationTimeline;
