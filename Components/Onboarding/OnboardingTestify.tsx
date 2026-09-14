import "swiper/css";
import { SwiperSlide } from "swiper/react";
import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingTestify.module.css";
import { ITestify } from "../Admin/Testify/AdminManageTestifiesPage";
import HostedImage from "../UI/HostedImage";
import SwiperSlider from "../UI/SwiperSlider";
import {
  t4xlBold,
  tlgDemiBold,
  tbaseRegular,
  txsRegular,
  txlBold,
} from "../UI/Typography";

const OnboardingTestify = ({ data }: { data?: ITestify[] }) => {
  const getContent = useLocale();

  if (!data?.length) return null;
  return (
    <div className={classes.main}>
      <h2 className={`${classes.title} ${txlBold}`}>
        {getContent("onboardingTestifyTitle")}
      </h2>
      <div className={classes.list}>
        <SwiperSlider>
          {data.map((node) => (
            <SwiperSlide key={node._id} className={classes.slide}>
              <div className={classes.card}>
                <div className={classes.avatar}>
                  <HostedImage
                    src={node.image}
                    alt={node.name || ""}
                    fill
                    sizes="5rem"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className={`${classes.name} ${tlgDemiBold}`}>
                  {node.name}
                </span>
                <span className={`${classes.role} ${tbaseRegular}`}>
                  {node.title}
                </span>
                <p className={`${classes.content} ${txsRegular}`}>
                  {node.content}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
    </div>
  );
};

export default OnboardingTestify;
