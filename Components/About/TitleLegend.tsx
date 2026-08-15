import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import { t3xlBold, tmdRegular } from "../UI/Typography";
import classes from "./TitleLegend.module.css";
const TitleLegend = ({
  legend,
  title,
}: {
  title: ContentKey;
  legend?: ContentKey;
}) => {
  const getContent = useLocale();
  return (
    <div className={classes.main}>
      <h2 className={`${classes.title} ${t3xlBold}`}>{getContent(title)}</h2>
      {!!legend && (
        <legend className={`${classes.legend} ${tmdRegular}`}>
          {getContent(legend)}
        </legend>
      )}
    </div>
  );
};

export default TitleLegend;
