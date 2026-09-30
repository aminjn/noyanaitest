"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import classes from "./AdminRequestsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { useRouter } from "@/Components/i18n/navigation";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import {
  adminDateTimeFormat,
  adminIntlTag,
  adminNumberFormat,
  ta,
} from "@/Components/Admin/i18n/adminText";
import {
  isRequestGroup,
  RequestGroup,
  requestGroupLabels,
  requestGroups,
  requestKindLabel,
  requestKinds,
  requestStatusColor,
  RequestStatusFilter,
  requestStatusFilterLabels,
  requestStatusFilters,
  requestStatusLabel,
} from "./requestMeta";

export interface IAdminRequestRow {
  _id: string;
  group: RequestGroup;
  kind: string;
  title: string;
  status: string;
  isPending: boolean;
  rejectReason: string;
  applicant:
    | { phone?: string; user: string }
    | { name?: string; doctor: string }
    | null;
  createdAt?: string;
  detail: string;
}

type CountRow = { group: string; kind: string; pending: number };

const numberFormat = adminNumberFormat();
const absoluteFormat = adminDateTimeFormat({
  dateStyle: "medium",
  timeStyle: "short",
});

const toDate = (v?: string) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(+d) ? d : null;
};

// "3 days ago" in the panel's language
const waitingLabel = (date: Date | null) => {
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(adminIntlTag(), { numeric: "auto" });
  for (const [unit, size] of steps)
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return rtf.format(0, "minute");
};

const applicantLabel = (row: IAdminRequestRow) => {
  const a = row.applicant;
  if (!a) return "";
  return "user" in a ? a.phone || "" : a.name || "";
};

const applicantHref = (row: IAdminRequestRow) => {
  const a = row.applicant;
  if (!a) return "";
  return "user" in a
    ? a.user
      ? adminPath(`/user/${a.user}`)
      : ""
    : a.doctor
      ? adminPath(`/doctorprofile/${a.doctor}`)
      : "";
};

const isStatusFilter = (v: unknown): v is RequestStatusFilter =>
  typeof v === "string" &&
  (requestStatusFilters as readonly string[]).includes(v);

const RequestsList = ({
  group,
  kind,
  status,
  counts,
  onChange,
}: {
  group: RequestGroup;
  kind: string;
  status: RequestStatusFilter;
  counts: CountRow[];
  onChange: (next: { kind?: string; status?: RequestStatusFilter }) => void;
}) => {
  const query = new URLSearchParams({ group, status });
  if (kind) query.set("kind", kind);
  const { data, error } = useSWR<IAdminRequestRow[]>(
    `${API}/admin/requests?${query.toString()}`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        Array.isArray(res?.data)
          ? (res.data as IAdminRequestRow[]).filter(
              (row) => row && typeof row === "object" && row._id,
            )
          : [],
      ),
  );

  const pendingOf = (k?: string) =>
    counts
      .filter((c) => c.group === group && (!k || c.kind === k))
      .reduce((sum, c) => sum + (Number(c.pending) || 0), 0);

  return (
    <div className={classes.list}>
      <div className={classes.filters}>
        <div className={classes.chips} role="group" aria-label={ta("نوع درخواست")}>
          {["", ...requestKinds[group]].map((k) => {
            const n = pendingOf(k || undefined);
            return (
              <button
                key={k || "all"}
                type="button"
                aria-pressed={kind === k}
                className={`${classes.chip} ${kind === k ? classes.chipActive : ""}`}
                onClick={() => onChange({ kind: k })}
              >
                <span>{k ? requestKindLabel(k) : ta("همه")}</span>
                {n > 0 && (
                  <span className={classes.count}>{numberFormat.format(n)}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className={classes.segmented} role="group" aria-label={ta("وضعیت")}>
          {requestStatusFilters.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              className={`${classes.segment} ${status === s ? classes.segmentActive : ""}`}
              onClick={() => onChange({ status: s })}
            >
              {requestStatusFilterLabels[s]}
            </button>
          ))}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <Table<IAdminRequestRow>
            name={`AdminRequests-${group}`}
            data={data}
            renderer={{
              kind: {
                name: ta("نوع"),
                value: (row) => requestKindLabel(row.kind),
                filter: "Set",
                width: 120,
              },
              title: {
                name: ta("عنوان"),
                value: (row) => row.title || "—",
                filter: "Text",
              },
              applicant: {
                name: ta("متقاضی"),
                value: (row) => applicantLabel(row),
                filter: "Text",
                component: (row) => {
                  const label = applicantLabel(row);
                  const href = applicantHref(row);
                  if (!label) return "—";
                  return href ? (
                    <InlineLink href={href}>
                      <bdi>{label}</bdi>
                    </InlineLink>
                  ) : (
                    <bdi>{label}</bdi>
                  );
                },
              },
              createdAt: {
                name: ta("مدت انتظار"),
                value: (row) => toDate(row.createdAt) || undefined,
                filter: "Date",
                component: (row) => {
                  const d = toDate(row.createdAt);
                  return (
                    <span title={d ? absoluteFormat.format(d) : undefined}>
                      {waitingLabel(d)}
                    </span>
                  );
                },
              },
              status: {
                name: ta("وضعیت"),
                value: (row) => requestStatusLabel(row.status),
                filter: "Set",
                component: (row) => (
                  <Badge color={requestStatusColor(row.status)} size="L">
                    {requestStatusLabel(row.status)}
                  </Badge>
                ),
              },
              actions: {
                name: ta("عملیات"),
                width: 110,
                component: (row) =>
                  row.detail ? (
                    <TableActions>
                      <Button size="S" href={adminPath(row.detail)}>
                        {ta("بررسی")}
                      </Button>
                    </TableActions>
                  ) : null,
              },
            }}
          />
        )}
      </HandleLoading>
    </div>
  );
};

// One provider-verification queue (2026-09), like the back offices of
// Doctolib / Zocdoc / Practo: every "join the platform", "a doctor proposed
// this centre" and "a doctor joins a centre" request, oldest pending first.
// The filters live in the URL, so old list links deep-link here
// (?group=become&kind=clinic).
const AdminRequestsPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const groupParam = params?.get("group");
  const group: RequestGroup = isRequestGroup(groupParam) ? groupParam : "become";
  const kindParam = params?.get("kind") || "";
  const kind = requestKinds[group].includes(kindParam) ? kindParam : "";
  const statusParam = params?.get("status");
  const status: RequestStatusFilter = isStatusFilter(statusParam)
    ? statusParam
    : "pending";

  const { data: counts } = useSWR<CountRow[]>(
    `${API}/admin/requests/counts`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        Array.isArray(res?.data)
          ? (res.data as CountRow[]).filter((c) => c && typeof c === "object")
          : [],
      ),
  );
  const safeCounts = useMemo(() => counts || [], [counts]);

  const go = useCallback(
    (next: { group: RequestGroup; kind: string; status: RequestStatusFilter }) => {
      const q = new URLSearchParams({ group: next.group });
      if (next.kind) q.set("kind", next.kind);
      if (next.status !== "pending") q.set("status", next.status);
      router.replace(adminPath(`/requests?${q.toString()}`), { scroll: false });
    },
    [router],
  );

  const groupPending = (g: RequestGroup) =>
    safeCounts
      .filter((c) => c.group === g)
      .reduce((sum, c) => sum + (Number(c.pending) || 0), 0);

  return (
    <WithTitle title={ta("درخواست‌ها")}>
      <ClientTabSystem
        viewState={[
          group,
          (g) => go({ group: isRequestGroup(g) ? g : "become", kind: "", status }),
        ]}
        items={requestGroups.map((g) => {
          const n = groupPending(g);
          return {
            id: g,
            title: (
              <span className={classes.tabTitle}>
                <span>{requestGroupLabels[g]}</span>
                {n > 0 && (
                  <span className={classes.count}>{numberFormat.format(n)}</span>
                )}
              </span>
            ),
            content: (
              <RequestsList
                group={g}
                kind={g === group ? kind : ""}
                status={status}
                counts={safeCounts}
                onChange={(next) =>
                  go({
                    group: g,
                    kind: next.kind ?? kind,
                    status: next.status ?? status,
                  })
                }
              />
            ),
          };
        })}
      />
    </WithTitle>
  );
};

export default AdminRequestsPage;
