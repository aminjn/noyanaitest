"use client";

import classes from "./SpecialityPage.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
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
import BigAd from "../UI/ListPage/BigAd";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";
import { t2xlRegular, tsmRegular, txlRegular } from "../UI/Typography";

export type SpecialityPageProps = {
  data: ISpeciality<{ Category: Record<never, never> }>;
  doctors: (IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
  }> & { sessionTypes: DoctorSessionType[] })[];
  pagesCount: number;
  count: number;
};

const SpecialityPage = ({
  data,
  doctors,
  pagesCount,
  count,
}: SpecialityPageProps) => {
  const getContent = useLocale();

  const searchParams = useSearchParams();

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "تخصص ها", target: "/speciality" },
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
        >
          {getContent("aboutThisSpeciality")}
        </Button>
      </div>
      <ListPageList
        itemWidth="12.5rem"
        pagination={{
          pagesCount,
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) =>
            `/speciality/${data.slug || data._id}?page=${page}`,
        }}
      >
        {doctors.map((node) => (
          <DoctorCardAlt key={node._id} node={node} />
        ))}
      </ListPageList>
      <div className={classes.box}>
        <BigAd />
        <RenderRtf value={data.description} />
      </div>
      <SmallAd />
    </ListPageLayout>
  );
};

export default SpecialityPage;
