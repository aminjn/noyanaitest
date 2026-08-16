"use client";

import { useParams } from "next/navigation";
import classes from "./DashboardManageBookingPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import { IReservation } from "./DashboardManageBookingsPage";

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

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <p>
            {getContent("doctor")} :{" "}
            <InlineLink
              href={`/dr/${data.doctor.slug || data.doctor._id}`}
            >
              {getDoctorProfileLabel(data.doctor)}
            </InlineLink>
          </p>
          <p>
            {getContent("patientName")} :{" "}
            {`${data.patient.givenName} ${data.patient.lastName}`}
          </p>
          <p>
            {getContent("sessionDate")} :{" "}
            <FormatDate value={data.date} time={false} />
          </p>
          <p>
            {getContent("sessionStart")} : {numberToTime(data.start)}
          </p>
          <p>
            {getContent("sessionEnd")} : {numberToTime(data.end)}
          </p>
          <p>
            {getContent("office")} : {data.office.name}
          </p>
          <p>
            {getContent("sessionType")} : {getContent(data.sessionType)}
          </p>
          {!!data.transaction && (
            <p>
              {getContent("bookingPrice")} :{" "}
              {currencize(Math.abs(data.transaction.amount))}{" "}
              {getContent("toman")}
            </p>
          )}
          <p>
            {getContent("submittedAt")} : <FormatDate value={data.createdAt} />
          </p>
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageBookingPage;
