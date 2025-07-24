"use client";

import useSWR from "swr";
import { MongoDoc } from "../Hooks/useUser";
import classes from "./AdminManageBlogMediasPage.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import WithTitle from "../Admin/UI/WithTitle";
import usePopup from "../Hooks/usePopup";
import CreateBlogMediaPopup from "./CreateBlogMediaPopup";
import Table from "../Admin/UI/Table";
import InlineLink from "../Admin/UI/InlineLink";
import { adminPath } from "../helpers/adminPath";
import FormatDate from "../UI/FormatDate";
import TableActions from "../Admin/UI/TableActions";
import IconLink from "../Admin/UI/IconLink";
import EditIcon from "../Icons/EditIcon";
import IconButton from "../Admin/UI/IconButton";
import Garbageicon from "../Icons/GarbageIcon";
import DeleteBlogMediaPopup from "./DeleteBlogMediaPopup";

export interface IBlogMedia extends MongoDoc {
  name?: string;
  file?: string;
  createdAt: Date;
}

const AdminManageBlogMediasPage = () => {
  const { data, error, mutate } = useSWR<IBlogMedia[]>(
    `${API}/auto/blogmedia`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="مولتی مدیا وبلاگ"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateBlogMedia",
                  <CreateBlogMediaPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            renderer={{
              name: {
                name: "نام",
                value: (node) => node.name,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/blogmedia/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
              },
              createdAt: {
                name: "تاریخ ایجاد",
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/blogmedia/${node._id}`)}
                      variant="Info"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteBlogMedia",
                          <DeleteBlogMediaPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <Garbageicon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
            name="AdminManageBlogMedias"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogMediasPage;
