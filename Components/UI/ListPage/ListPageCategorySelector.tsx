import FilterIcon from "@/Components/Icons/FilterIcon";
import Ixon from "../Ixon";
import classes from "./ListPageCategorySelector.module.css";
import { useSearchParams } from "next/navigation";
import Link from "@/Components/i18n/Link";
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
  hrefOf,
  isActive,
  allHref,
  allActive,
}: WithStyleProps<{
  categories: { _id: string; name?: string; slug?: string; title?: string }[];
  basePath: string;
  title?: string;
  noIcon?: boolean;
  // path-based filters (the medical directory's /disease/part/<slug>):
  // each chip's own URL and active state instead of ?category=; `allHref`
  // null hides the "all" chip
  hrefOf?: (category: { _id: string; slug?: string }) => string;
  isActive?: (category: { _id: string; slug?: string }) => boolean;
  allHref?: string | null;
  allActive?: boolean;
}>) => {
  const searchParams = useSearchParams();

  const getContent = useScopedLocale(LOCALE_NS);

  if (!categories.length) return null;
  const current = searchParams.get("category");
  const activeOf = (category: { _id: string; slug?: string }) =>
    isActive ? isActive(category) : current === (category.slug || category._id);
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
        {allHref !== null && (
          <Link
            href={allHref || basePath}
            className={`${classes.category} ${(allActive ?? !current) ? classes.activeCategory : ""} ${txsMedium}`}
          >
            {getContent("all")}
          </Link>
        )}
        {categories.map((category) => (
          <Link
            className={`${classes.category} ${activeOf(category) ? classes.activeCategory : ""} ${txsMedium}`}
            key={category._id}
            aria-current={activeOf(category) ? "page" : undefined}
            href={hrefOf ? hrefOf(category) : `${basePath}?category=${category.slug || category._id}`}
          >
            {category.name || category.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListPageCategorySelector;
