"use client";

import useSWR from "swr";
import useReadTime from "./useReadTime";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogPage.module.css";
import { API } from "../config";
import { useParams } from "next/navigation";
import { fetcher } from "../helpers/fetcher";
import { useEffect, useMemo, useRef, useState } from "react";
import BreadCrump from "../UI/BreadCrump";
import RenderRtf from "../UI/RenderRtf";
import BlogMainCard from "./BlogMainCard";
import BlogsCta from "./BlogsCta";
import BlogsCategories, { BlogCategoryCount } from "./BlogsCategories";
import BlogsMostViewed from "./BlogsMostViewed";
import { normalizeArticle } from "./normalizeArticle";
import Link from "@/Components/i18n/Link";
import CopyIcon from "../Icons/CopyIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import WhatsappIcon from "../Icons/WhatsappIcon";
import ClockIcon from "../Icons/ClockIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import { useClipboard } from "../Hooks/useClipboard";
import Ixon from "../UI/Ixon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import HostedImage from "../UI/HostedImage";
import FormatDate from "../UI/FormatDate";
import CommentSection from "../Comment/CommentSection";
import {
  t3xlBold,
  tlgBold,
  tmdBold,
  tmdRegular,
  tsmDemiBold,
  tsmMedium,
  txsRegular,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "magPost"];

export type BlogPageProps = {
  blog?: IBlog<{
    RelatedPopulated: Record<never, never>;
    CategoryPopulated: Record<never, never>;
    Tags: Record<never, never>;
  }>;
  thisWeek?: IBlog[];
  categoryCounts?: BlogCategoryCount[];
  mostViewed?: IBlog[];
};

type TocItem = { id: string; text: string; level: number };

// The article page (2026-10 redesign, after Healthline's and Paziresh24's
// magazine): a reading progress bar; the category, a large title, the
// summary as a lead and the byline; the cover; the text in a readable
// column with, beside it, the table of contents (built from the article's
// own headings), the way to a doctor and this week's picks; then the
// medical disclaimer, the tags, related articles and the comments.
const BlogPage = (props: BlogPageProps) => {
  const params = useParams<{ blogSlug: string }>();
  const { data: clientData } = useSWR(
    params ? `${API}/public/blog/${params.blogSlug}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { blog, thisWeek, categoryCounts, mostViewed } = useMemo<BlogPageProps>(
    () => clientData || props,
    [clientData, props],
  );

  // imported posts read cleanly: no empty-paragraph gaps, the page's own
  // typography, their title lines as headings (Components/Blog/normalizeArticle)
  const content = useMemo(() => normalizeArticle(blog?.content), [blog?.content]);

  const getContent = useScopedLocale(NS);
  const readTime = useReadTime();
  const copyTextToClipboard = useClipboard();

  // the table of contents: the article's own h2 / h3, once it is drawn
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll("h2, h3")) as HTMLElement[];
    const items = headings
      .map((h, i) => {
        if (!h.id) h.id = `section-${i + 1}`;
        return { id: h.id, text: (h.textContent || "").trim(), level: h.tagName === "H3" ? 3 : 2 };
      })
      .filter((item) => item.text);
    setToc(items);
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (seen.length) setActive(seen[0]);
      },
      { rootMargin: "-90px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [blog?._id, content]);

  // how far the reader is in the article
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-rect.top + window.innerHeight * 0.3, 0), Math.max(total, 1));
      setProgress(total > 0 ? done / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [blog?._id]);

  if (!blog) return null;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const time = readTime(blog);
  const related = (Array.isArray(blog.related) ? blog.related : []).filter((r) => r && typeof r === "object");
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const week = (Array.isArray(thisWeek) ? thisWeek : []).filter((w) => w && w._id !== blog._id).slice(0, 4);
  const authorName = blog.author || getContent("noyan");

  return (
    <div className={classes.container}>
      <div className={classes.progress} style={{ transform: `scaleX(${progress})` }} aria-hidden />
      <BreadCrump
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("blog"), target: "/mag" },
          {
            title: blog.title || blog._id,
            target: `/mag/${blog.slug || blog._id}`,
          },
        ]}
        className={classes.crump}
      />
      <header className={classes.header}>
        {!!blog.category && (
          <Link
            href={`/mag?category=${encodeURIComponent(blog.category.slug || blog.category._id)}`}
            className={`${classes.category} ${tsmDemiBold}`}
          >
            {blog.category.title}
          </Link>
        )}
        <h1 className={`${classes.h1} ${t3xlBold}`}>{blog.title}</h1>
        {!!blog.summary && <p className={`${classes.lead} ${tmdRegular}`}>{blog.summary}</p>}
        <div className={classes.meta}>
          <div className={classes.byline}>
            <span className={`${classes.avatar} ${tsmDemiBold}`} aria-hidden>
              {authorName.replace(/^(دکتر|Dr\.?)\s+/i, "").trim().charAt(0)}
            </span>
            <span className={`${classes.author} ${tsmDemiBold}`}>{authorName}</span>
            <span className={`${classes.facts} ${txsRegular}`}>
              {!!blog.publishedAt && (
                <span className={classes.fact}>
                  <Ixon width=".85rem">
                    <CalendarIcon />
                  </Ixon>
                  <FormatDate value={blog.publishedAt} time={false} />
                </span>
              )}
              {!!time && (
                <span className={classes.fact}>
                  <Ixon width=".85rem">
                    <ClockIcon />
                  </Ixon>
                  {time}
                </span>
              )}
            </span>
          </div>
          <div className={classes.share} aria-label={getContent("share")}>
            <button type="button" className={classes.shareBtn} title={getContent("magCopyLink")} onClick={() => copyTextToClipboard(pageUrl)}>
              <Ixon width="1rem">
                <CopyIcon />
              </Ixon>
            </button>
            <a
              className={classes.shareBtn}
              href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(blog.title || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram"
            >
              <Ixon width="1rem">
                <TelegramIcon />
              </Ixon>
            </a>
            <a
              className={classes.shareBtn}
              href={`https://wa.me/?text=${encodeURIComponent(`${blog.title || ""} ${pageUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
            >
              <Ixon width="1rem">
                <WhatsappIcon />
              </Ixon>
            </a>
          </div>
        </div>
      </header>
      {!!blog.image && (
        <div className={classes.cover}>
          <HostedImage src={blog.image} alt={blog.title || ""} fill sizes="(max-width: 1000px) 100vw, 70rem" style={{ objectFit: "cover" }} priority />
        </div>
      )}
      <div className={classes.wrap}>
        <article className={classes.article}>
          <div className={classes.content} ref={contentRef}>
            <RenderRtf key={blog._id} value={content} />
          </div>
          <p className={`${classes.disclaimer} ${txsRegular}`}>{getContent("magDisclaimer")}</p>
          {!!tags.length && (
            <div className={classes.tags}>
              <span className={`${classes.tagsTitle} ${tsmMedium}`}>{getContent("tags")}</span>
              {tags.map((tag) => (
                <Link key={tag._id} href={`/mag?tag=${tag._id}`} className={`${classes.tag} ${txsRegular}`}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
          <BlogsCta className={classes.mobileOnly} />
        </article>
        <aside className={classes.side}>
          {toc.length > 1 && (
            <nav className={classes.toc} aria-label={getContent("magToc")}>
              <h4 className={`${classes.sideTitle} ${tmdBold}`}>{getContent("magToc")}</h4>
              <ol>
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? classes.tocSub : undefined}>
                    <a href={`#${item.id}`} className={`${tsmMedium} ${active === item.id ? classes.tocActive : ""}`}>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <BlogsCta className={classes.desktopOnly} />
          <BlogsCategories
            nodes={categoryCounts}
            active={blog.category ? blog.category.slug || blog.category._id : undefined}
          />
          <BlogsMostViewed nodes={(mostViewed || []).slice(0, 5)} />
          {!!week.length && (
            <div className={classes.week}>
              <h4 className={`${classes.sideTitle} ${tmdBold}`}>{getContent("magThisWeek")}</h4>
              <ul>
                {week.map((w) => (
                  <li key={w._id}>
                    <Link href={`/mag/${w.slug || w._id}`} className={classes.weekItem}>
                      <span className={classes.weekImage}>
                        <HostedImage src={w.image} alt="" fill sizes="5rem" style={{ objectFit: "cover" }} />
                      </span>
                      <span className={`${classes.weekTitle} ${tsmMedium}`}>{w.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
      {!!related.length && (
        <section className={classes.related}>
          <h2 className={`${classes.relatedTitle} ${tlgBold}`}>{getContent("magRelated")}</h2>
          <ul className={classes.relatedList}>
            {related.slice(0, 3).map((node) => (
              <li key={node._id}>
                <BlogMainCard node={node} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={classes.comments}>
        <CommentSection model="Blog" nodeId={blog._id} />
      </div>
    </div>
  );
};

export default BlogPage;
