import Image from "next/image";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import classes from "./SpecialityCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import UserGroupIcon from "../Icons/UserGroupIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import CrownIcon from "../Icons/CrownIcon";
import Bitches from "../Booking/Bitches/Bitches";
import Button from "../UI/Button";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { Swiper, SwiperClass } from "swiper/react";
import { chunk } from "../helpers/lib";
import { SwiperSlide } from "swiper/react";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import StarIcon from "../Icons/StarIcon";
import { t2xsMedium, tsmBold, txsDemiBold, txsMedium } from "../UI/Typography";
import { useMemo, useState } from "react";

const DoctorsSlider = ({
  nodes,
}: {
  nodes: IDoctorProfile<{ Province: Record<never, never> }>[];
}) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>();

  const [index, setIndex] = useState<number>(0);

  const chunks = useMemo(() => chunk(nodes), [nodes]);

  if (!nodes.length) return null;
  if (!chunks.length) return null;
  return (
    <div className={classes.sliderContent}>
      <div className={classes.slider}>
        <Swiper
          slidesPerView={1}
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onSlideChange={(e) => setIndex(e.activeIndex)}
        >
          {chunk(nodes).map((chunk, i) => (
            <SwiperSlide key={`Chunk${i}`}>
              <div className={classes.chunk}>
                {chunk.map((doctor) => (
                  <div className={classes.doctor} key={doctor._id}>
                    <div className={classes.doctorIcon}>
                      <Ixon width="1rem">
                        <StetoscopeIcon />
                      </Ixon>
                    </div>
                    <div className={classes.doctorDetail}>
                      <span className={`${classes.doctorName} ${txsDemiBold}`}>
                        {getDoctorProfileLabel(doctor)}
                      </span>
                      {doctor.province && (
                        <span className={`${classes.province} ${t2xsMedium}`}>
                          {doctor.province.name}
                        </span>
                      )}
                    </div>
                    <div className={`${classes.score} ${txsMedium}`}>
                      <Ixon width=".75rem">
                        <StarIcon />
                      </Ixon>
                      <span>4.9</span>
                    </div>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={classes.navs}>
        {chunks.map((_, i) => (
          <button
            onClick={() => swiper?.slideTo(i)}
            key={`chunk${i}`}
            className={`${classes.nav} ${index === i ? classes.activeNav : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

const SpecialityCard = ({
  node,
}: {
  node: ISpeciality<{ Doctors: { Province: Record<never, never> } }>;
}) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <div className={classes.headerIcon}>
          <Ixon width="2rem">
            <StetoscopeIcon />
          </Ixon>
        </div>
        <div className={classes.headerDetails}>
          <span className={`${classes.name} ${tsmBold}`}>{node.name}</span>
          <div className={`${classes.countBox} ${txsMedium}`}>
            <Ixon width=".75rem">
              <UserGroupIcon />
            </Ixon>
            <span>
              {getContent("nDoctors", [
                (
                  (node.doctorsCountWithMainSpeciality || 0) +
                  (node.doctorsCountWithSideSpeciality || 0)
                )?.toString(),
              ])}
            </span>
          </div>
        </div>
        <div className={classes.chevron}>
          <Ixon width="1.5rem">
            <ChevronIcon />
          </Ixon>
        </div>
      </div>
      <div className={classes.doctorsBox}>
        <div className={classes.doctorsHeader}>
          <Ixon width=".75rem" className={classes.crownIcon}>
            <CrownIcon />
          </Ixon>
          <span className={classes.bestDoctors}>
            {getContent("bestDoctors")}
          </span>
        </div>
        <div className={classes.sliderBox}>
          <DoctorsSlider nodes={node.doctors} />
        </div>
      </div>
      <div className={classes.actions}>
        <Bitches />
        <Button
          variant="Primary"
          mode="Inline"
          radius="Medium"
          size="S"
          tailIcon={
            <span style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </span>
          }
          href={`/speciality/${node.slug || node._id}`}
        >
          {getContent("seeAll")}
        </Button>
      </div>
    </li>
  );
};

export default SpecialityCard;
