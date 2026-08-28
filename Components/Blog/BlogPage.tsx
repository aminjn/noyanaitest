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
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import UserIcon from "../Icons/UserIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import ClockIcon from "../Icons/ClockIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import { getRelativeTime } from "../helpers/lib";
import HostedImage from "../UI/HostedImage";
import CommentSection from "../Comment/CommentSection";
import {
  t2xsMedium,
  tsmDemiBold,
  tsmMedium,
  txsRegular,
} from "../UI/Typography";
import { WithStyleProps } from "../Layout/Layout";

export type BlogPageProps = {
  blog?: IBlog<{
    RelatedPopulated: Record<never, never>;
    CategoryPopulated: Record<never, never>;
    Tags: Record<never, never>;
  }>;
  thisWeek?: IBlog[];
};
const Side = ({ className = "", style }: WithStyleProps) => {
  const getContent = useScopedLocale(["common"]);

  return (
    <div className={`${classes.side} ${className}`} style={style}>
      <div className={classes.bookBox}>
        <h4 className={`${classes.bookTitle} ${tsmMedium}`}>
          {getContent("onlineConsult")}
        </h4>
        <legend className={`${classes.bookLegend} ${txsRegular}`}>
          {getContent("blogBookLegend")}
        </legend>
        <Button href="/book" variant="Error" size="M" radius="High" mode="Fill">
          {getContent("bookReservation")}
        </Button>
      </div>
    </div>
  );
};

const BlogPage = (props: BlogPageProps) => {
  const params = useParams<{ blogSlug: string }>();
  const { data: clientData } = useSWR(
    params ? `${API}/public/blog/${params.blogSlug}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const pathname = usePathname();

  const { blog, thisWeek } = useMemo<BlogPageProps>(
    () => clientData || props,
    [clientData, props],
  );

  console.log(blog);

  const getContent = useScopedLocale(["common"]);

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
      <div className={classes.wrap}>
        <div className={classes.main}>
          <div className={classes.intro}>
            {!!blog.category && (
              <Badge
                color="Error"
                mode="Fill"
                radius="High"
                size="XXL"
                className={classes.category}
              >
                {blog.category.title}
              </Badge>
            )}
            <h1 className={`${classes.h1} ${t2xsMedium}`}>{blog.title}</h1>
            <div className={classes.details}>
              <div className={`${classes.author} ${tsmDemiBold}`}>
                <Ixon width="3rem">
                  <UserIcon />
                </Ixon>
                <span>{getContent("noyan")}</span>
              </div>
              <div className={`${classes.more} ${txsRegular}`}>
                {!!blog.readTime && (
                  <div className={classes.withIcon}>
                    <Ixon width=".875rem">
                      <ClockIcon />
                    </Ixon>
                    <span>{blog.readTime}</span>
                  </div>
                )}
                <div className={classes.withIcon}>
                  <Ixon width=".875rem">
                    <CalendarIcon />
                  </Ixon>
                  <span>{getRelativeTime(new Date(blog.publishedAt))}</span>
                </div>
              </div>
            </div>
            <div className={classes.image}>
              <HostedImage
                src={blog.image}
                alt={blog.title}
                fill
                sizes="51rem"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={classes.shareBox}>
              <Button
                size="S"
                tailIcon={<ShareIcon />}
                variant="Neutral"
                mode="Fill"
                radius="High"
              >
                {getContent("share")}
              </Button>
            </div>
            <div className={classes.content}>
              <RenderRtf value={blog.content} />
            </div>
            {!!blog.tags.length && (
              <div className={classes.tags}>
                <span className={classes.tagsList}>{getContent("tags")}</span>
                <div className={classes.tagList}>
                  {blog.tags.map((tag) => (
                    <Badge
                      key={tag._id}
                      color="Primarylight"
                      mode="Fill"
                      size="XXL"
                      radius="High"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Side className={classes.mobileOnly} />
            <CommentSection model="Blog" nodeId={blog._id} />
          </div>
        </div>
        <Side className={classes.desktopOnly} />
      </div>
    </div>
  );
};

export default BlogPage;
