"use client";
import Image from "next/image";
import { IDisease, IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DrugPage.module.css";
import { imagePath } from "../helpers/imagepath";
import { TitleTextSection } from "../Symptom/SymptomPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import ListPageWideHeader from "../UI/ListPage/ListPageWideHeader";
import useLocale from "../Hooks/useLocale";
import PillIcon from "../Icons/PillIcon";
import BigAd from "../UI/ListPage/BigAd";
import ListPageWithSide from "../UI/ListPage/ListPageWithSide";
import { Fragment } from "react";
import ListPageSideSection from "../UI/ListPage/ListPageSideSection";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import ListPageSideExpandable from "../UI/ListPage/ListPageSideExpandable";
import ListPageAISummary from "../UI/ListPage/ListPageAiSummary";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";

export type DrugPageProps = {
  data: IDrug<{ SameAs: Record<never, never> }>;
  diseases: IDisease[];
  doctors: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
  specialities: ISpeciality[];
};
const DrugPage = ({ data, diseases, doctors, specialities }: DrugPageProps) => {
  const getContent = useLocale();

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "دارو ها", target: "/drug" },
        {
          title: data.name || data._id,
          target: `/drug/${data.slug || data._id}`,
        },
      ]}
    >
      <ListPageWideHeader
        name={data.name || ""}
        category={{
          title: getContent("alternateName"),
          value: data.alternateName || "",
        }}
        summary={data.summary}
        primaryAction={{ title: getContent("seeNoyanClinic") }}
        secondaryAction={{ title: getContent("inspectDrugWithAi") }}
        icon={<PillIcon />}
      />
      <BigAd position="drug1" />
      <ListPageWithSide
        side={
          <Fragment>
            <ListPageSideSection
              title={getContent("relatedDoctors")}
              cards={doctors.map((node) => (
                <DoctorCardAlt key={node._id} node={node} />
              ))}
            />
            <ListPageSideExpandable
              title={getContent("relatedSpecialities")}
              items={specialities.map((el) => ({
                title: el.name || "",
                target: `/speciality/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("relatedDiseases")}
              items={diseases.map((el) => ({
                title: el.name || "",
                target: `/disease/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("relatedDrugs")}
              items={data.sameAs.map((el) => ({
                title: el.name || "",
                target: `/drug/${el.slug || el._id}`,
              }))}
            />
          </Fragment>
        }
      >
        <ListPageAISummary
          title={getContent("drugAiSummary")}
          content={data.aiSummary}
        />
        <div className={classes.box}>{<RenderRtf value={data.content} />}</div>
      </ListPageWithSide>
      <SmallAd position="drug2" />
    </ListPageLayout>
  );
};

export default DrugPage;
