import { Fragment, ReactNode, useMemo, useRef, useState } from "react";
import classes from "./ListPageSideSection.module.css";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import SideAd from "./SideAd";
import { txsMedium } from "../Typography";
import useDimensions from "@/Components/Hooks/useDimentions";
import { chunk } from "@/Components/helpers/lib";

const ListPageSideSection = ({
  cards,
  title,
  cardWidth,
}: {
  title: string;
  cards: ReactNode[];
  cardWidth: number;
}) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>();

  const listRef = useRef<HTMLDivElement>(null);

  const { width } = useDimensions<HTMLDivElement>({ ref: listRef });

  const [index, setIndex] = useState<number>(0);

  const chunks = useMemo<ReactNode[][]>(() => {
    const perGroup = Math.floor(width / cardWidth) || 1;
    return chunk(cards, perGroup);
  }, [cardWidth, cards, width]);

  if (!cards.length) return null;
  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <div className={classes.slider} ref={listRef}>
        <Swiper
          slidesPerView={1}
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onSlideChange={(e) => setIndex(e.activeIndex)}
        >
          {chunks.map((chunk, i) => (
            <SwiperSlide key={`Chunk${i}`} className={classes.slide}>
              {chunk.map((card, i) => (
                <Fragment key={`Card${i}`}>{card}</Fragment>
              ))}
            </SwiperSlide>
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
