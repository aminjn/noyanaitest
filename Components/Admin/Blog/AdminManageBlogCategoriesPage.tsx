"use client";

import useSWR from "swr";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import classes from "./AdminManageBlogCategoriesPage.module.css";
import { IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import NewBlogCategoryPopup from "./NewBlogCategoryPopup";
import HandleLoading from "../UI/HandleLoading";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteBlogCategoryPopup from "./DeleteBlogCategoryPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBlogCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IBlogCategory[]>(
    `${API}/auto/blogcategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دسته بندی مقالات")}
          actions={
            hasAccess("BlogCategory", "write")
              ? [
                  {
                    title: ta("جدید"),
                    action: () =>
                      setPopup(
                        "NewBlogCategory",
                        <NewBlogCategoryPopup mutate={mutate} />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            data={data}
            renderer={{
              title: {
                name: ta("عنوان"),
                filter: "Text",
                value: (node) => node.title,
                component: (node) => (
                  <InlineLink href={adminPath(`/blogcategory/${node._id}`)}>
                    {node.title}
                  </InlineLink>
                ),
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    mutate={mutate}
                    modelName="blogCategory"
                    _id={node._id}
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("BlogCategory", "readOne") && (
                      <IconLink
                        href={adminPath(`/blogcategory/${node._id}`)}
                        title={ta("ویرایش")}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("BlogCategory", "delete") && (
                      <IconButton
                        title={ta("حذف")}
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteBlogCategory",
                            <DeleteBlogCategoryPopup
                              node={node}
                              mutate={mutate}
                            />,
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
            name="AdminManageBlogCategories"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogCategoriesPage;
