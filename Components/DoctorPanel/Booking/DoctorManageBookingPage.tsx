"use client";

import { useParams } from "next/navigation";
import classes from "./DoctorManageBookingPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
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

type DoctorReservation = IReservation<{
  Office: Record<never, never>;
  User: Record<never, never>;
  Patient: Record<never, never>;
}>;

const CheckInAction = ({
  nodeId,
  mutate,
}: {
  nodeId: string;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

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

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("bookingCalendar"), target: "/doctorpanel/calendar" },
  ]);

  const canCheckIn =
    !!data &&
    data.sessionType === "inPerson" &&
    ["pending", "active"].includes(data.status) &&
    !data.patientPresentAt;

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

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("office")}
                </span>
                <span className={classes.infoValue}>{data.office.name}</span>
              </div>

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
                />
              )}
              {canCheckIn && (
                <CheckInAction nodeId={data._id} mutate={mutate} />
              )}
            </div>
          </div>

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
