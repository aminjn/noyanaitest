"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import { adminPath } from "@/Components/helpers/adminPath";
import { currencize } from "@/Components/helpers/currencize";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "../Finance/FinanceListControls";
import {
  IAdminReservationRow,
  ReservationStatus,
  ReservationStatusBadge,
  doctorLabel,
  formatDay,
  hhmm,
  identityLabel,
  personLabel,
  reservationStatusDict,
  sessionTypeDict,
} from "./reservationAdmin";
import classes from "./AdminManageReservationsPage.module.css";

// Every appointment, server-paged (2026-10): search by doctor / patient /
// phone / national id / reservation id, filter by status, session type and
// day range; ?doctor= ?user= ?patient= ?clinic= ?office= narrow it from other
// admin pages (user, doctor, centre). Rows open the reservation record, where
// the actions live. Like the Doctolib Pro / Practo Ray appointment lists.

const num = adminNumberFormat();
const SCOPES = ["doctor", "user", "patient", "clinic", "office"] as const;

const AdminManageReservationsPage = ({
  scope,
  embedded,
}: {
  // fixed filters when the list is shown inside another page (user page)
  scope?: Partial<Record<(typeof SCOPES)[number], string>>;
  embedded?: boolean;
}) => {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get("status") || undefined;
  const state = useFinanceFilters({ status: initialStatus }, "sessionType");
  const needsAction = !scope && searchParams?.get("needsAction") === "1";
  const query = useMemo(() => {
    const params = new URLSearchParams(state.query);
    for (const key of SCOPES) {
      const value = scope?.[key] ?? (scope ? null : searchParams?.get(key));
      if (value) params.set(key, value);
    }
    if (needsAction) params.set("needsAction", "1");
    return params;
  }, [state.query, scope, searchParams, needsAction]);
  const { data, error, isValidating } = useFinanceList<IAdminReservationRow>(
    `${API}/admin/reservations`,
    query,
    state.page,
    embedded ? 10 : undefined,
  );
  const counts = (data?.body?.statusCounts || {}) as Record<string, number>;
  const scoped = !scope && SCOPES.some((key) => searchParams?.get(key));

  const content = (
    <>
      <FinanceFilterBar
        state={state}
        searchPlaceholder={ta("جستجو با نام پزشک، نام یا کد ملی بیمار، موبایل یا شماره‌ی نوبت…")}
        status={{ title: ta("وضعیت"), options: reservationStatusDict }}
        extra={{ title: ta("نوع ویزیت"), options: sessionTypeDict }}
      />
      {!embedded && (
        <div className={classes.chips} role="tablist" aria-label={ta("وضعیت")}>
          {(Object.keys(reservationStatusDict) as ReservationStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={state.filters.status === status}
              className={`${classes.chip} ${state.filters.status === status ? classes.chipActive : ""}`}
              onClick={() =>
                state.set({ status: state.filters.status === status ? "" : status })
              }
            >
              <span>{reservationStatusDict[status]}</span>
              <span className={classes.chipCount}>{num.format(counts[status] || 0)}</span>
            </button>
          ))}
          {(needsAction || scoped) && (
            <InlineLink href={adminPath("/reservation")}>{ta("حذف فیلترهای پیوند")}</InlineLink>
          )}
        </div>
      )}
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <div className={isValidating ? classes.stale : ""}>
            <Table
              name={embedded ? "AdminUserReservations" : "AdminManageReservations"}
              data={data.rows}
              renderer={{
                when: {
                  name: ta("زمان نوبت"),
                  value: (node) => `${formatDay(node.date)} · ${hhmm(node.start)}`,
                  component: (node) => (
                    <InlineLink href={adminPath(`/reservation/${node._id}`)}>
                      {formatDay(node.date)} · {hhmm(node.start)}
                    </InlineLink>
                  ),
                },
                doctor: {
                  name: ta("پزشک"),
                  value: (node) => doctorLabel(node.doctor),
                  component: (node) =>
                    node.doctor ? (
                      <InlineLink href={adminPath(`/doctorprofile/${node.doctor._id}`)}>
                        {doctorLabel(node.doctor)}
                      </InlineLink>
                    ) : (
                      "—"
                    ),
                },
                patient: {
                  name: ta("بیمار"),
                  value: (node) => identityLabel(node.patient),
                },
                user: {
                  name: ta("رزروکننده"),
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
                sessionType: {
                  name: ta("نوع ویزیت"),
                  value: (node) => sessionTypeDict[node.sessionType] || node.sessionType,
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => reservationStatusDict[node.status] || node.status,
                  component: (node) => (
                    <ReservationStatusBadge status={node.status} noShowParty={node.noShowParty} />
                  ),
                },
                total: {
                  name: ta("مبلغ (تومان)"),
                  value: (node) => node.total ?? 0,
                  component: (node) => currencize(node.total),
                },
                office: {
                  name: ta("مطب / مرکز"),
                  value: (node) => node.office?.name || "—",
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
          </div>
        )}
      </HandleLoading>
    </>
  );

  if (embedded) return content;
  return (
    <WithTitle title={needsAction ? ta("نوبت‌های نیازمند بررسی") : ta("نوبت‌ها")}>
      {content}
    </WithTitle>
  );
};

export default AdminManageReservationsPage;
