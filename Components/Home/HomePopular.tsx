import Link from "next/link";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
import classes from "./HomePopular.module.css";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import { t2xlBold, tlgMedium } from "../UI/Typography";

const HomePopular = ({
  nodes,
}: {
  nodes?: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
}) => {
  const getContent = useLocale();

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h2 className={`${classes.title} ${t2xlBold}`}>
          {getContent("popularDoctors")}
        </h2>
        <Link href={"/doctors"} className={classes.all}>
          <span className={`${classes.allText} ${tlgMedium}`}>
            {getContent("seeAll")}
          </span>
          <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      </div>
      <SwiperSlider>
        {nodes.map((node) => (
          <SwiperSlide key={node._id} tag="li" className={classes.slide}>
            <DoctorCardAlt node={node} />
          </SwiperSlide>
        ))}
      </SwiperSlider>
    </div>
  );
};

export default HomePopular;
