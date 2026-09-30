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
import GarbageIcon from "../Icons/GarbageIcon";
import DeleteBlogMediaPopup from "./DeleteBlogMediaPopup";
import useAccessLevel from "../Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

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

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("مولتی مدیا وبلاگ")}
          actions={
            hasAccess("BlogMedia", "write")
              ? [
                  {
                    title: ta("جدید"),
                    action: () =>
                      setPopup(
                        "CreateBlogMedia",
                        <CreateBlogMediaPopup mutate={mutate} />
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                value: (node) => node.name,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/blogmedia/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
              },
              createdAt: {
                name: ta("تاریخ ایجاد"),
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("BlogMedia", "readOne") && (
                      <IconLink
                        href={adminPath(`/blogmedia/${node._id}`)}
                        variant="Info"
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("BlogMedia", "delete") && (
                      <IconButton
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteBlogMedia",
                            <DeleteBlogMediaPopup node={node} mutate={mutate} />
                          )
                        }
                      >
                        <GarbageIcon />
                      </IconButton>
                    )}
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
