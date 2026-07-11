import { ReactNode, useState } from "react";
import classes from "./ListPageSideSection.module.css";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import SideAd from "./SideAd";
import { txsMedium } from "../Typography";

const ListPageSideSection = ({
  cards,
  title,
}: {
  title: string;
  cards: ReactNode[];
}) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>();

  const [index, setIndex] = useState<number>(0);

  if (!cards.length) return null;
  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <div className={classes.slider}>
        <Swiper
          slidesPerView={1}
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onSlideChange={(e) => setIndex(e.activeIndex)}
        >
          {cards.map((card, i) => (
            <SwiperSlide key={`Slide${i}`}>{card}</SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={classes.navs}>
        {cards.map((_, i) => (
          <button
            key={`Dot${i}`}
            onClick={() => swiper?.slideTo(i)}
            className={`${classes.nav} ${index === i ? classes.activeNav : ""}`}
          />
        ))}
      </div>
      <SideAd />
    </div>
  );
};

export default ListPageSideSection;
