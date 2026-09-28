"use client";
import { useIntlLocale } from "@/Components/i18n/navigation";

import useSWR from "swr";
import classes from "./DoctorManageCalendarDayPage.module.css";
import {
  doctorSessionTypes,
  IDoctorSession,
  patientStatuses,
} from "./DoctorCalendarDay";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import { numberToTime } from "./AddSessionsAgent";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import { Fragment, useMemo } from "react";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import MutateSessionPopup from "./MutateSessionPopup";
import DeleteSessionPopup from "./DeleteSessionPopup";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

const NS: ContentNamespace[] = ["common", "doctorPanelCalendar"];

const DoctorManageCalendarDayPage = () => {
  const intlTag = useIntlLocale();
  const params = useParams<{ stamp: string }>();
  const { data, error, mutate } = useSWR<
    IDoctorSession<{ Booking: { User: true }; Clinic: Record<never, never> }>[]
  >(
    params ? `${API}/doctor/calendar/${params.stamp}/full` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("bookingCalendar"), target: "/doctorpanel/calendar" },
  ]);

  const past = useMemo<boolean>(
    () => new Date(Number(params.stamp)) < new Date(),
    [params.stamp],
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          actions={
            past
              ? undefined
              : [
                  {
                    id: "New",
                    content: (
                      <Button
                        onClick={() =>
                          setPopup(
                            "MutateSession",
                            <MutateSessionPopup
                              mutate={mutate}
                              stamp={params.stamp}
                            />,
                          )
                        }
                      >
                        {getContent("newItem")}
                      </Button>
                    ),
                  },
                ]
          }
          title={`${getContent("timeLine")} ${safeFormatDate(
            new Intl.DateTimeFormat(intlTag, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            Number(params.stamp),
          )}`}
        >
          <Table
            name="DoctorManageCalendarDay"
            data={data}
            renderer={{
              start: {
                name: getContent("sessionStart"),
                value: (node) => node.start,
                component: (node) => numberToTime(node.start),
                filter: "Number",
              },
              end: {
                name: getContent("sessionEnd"),
                value: (node) => node.end,
                filter: "Number",
                component: (node) => numberToTime(node.end),
              },
              duration: {
                name: getContent("sessionDuration"),
                value: (node) => node.end - node.start,
                component: (node) => numberToTime(node.end - node.start),
                filter: "Number",
              },
              ...doctorSessionTypes.reduce(
                (acc, kind) => ({
                  ...acc,
                  [kind]: {
                    name: getContent(kind),
                    value: (node: IDoctorSession) =>
                      node[kind] ? getContent("yes") : getContent("no"),
                    filter: "Set",
                    component: (node: IDoctorSession) => (
                      <BooleanToIcon value={!!node[kind]} />
                    ),
                  },
                }),
                {},
              ),
              ...patientStatuses.reduce(
                (acc, status) => ({
                  ...acc,
                  [status]: {
                    name: getContent(status),
                    value: (node: IDoctorSession) =>
                      node[status] ? getContent("yes") : getContent("no"),
                    filter: "Set",
                    component: (node: IDoctorSession) => (
                      <BooleanToIcon value={!!node[status]} />
                    ),
                  },
                }),
                {},
              ),
              note: {
                name: getContent("description"),
                filter: "Text",
                value: (node) => node.note,
              },
              clinic: {
                name: getContent("office"),
                filter: "Set",
                value: (node) => node.clinic?.name,
              },
              booking: {
                name: getContent("bookingStatus"),
                filter: "Text",
                value: (node) => (node.booking ? node.booking.user.phone : ""),
                // Legacy session Booking (not a Reservation): there is no
                // detail page for it - /doctorpanel/booking/[id] loads
                // Reservations only - so show the phone without a link.
                component: (node) =>
                  node.booking ? node.booking.user.phone : getContent("notBooked"),
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    {!past && !node.booking && (
                      <Fragment>
                        <IconButton
                          variant="Info"
                          onClick={() =>
                            setPopup(
                              "MutateSession",
                              <MutateSessionPopup
                                mutate={mutate}
                                node={node as IDoctorSession}
                              />,
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          variant="Danger"
                          onClick={() =>
                            setPopup(
                              "DeleteSessionPopup",
                              <DeleteSessionPopup
                                node={node as IDoctorSession}
                                mutate={mutate}
                              />,
                            )
                          }
                        >
                          <GarbageIcon />
                        </IconButton>
                      </Fragment>
                    )}
                  </TableActions>
                ),
              },
            }}
          />
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorManageCalendarDayPage;
