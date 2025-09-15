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

const AdminManageBlogCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IBlogCategory[]>(
    `${API}/auto/blogcategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی مقالات"
          actions={
            hasAccess("BlogCategory", "write")
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup(
                        "NewBlogCategory",
                        <NewBlogCategoryPopup mutate={mutate} />
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
                name: "عنوان",
                filter: "Text",
                value: (node) => node.title,
                component: (node) => (
                  <InlineLink href={adminPath(`/blogcategory/${node._id}`)}>
                    {node.title}
                  </InlineLink>
                ),
              },
              slug: {
                name: "اسلاگ",
                filter: "Text",
                value: (node) => node.slug,
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("BlogCategory", "readOne") && (
                      <IconLink href={adminPath(`/blogcategory/${node._id}`)}>
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("BlogCategory", "delete") && (
                      <IconButton
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteBlogCategory",
                            <DeleteBlogCategoryPopup
                              node={node}
                              mutate={mutate}
                            />
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
