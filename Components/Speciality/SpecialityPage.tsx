"use client";

import classes from "./SpecialityPage.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useParams, useSearchParams } from "next/navigation";
import { DoctorSessionType } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import Ixon from "../UI/Ixon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import UserGroupIcon from "../Icons/UserGroupIcon";
import Button from "../UI/Button";
import ArrowCircleDownIcon from "../Icons/ArrowCircleDownIcon";
import ListPageList from "../UI/ListPage/ListPageList";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import DoctorCard from "../Doctor/DoctorCard";
import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";
import BigAd from "../UI/ListPage/BigAd";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";
import { t2xlRegular, tsmRegular, txlRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "specialityPage"];

// getSpeciality returns Doctor and DoctorProfile rows merged into one
// paginated list, each tagged with the collection it came from.
export type SpecialityDoctorProfileRow = IDoctorProfile<{
  MainSpecialityPopulated: Record<never, never>;
  TextChatSettings: Record<never, never>;
  SipCallSettings: Record<never, never>;
  InPersonSettings: Record<never, never>;
  VideoCallSettings: Record<never, never>;
  VoiceCallSettings: Record<never, never>;
  Province: Record<never, never>;
}> & { sessionTypes: DoctorSessionType[]; model: "DoctorProfile" };

export type SpecialityDoctorRow = IDoctor<{
  SpecialityPopulated: Record<never, never>;
}> & { model: "Doctor" };

export type SpecialityPageProps = {
  data: ISpeciality<{ Category: Record<never, never> }>;
  doctors: (SpecialityDoctorProfileRow | SpecialityDoctorRow)[];
  pagesCount: number;
  count: number;
};

const SpecialityPage = ({
  data,
  doctors,
  pagesCount,
  count,
}: SpecialityPageProps) => {
  const getContent = useScopedLocale(NS);

  const searchParams = useSearchParams();

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("specialities"), target: "/speciality" },
        {
          title: data.name || data._id,
          target: `/speciality/${data.slug || data._id}`,
        },
      ]}
    >
      <div className={classes.header}>
        <div className={classes.headerIcon}>
          <Ixon width="2.5rem">
            <StetoscopeIcon />
          </Ixon>
        </div>
        <div className={classes.headerContent}>
          <div className={classes.headerIntro}>
            <h1 className={`${classes.h1} ${t2xlRegular}`}>{data.name}</h1>
            <div className={classes.doctorsCount}>
              <Ixon width=".75rem">
                <UserGroupIcon />
              </Ixon>
              <span>{getContent("nDoctors", [count.toString()])}</span>
            </div>
          </div>
          {!!data.category && (
            <legend className={`${classes.category} ${tsmRegular}`}>
              {data.category.name}
            </legend>
          )}
        </div>
        <Button
          variant="Primary"
          mode="Outline"
          size="L"
          radius="High"
          tailIcon={<ArrowCircleDownIcon />}
          href="#about"
        >
          {getContent("aboutThisSpeciality")}
        </Button>
      </div>
      <ListPageList
        itemWidth="14.75rem"
        pagination={{
          pagesCount,
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) =>
            `/speciality/${data.slug || data._id}?page=${page}`,
        }}
      >
        {doctors.map((node) =>
          node.model === "Doctor" ? (
            <DoctorCard key={`Doctor-${node._id}`} node={node} />
          ) : (
            <DoctorCardAlt key={`DoctorProfile-${node._id}`} node={node} />
          ),
        )}
      </ListPageList>
      <div className={classes.box} id="about">
        <BigAd
          position="speciality1"
          resourceModel="Speciality"
          resource={data._id}
        />
        <RenderRtf value={data.description} />
      </div>
      <SmallAd
        position="speciality2"
        resourceModel="Speciality"
        resource={data._id}
      />
    </ListPageLayout>
  );
};

export default SpecialityPage;
