"use client";

import { useParams } from "next/navigation";
import classes from "./DashboardManageBookingPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import Button from "@/Components/UI/Button";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { IReservation } from "./DashboardManageBookingsPage";
import ReservationStatusBadge from "./ReservationStatusBadge";
import ReservationTimeline from "./ReservationTimeline";
import ReservationJoinButton from "./ReservationJoinButton";
import PatientIntakeCard from "@/Components/Visit/PatientIntakeCard";

const NS: ContentNamespace[] = ["common", "dashboardBooking"];

const DashboardManageBookingPage = () => {
  const params = useParams<{ nodeId: string }>();

  const { data, error } = useSWR<
    IReservation<{
      Doctor: Record<never, never>;
      Office: Record<never, never>;
      User: Record<never, never>;
      Patient: Record<never, never>;
      Transaction: Record<never, never>;
    }>
  >(`${API}/user/reservation/${params.nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <Button
              href="/dashboard/booking"
              mode="Inline"
              size="S"
              leadIcon={<ArrowLeftIcon />}
            >
              {getContent("backToList")}
            </Button>
            <ReservationStatusBadge status={data.status} />
          </div>

          <div className={classes.card}>
            <div className={classes.cardHeader}>
              <span className={classes.title}>{getContent("reservation")}</span>
              <FormatDate
                className={classes.date}
                value={data.date}
                time={false}
              />
            </div>

            <div className={classes.infoGrid}>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>
                  {getContent("doctor")}
                </span>
                <InlineLink
                  className={classes.infoValue}
                  href={`/dr/${data.doctor.slug || data.doctor._id}`}
                >
                  {getDoctorProfileLabel(data.doctor)}
                </InlineLink>
              </div>

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

              {!!data.transaction && (
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>
                    {getContent("bookingPrice")}
                  </span>
                  <span className={classes.infoValue}>
                    {currencize(Math.abs(data.transaction.amount))}{" "}
                    {getContent("toman")}
                  </span>
                </div>
              )}

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

            {(!!data.chat || !!data.callRoom) && data.status === "active" && (
              <div className={classes.joinRow}>
                <ReservationJoinButton
                  chat={data.chat}
                  callRoom={data.callRoom}
                  sessionType={data.sessionType}
                />
              </div>
            )}
          </div>

          <PatientIntakeCard reservationId={data._id} />

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

export default DashboardManageBookingPage;
