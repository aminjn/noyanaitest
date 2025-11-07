import { ReactNode, useState } from "react";
import classes from "./WithSideMap.module.css";
import BookingMap from "./BookingMap";

const WithSideMap = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className={classes.container}>
      <div className={`${classes.main} ${isExpanded ? classes.shrunk : ""}`}>
        {children}
      </div>
      <BookingMap expanded={isExpanded} setExpanded={setIsExpanded} />
    </div>
  );
};

export default WithSideMap;
