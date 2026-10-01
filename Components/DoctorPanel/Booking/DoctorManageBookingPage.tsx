"use client";

import { useParams } from "next/navigation";
import classes from "./DoctorManageBookingPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useForm from "@/Components/Hooks/useForm";
import FormatDate from "@/Components/UI/FormatDate";
import Button from "@/Components/UI/Button";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import ReservationTimeline from "@/Components/Dashboard/Booking/ReservationTimeline";
import ReservationJoinButton from "@/Components/Dashboard/Booking/ReservationJoinButton";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import DoctorVisitPanel from "@/Components/Visit/DoctorVisitPanel";
import ReservationCancel from "@/Components/Dashboard/Booking/ReservationCancel";
import usePopup from "@/Components/Hooks/usePopup";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import MoveReservationPopup from "../Desk/MoveReservationPopup";

const NS: ContentNamespace[] = ["common", "doctorPanelBooking"];

type DoctorReservation = IReservation<{
  Office: Record<never, never>;
  User: Record<never, never>;
  Patient: Record<never, never>;
}>;

const CHECK_IN_EARLY_MINUTES = 60;

const CheckInAction = ({
  nodeId,
  mutate,
}: {
  nodeId: string;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  const { submit, isLoading } = useForm<Record<string, never>>({
    path: `${API}/doctor/reservation/${nodeId}/check-in`,
    method: "PATCH",
    successMessage: getContent("checkInSuccessMessage"),
    successCb: () => mutate(),
  });

  return (
    <Button
      isLoading={isLoading}
      leadIcon={<CheckCircleIcon />}
      onClick={() => submit()}
    >
      {getContent("checkInPatient")}
    </Button>
  );
};

const DoctorManageBookingPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<DoctorReservation>(
    nodeId ? `${API}/doctor/reservation/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const hasAccess = useDoctorAcl();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("schedule"), target: "/doctorpanel/schedule" },
  ]);

  const checkInPossible =
    !!data &&
    data.sessionType === "inPerson" &&
    ["pending", "active"].includes(data.status) &&
    !data.patientPresentAt;
  // same window the API enforces: from an hour before the start (checking a
  // patient in a day early would complete the visit and pay out regardless)
  const checkInOpen =
    !!data &&
    Date.now() >=
      new Date(data.date).getTime() + (data.start - CHECK_IN_EARLY_MINUTES) * 60000;
  const canCheckIn = checkInPossible && checkInOpen;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <span className={classes.title}>{getContent("reservation")}</span>
            <ReservationStatusBadge status={data.status} />
          </div>

          <div className={classes.card}>
            <div className={classes.infoGrid}>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("patientName")}
                </span>
                <span className={classes.infoValue}>
                  {`${data.patient.givenName} ${data.patient.lastName}`}
                </span>
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("sessionDate")}
                </span>
                <FormatDate
                  className={classes.infoValue}
                  value={data.date}
                  time={false}
                />
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("sessionStart")}
                </span>
                <span className={classes.infoValue}>
                  {numberToTime(data.start)} - {numberToTime(data.end)}
                </span>
              </div>

              {/* an online visit has no office */}
              {data.sessionType === "inPerson" && (
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>
                    {getContent("office")}
                  </span>
                  <span className={classes.infoValue}>
                    {data.office?.name || "—"}
                  </span>
                </div>
              )}

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("sessionType")}
                </span>
                <span className={classes.infoValue}>
                  {getContent(data.sessionType)}
                </span>
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("submittedAt")}
                </span>
                <FormatDate
                  className={classes.infoValue}
                  value={data.createdAt}
                />
              </div>
            </div>

            <div className={classes.actionsRow}>
              {(!!data.chat || !!data.callRoom) && data.status === "active" && (
                <ReservationJoinButton
                  chat={data.chat}
                  callRoom={data.callRoom}
                  sessionType={data.sessionType}
                  panel="doctor"
                />
              )}
              {canCheckIn && (
                <CheckInAction nodeId={data._id} mutate={mutate} />
              )}
              {checkInPossible && !checkInOpen && (
                <span className={classes.hint}>
                  {getContent("checkInOpensHint")}
                </span>
              )}
              {data.status === "pending" && hasAccess("mutateCalendar") && (
                <Button
                  variant="Neutral"
                  onClick={() =>
                    setPopup(
                      "MoveReservation",
                      <MoveReservationPopup
                        reservationId={data._id}
                        sessionType={data.sessionType}
                        onDone={() => mutate()}
                      />,
                    )
                  }
                >
                  {getContent("deskMove")}
                </Button>
              )}
              <ReservationCancel
                side="doctor"
                reservation={data}
                ns={NS}
                onDone={() => mutate()}
              />
              {data.sessionType === "inPerson" && !!data.patientPresentAt && (
                <span className={classes.present}>
                  <CheckCircleIcon />
                  <span>{getContent("patientJoined")}</span>
                  <FormatDate value={data.patientPresentAt} />
                </span>
              )}
            </div>
          </div>

          {/* no note / intake for a visit that was cancelled */}
          {data.status !== "cancelled" && (
            <DoctorVisitPanel reservationId={data._id} />
          )}

          <div className={classes.card}>
            <span className={classes.title}>
              {getContent("reservationTimeline")}
            </span>
            <ReservationTimeline data={data} />
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManageBookingPage;
