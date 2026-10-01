"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import {
  callTypeDict,
  ICallRoom,
} from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import { ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "../Finance/FinanceListControls";
import {
  AdminPerson,
  doctorLabel,
  formatDay,
  hhmm,
  identityLabel,
  personLabel,
} from "../Reservation/reservationAdmin";
import CreateCallPopup from "./CreateCallPopup";
import DestroyCallPopup from "./DestroyCallPopup";
import { callStatusDict, formatDuration } from "./callAdmin";

// Calls (2026-10, audit P3-18): server-paged, searchable by participant,
// filterable by status / type / day and - through ?doctor= ?user=
// ?reservation= links from other admin pages - by doctor or patient. Each
// row shows the reservation it belongs to, how long it ran, who joined and
// whether it was recorded; the row opens the call's record.

export type AdminCallRow = {
  _id: string;
  callType: "voice" | "video";
  source?: string;
  status?: string;
  startedAt?: string;
  connectedAt?: string;
  endedAt?: string;
  duration?: number | null;
  participants: AdminPerson[];
  joined?: number;
  recordings?: number;
  reservation?: {
    _id: string;
    date?: string;
    start?: number;
    doctor?: { _id: string; firstName?: string; lastName?: string } | null;
    patient?: { _id: string; givenName?: string; lastName?: string } | null;
  } | null;
};

const SCOPES = ["doctor", "user", "reservation"] as const;

const AdminManageCallRoomsPage = () => {
  const searchParams = useSearchParams();
  const state = useFinanceFilters({}, "callType");
  const query = useMemo(() => {
    const params = new URLSearchParams(state.query);
    for (const key of SCOPES) {
      const value = searchParams?.get(key);
      if (value) params.set(key, value);
    }
    return params;
  }, [state.query, searchParams]);
  const scoped = SCOPES.some((key) => searchParams?.get(key));
  const { data, error, mutate, isValidating } = useFinanceList<AdminCallRow>(
    `${API}/admin/calls`,
    query,
    state.page,
  );
  const { setPopup } = usePopup();

  return (
    <WithTitle
      title={ta("مکالمات")}
      actions={[
        {
          title: ta("جدید"),
          action: () => setPopup("CreateCall", <CreateCallPopup mutate={mutate} />),
        },
      ]}
    >
      <FinanceFilterBar
        state={state}
        searchPlaceholder={ta("جستجوی شرکت‌کننده با موبایل، نام یا کد ملی…")}
        status={{ title: ta("وضعیت"), options: callStatusDict }}
        extra={{ title: ta("نوع تماس"), options: callTypeDict }}
      />
      {scoped && (
        <p>
          <InlineLink href={adminPath("/callroom")}>{ta("حذف فیلترهای پیوند")}</InlineLink>
        </p>
      )}
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Table
              name="AdminManageCallRooms"
              data={data.rows}
              renderer={{
                startedAt: {
                  name: ta("شروع تماس"),
                  value: (node) => (node.startedAt ? new Date(node.startedAt) : undefined),
                },
                participants: {
                  name: ta("شرکت‌کنندگان"),
                  value: (node) =>
                    (Array.isArray(node.participants) ? node.participants : [])
                      .map((p) => personLabel(p))
                      .join("، ") || "—",
                },
                reservation: {
                  name: ta("نوبت"),
                  value: (node) =>
                    node.reservation
                      ? `${doctorLabel(node.reservation.doctor)} / ${identityLabel(node.reservation.patient)}`
                      : "—",
                  component: (node) =>
                    node.reservation ? (
                      <InlineLink href={adminPath(`/reservation/${node.reservation._id}`)}>
                        {doctorLabel(node.reservation.doctor)} / {identityLabel(node.reservation.patient)}
                        {" · "}
                        {formatDay(node.reservation.date)} {hhmm(node.reservation.start)}
                      </InlineLink>
                    ) : (
                      ta("تماس دستی")
                    ),
                },
                callType: {
                  name: ta("نوع تماس"),
                  value: (node) => callTypeDict[node.callType] || node.callType,
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => callStatusDict[node.status || ""] || node.status || "—",
                },
                duration: {
                  name: ta("مدت"),
                  value: (node) => formatDuration(node.duration),
                },
                joined: {
                  name: ta("حاضران / ضبط"),
                  value: (node) =>
                    `${node.joined ?? 0} / ${node.recordings ?? 0}`,
                },
                actions: {
                  name: ta("عملیات"),
                  component: (node) => (
                    <TableActions>
                      {(node.status === "ringing" || node.status === "active") && (
                        <IconButton
                          title={ta("پایان تماس")}
                          variant="Danger"
                          onClick={() =>
                            setPopup(
                              "DestroyCall",
                              <DestroyCallPopup
                                node={{ _id: node._id } as unknown as ICallRoom}
                                mutate={mutate}
                              />,
                            )
                          }
                        >
                          <XMarkIcon />
                        </IconButton>
                      )}
                      <InlineLink href={adminPath(`/callroom/${node._id}`)}>
                        <span aria-label={ta("مشاهده")} style={{ display: "inline-flex", transform: "rotateZ(90deg)" }}>
                          <ChevronIcon />
                        </span>
                      </InlineLink>
                    </TableActions>
                  ),
                },
              }}
            />
            <FinancePager
              total={data.total}
              page={state.page}
              limit={data.limit}
              setPage={state.setPage}
              stale={isValidating}
            />
          </>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default AdminManageCallRoomsPage;
