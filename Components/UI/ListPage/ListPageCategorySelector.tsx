import FilterIcon from "@/Components/Icons/FilterIcon";
import Ixon from "../Ixon";
import classes from "./ListPageCategorySelector.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useLocale from "@/Components/Hooks/useLocale";
import { txsMedium } from "../Typography";
const ListPageCategorySelector = ({
  categories,
  basePath,
  title,
}: {
  categories: { _id: string; name?: string; slug?: string; title?: string }[];
  basePath: string;
  title?: string;
}) => {
  const searchParams = useSearchParams();

  const getContent = useLocale();

  if (!categories.length) return null;
  return (
    <div className={classes.categoryBox}>
      <div className={classes.titleBox}>
        <Ixon width="1rem">
          <FilterIcon />
        </Ixon>
        {!!title && <span>{title}</span>}
      </div>
      <div className={classes.categories}>
        <Link
          href={basePath}
          className={`${classes.category} ${searchParams.get("category") ? "" : classes.activeCategory} ${txsMedium}`}
        >
          {getContent("all")}
        </Link>
        {categories.map((category) => (
          <Link
            className={`${classes.category} ${searchParams.get("category") === (category.slug || category._id) ? classes.activeCategory : ""} ${txsMedium}`}
            key={category._id}
            href={`${basePath}?category=${category.slug || category._id}`}
          >
            {category.name || category.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListPageCategorySelector;
