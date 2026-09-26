import Link from "@/Components/i18n/Link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StarLineIcon from "../Icons/StarLineIcon";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import classes from "./BlogsChosen.module.css";
import ClockIcon from "../Icons/ClockIcon";
import UserIcon from "../Icons/UserIcon";
import { getRelativeTime } from "../helpers/lib";
import {
  t2xsRegular,
  tmdMedium,
  txsDemiBold,
  txsRegular,
} from "../UI/Typography";
import Badge from "../UI/Badge";

const NS: ContentNamespace[] = ["common", "mag"];

const ChosenBlogCard = ({
  node,
}: {
  node: IBlog<{ CategoryPopulated: Record<never, never> }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.card}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.title}
          fill
          sizes="35rem"
          style={{ objectFit: "cover" }}
        />
        <div className={classes.overlay} />
        {!!node.category && (
          <Badge
            color="Error"
            mode="Fill"
            radius="High"
            size="XXL"
            className={classes.category}
          >
            {node.category.title}
          </Badge>
        )}
        <div className={classes.topContent}>
          <Link href={`/mag/${node.slug || node._id}`}>
            <h3 className={`${classes.itemTitle} ${tmdMedium}`}>
              {node.title}
            </h3>
          </Link>
          <div className={classes.topFooter}>
            {!!node.readTime && (
              <div className={classes.readTime}>
                <Ixon width=".75rem">
                  <ClockIcon />
                </Ixon>
                <span className={txsRegular}>{node.readTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={classes.content}>
        <div className={`${classes.author} ${txsDemiBold}`}>
          <Ixon width="2rem">
            <UserIcon />
            <span>{getContent("noyan")}</span>
          </Ixon>
        </div>
        <span className={`${classes.publish} ${t2xsRegular}`}>
          {getRelativeTime(node.publishedAt)}
        </span>
      </div>
    </div>
  );
};

const BlogsChosen = ({
  nodes,
}: {
  nodes?: IBlog<{ CategoryPopulated: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(NS);

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.titleBox}>
          <Ixon width="1.5rem" className={classes.titleIcon}>
            <StarLineIcon />
          </Ixon>
          <h2 className={`${classes.title} ${tmdMedium}`}>
            {getContent("chosenBlogs")}
          </h2>
        </div>
      </div>
      <div className={classes.list}>
        {nodes.map((node) => (
          <ChosenBlogCard key={node._id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default BlogsChosen;
