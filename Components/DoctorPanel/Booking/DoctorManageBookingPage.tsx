"use client";
import { tehranInstantOf } from "@/Components/helpers/tehranTime";

import { useParams } from "next/navigation";
import classes from "./DoctorManageBookingPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
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
import VisitQuickActions from "../Desk/VisitQuickActions";
import DeskPaidAction from "../Desk/DeskPaidAction";
import InsuranceBreakdown from "@/Components/Booking/Insurance/InsuranceBreakdown";
import useBreakdownTexts from "@/Components/Booking/Insurance/useBreakdownTexts";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "doctorPanelBooking"];

type DoctorReservation = IReservation<{
  Office: Record<never, never>;
  User: Record<never, never>;
  Patient: Record<never, never>;
}>;

const CHECK_IN_EARLY_MINUTES = 60;

const DoctorManageBookingPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<DoctorReservation>(
    nodeId ? `${API}/doctor/reservation/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const breakdownText = useBreakdownTexts();
  const money = (n: number) => getContent("xToman", [new Intl.NumberFormat(intlTag).format(Math.max(0, Math.round(n)))]);
  const { setPopup } = usePopup();
  const hasAccess = useDoctorAcl();

  const patientName =
    [data?.patient?.givenName, data?.patient?.lastName].filter(Boolean).join(" ") || "—";

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
      tehranInstantOf(data.date, data.start - CHECK_IN_EARLY_MINUTES).getTime();

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
                  {patientName}
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

            {/* the insurers' lines (and whose claim list they go to), the
                patient's share and how it is paid */}
            <InsuranceBreakdown reservation={data} text={breakdownText} money={money} />

            <div className={classes.actionsRow}>
              {(!!data.chat || !!data.callRoom) && data.status === "active" && (
                <ReservationJoinButton
                  chat={data.chat}
                  callRoom={data.callRoom}
                  sessionType={data.sessionType}
                  panel="doctor"
                />
              )}
              <VisitQuickActions visit={data} name={patientName} onDone={() => mutate()} size="M" />
              <DeskPaidAction visit={data} onDone={() => mutate()} />
              {!!data.deskPaidAt && (
                <span className={classes.present}>
                  <CheckCircleIcon />
                  <span>{getContent("dpPaidAt")}</span>
                  <FormatDate value={data.deskPaidAt} />
                </span>
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
