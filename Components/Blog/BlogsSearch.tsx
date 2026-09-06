import { useEffect } from "react";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import useDebounce from "../Hooks/useDebounce";
import useScopedLocale from "../Hooks/useScopedLocale";
import BookOpenIcon from "../Icons/BookOpenIcon";
import SearchIcon from "../Icons/SearchIcon";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { t3xlDemiBold, tbaseRegular } from "../UI/Typography";
import classes from "./BlogsSearch.module.css";
import useProgress from "../Hooks/useProgress";
import { useSearchParams } from "next/navigation";

const BlogsSearch = ({ recommended }: { recommended?: IBlog[] }) => {
  const getContent = useScopedLocale(["mag"]);

  const searchParams = useSearchParams();
  const [query, setQuery] = useDebounce({
    initialValue: searchParams.get("search"),
  });

  const push = useProgress();

  useEffect(() => {
    const loaded = searchParams.get("search") || "";
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    const sort = searchParams.get("sort");
    if (sort) params.append("sort", sort);
    const page = searchParams.get("page");
    if (page) params.append("page", loaded !== query ? "1" : page);
    const tag = searchParams.get("tag");
    if (tag) params.append("tag", tag);
    const category = searchParams.get("category");
    if (category) params.append("category", category);
    push(`/mag?${params.toString()}`);
  }, [push, query, searchParams]);

  return (
    <div className={classes.main}>
      <Badge
        color="Primary"
        size="XXL"
        radius="High"
        mode="Fill"
        leadIcon={<BookOpenIcon />}
        className={classes.badge}
      >
        {getContent("blogsIntroBadge")}
      </Badge>
      <h1 className={`${classes.h1} ${t3xlDemiBold}`}>
        {getContent("magTitle")}
      </h1>
      <legend className={`${classes.legend} ${tbaseRegular}`}>
        {getContent("magLegend")}
      </legend>
      <div className={classes.searchBox}>
        <input
          placeholder={getContent("searchInMag")}
          onChange={(e) => setQuery(e.target.value)}
          className={classes.input}
        />
        <Ixon width="1.5rem" className={classes.icon}>
          <SearchIcon />
        </Ixon>
      </div>
      {!!recommended?.length && (
        <div className={classes.rec}>
          <span className={classes.recTitle}>
            {getContent("recommendations")}
          </span>
          <div className={classes.recList}>
            {recommended.map((el) => (
              <Button
                variant="Primary"
                mode="Fill"
                size="L"
                radius="High"
                key={el._id}
                className={classes.recItem}
              >
                {el.title}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsSearch;
