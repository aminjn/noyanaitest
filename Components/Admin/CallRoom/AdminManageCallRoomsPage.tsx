"use client";

import { API } from "@/Components/config";
import {
  callTypeDict,
  ICallRoom,
} from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import usePopup from "@/Components/Hooks/usePopup";
import CreateCallPopup from "./CreateCallPopup";
import DestroyCallPopup from "./DestroyCallPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageCallRoomsPage = () => {
  const { data, error, mutate } = useSWR<ICallRoom<{ participants: true }>[]>(
    `${API}/auto/callroom`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("مکالمات")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup("CreateCall", <CreateCallPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            name="AdminManageCallRooms"
            data={data}
            renderer={{
              partyA: {
                name: ta("طرف اول"),
                value: (node) => node.participants?.[0]?.phone,
                filter: "Text",
                component: (node) => {
                  const party = node.participants?.[0];
                  if (!party) return "—";
                  return (
                    <InlineLink href={adminPath(`/user/${party._id}`)}>
                      {party.phone || party._id}
                    </InlineLink>
                  );
                },
              },
              partyB: {
                name: ta("طرف دوم"),
                value: (node) => node.participants?.[1]?.phone,
                filter: "Text",
                component: (node) => {
                  const party = node.participants?.[1];
                  if (!party) return "—";
                  return (
                    <InlineLink href={adminPath(`/user/${party._id}`)}>
                      {party.phone || party._id}
                    </InlineLink>
                  );
                },
              },
              callType: {
                name: ta("نوع تماس"),
                value: (node) => callTypeDict[node.callType],
                filter: "Set",
              },
              startedAt: {
                name: ta("شروع تماس"),
                value: (node) =>
                  node.startedAt ? new Date(node.startedAt) : undefined,
                filter: "Date",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) =>
                  ({
                    ringing: ta("در حال زنگ"),
                    ongoing: ta("در جریان"),
                    ended: ta("پایان‌یافته"),
                    cancelled: ta("لغو شده"),
                  })[node.status || ""] ||
                  node.status ||
                  "—",
                filter: "Set",
              },
              endedAt: {
                name: ta("پایان تماس"),
                value: (node) =>
                  node.endedAt ? new Date(node.endedAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {(node.status === "ringing" ||
                      node.status === "ongoing") && (
                      <IconButton
                        title={ta("پایان تماس")}
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DestroyCall",
                            <DestroyCallPopup node={node} mutate={mutate} />,
                          )
                        }
                      >
                        <XMarkIcon />
                      </IconButton>
                    )}
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

export default AdminManageCallRoomsPage;
