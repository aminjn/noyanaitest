import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { t3xlBold, tmdRegular } from "../UI/Typography";
import classes from "./TitleLegend.module.css";

const NS: ContentNamespace[] = ["common", "aboutPage"];
const TitleLegend = ({
  legend,
  title,
}: {
  title: ContentKey;
  legend?: ContentKey;
}) => {
  const getContent = useScopedLocale(NS);
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
