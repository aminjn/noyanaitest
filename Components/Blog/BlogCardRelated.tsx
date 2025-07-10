import Link from "next/link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogCardRelated.module.css";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";

const BlogCardRelated = ({ node }: { node: IBlog }) => {
  return (
    <li className={classes.main}>
      <Link className={classes.link} href={`/mag/${node.slug || node._id}`}>
        <div className={classes.image}>
          <Image
            src={imagePath(node.image)}
            alt={node.title || ""}
            fill
            sizes="300px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.content}>
          <h3 className={classes.title}>{node.title}</h3>
          <p className={classes.summary}>{node.summary}</p>
        </div>
      </Link>
    </li>
  );
};

export default BlogCardRelated;
