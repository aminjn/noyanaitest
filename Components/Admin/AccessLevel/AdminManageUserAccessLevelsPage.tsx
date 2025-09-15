"use client";

import useSWR from "swr";
import classes from "./AdminManageUserAccessLevelsPage.module.css";
import { IUserAccessLevel } from "./AccessLevelAdminsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RemoveAccessLevelUserPopup from "./RemoveAccessLevelUserPopup";
import InfoIcon from "@/Components/Icons/InfoIcon";
import ConnectAccessLevelToUserPopup from "./ConnectAccessLevelToUserPopup";

const AdminManageUserAccessLevelsPage = () => {
  const { data, error, mutate } = useSWR<
    IUserAccessLevel<{ AccessLevelPopulated: true; UserPopulated: true }>[]
  >(`${API}/auto/useraccesslevel`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="ادمین ها"
          actions={[
            {
              title: "جدید",
              icon: <InfoIcon />,
              action: () =>
                setPopup(
                  "ConnectAccessLevelToUser",
                  <ConnectAccessLevelToUserPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageUserAccessLevels"
            data={data}
            renderer={{
              accessLevel: {
                name: "سطح دسترسی",
                value: (node) =>
                  node.accessLevel?.name || node.accessLevel?._id,
                component: (node) =>
                  node.accessLevel ? (
                    <InlineLink
                      href={adminPath(`/accesslevel/${node.accessLevel._id}`)}
                    >
                      {node.accessLevel.name || node.accessLevel._id}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
                filter: "Multi",
              },
              user: {
                name: "کاربر",
                value: (node) => node.user.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {node.user.phone || node.user._id}
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
                          "RemoveAccessLevelUserPopup",
                          <RemoveAccessLevelUserPopup
                            permission={node}
                            mutate={mutate}
                          />
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

export default AdminManageUserAccessLevelsPage;
