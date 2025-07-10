"use client";

import useSWR from "swr";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogPage.module.css";
import { API } from "../config";
import { useParams, usePathname } from "next/navigation";
import { fetcher } from "../helpers/fetcher";
import { useMemo } from "react";
import BreadCrump from "../UI/BreadCrump";
import RenderRtf from "../UI/RenderRtf";
import BlogCardRelated from "./BlogCardRelated";
import BlogCardWeek from "./BlogCardWeek";
import Button from "../UI/Button";
import ShareIcon from "../Icons/ShareIcon";
import CopyIcon from "../Icons/CopyIcon";
import { useClipboard } from "../Hooks/useClipboard";

export type BlogPageProps = {
  blog?: IBlog<{ RelatedPopulated: true }>;
  thisWeek?: IBlog[];
};

const BlogPage = (props: BlogPageProps) => {
  const params = useParams<{ blogSlug: string }>();
  const { data: clientData } = useSWR(
    params ? `${API}/public/blog/${params.blogSlug}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const pathname = usePathname();

  const { blog, thisWeek } = useMemo<BlogPageProps>(
    () => clientData || props,
    [clientData, props]
  );

  const copyTextToClipboard = useClipboard();

  if (!blog) return null;
  return (
    <div className={classes.container}>
      <BreadCrump
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: "بلاگ ها", target: "/mag" },
          {
            title: blog.title || blog._id,
            target: `/mag/${blog.slug || blog._id}`,
          },
        ]}
        className={classes.crump}
      />
      <h1 className={classes.title}>{blog.title}</h1>
      <div className={classes.main}>
        <article className={classes.content}>
          <div className={classes.rtf}>
            <RenderRtf value={blog.content} />
          </div>
          <div className={classes.footer}>
            <div className={classes.meta}>
              {!!blog.author && <span>{blog.author}</span>}
              {!!blog.publishedAt && (
                <span>
                  {new Date(blog.publishedAt).toLocaleDateString("fa-IR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {!!blog.readTime && <span>{blog.readTime}</span>}
            </div>
            <div className={classes.actions}>
              <Button
                variant="Naked"
                leadIcon={<CopyIcon />}
                onClick={() => copyTextToClipboard(window.location.href)}
              >
                کپی لینک پست
              </Button>
              {!!navigator.share && (
                <Button
                  variant="Black"
                  leadIcon={<ShareIcon />}
                  onClick={() => navigator.share({ url: window.location.href })}
                >
                  اشتراک گذاری
                </Button>
              )}
            </div>
          </div>
        </article>
        {(!!blog.related.length || !!thisWeek?.length) && (
          <aside className={classes.sides}>
            {!!blog.related.length && (
              <div className={classes.side}>
                <h2 className={classes.sideTitle}>مقالات مرتبط</h2>
                <ul className={classes.sideList}>
                  {blog.related.map((node) => (
                    <BlogCardRelated key={node._id} node={node} />
                  ))}
                </ul>
              </div>
            )}
            {!!thisWeek?.length && (
              <div className={classes.side}>
                <h2 className={classes.sideTitle}>مطالب برگزیده هفته</h2>
                <ul className={classes.sideList}>
                  {thisWeek.map((node) => (
                    <BlogCardWeek key={node._id} node={node} />
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
