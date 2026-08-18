"use client";

import useSWR from "swr";
import classes from "./AdminManageBlogsPage.module.css";
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
import FormatDate from "@/Components/UI/FormatDate";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DeleteBlogPopup from "./DeleteBlogPopup";

export interface IBlogCategory extends MongoDoc {
  title?: string;
  slug?: string;
  order: number;
}

type BlogPopulation = {
  CategoryPopulated?: boolean;
  RelatedPopulated?: boolean;
};

export interface IBlog<T extends BlogPopulation = BlogPopulation>
  extends MongoDoc {
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
  related: T["RelatedPopulated"] extends true ? IBlog[] : string[];
  thisWeekSpecial: boolean;
  home: boolean;
  published: boolean;
  category?: T["CategoryPopulated"] extends true ? IBlogCategory : string;
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
    IBlog<{ RelatedPopulated: true; CategoryPopulated: true }>[]
  >(`${API}/auto/blog`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
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
                        <CreateBlogPopup mutate={mutate} />
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
                    {node.title}
                  </InlineLink>
                ),
                filter: "Text",
              },
              summary: {
                name: "حلاصه",
                value: (node) => node.summary,
                filter: "Text",
              },
              publishedAt: {
                name: "تاریخ انتشار",
                value: (node) => node.publishedAt,
                component: (node) => <FormatDate value={node.publishedAt} />,
              },
              order: {
                name: "رتبه",
                filter: "Number",
                value: (node) => node.order,
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
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
              readTime: {
                name: "مدت زمان مطالعه",
                value: (node) => node.readTime,
                filter: "Multi",
              },
              related: {
                name: "مقالات مرتبط",
                component: (node) => (
                  <div className={classes.relateds}>
                    {node.related.map((el) => (
                      <InlineLink
                        key={el._id}
                        href={adminPath(`/blog/${el._id}`)}
                      >
                        {el.title || el._id}
                      </InlineLink>
                    ))}
                  </div>
                ),
              },
              thisWeekSpecial: {
                name: "مطالب ویژه این هفته",
                filter: "Set",
                value: (node) => booleanToValue[`${node.thisWeekSpecial}`],
                component: (node) => (
                  <BooleanToIcon value={node.thisWeekSpecial} />
                ),
              },
              home: {
                name: "نمایش در خانه",
                filter: "Set",
                value: (node) => booleanToValue[`${node.home}`],
                component: (node) => <BooleanToIcon value={node.home} />,
              },
              published: {
                name: "منتشر شده",
                value: (node) => booleanToValue[`${node.published}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.published} />,
              },
              category: {
                name: "دسته بندی",
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
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("Blog", "readOne") && (
                      <IconLink href={adminPath(`/blog/${node._id}`)}>
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Blog", "delete") && (
                      <IconButton
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteBlog",
                            <DeleteBlogPopup node={node} mutate={mutate} />
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
