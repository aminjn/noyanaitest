"use client";
import Image from "next/image";
import {
  IDisease,
  IDrug,
  ISymptom,
} from "../Admin/Disease/AdminManageDiseasesPage";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import useSiteSettings from "../Hooks/useSiteSettings";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./SymptomPage.module.css";
import { imagePath } from "../helpers/imagepath";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageWideHeader, {
  medicalReviewerOf,
  medicalReviewPending,
} from "../UI/ListPage/ListPageWideHeader";
import ListPageFacts from "../UI/ListPage/ListPageFacts";
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
import DirectoryFunnel, {
  aiCheckHref,
  bookSpecialistHref,
} from "../Directory/DirectoryFunnel";

const NS: ContentNamespace[] = ["common", "symptomPage"];

export type SymptomPageProps = {
  data: ISymptom<{
    SameAs: Record<never, never>;
    Category: Record<never, never>;
    Part: Record<never, never>;
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
  const getContent = useScopedLocale(NS);

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
  const getContent = useScopedLocale(NS);
  const emergency = useSiteSettings();

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("symptoms"), target: "/symptom" },
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
        reviewer={medicalReviewerOf(data)}
        pendingReview={medicalReviewPending(data)}
        primaryAction={{
          title: getContent("bookASpecialist"),
          // the booking search narrowed to the speciality that treats it
          href: bookSpecialistHref(specialities[0]),
        }}
        // the AI symptom check opened on this symptom (2026-10)
        secondaryAction={{
          title: getContent("inspectSymptomWithAi"),
          href: aiCheckHref(getContent("aiPrefillSymptom", [data.name || ""])),
        }}
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
              cardWidth={236}
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
              // the directory's "by body part" pages of this symptom
              title={getContent("directoryByPart")}
              items={(Array.isArray(data.part) ? data.part : [])
                .filter((el): el is Exclude<typeof el, string> => !!el && typeof el === "object")
                .map((el) => ({
                  title: el.name || "",
                  target: `/symptom/part/${el.slug || el._id}`,
                }))}
            />
            <ListPageSideExpandable
              title={getContent("similarSymptoms")}
              items={(data.sameAs ?? []).map((el) => ({
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
        <ListPageFacts
          items={[
            { title: getContent("description"), value: data.description },
            { title: getContent("pathophysiology"), value: data.pathophysiology },
            { title: getContent("naturalProgeression"), value: data.naturalProgression },
            { title: getContent("expectedPrognosis"), value: data.expectedPrognosis },
          ]}
        />
        <ListPageFacts
          // safety apart and highlighted: complications, and the warning
          // signs that need a doctor or the emergency number (every page)
          title={getContent("whenToSeeADoctor")}
          tone="warning"
          items={[
            { title: getContent("possibleComplications"), value: data.possibleComplication },
          ]}
          note={
            // the number and the on/off are the super admin's (System
            // settings -> General); the wording is the UI text
            emergency.emergencyNoteEnabled
              ? getContent("seeDoctorWarningNote", [emergency.emergencyNumberText])
              : undefined
          }
        />
        {!!data.content && (
          <div className={classes.box}>
            <RenderRtf value={data.content} />
          </div>
        )}
        <DirectoryFunnel
          aiPrompt={getContent("aiPrefillSymptom", [data.name || ""])}
          speciality={specialities[0]}
        />
      </ListPageWithSide>
      <SmallAd
        position="symptom2"
        resourceModel="Symptom"
        resource={data._id}
      />
    </ListPageLayout>
  );
};

export default SymptomPage;
