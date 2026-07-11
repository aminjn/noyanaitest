import { useState } from "react";
import classes from "./ListPageSideExpandable.module.css";
import Ixon from "../Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import Link from "next/link";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { t2xsRegular, txsMedium, txsRegular } from "../Typography";

const ListPageSideExpandable = ({
  items,
  title,
}: {
  title: string;
  items: { title: string; target: string }[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!items.length) return null;
  return (
    <div className={classes.main}>
      <div
        className={classes.header}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className={classes.titleBox}>
          <span className={`${classes.title} ${txsMedium}`}>{title}</span>
          <span className={`${classes.count} ${t2xsRegular}`}>
            {items.length}
          </span>
        </div>
        <Ixon
          className={classes.chevron}
          width="1rem"
          style={{ transform: `rotateZ(${isOpen ? 180 : 0}deg)` }}
        >
          <ChevronIcon />
        </Ixon>
      </div>
      <div className={`${classes.list} ${isOpen ? classes.open : ""}`}>
        {items.map((el) => (
          <Link
            key={el.target}
            href={el.target}
            className={`${classes.item} ${txsRegular}`}
          >
            <span>{el.title}</span>
            <Ixon width="1rem" className={classes.arrow}>
              <ArrowLeftIcon />
            </Ixon>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListPageSideExpandable;
