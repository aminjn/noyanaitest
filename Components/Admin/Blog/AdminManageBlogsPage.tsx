"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { MongoDoc } from "@/Components/Hooks/useUser";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateBlogPopup from "./CreateBlogPopup";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DeleteBlogPopup from "./DeleteBlogPopup";
import OrderEditor from "../UI/OrderEditor";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  BlogTagPopulation,
  IBlogTag,
} from "../BlogTag/AdminManageBlogTgasPage";

export type BlogCategoryPopulation = Population<Record<never, never>>;

export interface IBlogCategory<
  T extends BlogCategoryPopulation = BlogCategoryPopulation,
> extends MongoDoc {
  title?: string;
  slug?: string;
  order: number;
}

type BlogPopulation = Population<{
  CategoryPopulated?: BlogCategoryPopulation;
  RelatedPopulated?: BlogPopulation;
  Tags: BlogTagPopulation;
}>;

export interface IBlog<
  T extends BlogPopulation = BlogPopulation,
> extends MongoDoc {
  image?: string;
  title?: string;
  summary?: string;
  publishedAt: Date;
  order: number;
  slug?: string;
  content?: string;
  author?: string;
  // Set when this post was submitted by an organization panel (doctor/
  // clinic/pharmacy/insurance/paraClinic) instead of written by an admin.
  // Those posts always come in unpublished and stay that way until an admin
  // reviews and publishes them here.
  authorType?: "doctor" | "clinic" | "pharmacy" | "insurance" | "paraClinic";
  readTime?: string;
  related: T["RelatedPopulated"] extends BlogPopulation ? IBlog[] : string[];
  thisWeekSpecial: boolean;
  home: boolean;
  published: boolean;
  category?: T["CategoryPopulated"] extends BlogCategoryPopulation
    ? IBlogCategory<T["CategoryPopulated"]>
    : string;
  recommended: boolean;
  chosen: boolean;
  tags: T["Tags"] extends BlogTagPopulation ? IBlogTag<T["Tags"]>[] : string[];
}

const authorTypeLabels: Record<string, string> = {
  doctor: "پزشک",
  clinic: "کلینیک",
  pharmacy: "داروخانه",
  insurance: "بیمه",
  paraClinic: "پاراکلینیک",
};

const AdminManageBlogsPage = () => {
  const { data, error, mutate } = useSWR<
    IBlog<{
      RelatedPopulated: Record<never, never>;
      CategoryPopulated: Record<never, never>;
    }>[]
  >(`${API}/auto/blog`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const hasAccess = useAccessLevel();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="مقالات"
          actions={
            hasAccess("Blog", "write")
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup(
                        "CreateBlog",
                        <CreateBlogPopup mutate={mutate} />,
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
                value: (node) => node.title,
                component: (node) => (
                  <InlineLink href={adminPath(`/blog/${node._id}`)}>
                    {node.title || "—"}
                  </InlineLink>
                ),
                filter: "Text",
              },
              published: {
                name: "انتشار",
                value: (node) => booleanToValue[`${node.published}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.published} />,
              },
              category: {
                name: "دسته‌بندی",
                value: (node) =>
                  node.category?.title || node.category?._id || "ندارد",
                filter: "Multi",
                component: (node) =>
                  node.category ? (
                    <InlineLink
                      href={adminPath(`/blogcategory/${node.category._id}`)}
                    >
                      {node.category.title || node.category._id}
                    </InlineLink>
                  ) : (
                    "ندارد"
                  ),
              },
              author: {
                name: "نویسنده",
                value: (node) => node.author,
                filter: "Multi",
              },
              authorType: {
                name: "منبع",
                value: (node) =>
                  node.authorType
                    ? authorTypeLabels[node.authorType] || node.authorType
                    : "ادمین",
                filter: "Set",
              },
              publishedAt: {
                name: "تاریخ انتشار",
                value: (node) =>
                  node.publishedAt ? new Date(node.publishedAt) : undefined,
                filter: "Date",
              },
              order: {
                name: "رتبه",
                filter: "Number",
                value: (node) => node.order,
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="blog"
                    mutate={mutate}
                    value={node.order}
                  />
                ),
              },
              home: {
                name: "نمایش در خانه",
                filter: "Set",
                value: (node) => booleanToValue[`${node.home}`],
                component: (node) => <BooleanToIcon value={node.home} />,
              },
              thisWeekSpecial: {
                name: "ویژه هفته",
                filter: "Set",
                value: (node) => booleanToValue[`${node.thisWeekSpecial}`],
                component: (node) => (
                  <BooleanToIcon value={node.thisWeekSpecial} />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("Blog", "readOne") && (
                      <IconLink
                        href={adminPath(`/blog/${node._id}`)}
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Blog", "delete") && (
                      <IconButton
                        variant="Danger"
                        title="حذف"
                        onClick={() =>
                          setPopup(
                            "DeleteBlog",
                            <DeleteBlogPopup node={node} mutate={mutate} />,
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
            name="AdminManageBlogs"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBlogsPage;
