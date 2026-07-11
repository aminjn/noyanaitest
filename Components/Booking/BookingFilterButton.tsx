import { ReactNode, useState } from "react";
import classes from "./BookingFilterButton.module.css";
import { txsRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const BookingFilterButton = ({
  active,
  title,
  children,
}: {
  title: string;
  active: boolean;
  children?: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={classes.filterButtonContainer}>
      <button
        type="button"
        className={classes.filterButton}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${classes.filterButtonTitle} ${txsRegular}`}>
          {title}
        </span>
        {!!active && <span className={classes.activeBadge} />}
        <Ixon
          className={classes.filterButtonChevron}
          width="1rem"
          style={{ transform: isOpen ? "rotateZ(0)" : "rotateZ(90deg)" }}
        >
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && <div className={classes.filterButtonContent}>{children}</div>}
    </div>
  );
};

export default BookingFilterButton;
