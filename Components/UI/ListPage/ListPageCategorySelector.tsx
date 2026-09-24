import FilterIcon from "@/Components/Icons/FilterIcon";
import Ixon from "../Ixon";
import classes from "./ListPageCategorySelector.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { txsMedium } from "../Typography";
import { WithStyleProps } from "@/Components/Layout/Layout";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];
const ListPageCategorySelector = ({
  categories,
  basePath,
  title,
  className = "",
  style,
  noIcon,
}: WithStyleProps<{
  categories: { _id: string; name?: string; slug?: string; title?: string }[];
  basePath: string;
  title?: string;
  noIcon?: boolean;
}>) => {
  const searchParams = useSearchParams();

  const getContent = useScopedLocale(LOCALE_NS);

  if (!categories.length) return null;
  return (
    <div className={`${classes.categoryBox} ${className}`} style={style}>
      <div className={classes.titleBox}>
        {!noIcon && (
          <Ixon width="1rem">
            <FilterIcon />
          </Ixon>
        )}
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
