"use client";
import useSWR from "swr";
import {
  ITicket,
  ticketStatusDict,
  ticketSubjectDict,
} from "@/Components/Dashboard/Support/SupportPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

export type AdminTicket = ITicket<{ SubmittedBy: Record<never, never> }>;

const AdminManageTicketsPage = () => {
  const { data, error } = useSWR<AdminTicket[]>(
    `${API}/auto/ticket`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تیکت های پشتیبانی")}>
          <Table
            data={data}
            name="AdminManageTickets"
            renderer={{
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => ticketStatusDict[node.status],
                filter: "Set",
              },
              subject: {
                name: ta("موضوع"),
                value: (node) => ticketSubjectDict[node.subject],
                filter: "Set",
              },
              submittedBy: {
                name: ta("کاربر"),
                value: (node) => node.submittedBy?.phone,
                filter: "Text",
                component: (node) =>
                  node.submittedBy ? (
                    <InlineLink
                      href={adminPath(`/user/${node.submittedBy._id}`)}
                    >
                      {node.submittedBy.phone || node.submittedBy._id}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              submittedAt: {
                name: ta("زمان ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
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
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageTicketsPage;
