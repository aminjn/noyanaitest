import Link from "next/link";
import classes from "./Pagination.module.css";
import useLocale from "../Hooks/useLocale";
import ChevronIcon from "../Icons/ChevronIcon";
import { Fragment, useCallback } from "react";
import { range } from "../helpers/lib";
import { WithStyleProps } from "../Layout/Layout";

const Page = ({
  current,
  page,
  makePath,
}: {
  current: number;
  page: number;
  makePath: (page: number) => string;
}) => {
  return (
    <Link
      href={makePath(page)}
      className={`${classes.page} ${
        current === page ? classes.activePage : ""
      }`}
    >
      {page}
    </Link>
  );
};

const Divider = () => {
  return <span className={classes.divider}>...</span>;
};

export type PagePathMaker = (page: number) => string;
const Pagination = ({
  currentPage,
  makePath,
  pagesCount,
  span = 2,
  className = "",
  style,
}: WithStyleProps<{
  pagesCount: number;
  currentPage: number;
  makePath: PagePathMaker;
  span?: number;
}>) => {
  const getContent = useLocale();

  const renderPage = useCallback(
    (target: number) => (
      <Page makePath={makePath} current={currentPage} page={target} />
    ),
    [currentPage, makePath]
  );

  if (pagesCount <= 1) return null;
  return (
    <div style={style} className={`${classes.main} ${className}`}>
      <Link
        style={{ transform: "rotateZ(-90deg)" }}
        className={`${classes.arrow} ${
          currentPage === 1 ? classes.disabled : ""
        }`}
        title={getContent("previousPage")}
        href={makePath(currentPage === 1 ? 1 : currentPage - 1)}
      >
        <ChevronIcon />
      </Link>
      {renderPage(1)}
      {currentPage - span > 2 && <Divider />}
      {pagesCount !== 2 &&
        range(2, pagesCount - 1).map((page) => (
          <Fragment key={`Page${page}`}>
            {Math.abs(currentPage - page) <= span ? renderPage(page) : null}
          </Fragment>
        ))}
      {currentPage + span < pagesCount - 1 && <Divider />}
      {renderPage(pagesCount)}
      <Link
        style={{ transform: "rotateZ(90deg)" }}
        className={`${classes.arrow} ${
          currentPage === pagesCount ? classes.disabled : ""
        }`}
        title={getContent("nextPage")}
        href={makePath(
          currentPage === pagesCount ? pagesCount : currentPage + 1
        )}
      >
        <ChevronIcon />
      </Link>
    </div>
  );
};

export default Pagination;
