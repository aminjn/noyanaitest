import { Children, CSSProperties, ReactNode } from "react";
import classes from "./ListPageList.module.css";
import Pagination, { PaginationProps } from "../Pagination";
import ListPageEmpty from "./ListPageEmpty";
const ListPageList = ({
  children,
  pagination,
  itemWidth,
}: {
  children: ReactNode;
  pagination: PaginationProps;
  itemWidth: string;
}) => {
  // nothing to list (new site, or a filter / page with no match)
  if (Children.toArray(children).length === 0) return <ListPageEmpty />;
  return (
    <div className={classes.listBox}>
      <ul
        className={classes.list}
        style={{ "--item-width": itemWidth } as CSSProperties}
      >
        {children}
      </ul>
      <div className={classes.pagination}>
        <Pagination {...pagination} />
      </div>
    </div>
  );
};

export default ListPageList;
