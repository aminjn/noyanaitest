import { useState } from "react";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import SectionHeader from "../UI/SectionHeader";
import classes from "./HomeSpecialities.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import HostedImage from "../UI/HostedImage";
import { tlgBold, tsmDemiBold, } from "../UI/Typography";
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

const NS: ContentNamespace[] = ["common", "home"];

const SpecialityDoctors = ({ node }: { node: ISpeciality }) => {
  const { data } = useSWR<
    IDoctorProfile<{
      MainSpecialityPopulated: Record<never, never>;
      TextChatSettings: Record<never, never>;
      SipCallSettings: Record<never, never>;
      InPersonSettings: Record<never, never>;
      VideoCallSettings: Record<never, never>;
      VoiceCallSettings: Record<never, never>;
      Province: Record<never, never>;
    }>[]
  >(`${API}/public/specialityDoctors/${node._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.doctors),
  );

  const getContent = useScopedLocale(NS);
  const getCompContent = getContent;

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

  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      {/* the admin's picks (isHome), not a view ranking */}
      <SectionHeader
        title={getContent("featuredSpecialities")}
        description={getContent("megaDescSpecialities")}
        action={{ href: "/speciality", label: getContent("seeAll") }}
      />
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
                  loading="lazy"
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
