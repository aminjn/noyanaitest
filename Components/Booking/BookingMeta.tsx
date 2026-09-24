import { useState } from "react";
import { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import {
  t2xsMedium,
  tsmDemiBold,
  tsmMedium,
  txsRegular,
} from "../UI/Typography";
import classes from "./BookingMeta.module.css";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const NS: ContentNamespace[] = ["common", "booking"];
const BookingMeta = ({
  description,
  label,
  legend,
  title,
  descriptions,
}: {
  title: ContentKey;
  legend: ContentKey;
  label: ContentKey;
  description: ContentKey;
  descriptions: IBookingDescription[] | undefined;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = useScopedLocale(NS);

  if (!descriptions?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.intro}>
        <legend className={`${classes.legend} ${txsRegular}`}>
          {getContent("bookingMetaLegend")}
        </legend>
        <h4 className={`${classes.title} ${tsmDemiBold}`}>
          {getContent(title)}
        </h4>
        <p className={`${classes.subtitle} ${t2xsMedium}`}>
          {getContent(legend)}
        </p>
      </div>
      <div className={classes.content}>
        <div className={classes.header}>
          <legend className={`${classes.about} ${tsmDemiBold}`}>
            {getContent("aboutThisPage")}
          </legend>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={classes.toggle}
            style={{ transform: `rotateZ(${isOpen ? 180 : 0}deg)` }}
          >
            <Ixon width="1.5rem">
              <ChevronIcon />
            </Ixon>
          </button>
        </div>
        <div className={`${classes.segments} ${isOpen ? classes.open : ""}`}>
          {descriptions.map((d, i) => (
            <div key={i} className={classes.segment}>
              <h5 className={`${classes.h5} ${tsmMedium}`}>{d.title}</h5>
              <p className={`${classes.description} ${txsRegular}`}>
                {d.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingMeta;
