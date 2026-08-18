import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import classes from "./HomeAdSlider.module.css";
import HostedImage from "../UI/HostedImage";
import { useState } from "react";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
const HomeAdSlider = ({ nodes }: { nodes?: IAdvertisement[] }) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <Swiper
        loop
        wrapperTag="ul"
        className={classes.slider}
        onSwiper={(swiper) => setSwiper(swiper)}
      >
        {nodes.map((node) => (
          <SwiperSlide tag="li" key={node._id}>
            <div className={classes.image}>
              <HostedImage
                src={node.image}
                alt={node.name || ""}
                style={{ objectFit: "contain" }}
                fill
                sizes="70rem"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className={classes.navButton} onClick={() => swiper?.slideNext()}>
        <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
          <ChevronIcon />
        </Ixon>
      </button>
      <button
        className={`${classes.navButton} ${classes.navPrev}`}
        onClick={() => swiper?.slidePrev()}
      >
        <Ixon width="1.5rem" style={{ transform: "rotateZ(-90deg)" }}>
          <ChevronIcon />
        </Ixon>
      </button>
    </div>
  );
};

export default HomeAdSlider;
