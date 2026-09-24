import { SwiperSlide } from "swiper/react";
import { IAboutWhy } from "../Admin/AboutWhy/AdminManageAboutWhysPage";
import { chunk } from "../helpers/lib";
import HostedImage from "../UI/HostedImage";
import SwiperSlider from "../UI/SwiperSlider";
import { tbaseBold, txsRegular } from "../UI/Typography";
import classes from "./AboutPrinciples.module.css";
import TitleLegend from "./TitleLegend";

const Item = ({ item }: { item: IAboutWhy }) => {
  return (
    <li className={classes.item}>
      <div className={classes.icon}>
        <HostedImage
          src={item.image}
          alt={item.title || ""}
          fill
          sizes="1.25rem"
        />
      </div>
      <h3 className={`${classes.title} ${tbaseBold}`}>{item.title}</h3>
      <p className={`${classes.description} ${txsRegular}`}>{item.content}</p>
    </li>
  );
};

const AboutPrinciples = ({ items }: { items: IAboutWhy[] }) => {
  if (!items.length) return null;
  return (
    <div className={classes.main}>
      <TitleLegend title="ourPrinciplesTitle" legend="ourPrinciplesLegend" />
      <div className={classes.listMobile}>
        <SwiperSlider>
          {chunk(items, 2).map((c, i) => (
            <SwiperSlide key={i}>
              <div className={classes.chunk}>
                {c.map((item) => (
                  <Item key={item._id} item={item} />
                ))}
              </div>
            </SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
      <ul className={classes.list}>
        {items.map((item) => (
          <Item key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default AboutPrinciples;
