import { ReactNode } from "react";
import classes from "./ListPageList.module.css";
import Pagination, { PaginationProps } from "../Pagination";
const ListPageList = ({
  children,
  pagination,
  itemWidth,
}: {
  children: ReactNode;
  pagination: PaginationProps;
  itemWidth: string;
}) => {
  return (
    <div className={classes.listBox}>
      <ul
        className={classes.list}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${itemWidth}, 1fr))`,
        }}
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
