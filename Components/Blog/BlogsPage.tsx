"use client";

import { useParams, useSearchParams } from "next/navigation";
import { IBlog, IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogsPage.module.css";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useProgress from "../Hooks/useProgress";
import SelectInput from "../UI/SelectInput";
import BlogMainCard from "./BlogMainCard";
import BreadCrump from "../UI/BreadCrump";

export type BlogsPageProps = {
  blogs?: IBlog[];
  categories?: IBlogCategory[];
  blogsCount?: number;
};

const blogSorts = ["order", "date"] as const;

type BlogSort = (typeof blogSorts)[number];

const blogSortDict: Record<BlogSort, string> = {
  date: "تاریخ انتشار",
  order: "پیش فرض",
};

const BlogsPage = (props: BlogsPageProps) => {
  const searchParams = useSearchParams();
  const params = useParams<{ nodeSlug?: string; page?: string }>();
  const [sort] = useState<string | null>(() => searchParams.get("sort"));

  const { data: clientData } = useSWR<BlogsPageProps>(
    params
      ? `${API}/public/blog?${
          params.nodeSlug ? `category=${params.nodeSlug}&` : ""
        }${params.page ? `page=${params.page}&` : ""}${
          sort ? `sort=${sort}` : ""
        }`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { blogs, blogsCount, categories } = useMemo<BlogsPageProps>(
    () => clientData || props,
    [props, clientData]
  );

  const push = useProgress();

  return (
    <div className={classes.main}>
      <BreadCrump
        className={classes.crump}
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: "بلاگ ها", target: "/mag" },
        ]}
      />
      <div className={classes.header}>
        <h1 className={classes.title}>مجله سلامت</h1>
        <div className={classes.criterias}>
          <SelectInput
            className={classes.criteria}
            title="دسته بندی ها"
            options={(categories || []).reduce(
              (acc, category) => ({
                ...acc,
                [category.slug || category._id]:
                  category.title || category.slug || category._id,
              }),
              {}
            )}
            defaultvalue={params.nodeSlug}
            onChange={(e) =>
              push(e.target.value ? `/mag/category/${e.target.value}` : "/mag")
            }
          />
          <SelectInput
            className={classes.criteria}
            title="مرتب سازی بر اساس"
            options={blogSortDict}
            defaultvalue={sort || undefined}
            onChange={(e) =>
              push(
                `/mag${params.nodeSlug ? `/category/${params.nodeSlug}` : ""}?${
                  e.target.value ? `sort=${e.target.value}` : ""
                }`
              )
            }
          />
        </div>
      </div>
      {!!blogs?.length ? (
        <ul className={classes.list}>
          {blogs.map((blog) => (
            <BlogMainCard key={blog._id} node={blog} />
          ))}
        </ul>
      ) : (
        <p>موردی یافت نشد</p>
      )}
    </div>
  );
};

export default BlogsPage;
