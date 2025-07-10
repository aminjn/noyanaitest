import Link from "next/link";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import classes from "./BlogCardWeek.module.css";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const BlogCardWeek = ({ node }: { node: IBlog }) => {
  return (
    <li className={classes.main}>
      <Link className={classes.link} href={`/mag/${node.slug || node._id}`}>
        <h3 className={classes.title}>{node.title}</h3>
        <p className={classes.summary}>{node.summary}</p>
        <span className={classes.more}>
          <span>بیشتر بخوانید</span>
          <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </span>
      </Link>
    </li>
  );
};

export default BlogCardWeek;
