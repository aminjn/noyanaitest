"use client";

import { API } from "@/Components/config";
import { ICallRoom } from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import CreateCallPopup from "./CreateCallPopup";
import DestroyCallPopup from "./DestroyCallPopup";

const AdminManageCallRoomsPage = () => {
  const { data, error, mutate } = useSWR<ICallRoom<{ participants: true }>[]>(
    `${API}/auto/callroom`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="مکالمات"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup("CreateCall", <CreateCallPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            name="AdminManageCallRooms"
            data={data}
            renderer={{
              startedAt: {
                name: "زمان ایجاد",
                value: (node) => new Date(node.startedAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.startedAt} />,
              },
              partyA: {
                name: "A Party",
                value: (node) => node.participants[0]?.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink
                    href={adminPath(`/user/${node.participants[0]?._id}`)}
                  >
                    {node.participants[0]?.phone || node.participants[0]?._id}
                  </InlineLink>
                ),
              },
              partyB: {
                name: "B Party",
                filter: "Text",
                value: (node) => node.participants[0]?.phone,
                component: (node) => (
                  <InlineLink
                    href={adminPath(`/user/${node.participants[1]?._id}`)}
                  >
                    {node.participants[1]?.phone || node.participants[1]?._id}
                  </InlineLink>
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                    variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DestroyCall",
                          <DestroyCallPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
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
