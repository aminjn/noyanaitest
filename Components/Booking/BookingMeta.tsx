import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import {
  t2xsMedium,
  tsmDemiBold,
  tsmMedium,
  txsRegular,
} from "../UI/Typography";
import classes from "./BookingMeta.module.css";
const BookingMeta = ({
  description,
  label,
  legend,
  title,
}: {
  title: ContentKey;
  legend: ContentKey;
  label: ContentKey;
  description: ContentKey;
}) => {
  const getContent = useScopedLocale(["booking"]);

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
        <legend className={`${classes.about} ${tsmDemiBold}`}>
          {getContent("aboutThisPage")}
        </legend>
        <h5 className={`${classes.h5} ${tsmMedium}`}>{getContent(label)}</h5>
        <p className={`${classes.description} ${txsRegular}`}>
          {getContent(description)}
        </p>
      </div>
    </div>
  );
};

export default BookingMeta;
