"use client";

import useSWR from "swr";
import classes from "./DashboardManageBookingsPage.module.css";
import { IBooking } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";

const DashboardManageBookingsPage = () => {
  const { data, error } = useSWR<
    IBooking<{
      Doctor: Record<string, never>;
      Session: Record<string, never>;
    }>[]
  >(`${API}/user/booking`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="DashboardManageBookings"
          renderer={{
            bookedAt: {
              name: getContent("bookedAt"),
              value: (node) => new Date(node.bookedAt),
              component: (node) => <FormatDate value={node.bookedAt} />,
              filter: "Date",
            },
            bookPrice: {
              name: getContent("bookingPrice"),
              filter: "Number",
              value: (node) => node.bookPrice,
              component: (node) => currencize(node.bookPrice),
            },
            kind: {
              name: getContent("sessionKind"),
              value: (node) => getContent(node.kind),
              filter: "Set",
            },
            sessionDate: {
              name: getContent("sessionDate"),
              value: (node) => new Date(node.session.date),
              component: (node) => (
                <FormatDate time={false} value={new Date(node.session.date)} />
              ),
              filter: "Date",
            },
            start: {
              name: getContent("sessionStart"),
              value: (node) => node.session.start,
              component: (node) => numberToTime(node.session.start),
              filter: "Number",
            },
            doctor: {
              name: getContent("doctor"),
              value: (node) => getDoctorProfileLabel(node.doctor),
              component: (node) => (
                <InlineLink
                  href={`/doctor/${node.doctor.slug || node.doctor._id}`}
                >
                  {getDoctorProfileLabel(node.doctor)}
                </InlineLink>
              ),
              filter: "Multi",
            },
            actions: {
              name: getContent("actions"),
              component: (node) => (
                <TableActions>
                  <IconLink href={`/dashboard/booking/${node._id}`}>
                    <EyeIcon />
                  </IconLink>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DashboardManageBookingsPage;
