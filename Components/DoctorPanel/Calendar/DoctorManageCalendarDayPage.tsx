"use client";

import useSWR from "swr";
import classes from "./DoctorManageCalendarDayPage.module.css";
import { doctorSessionTypes, IDoctorSession } from "./DoctorCalendarDay";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import { numberToTime } from "./AddSessionsAgent";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import { Fragment, useMemo } from "react";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import MutateSessionPopup from "./MutateSessionPopup";
import DeleteSessionPopup from "./DeleteSessionPopup";

const DoctorManageCalendarDayPage = () => {
  const params = useParams<{ stamp: string }>();
  const { data, error, mutate } = useSWR<
    IDoctorSession<{ Booking: { User: true } }>[]
  >(
    params ? `${API}/doctor/calendar/${params.stamp}/full` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const past = useMemo<boolean>(
    () => new Date(Number(params.stamp)) < new Date(),
    [params.stamp]
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
                            />
                          )
                        }
                      >
                        {getContent("newItem")}
                      </Button>
                    ),
                  },
                ]
          }
          title={`${getContent("timeLine")} ${new Date(
            Number(params.stamp)
          ).toLocaleDateString("fa-IR", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`}
        >
          <Table
            name="DoctorManageCalendarDay"
            data={data}
            renderer={{
              createdAt: {
                name: getContent("createdAt"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.createdAt} />,
              },
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
                {}
              ),
              note: {
                name: getContent("description"),
                filter: "Text",
                value: (node) => node.note,
              },
              booking: {
                name: getContent("bookingStatus"),
                filter: "Text",
                value: (node) => (node.booking ? node.booking.user.phone : ""),
                component: (node) =>
                  node.booking ? (
                    <InlineLink
                      href={`/doctorpanel/booking/${node.booking._id}`}
                    >
                      {node.booking.user.phone}
                    </InlineLink>
                  ) : (
                    getContent("notBooked")
                  ),
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
                              />
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
                              />
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
