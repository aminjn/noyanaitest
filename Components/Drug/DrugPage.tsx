"use client";
import Image from "next/image";
import { IDisease, IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DrugPage.module.css";
import { imagePath } from "../helpers/imagepath";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import ListPageWideHeader, {
  medicalReviewerOf,
  medicalReviewPending,
} from "../UI/ListPage/ListPageWideHeader";
import ListPageFacts from "../UI/ListPage/ListPageFacts";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
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

const NS: ContentNamespace[] = ["common", "drugPage"];

export type DrugPageProps = {
  data: IDrug<{ SameAs: Record<never, never> }>;
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
  specialities: ISpeciality[];
};
const DrugPage = ({ data, diseases, doctors, specialities }: DrugPageProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("drugsTitle"), target: "/drug" },
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
        reviewer={medicalReviewerOf(data)}
        pendingReview={medicalReviewPending(data)}
        // the pharmacy products matching this drug (the label used to say
        // "see Noyan clinic" and opened the whole product list)
        primaryAction={{
          title: getContent("poShop"),
          href: `/product?search=${encodeURIComponent(data.name || "")}`,
        }}
        secondaryAction={{ title: getContent("inspectDrugWithAi"), href: "/wizard" }}
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
              items={(data.sameAs ?? []).map((el) => ({
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
        <ListPageFacts
          items={[
            { title: getContent("activeIngridients"), value: data.activeIngridient },
            { title: getContent("dosageForm"), value: data.dosageForm },
            {
              title: getContent("prescribingStatus"),
              value:
                data.prescriptionStatus === "rx"
                  ? getContent("rxRequired" as ContentKey)
                  : data.prescriptionStatus === "otc"
                    ? getContent("rxNotRequired" as ContentKey)
                    : undefined,
            },
            { title: getContent("description"), value: data.description },
          ]}
        />
        <ListPageFacts
          title={getContent("warnings")}
          tone="warning"
          items={[
            { title: getContent("warning"), value: data.warning },
            { title: getContent("sideEffects"), value: data.sideEffects },
            { title: getContent("pregnancyWarning"), value: data.pregnancyWarning },
            { title: getContent("breastfeedingWarning"), value: data.breastfeedingWarning },
            { title: getContent("alcoholWarning"), value: data.alcoholWarning },
            { title: getContent("foodWarning"), value: data.foodWarning },
            { title: getContent("overdosage"), value: data.overdosage },
          ]}
          // shown with every drug: never start or stop on one's own, 115
          note={getContent("drugSafetyNote" as ContentKey)}
        />
        <ListPageFacts
          items={[
            { title: getContent("dosage"), value: data.dosage },
            { title: getContent("adminstrationRoute"), value: data.adminstrationRoute },
            { title: getContent("prescribingInfo"), value: data.prescribingInfo },
            { title: getContent("clinicalPharmacology"), value: data.clinicalPharmacology },
          ]}
        />
        {!!data.content && (
          <div className={classes.box}>
            <RenderRtf value={data.content} />
          </div>
        )}
      </ListPageWithSide>
      <SmallAd position="drug2" />
    </ListPageLayout>
  );
};

export default DrugPage;
