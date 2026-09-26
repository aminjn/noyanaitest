import Link from "next/link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import Badge from "../UI/Badge";
import HostedImage from "../UI/HostedImage";
import classes from "./BlogCardHome.module.css";
import { getRelativeTime } from "../helpers/lib";
import Ixon from "../UI/Ixon";
import ClockIcon from "../Icons/ClockIcon";
import { tbaseMedium, txsRegular } from "../UI/Typography";
const BlogCardHome = ({
  node,
}: {
  node: IBlog<{ CategoryPopulated: Record<never, never> }>;
}) => {
  return (
    <div className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.title}
          fill
          sizes="16.75rem"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
      </div>
      <div className={classes.content}>
        {!!node.category && (
          <Badge color="Primarylight" mode="Fill" size="XL" radius="High">
            {node.category.title}
          </Badge>
        )}
        <Link href={`/mag/${node.slug || node._id}`}>
          <h4 className={`${classes.name} ${tbaseMedium}`}>{node.title}</h4>
        </Link>
        <div className={`${classes.footer} ${txsRegular}`}>
          <span>{getRelativeTime(new Date(node.publishedAt))}</span>
          {!!node.readTime && (
            <div className={classes.readTime}>
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

export default BlogCardHome;
