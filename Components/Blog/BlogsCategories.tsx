import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import { tmdBold, tsmMedium, t2xsRegular } from "../UI/Typography";
import classes from "./BlogsCategories.module.css";

const NS: ContentNamespace[] = ["common", "mag", "magPost"];

export type BlogCategoryCount = { _id: string; title?: string; slug?: string; count: number };

// The magazine's categories in the sidebar, with how many articles each
// holds (2026-10): the way to browse a topic from any article.
const BlogsCategories = ({ nodes, active }: { nodes?: BlogCategoryCount[]; active?: string }) => {
  const getContent = useScopedLocale(NS);
  const intl = useIntlLocale();
  const list = (Array.isArray(nodes) ? nodes : []).filter((n) => n && n._id && n.title);
  if (!list.length) return null;
  const num = new Intl.NumberFormat(intl);
  return (
    <nav className={classes.main} aria-label={getContent("magCategories")}>
      <h4 className={`${classes.title} ${tmdBold}`}>{getContent("magCategories")}</h4>
      <ul>
        {list.map((c) => {
          const key = c.slug || c._id;
          return (
            <li key={c._id}>
              <Link
                href={`/mag?category=${encodeURIComponent(key)}`}
                className={`${classes.item} ${tsmMedium} ${active && active === key ? classes.active : ""}`}
              >
                <span>{c.title}</span>
                <span className={`${classes.count} ${t2xsRegular}`}>{num.format(c.count)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BlogsCategories;
