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

export type AdminTicket = ITicket<{ SubmittedBy: Record<never, never> }>;

const AdminManageTicketsPage = () => {
  const { data, error } = useSWR<AdminTicket[]>(
    `${API}/auto/ticket`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="تیکت های پشتیبانی">
          <Table
            data={data}
            name="AdminManageTickets"
            renderer={{
              title: {
                name: "عنوان",
                value: (node) => node.title,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => ticketStatusDict[node.status],
                filter: "Set",
              },
              subject: {
                name: "موضوع",
                value: (node) => ticketSubjectDict[node.subject],
                filter: "Set",
              },
              submittedBy: {
                name: "کاربر",
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
                name: "زمان ثبت",
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/ticket/${node._id}`)}
                      variant="Info"
                      title="مشاهده و پاسخ"
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
