import Link from "next/link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./BlogsMostViewed.module.css";
import { t2xsRegular, tbaseMedium, tsmMedium, txlBold } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "mag"];

const BlogsMostViewed = ({ nodes }: { nodes: IBlog[] }) => {
  const getContent = useScopedLocale(NS);

  if (!nodes.length) return null;
  return (
    <div className={classes.main}>
      <h4 className={`${classes.title} ${tbaseMedium}`}>
        {getContent("mostViewedArticles")}
      </h4>
      <div className={classes.list}>
        {nodes.map((node, i) => (
          <div className={classes.item} key={node._id}>
            <span className={`${classes.index} ${txlBold}`}>{i + 1}</span>
            <div className={classes.itemContent}>
              <Link href={`/mag/${node.slug || node._id}`}>
                <h5 className={`${classes.itemTitle} ${tsmMedium}`}>
                  {node.title}
                </h5>
              </Link>
              <div className={`${classes.itemFooter} ${t2xsRegular}`}>
                {!!node.readTime && <span>{node.readTime}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsMostViewed;
