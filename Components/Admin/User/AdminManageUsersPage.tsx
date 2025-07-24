"use client";
import useSWR from "swr";
import classes from "./AdminManageUsersPage.module.css";
import { IUser } from "@/Components/Hooks/useUser";
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

const AdminManageUsersPage = () => {
  const { data, error, mutate } = useSWR<IUser[]>(
    `${API}/auto/user`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="کابران">
          <Table
            data={data}
            name="AdminManageUsers"
            renderer={{
              phone: {
                name: "موبایل",
                value: (node) => node.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/user/${node._id}`)}>
                    {node.phone}
                  </InlineLink>
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/user/${node._id}`)}>
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

export default AdminManageUsersPage;
