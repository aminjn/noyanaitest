import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import SectionHeader from "../UI/SectionHeader";
import classes from "./HomePopular.module.css";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";
import DoctorCardAlt from "../UI/DoctorCardAlt";

const NS: ContentNamespace[] = ["common", "home"];

const HomePopular = ({
  nodes,
}: {
  nodes?: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(NS);

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <SectionHeader
        title={getContent("popularDoctors")}
        action={{ href: "/book", label: getContent("seeAll") }}
      />
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
