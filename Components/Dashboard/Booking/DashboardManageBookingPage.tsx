"use client";

import { useParams, useSearchParams } from "next/navigation";
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
import PatientIntakeCard from "@/Components/Visit/PatientIntakeCard";
import ReservationDispute from "./ReservationDispute";
import VisitFeedbackCard from "@/Components/Visit/VisitFeedbackCard";
import LeaveByHint from "@/Components/Map/LeaveByHint";
import BookingManagePanel from "./BookingManagePanel";
import InsuranceBreakdown, { BreakdownReservation } from "@/Components/Booking/Insurance/InsuranceBreakdown";
import useBreakdownTexts from "@/Components/Booking/Insurance/useBreakdownTexts";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "dashboardBooking", "bookingFlow"];

const DashboardManageBookingPage = () => {
  const params = useParams<{ nodeId: string }>();
  // right after booking: the confirmation (step 3 of the booking flow)
  const search = useSearchParams();
  const isNew = search.get("new") === "1";
  // an earlier-slot notice's link (/w/<code>): its one-tap move is on top
  const earlier = search.get("earlier") === "1";

  const { data, error, mutate } = useSWR<
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
  const intlTag = useIntlLocale();
  const breakdownText = useBreakdownTexts();
  const money = (n: number) => getContent("xToman", [new Intl.NumberFormat(intlTag).format(Math.max(0, Math.round(n)))]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <Button
              href="/dashboard/booking"
              mode="Inline"
              size="M"
              leadIcon={<ArrowLeftIcon />}
            >
              {getContent("backToList")}
            </Button>
            <ReservationStatusBadge status={data.status} patient={data} />
          </div>

          <BookingManagePanel
            data={data as Parameters<typeof BookingManagePanel>[0]["data"]}
            isNew={isNew}
            earlier={earlier}
            onChanged={() => mutate()}
          />

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
                  {numberToTime(data.start)}
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

            {/* the insurers' lines, the patient's share and how it was paid */}
            <InsuranceBreakdown
              className={classes.breakdown}
              reservation={data as unknown as BreakdownReservation}
              text={breakdownText}
              money={money}
            />

            {/* an upcoming in-person visit: when to leave, traffic zone */}
            {data.sessionType === "inPerson" &&
              (data.status === "active" || data.status === "pending") && (
              <LeaveByHint
                className={classes.leaveBy}
                coords={data.office?.location?.coordinates}
                date={data.date}
                start={data.start}
              />
            )}

            <div className={classes.joinRow}>
              <ReservationDispute
                reservation={data}
                ns={NS}
                onDone={() => mutate()}
              />
            </div>
          </div>

          {data.status === "completed" && (
            <VisitFeedbackCard reservationId={data._id} />
          )}

          {/* no questionnaire for a cancelled visit */}
          {data.status !== "cancelled" && (
            <div id="intake">
              <PatientIntakeCard reservationId={data._id} />
            </div>
          )}

          <div className={classes.card}>
            <span className={classes.title}>
              {getContent("reservationTimeline")}
            </span>
            <ReservationTimeline data={data} patient />
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageBookingPage;
