import Link from "next/link";
import { IBlogTag } from "../Admin/BlogTag/AdminManageBlogTgasPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./BlogsHotTags.module.css";
import Badge from "../UI/Badge";
import { tbaseMedium } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "mag"];

const BlogsHotTags = ({ nodes }: { nodes: IBlogTag[] }) => {
  const getContent = useScopedLocale(NS);

  if (!nodes.length) return null;
  return (
    <div className={classes.main}>
      <h4 className={`${classes.title} ${tbaseMedium}`}>
        {getContent("hotBlogsTags")}
      </h4>
      <div className={classes.list}>
        {nodes.map((node) => (
          <Link href={`/mag?tag=${node._id}`} key={node._id}>
            <Badge color="Black" mode="Fill" size="XL" radius="High">
              {node.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogsHotTags;
