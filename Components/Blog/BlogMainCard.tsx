import { IBlog, IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import useReadTime from "./useReadTime";
import classes from "./BlogMainCard.module.css";
import HostedImage from "../UI/HostedImage";
import Link from "@/Components/i18n/Link";
import FormatDate from "../UI/FormatDate";
import Ixon from "../UI/Ixon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ClockIcon from "../Icons/ClockIcon";
import { t2xsRegular, tmdBold, tsmRegular, txsDemiBold } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "blogMainCard"];

// One article in the magazine's lists (2026-10 redesign, like Healthline's
// and Paziresh24's magazine): the whole card is the link; the picture
// (16:9) carries the category, then the title (two lines), the summary
// (two lines) and the byline - author, date, reading time. Every card is
// the same height in a row, whatever its text.
const BlogMainCard = ({ node, compact }: { node: IBlog; compact?: boolean }) => {
  const getContent = useScopedLocale(NS);
  const readTime = useReadTime();
  const category = node.category && typeof node.category === "object" ? (node.category as IBlogCategory) : null;
  const time = readTime(node);

  return (
    <Link href={`/mag/${node.slug || node._id}`} className={`${classes.main} ${compact ? classes.compact : ""}`}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.title || ""}
          fill
          sizes="(max-width: 640px) 100vw, 22rem"
          style={{ objectFit: "cover" }}
        />
        {!!category?.title && <span className={`${classes.category} ${txsDemiBold}`}>{category.title}</span>}
      </div>
      <div className={classes.content}>
        <h3 className={`${classes.title} ${tmdBold}`}>{node.title}</h3>
        {!!node.summary && !compact && <p className={`${classes.summary} ${tsmRegular}`}>{node.summary}</p>}
        <div className={`${classes.byline} ${t2xsRegular}`}>
          <span className={classes.author}>{node.author || getContent("noyan")}</span>
          {!!node.publishedAt && (
            <>
              <span aria-hidden className={classes.dot} />
              <FormatDate value={node.publishedAt} time={false} />
            </>
          )}
          {!!time && (
            <span className={classes.time}>
              <Ixon width=".75rem">
                <ClockIcon />
              </Ixon>
              {time}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogMainCard;
