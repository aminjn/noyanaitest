import classes from "./HomeServices.module.css";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import CrownIcon from "../Icons/CrownIcon";
import Link from "next/link";
import DoubleChevronIcon from "../Icons/DoubleChevronIcon";
import Image from "next/image";
import serviceImage from "./services.png";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";
import ServiceCard from "../UI/ServiceCard";
import { t4xlBold, tlgBold, tmdMedium } from "../UI/Typography";
import Button from "../UI/Button";

const HomeServices = ({
  nodes,
}: {
  nodes?: IService<{ Owner: Record<never, never> }>[];
}) => {
  const getContent = useLocale();

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Link href={"/service"} className={classes.chevron}>
          <Ixon width="1.5rem">
            <DoubleChevronIcon />
          </Ixon>
        </Link>
        <div className={classes.titleBox}>
          <h2 className={tlgBold}>{getContent("bestCliniclaServices")}</h2>
          <Ixon width="1.5rem">
            <CrownIcon />
          </Ixon>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.list}>
          <SwiperSlider>
            {nodes.map((node) => (
              <SwiperSlide tag="li" key={node._id} className={classes.slide}>
                <ServiceCard node={node} />
              </SwiperSlide>
            ))}
          </SwiperSlider>
        </div>
        <div className={classes.intro}>
          <div className={classes.image}>
            <Image
              src={serviceImage}
              alt={"Noyan Services"}
              fill
              style={{ objectFit: "contain" }}
              sizes="12rem"
            />
          </div>
          <h3 className={`${classes.secondareyTitle} ${t4xlBold}`}>
            {getContent("noyanClinicalServicesTitle")}
          </h3>
          <p className={`${classes.description} ${tmdMedium}`}>
            {getContent("noyanClinicalServicesDescription")}
          </p>
          <Button
            href={"/service"}
            leadIcon={
              <Ixon style={{ transform: "rotateZ(180deg)" }}>
                <ArrowLeftIcon />
              </Ixon>
            }
            className={classes.action}
            variant="Primary"
            mode="Outline"
            size="L"
            radius="Medium"
          >
            {getContent("seeAllClinicalServices")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeServices;
