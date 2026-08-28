import { useState } from "react";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import classes from "./HomeSpecialities.module.css";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import HostedImage from "../UI/HostedImage";
import useComplexLocale from "../Hooks/useComplexLocale";
import { t2xlBold, tlgBold, tsmDemiBold, tsmMedium } from "../UI/Typography";
import { SwiperSlide } from "swiper/react";
import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import CrownIcon from "../Icons/CrownIcon";
import SwiperSlider from "../UI/SwiperSlider";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import Button from "../UI/Button";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";

const SpecialityDoctors = ({ node }: { node: ISpeciality }) => {
  const { data } = useSWR<
    IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[]
  >(`${API}/public/specialityDoctors/${node._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.doctors),
  );

  const getCompContent = useComplexLocale();

  const getContent = useLocale();

  return (
    <div className={classes.doctorsBox}>
      <div className={classes.doctorsHeader}>
        <div className={classes.doctorsTitleBox}>
          <Ixon width="2.25rem" className={classes.crown}>
            <CrownIcon />
          </Ixon>
          <h4 className={`${classes.doctorsTitle} ${tlgBold}`}>
            {getCompContent("xSpecialityGreatestDoctors", [node.name || ""])}
          </h4>
        </div>
        <Button
          tailIcon={<ArrowLeftIcon />}
          href={`/speciality/${node.slug || node._id}`}
          size="S"
          mode="Inline"
          variant="Primary"
          style={{ backgroundColor: "transparent" }}
        >
          {getContent("goToPage")}
        </Button>
      </div>
      {!!data?.length && (
        <SwiperSlider>
          {data.map((node) => (
            <SwiperSlide key={node._id} className={classes.doctorSlide}>
              <DoctorCardAlt node={node} />
            </SwiperSlide>
          ))}
        </SwiperSlider>
      )}
    </div>
  );
};

const HomeSpecialitiesInner = ({ nodes }: { nodes: ISpeciality[] }) => {
  const [activeNode, setActiveNode] = useState<ISpeciality | null>(null);

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h2 className={`${classes.title} ${t2xlBold}`}>
          {getContent("mostViewedSpecialities")}
        </h2>
        <Button
          href={"/speciality"}
          tailIcon={
            <span style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </span>
          }
          variant="Primary"
          mode="Inline"
          size="S"
          style={{ backgroundColor: "transparent" }}
        >
          {getContent("seeAll")}
        </Button>
      </div>
      <ul className={classes.grid}>
        {nodes.map((node) => (
          <li key={node._id}>
            <div
              className={`${classes.speciality} ${activeNode?._id === node._id ? classes.activeSpeciality : ""}`}
              onClick={() => setActiveNode(node)}
            >
              <div className={classes.image}>
                <HostedImage
                  src={node.image}
                  alt={node.name || ""}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="3.5rem"
                />
              </div>
              <span className={`${classes.specialityName} ${tsmDemiBold}`}>
                {node.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {!!activeNode && <SpecialityDoctors node={activeNode} />}
    </div>
  );
};

const HomeSpecialities = ({ nodes }: { nodes?: ISpeciality[] }) => {
  if (!nodes?.length) return null;
  return <HomeSpecialitiesInner nodes={nodes} />;
};

export default HomeSpecialities;
