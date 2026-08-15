"use client";
import { useMemo } from "react";
import MedicalCenterLayout from "../Clinic/MedicalCenterLayout";
import StickyNav, { SectionMap } from "../Clinic/StickyNav";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import useLocale from "../Hooks/useLocale";
import classes from "./InsurancePage.module.css";
import InsurancePageIntro from "./InsurancePageIntro";
import InsurancePageInfo from "./InsurancePageInfo";
import InsuranceCoverages from "./InsuranceCoverages";
import InsurancePlans from "./InsurancePlans";
import InsuranceAdvantages from "./InsuranceAdvantages";
import InsuranceContact from "./InsuranceContact";
import LocationSection from "../Clinic/LocationSection";
import CommentSection from "../Comment/CommentSection";

export type InsurancePageNode = IInsurance<{
  Category: Record<never, never>;
  Plans: Record<never, never>;
}>;

export type InsurancePageProps = { data: InsurancePageNode };

const InsurancePage = ({ data }: InsurancePageProps) => {
  const getContent = useLocale();

  const sections = useMemo<SectionMap>(() => {
    return [];
  }, []);

  return (
    <MedicalCenterLayout
      back={{ target: "/insurance", title: getContent("backToList") }}
    >
      <InsurancePageIntro node={data} />
      <StickyNav map={sections} />
      <div className={classes.content}>
        <InsurancePageInfo node={data} />
        <InsuranceCoverages node={data} />
        <InsurancePlans node={data} />
        <InsuranceAdvantages node={data} />
        <InsuranceContact node={data} />
        <LocationSection
          name={data.name}
          address={data.address}
          coords={data.location?.coordinates}
        />
        <CommentSection model="Insurance" nodeId={data._id} />
      </div>
    </MedicalCenterLayout>
  );
};

export default InsurancePage;
