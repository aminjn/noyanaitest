"use client";

import { useParams, useSearchParams } from "next/navigation";
import { IBlog, IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogsPage.module.css";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useProgress from "../Hooks/useProgress";
import SelectInput from "../UI/SelectInput";
import BlogMainCard from "./BlogMainCard";
import BreadCrump from "../UI/BreadCrump";
import BlogsSearch from "./BlogsSearch";
import BlogsChosen from "./BlogsChosen";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ListPageList from "../UI/ListPage/ListPageList";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tbaseMedium } from "../UI/Typography";
import BlogsMostViewed from "./BlogsMostViewed";
import { IBlogTag } from "../Admin/BlogTag/AdminManageBlogTgasPage";
import BlogsHotTags from "./BlogsHotTags";
import BlogsRRS from "./BlogsRRS";
import { ContentKey } from "../Enums/contentKeys";

const NS: ContentNamespace[] = ["common", "mag"];

export type BlogsPageProps = {
  blogs?: IBlog[];
  categories?: IBlogCategory[];
  blogsCount?: number;
  pagesCount: number;
  recommended?: IBlog[];
  chosen?: IBlog<{ CategoryPopulated: Record<never, never> }>[];
  mostViewed: IBlog[];
  hotTags: IBlogTag[];
};

const blogSorts = ["order", "date"] as const;

type BlogSort = (typeof blogSorts)[number];

const blogSortDict: Record<BlogSort, ContentKey> = {
  date: "publicationDate",
  order: "isDefault",
};

const sorts = ["best", "newest"] as const;

type Sort = (typeof sorts)[number];

const sortContentKeyDict: Record<Sort, ContentKey> = {
  best: "mostPopular",
  newest: "mostRecent",
};

const BlogsPage = (props: BlogsPageProps) => {
  const searchParams = useSearchParams();
  const params = useParams<{ nodeSlug?: string; page?: string }>();
  const [currentSort, setCurrentSort] = useState<Sort>(
    () => sorts.find((el) => el === searchParams.get("sort")) || "newest",
  );

  const { blogs, blogsCount, categories } = useMemo<BlogsPageProps>(
    () => props,
    [props],
  );

  useEffect(() => {
    setCurrentSort(
      sorts.find((el) => el === searchParams.get("sort")) || "newest",
    );
  }, [searchParams]);

  const getContent = useScopedLocale(NS);

  const push = useProgress();

  return (
    <div className={classes.main}>
      <BreadCrump
        className={classes.crump}
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("blog"), target: "/mag" },
          ...(params.nodeSlug
            ? [
                {
                  title: decodeURIComponent(
                    categories?.find(
                      (c) => (c.slug || c._id) === params.nodeSlug,
                    )?.title || params.nodeSlug,
                  ),
                  target: `/mag/category/${params.nodeSlug}`,
                },
              ]
            : []),
        ]}
      />
      <BlogsSearch recommended={props.recommended} />
      <BlogsChosen nodes={props.chosen} />
      <div className={classes.content}>
        <div className={classes.listBox}>
          <ListPageCategorySelector
            basePath="/mag"
            categories={props.categories || []}
            noIcon
          />
          <div className={classes.header}>
            <span className={`${classes.titleBox} ${tbaseMedium}`}>
              <span className={classes.title}>{getContent("allArticles")}</span>
              <span className={classes.count}>{`(${props.blogsCount})`}</span>
            </span>
            <div className={classes.sortBox}>
              {sorts.map((sort) => (
                <button
                  key={sort}
                  className={`${classes.sort} ${tbaseMedium} ${sort === currentSort ? classes.activeSort : ""}`}
                  onClick={() => {
                    const params = new URLSearchParams();
                    const category = searchParams.get("category");
                    if (category) params.append("category", category);
                    params.append("sort", sort);
                    push(`/mag?${params.toString()}`);
                  }}
                >
                  {getContent(sortContentKeyDict[sort])}
                </button>
              ))}
            </div>
          </div>
          <ListPageList
            itemWidth="24rem"
            pagination={{
              makePath: (page) => {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                const sort = searchParams.get("sort");
                if (sort) params.append("sort", sort);
                const category = searchParams.get("category");
                if (category) params.append("category", category);
                const search = searchParams.get("search");
                if (search) params.append("search", search);
                const tag = searchParams.get("tag");
                if (tag) params.append("tag", tag);
                return `/mag?${params.toString()}`;
              },
              currentPage: Number(searchParams.get("page")) || 1,
              pagesCount: props.pagesCount,
            }}
          >
            {props.blogs?.map((node) => (
              <BlogMainCard key={node._id} node={node} />
            ))}
          </ListPageList>
        </div>
        <div className={classes.side}>
          <BlogsMostViewed nodes={props.mostViewed} />
          <BlogsHotTags nodes={props.hotTags} />
          <BlogsRRS />
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
