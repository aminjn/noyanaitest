"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  ITicket,
  TicketStatus,
  ticketStatusDict,
  ticketStatuses,
  ticketSubjectDict,
} from "@/Components/Dashboard/Support/SupportPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import Button from "@/Components/UI/Button";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import {
  AdminTicketRow,
  PriorityBadge,
  TicketPriority,
  WaitingBadge,
  formatHours,
  supportUserLabel,
  ticketPriorities,
  ticketPriorityDict,
  useSupportStaff,
} from "./supportShared";
import OpenTicketPopup from "./OpenTicketPopup";
import classes from "./support.module.css";

export type AdminTicket = ITicket<{ SubmittedBy: Record<never, never> }>;

type TicketsResponse = {
  items: AdminTicketRow[];
  total: number;
  page: number;
  limit: number;
  statusCounts: Record<string, number>;
  mineOpen: number;
  unassignedOpen: number;
};

const PAGE_SIZE = 50;
const num = adminNumberFormat();

// queue views, Zendesk / Doctolib Pro style: what needs an answer first
type View = "open" | "mine" | "unassigned" | "overdue" | "all" | TicketStatus;
const views: { view: View; title: () => string }[] = [
  { view: "open", title: () => ta("باز و در دست بررسی") },
  { view: "mine", title: () => ta("تیکت‌های من") },
  { view: "unassigned", title: () => ta("بدون مسئول") },
  { view: "overdue", title: () => ta("دیرکرد") },
  { view: "all", title: () => ta("همه") },
  ...ticketStatuses.map((s) => ({ view: s as View, title: () => ticketStatusDict[s] })),
];

const AdminManageTicketsPage = () => {
  const [view, setView] = useState<View>("open");
  const [priority, setPriority] = useState<"" | TicketPriority>("");
  const [assignee, setAssignee] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();
  const { data: staff } = useSupportStaff();

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (view === "open" || view === "mine" || view === "unassigned")
    params.set("status", "Open,InProgress");
  else if (view !== "all" && view !== "overdue") params.set("status", view);
  if (view === "overdue") params.set("overdue", "1");
  if (view === "mine") params.set("assignee", "me");
  else if (view === "unassigned") params.set("assignee", "none");
  else if (assignee) params.set("assignee", assignee);
  if (priority) params.set("priority", priority);
  if (query) params.set("q", query);

  const { data, error } = useSWR<TicketsResponse>(
    `${API}/admin/support/tickets?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { keepPreviousData: true, refreshInterval: 30_000 },
  );
  const items = Array.isArray(data?.items) ? data.items : [];
  const pages = data ? Math.max(1, Math.ceil(data.total / (data.limit || PAGE_SIZE))) : 1;
  const counts: Partial<Record<View, number>> = data
    ? {
        ...data.statusCounts,
        open: (data.statusCounts?.Open || 0) + (data.statusCounts?.InProgress || 0),
        mine: data.mineOpen,
        unassigned: data.unassignedOpen,
      }
    : {};

  const select = (next: () => void) => {
    next();
    setPage(1);
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تیکت های پشتیبانی")}
          actions={
            hasAccess("Ticket", "write")
              ? [
                  {
                    title: ta("تیکت برای کاربر"),
                    icon: <PlusIcon />,
                    action: () =>
                      setPopup(
                        "OpenTicket",
                        <OpenTicketPopup
                          onCreated={(id) => push(adminPath(`/ticket/${id}`))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <div className={classes.stack}>
            <div className={classes.chips} role="tablist">
              {views.map((v) => (
                <button
                  key={v.view}
                  type="button"
                  role="tab"
                  aria-selected={view === v.view}
                  className={`${classes.chip} ${view === v.view ? classes.chipActive : ""}`}
                  onClick={() => select(() => setView(v.view))}
                >
                  <span>{v.title()}</span>
                  {counts[v.view] !== undefined && (
                    <span className={classes.chipCount}>{num.format(counts[v.view] || 0)}</span>
                  )}
                </button>
              ))}
            </div>
            <div className={classes.toolbar}>
              <input
                className={classes.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ta("جستجو با عنوان یا موبایل کاربر...")}
              />
              <select
                className={classes.select}
                aria-label={ta("اولویت")}
                value={priority}
                onChange={(e) => select(() => setPriority(e.target.value as TicketPriority | ""))}
              >
                <option value="">{ta("همه‌ی اولویت‌ها")}</option>
                {ticketPriorities.map((p) => (
                  <option key={p} value={p}>
                    {ticketPriorityDict[p]}
                  </option>
                ))}
              </select>
              {view !== "mine" && view !== "unassigned" && (
                <select
                  className={classes.select}
                  aria-label={ta("مسئول")}
                  value={assignee}
                  onChange={(e) => select(() => setAssignee(e.target.value))}
                >
                  <option value="">{ta("همه‌ی مسئولان")}</option>
                  <option value="none">{ta("بدون مسئول")}</option>
                  {(Array.isArray(staff) ? staff : []).map((s) => (
                    <option key={s._id} value={s._id}>
                      {supportUserLabel(s)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Table
              data={items}
              name="AdminManageTickets"
              renderer={{
                title: {
                  name: ta("عنوان"),
                  value: (node) => node.title,
                  component: (node) => (
                    <InlineLink href={adminPath(`/ticket/${node._id}`)}>
                      {node.title || ta("بدون عنوان")}
                    </InlineLink>
                  ),
                },
                waiting: {
                  name: ta("منتظر"),
                  value: (node) =>
                    node.overdue ? ta("دیرکرد") : node.waitingOn === "support" ? ta("پشتیبانی") : node.waitingOn === "user" ? ta("کاربر") : "",
                  component: (node) => <WaitingBadge timing={node} />,
                },
                priority: {
                  name: ta("اولویت"),
                  value: (node) => ticketPriorityDict[node.priority] || node.priority,
                  component: (node) => <PriorityBadge priority={node.priority} />,
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => ticketStatusDict[node.status] || node.status,
                },
                assignee: {
                  name: ta("مسئول"),
                  value: (node) => (node.assignee ? supportUserLabel(node.assignee) : ta("بدون مسئول")),
                },
                submittedBy: {
                  name: ta("کاربر"),
                  value: (node) => supportUserLabel(node.submittedBy),
                  component: (node) =>
                    node.submittedBy?._id ? (
                      <InlineLink href={adminPath(`/user/${node.submittedBy._id}`)}>
                        {supportUserLabel(node.submittedBy)}
                      </InlineLink>
                    ) : (
                      "—"
                    ),
                },
                subject: {
                  name: ta("موضوع"),
                  value: (node) => ticketSubjectDict[node.subject] || node.subject,
                },
                age: {
                  name: ta("عمر تیکت"),
                  value: (node) => formatHours(node.ageHours || 0),
                },
                submittedAt: {
                  name: ta("زمان ثبت"),
                  value: (node) => new Date(node.submittedAt),
                },
                actions: {
                  name: ta("عملیات"),
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        href={adminPath(`/ticket/${node._id}`)}
                        variant="Info"
                        title={ta("مشاهده و پاسخ")}
                      >
                        <EditIcon />
                      </IconLink>
                    </TableActions>
                  ),
                },
              }}
            />
            {pages > 1 && (
              <div className={classes.pager}>
                <Button
                  size="S"
                  variant={page <= 1 ? "Disable" : "Neutral"}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {ta("قبلی")}
                </Button>
                <span>{ta("صفحه‌ی ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
                <Button
                  size="S"
                  variant={page >= pages ? "Disable" : "Neutral"}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  {ta("بعدی")}
                </Button>
              </div>
            )}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageTicketsPage;
