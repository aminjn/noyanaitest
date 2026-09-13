import { Swiper, SwiperClass } from "swiper/react";
import classes from "./SwiperSlider.module.css";
import { ReactNode, useState } from "react";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const SwiperSlider = ({
  children,
  swiperClass,
  ltr,
}: {
  children?: ReactNode;
  swiperClass?: string;
  ltr?: boolean;
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
          style={{
            insetInlineEnd: ltr ? "unset" : 0,
            insetInlineStart: ltr ? 0 : "unset",
            transform: `translateY(-50%) translateX(${ltr ? "" : "-"}50%)`,
          }}
        >
          <Ixon
            width="1.5rem"
            style={{ transform: `rotateZ( ${ltr ? "-" : ""}90deg)` }}
          >
            <ChevronIcon />
          </Ixon>
        </button>
      )}
      {!!isBegining ? null : (
        <button
          className={`${classes.navButton} ${classes.navPrev}`}
          onClick={() => swiper?.slidePrev()}
          style={{
            insetInlineStart: ltr ? "unset" : 0,
            insetInlineEnd: ltr ? 0 : "unset",
            transform: `translateY(-50%) translateX(${ltr ? "-" : ""}50%)`,
          }}
        >
          <Ixon
            width="1.5rem"
            style={{ transform: `rotateZ(${ltr ? "" : "-"}90deg)` }}
          >
            <ChevronIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};

export default SwiperSlider;
