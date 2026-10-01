"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import {
  callTypeDict,
  ICallRoom,
} from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import {
  AdminPerson,
  doctorLabel,
  formatDateTime,
  formatDay,
  hhmm,
  identityLabel,
  personLabel,
} from "../Reservation/reservationAdmin";
import DestroyCallPopup from "./DestroyCallPopup";
import {
  callEventDict,
  callStatusDict,
  formatDuration,
  participantStatusDict,
  recordingStatusDict,
} from "./callAdmin";
import classes from "../Reservation/AdminManageReservationPage.module.css";

// One call (2026-10): the reservation it belongs to, each participant's time
// in the room, the event timeline and the recordings (metadata - the files
// stay on the call server). Ending a live call is the only action.

type CallDetail = {
  _id: string;
  callType: "voice" | "video";
  source?: string;
  status?: string;
  startedAt?: string;
  connectedAt?: string;
  endedAt?: string;
  duration?: number | null;
  recordingEnabled?: boolean;
  initiator?: AdminPerson | null;
  endedBy?: AdminPerson | null;
  reservation?: {
    _id: string;
    date?: string;
    start?: number;
    status?: string;
    doctor?: { _id: string; firstName?: string; lastName?: string } | null;
    patient?: { _id: string; givenName?: string; lastName?: string } | null;
  } | null;
  callParticipants?: {
    _id: string;
    user?: AdminPerson | null;
    role?: string;
    status?: string;
    joinedAt?: string;
    leftAt?: string;
    seconds?: number | null;
  }[];
  events?: {
    _id: string;
    type: string;
    user?: AdminPerson | null;
    createdAt?: string;
  }[];
  recordings?: {
    _id: string;
    kind?: string;
    status?: string;
    format?: string;
    startedAt?: string;
    endedAt?: string;
    error?: string;
    startedBy?: AdminPerson | null;
  }[];
};

const Pair = ({ title, value }: { title: string; value?: React.ReactNode }) => (
  <div className={classes.pair}>
    <span className={classes.pairTitle}>{title}</span>
    <span className={classes.pairValue}>{value ?? "—"}</span>
  </div>
);

const seconds = (from?: string, to?: string) => {
  const a = from ? new Date(from).getTime() : NaN;
  const b = to ? new Date(to).getTime() : NaN;
  return Number.isFinite(a) && Number.isFinite(b) && b >= a ? Math.round((b - a) / 1000) : null;
};

const AdminManageCallRoomPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<CallDetail>(
    params?.nodeId ? `${API}/admin/calls/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const participants = Array.isArray(data?.callParticipants) ? data.callParticipants : [];
  const events = Array.isArray(data?.events) ? data.events : [];
  const recordings = Array.isArray(data?.recordings) ? data.recordings : [];
  const live = data?.status === "ringing" || data?.status === "active";

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تماس ${1}", [formatDateTime(data.startedAt)])}
          actions={
            live
              ? [
                  {
                    title: ta("پایان تماس"),
                    danger: true,
                    icon: <XMarkIcon />,
                    action: () =>
                      setPopup(
                        "DestroyCall",
                        <DestroyCallPopup
                          node={{ _id: data._id } as unknown as ICallRoom}
                          mutate={() => mutate()}
                        />,
                      ),
                  },
                ]
              : []
          }
        >
          <div className={classes.main}>
            <div className={classes.grid}>
              <section className={classes.section}>
                <h2 className={classes.sectionTitle}>{ta("خلاصه")}</h2>
                <Pair title={ta("نوع تماس")} value={callTypeDict[data.callType] || data.callType} />
                <Pair title={ta("وضعیت")} value={callStatusDict[data.status || ""] || data.status} />
                <Pair title={ta("شروع")} value={formatDateTime(data.startedAt)} />
                <Pair title={ta("وصل شدن")} value={formatDateTime(data.connectedAt)} />
                <Pair title={ta("پایان")} value={formatDateTime(data.endedAt)} />
                <Pair title={ta("مدت گفتگو")} value={formatDuration(data.duration)} />
                <Pair title={ta("ایجادکننده")} value={personLabel(data.initiator)} />
                {data.endedBy && <Pair title={ta("پایان‌دهنده")} value={personLabel(data.endedBy)} />}
              </section>
              <section className={classes.section}>
                <h2 className={classes.sectionTitle}>{ta("نوبت")}</h2>
                {data.reservation ? (
                  <>
                    <Pair
                      title={ta("نوبت")}
                      value={
                        <InlineLink href={adminPath(`/reservation/${data.reservation._id}`)}>
                          {formatDay(data.reservation.date)} · {hhmm(data.reservation.start)}
                        </InlineLink>
                      }
                    />
                    <Pair
                      title={ta("پزشک")}
                      value={
                        data.reservation.doctor ? (
                          <InlineLink href={adminPath(`/doctorprofile/${data.reservation.doctor._id}`)}>
                            {doctorLabel(data.reservation.doctor)}
                          </InlineLink>
                        ) : undefined
                      }
                    />
                    <Pair title={ta("بیمار")} value={identityLabel(data.reservation.patient)} />
                  </>
                ) : (
                  <p className={classes.muted}>{ta("این تماس دستی ساخته شده و به نوبتی وصل نیست.")}</p>
                )}
              </section>
            </div>

            <section className={classes.section}>
              <h2 className={classes.sectionTitle}>{ta("شرکت‌کنندگان")}</h2>
              <Table
                name="AdminCallParticipants"
                data={participants}
                renderer={{
                  user: {
                    name: ta("کاربر"),
                    value: (node) => personLabel(node.user),
                    component: (node) =>
                      node.user ? (
                        <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                          {personLabel(node.user)}
                        </InlineLink>
                      ) : (
                        "—"
                      ),
                  },
                  role: {
                    name: ta("نقش"),
                    value: (node) => (node.role === "host" ? ta("میزبان") : ta("مهمان")),
                  },
                  status: {
                    name: ta("وضعیت"),
                    value: (node) => participantStatusDict[node.status || ""] || node.status || "—",
                  },
                  joinedAt: { name: ta("ورود"), value: (node) => formatDateTime(node.joinedAt) },
                  leftAt: { name: ta("خروج"), value: (node) => formatDateTime(node.leftAt) },
                  seconds: { name: ta("مدت حضور"), value: (node) => formatDuration(node.seconds) },
                }}
              />
            </section>

            <section className={classes.section}>
              <h2 className={classes.sectionTitle}>{ta("ضبط‌ها")}</h2>
              {recordings.length ? (
                <Table
                  name="AdminCallRecordings"
                  data={recordings}
                  renderer={{
                    startedAt: { name: ta("شروع"), value: (node) => formatDateTime(node.startedAt) },
                    duration: {
                      name: ta("مدت"),
                      value: (node) => formatDuration(seconds(node.startedAt, node.endedAt)),
                    },
                    kind: {
                      name: ta("نوع"),
                      value: (node) => (node.kind === "screen" ? ta("صفحه") : ta("شرکت‌کننده")),
                    },
                    status: {
                      name: ta("وضعیت"),
                      value: (node) =>
                        `${recordingStatusDict[node.status || ""] || node.status || "—"}${node.error ? ` (${node.error})` : ""}`,
                    },
                    startedBy: { name: ta("شروع‌کننده"), value: (node) => personLabel(node.startedBy) },
                  }}
                />
              ) : (
                <p className={classes.muted}>{ta("این تماس ضبط نشده است.")}</p>
              )}
            </section>

            <section className={classes.section}>
              <h2 className={classes.sectionTitle}>{ta("رویدادها")}</h2>
              {events.length ? (
                <ul className={classes.history}>
                  {events.map((event) => (
                    <li key={event._id}>
                      <strong>{callEventDict[event.type] || event.type}</strong>
                      <span className={classes.muted}>
                        {" · "}
                        {formatDateTime(event.createdAt)}
                        {event.user ? ` · ${personLabel(event.user)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={classes.muted}>{ta("رویدادی ثبت نشده است.")}</p>
              )}
            </section>
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageCallRoomPage;
