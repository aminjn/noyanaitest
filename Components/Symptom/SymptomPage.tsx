"use client";
import Image from "next/image";
import {
  IDisease,
  IDrug,
  ISymptom,
} from "../Admin/Disease/AdminManageDiseasesPage";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import classes from "./SymptomPage.module.css";
import { imagePath } from "../helpers/imagepath";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageWideHeader from "../UI/ListPage/ListPageWideHeader";
import FlaskIcon from "../Icons/FlaskIcon";
import BigAd from "../UI/ListPage/BigAd";
import ListPageWithSide from "../UI/ListPage/ListPageWithSide";
import { Fragment } from "react";
import ListPageSideSection from "../UI/ListPage/ListPageSideSection";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import ListPageSideExpandable from "../UI/ListPage/ListPageSideExpandable";
import ListPageAISummary from "../UI/ListPage/ListPageAiSummary";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";

export type SymptomPageProps = {
  data: ISymptom<{
    SameAs: Record<never, never>;
    Category: Record<never, never>;
  }>;
  diseases: IDisease[];
  doctors: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    TextChatSettings: Record<never, never>;
    SipCallSettings: Record<never, never>;
    InPersonSettings: Record<never, never>;
    VideoCallSettings: Record<never, never>;
    VoiceCallSettings: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  drugs: IDrug[];
  specialities: ISpeciality[];
};

export const TitleTextSection = ({
  title,
  value,
}: {
  title: ContentKey;
  value?: string;
}) => {
  const getContent = useLocale();

  if (!value) return null;
  return (
    <section className={classes.section}>
      <h2 className={classes.h2}>{getContent(title)}</h2>
      <p className={classes.text}>{value}</p>
    </section>
  );
};

const SymptomPage = ({
  data,
  diseases,
  doctors,
  drugs,
  specialities,
}: SymptomPageProps) => {
  const getContent = useLocale();

  console.log(drugs);
  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "علائم", target: "/symptom" },
        {
          title: data.name || data._id,
          target: `/symptom/${data.slug || data._id}`,
        },
      ]}
    >
      <ListPageWideHeader
        icon={<FlaskIcon />}
        name={data.name || ""}
        category={
          data.category
            ? {
                title: getContent("symptomCategory"),
                value: data.category?.name || "",
              }
            : undefined
        }
        primaryAction={{ title: getContent("bookASessionFromADoctor") }}
        secondaryAction={{ title: getContent("inspectSymptomWithAi") }}
        summary={data.summary}
      />
      <BigAd position="symptom1" resourceModel="Symptom" resource={data._id} />
      <ListPageWithSide
        side={
          <Fragment>
            <ListPageSideSection
              title={getContent("relatedDoctors")}
              cards={doctors.map((el) => (
                <DoctorCardAlt key={el._id} node={el} />
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
              items={drugs.map((el) => ({
                title: el.name || "",
                target: `/drug/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("similarSymptoms")}
              items={data.sameAs.map((el) => ({
                title: el.name || "",
                target: `/symptom/${el.slug || el._id}`,
              }))}
            />
          </Fragment>
        }
      >
        <ListPageAISummary
          title={getContent("symptomAiSummaryTitle")}
          content={data.aiSummary}
        />
        <div className={classes.box}>
          <RenderRtf value={data.content} />
        </div>
      </ListPageWithSide>
      <SmallAd
        position="symptom1"
        resourceModel="Symptom"
        resource={data._id}
      />
    </ListPageLayout>
  );
};

export default SymptomPage;
