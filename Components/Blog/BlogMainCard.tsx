import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogMainCard.module.css";
import HostedImage from "../UI/HostedImage";
import Link from "@/Components/i18n/Link";
import FormatDate from "../UI/FormatDate";
import Ixon from "../UI/Ixon";
import UserIcon from "../Icons/UserIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ClockIcon from "../Icons/ClockIcon";
import {
  t2xsRegular,
  tbaseMedium,
  tsmRegular,
  txsDemiBold,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "blogMainCard"];

const BlogMainCard = ({ node }: { node: IBlog }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.title}
          fill
          sizes="24rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.content}>
        <Link href={`/mag/${node.slug || node._id}`}>
          <h3 className={`${classes.title} ${tbaseMedium}`}>{node.title}</h3>
          {!!node.summary && (
            <p className={`${classes.summary} ${tsmRegular}`}>{node.summary}</p>
          )}
        </Link>
        <div className={`${classes.author} ${txsDemiBold}`}>
          <Ixon width="1.75rem">
            <UserIcon />
          </Ixon>
          <span>{getContent("noyan")}</span>
        </div>
        <div className={classes.details}>
          {!!node.readTime && (
            <div className={`${classes.readTime} ${t2xsRegular}`}>
              <Ixon width=".75rem">
                <ClockIcon />
              </Ixon>
              <span>{node.readTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogMainCard;
