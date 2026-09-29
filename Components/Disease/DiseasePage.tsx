"use client";
import Image from "next/image";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./DiseasePage.module.css";
import { imagePath } from "../helpers/imagepath";
import { TitleTextSection } from "../Symptom/SymptomPage";
import SymptomCard from "../Symptom/SymptomCard";
import { Fragment, ReactNode } from "react";
import { ContentKey } from "../Enums/contentKeys";
import SpecialityCard from "../Speciality/SpecialityCard";
import DrugCard from "../Drug/DrugCard";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageWideHeader from "../UI/ListPage/ListPageWideHeader";
import FlaskIcon from "../Icons/FlaskIcon";
import BigAd from "../UI/ListPage/BigAd";
import ListPageWithSide from "../UI/ListPage/ListPageWithSide";
import ListPageSideSection from "../UI/ListPage/ListPageSideSection";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import ClinicCardAlt from "./ClinicCardAlt";
import ListPageSideExpandable from "../UI/ListPage/ListPageSideExpandable";
import ListPageAISummary from "../UI/ListPage/ListPageAiSummary";
import RenderRtf from "../UI/RenderRtf";
import SmallAd from "../UI/ListPage/SmallAd";

const NS: ContentNamespace[] = ["common", "diseasePage"];

export type DiseasePageProps = {
  data: IDisease<{
    Speciality: Record<never, never>;
    Symptom: Record<never, never>;
    Drugs: Record<never, never>;
    Category: Record<never, never>;
    SameAs: Record<never, never>;
  }>;
  doctors: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    TextChatSettings: Record<never, never>;
    SipCallSettings: Record<never, never>;
    InPersonSettings: Record<never, never>;
    VideoCallSettings: Record<never, never>;
    VoiceCallSettings: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  clinics: IClinic<{
    Category: Record<never, never>;
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>[];
};

const DiseasePage = ({ data, clinics, doctors }: DiseasePageProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("diseases"), target: "/disease" },
        {
          title: data.name || data._id,
          target: `/disease/${data.slug || data._id}`,
        },
      ]}
    >
      <ListPageWideHeader
        icon={<FlaskIcon />}
        name={data.name || ""}
        category={{
          title: getContent("diseaseCategory"),
          value: data.category?.name || "",
        }}
        summary={data.summary}
        primaryAction={{
          title: getContent("bookASessionFromADoctor"),
          // doctors who treat this disease, on the booking search
          href: `/book?disease=${data._id}&name=${encodeURIComponent(data.name || "")}`,
        }}
        secondaryAction={{ title: getContent("inpectDiseaseWithAi"), href: "/wizard" }}
      />
      <BigAd position="disease1" />
      <ListPageWithSide
        side={
          <Fragment>
            <ListPageSideSection
              title={getContent("relatedDoctors")}
              cards={doctors.map((doctor) => (
                <DoctorCardAlt key={doctor._id} node={doctor} />
              ))}
              cardWidth={236}
            />
            <ListPageSideSection
              title={getContent("relatedClinics")}
              cards={clinics.map((clinic) => (
                <ClinicCardAlt key={clinic._id} node={clinic} />
              ))}
              cardWidth={236}
            />
            <ListPageSideExpandable
              title={getContent("relatedSpecialities")}
              items={data.specialities.map((el) => ({
                title: el.name || "",
                target: `/speciality/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("similarDiseases")}
              items={data.sameAs.map((el) => ({
                title: el.name || "",
                target: `/disease/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("relatedSymptoms")}
              items={data.symptoms.map((el) => ({
                title: el.name || el._id,
                target: `/symptom/${el.slug || el._id}`,
              }))}
            />
            <ListPageSideExpandable
              title={getContent("relatedDrugs")}
              items={data.drugs.map((el) => ({
                title: el.name || "",
                target: `/drug/${el.slug || el._id}`,
              }))}
            />
          </Fragment>
        }
      >
        <Fragment>
          <ListPageAISummary
            title={getContent("diseaseAiSummaryTitle")}
            content={data.aiSummary}
          />
          <div className={classes.box}>
            <RenderRtf value={data.content} />
          </div>
        </Fragment>
      </ListPageWithSide>
      <SmallAd position="disease1" />
    </ListPageLayout>
  );
};

export default DiseasePage;
