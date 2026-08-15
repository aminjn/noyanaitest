import { IAboutWhy } from "../Admin/AboutWhy/AdminManageAboutWhysPage";
import useLocale from "../Hooks/useLocale";
import CalendarIcon from "../Icons/CalendarIcon";
import Ixon from "../UI/Ixon";
import { tmdBold, tsmRegular } from "../UI/Typography";
import classes from "./AboutWhys.module.css";
import TitleLegend from "./TitleLegend";
const AboutWhys = ({ items }: { items: IAboutWhy[] }) => {
  if (!items.length) return null;
  return (
    <div className={classes.main}>
      <TitleLegend title="whyNoyanAi" legend="whyNoyanLegend" />
      <ul className={classes.list}>
        {items.map((item) => (
          <li key={item._id} className={classes.item}>
            <div className={classes.icon}>
              <Ixon width="1.75rem">
                <CalendarIcon />
              </Ixon>
            </div>
            <h3 className={`${classes.itemTitle} ${tmdBold}`}>{item.title}</h3>
            <p className={`${classes.itemDescription} ${tsmRegular}`}>
              {item.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AboutWhys;
