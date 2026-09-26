import Link from "@/Components/i18n/Link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogCardWeek.module.css";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

const BlogCardWeek = ({ node }: { node: IBlog }) => {
  const getContent = useScopedLocale();
  return (
    <li className={classes.main}>
      <Link className={classes.link} href={`/mag/${node.slug || node._id}`}>
        <h3 className={classes.title}>{node.title}</h3>
        <p className={classes.summary}>{node.summary}</p>
        <span className={classes.more}>
          <span>{getContent("readMore")}</span>
          <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </span>
      </Link>
    </li>
  );
};

export default BlogCardWeek;
