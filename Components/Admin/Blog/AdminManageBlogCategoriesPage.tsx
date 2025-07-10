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
import Garbageicon from "@/Components/Icons/GarbageIcon";
import DeleteBlogCategoryPopup from "./DeleteBlogCategoryPopup";

const AdminManageBlogCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IBlogCategory[]>(
    `${API}/auto/blogcategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی مقالات"
          actions={[
            {
              title: "جدید",
              action: () => setPopup(<NewBlogCategoryPopup mutate={mutate} />),
            },
          ]}
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
                    <IconLink href={adminPath(`/blogcategory/${node._id}`)}>
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          <DeleteBlogCategoryPopup
                            node={node}
                            mutate={mutate}
                          />
                        )
                      }
                    >
                      <Garbageicon />
                    </IconButton>
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
