import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IHomeIntroduction } from "../Admin/HomeIntroduction/AdminManageHomeIntroductionsPage";
import useLocale from "../Hooks/useLocale";
import classes from "./HomeIntroduction.module.css";
import useWindow from "../Hooks/useWindow";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import { t4xlBold, tlgDemiBold } from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";

const INITIAL_ITEM_WIDTH = 240;
const WIDTH_STEP = 20;
const GAP = 46;

const HomeIntroductionInner = ({ nodes }: { nodes: IHomeIntroduction[] }) => {
  // const getContent = useLocale();

  const getContent = useScopedLocale(["home"]);

  const [isServer, setIsServer] = useState<boolean>(true);

  useEffect(() => setIsServer(false), []);

  const { width: windowWidth } = useWindow();

  const maxCanFit = useMemo<number>(() => {
    if (isServer) return 7;
    let acc = INITIAL_ITEM_WIDTH;
    let currentWidth = INITIAL_ITEM_WIDTH;
    let count = 1;
    while (currentWidth > 0 && acc < windowWidth) {
      currentWidth -= WIDTH_STEP;
      acc += (currentWidth + GAP) * 2;
      count += 2;
    }
    return count > 3 ? count - 2 : count;
  }, [isServer, windowWidth]);

  const extendedNodes = useMemo<IHomeIntroduction[]>(() => {
    const result = [];
    while (maxCanFit >= result.length) result.push(...nodes);
    return result;
  }, [maxCanFit, nodes]);

  const [index, setIndex] = useState<number>(0);

  const getDistance = useCallback(
    (i: number) => {
      const visibleCenter = index + Math.floor(maxCanFit / 2);
      const total = extendedNodes.length;
      let diff = i - visibleCenter;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return Math.abs(diff);
    },
    [extendedNodes, index, maxCanFit],
  );

  const getVisualProgress = (i: number) => {
    const center = index + Math.floor(maxCanFit / 2);
    const total = extendedNodes.length;
    let diff = i - center;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    const abs = Math.abs(diff);
    const maxDist = Math.floor(maxCanFit / 2);
    return Math.min(abs / maxDist, 1);
  };

  const getStyle = (i: number) => {
    const t = getVisualProgress(i);
    const d = getDistance(i);
    const scale = 1 - t * 0.3;

    return {
      transform: `scale(${scale})`,
      backgroundColor: !!d ? "var(--primary2)" : "var(--primary1)",
      border: !!d ? "1px solid var(--white)" : "2px solid var(--primary3)",
    };
  };

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.intro}>
          <h2 className={`${classes.title} ${t4xlBold}`}>
            {getContent("noyanIntroductionTitle")}
          </h2>
          <legend className={`${classes.legend} ${tlgDemiBold}`}>
            {getContent("noyanIntroductionLegend")}
          </legend>
        </div>
        <Swiper
          wrapperTag="ul"
          slidesPerView={maxCanFit}
          onSlideChange={(e) => setIndex(e.realIndex)}
          loop
          spaceBetween={"32px"}
        >
          {extendedNodes.map((node, i) => (
            <SwiperSlide key={`${node._id}${i}`} tag="li">
              <div className={classes.slideContainer}>
                <div className={classes.slide} style={getStyle(i)}>
                  <div className={classes.image}>
                    <Image
                      src={imagePath(node.image)}
                      alt={node.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <legend className={`${classes.slideTitle} ${tlgDemiBold}`}>
                    {node.title}
                  </legend>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

const HomeIntroduction = ({ nodes }: { nodes?: IHomeIntroduction[] }) => {
  if (!nodes) return;
  return <HomeIntroductionInner nodes={nodes} />;
};

export default HomeIntroduction;
