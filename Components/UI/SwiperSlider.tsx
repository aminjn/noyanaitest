import { Swiper, SwiperClass } from "swiper/react";
import classes from "./SwiperSlider.module.css";
import { ReactNode, useState } from "react";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const SwiperSlider = ({
  children,
  swiperClass,
}: {
  children?: ReactNode;
  swiperClass?: string;
}) => {
  const [isBegining, setIsBegining] = useState<boolean>(false);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const [swiper, setSwiper] = useState<null | SwiperClass>(null);

  return (
    <div className={classes.list}>
      <Swiper
        onSwiper={(swiper) => {
          setSwiper(swiper);
          setIsBegining(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          setIsBegining(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        slidesPerView={"auto"}
        spaceBetween={16}
        wrapperTag="ul"
        className={swiperClass}
      >
        {children}
      </Swiper>
      {!!isEnd ? null : (
        <button
          className={classes.navButton}
          onClick={() => swiper?.slideNext()}
        >
          <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </button>
      )}
      {!!isBegining ? null : (
        <button
          className={`${classes.navButton} ${classes.navPrev}`}
          onClick={() => swiper?.slidePrev()}
        >
          <Ixon width="1.5rem" style={{ transform: "rotateZ(-90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};

export default SwiperSlider;
