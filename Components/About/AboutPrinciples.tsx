import { IAboutWhy } from "../Admin/AboutWhy/AdminManageAboutWhysPage";
import TargetIcon from "../Icons/TargetIcon";
import Ixon from "../UI/Ixon";
import { tbaseBold, txsRegular } from "../UI/Typography";
import classes from "./AboutPrinciples.module.css";
import TitleLegend from "./TitleLegend";
const AboutPrinciples = ({ items }: { items: IAboutWhy[] }) => {
  if (!items.length) return null;
  return (
    <div className={classes.main}>
      <TitleLegend title="ourPrinciplesTitle" legend="ourPrinciplesLegend" />
      <ul className={classes.list}>
        {items.map((item) => (
          <li key={item._id} className={classes.item}>
            <div className={classes.icon}>
              <Ixon width="1.25rem">
                <TargetIcon />
              </Ixon>
            </div>
            <h3 className={`${classes.title} ${tbaseBold}`}>{item.title}</h3>
            <p className={`${classes.description} ${txsRegular}`}>
              {item.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AboutPrinciples;
