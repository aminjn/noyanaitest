import StarIcon from "../Icons/StarIcon";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import Ixon from "../UI/Ixon";
import { tsmMedium, txlBold } from "../UI/Typography";
import { Score, scores } from "./CommentSection";
import classes from "./CommentsSummary.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "commentSection"];
const CommentsSummary = ({
  average,
  count,
  scores: scoresMap,
}: {
  average: number;
  scores: Record<Score, number>;
  count: number;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <div className={classes.main}>
      <div className={classes.stats}>
        <span className={`${classes.average} ${txlBold}`}>
          {average.toFixed(2)}
        </span>
        <div className={classes.scores}>
          {scores.map((score) => (
            <Ixon
              width="1rem"
              key={score}
              className={`${classes.star} ${score < average ? classes.activeScore : ""}`}
            >
              <StarIcon />
            </Ixon>
          ))}
        </div>
        <span className={classes.totalCount}>
          {getContent("fromXComments", [count.toString()])}
        </span>
      </div>
      <div className={classes.bars}>
        {scores.map((score) => (
          <div className={classes.barBox} key={score}>
            <span className={classes.percent}>
              {getContent("percentSymbol", [
                Math.floor((scoresMap[score] / (count || 1)) * 100).toString(),
              ])}
            </span>
            <div className={classes.bar}>
              <div
                className={classes.track}
                style={{
                  insetInlineStart: `${100 - (scoresMap[score] / count) * 100}%`,
                }}
              />
            </div>
            <Ixon className={classes.scoreStar} width=".75rem">
              <StarIcon />
            </Ixon>
            <span className={`${classes.scoreLabel} ${tsmMedium}`}>
              {score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSummary;
