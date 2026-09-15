import { IAboutWhy } from "../Admin/AboutWhy/AdminManageAboutWhysPage";
import HostedImage from "../UI/HostedImage";
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
              <HostedImage
                src={item.image}
                alt={item.title || ""}
                fill
                sizes="1.25rem"
              />
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
