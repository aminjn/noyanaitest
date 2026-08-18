import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogMainCard.module.css";
import HostedImage from "../UI/HostedImage";
import Link from "next/link";
import FormatDate from "../UI/FormatDate";

const BlogMainCard = ({ node }: { node: IBlog }) => {
  return (
    <li className={classes.main}>
      <Link href={`/mag/${node.slug || node._id}`} className={classes.link}>
        <div className={classes.image}>
          <HostedImage
            src={node.image}
            alt={node.title || ""}
            fill
            style={{ objectFit: "cover" }}
            sizes="600px"
          />
        </div>
        <div className={classes.content}>
          <h2 className={classes.title}>{node.title}</h2>
          <p className={classes.summary}>{node.summary}</p>
          <FormatDate
            className={classes.publish}
            time={false}
            value={node.publishedAt}
          />
        </div>
      </Link>
    </li>
  );
};

export default BlogMainCard;
