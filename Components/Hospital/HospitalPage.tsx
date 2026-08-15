"use client";

import { useMemo } from "react";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import MedicalCenterLayout from "../Clinic/MedicalCenterLayout";
import StickyNav, { SectionMap } from "../Clinic/StickyNav";
import WideIntro from "../Clinic/WideIntro";
import useLocale from "../Hooks/useLocale";
import classes from "./HospitalsPage.module.css";
import MedicalCenterSummary from "../Clinic/MedicalCenterSummary";
import MedicalCenterTagList from "../Clinic/MedicalCenterTagList";
import MedicalCenterContactInfo from "../Clinic/MedicalCenterContactInfo";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import HospitalPageClinics from "./HospitalPageClinics";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import MedicalCenterSpecialities from "../Clinic/MedicalCenterSpecialities";
import MedicalCenterServices from "../Clinic/MedicalCenterServices";
import MedicalCenterInsurances from "../Clinic/MedicalCenterInsurances";
import MedicalCenterCertificates from "../Clinic/MedicalCenterCertificates";
import MedicalCenterDoctors from "../Clinic/MedicalCenterDoctors";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import LocationSection from "../Clinic/LocationSection";
import CommentSection from "../Comment/CommentSection";
import SmallAd from "../UI/ListPage/SmallAd";

export type HospitalPageNode = IHospital<{
  Province: Record<never, never>;
  Category: Record<never, never>;
  Clinics: {
    Clinic: {
      DoctorsPopulated: {
        DoctorPopulated: { MainSpecialityPopulated: Record<never, never> };
      };
    };
  };
  Tags: Record<never, never>;
  Owner: Record<never, never>;
  Insurances: Record<never, never>;
}>;

export type HospitalPageProps = {
  data: HospitalPageNode;
};

const HospitalPage = ({ data }: HospitalPageProps) => {
  console.log(data);
  const getContent = useLocale();

  const specialities = useMemo<ISpeciality[]>(
    () =>
      data.clinics
        .map((c) => c.clinic.doctors)
        .reduce(
          (acc, el) => [...acc, ...el.map((c) => c.doctor?.mainSpeciality)],
          [] as (ISpeciality | undefined)[],
        )
        .filter(Boolean) as ISpeciality[],
    [data.clinics],
  );

  console.log(specialities);

  const sections = useMemo<SectionMap>(() => {
    const result: SectionMap = [
      { title: "introduction", target: "introduction" },
    ];
    if (data.tags.length)
      result.push({ title: "features", target: "features" });
    result.push({ title: "clinics", target: "clinics" });
    // if (data.clinics.length)
    //   result.push({ title: "departments", target: "departments" });
    // if (data.specialities)
    //   result.push({ title: "specialities", target: "specialities" });
    // if (node.services?.length)
    //   result.push({ title: "service", target: "services" });
    // if (node.insurances.length)
    //   result.push({ title: "insurances", target: "insurances" });
    // if (node.doctors.length)
    //   result.push({ title: "doctors", target: "doctors" });
    if (data.location) result.push({ title: "location", target: "location" });
    result.push({ title: "comments", target: "comments" });
    return result;
  }, [data]);

  const doctors = useMemo<
    IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[]
  >(() => {
    const result = data.clinics
      .map((c) => c.clinic)
      .reduce(
        (acc, el) => [...acc, ...el.doctors.map((e) => e.doctor)],
        [] as (IDoctorProfile<{
          MainSpecialityPopulated: Record<never, never>;
        }> | null)[],
      )
      .filter(Boolean);
    return result as IDoctorProfile<{
      MainSpecialityPopulated: Record<never, never>;
    }>[];
  }, [data.clinics]);

  return (
    <div className={classes.main}>
      <MedicalCenterLayout
        back={{ target: "/hospital", title: getContent("backToHospitalsList") }}
      >
        <WideIntro
          name={data.name}
          commentCount={450}
          score={4.9}
          category={data.category?.name}
          image={data.image}
          province={data.province?.name}
        />
        <StickyNav map={sections} />
        <MedicalCenterSummary
          code={data.code}
          doctorCount={data.clinics.reduce(
            (acc, el) => acc + el.clinic.doctors.length,
            0,
          )}
          establishment={data.establishment}
          personelCount={data.personelCount}
          summary={data.summary}
        />
        <MedicalCenterTagList tags={data.tags} />
        <MedicalCenterContactInfo
          address={data.address}
          businessTimes={data.businessTimes}
          mail={data.mail}
          owner={data.owner ? getDoctorProfileLabel(data.owner) : undefined}
          phone={data.phone}
          website={data.website}
        />
        <HospitalPageClinics node={data} />
        <MedicalCenterSpecialities nodes={specialities} />
        <MedicalCenterServices nodes={data.services || []} />
        <MedicalCenterInsurances
          nodes={data.insurances}
          title="hospitalInsurances"
        />
        <MedicalCenterCertificates nodes={data.certificates || []} />
        <MedicalCenterDoctors nodes={doctors} />
        <LocationSection
          coords={data.location?.coordinates}
          name={data.name}
          address={data.address}
        />
        <div className={classes.comments} id="comments">
          <CommentSection model="Hospital" nodeId={data._id} />
        </div>
      </MedicalCenterLayout>
      <SmallAd />
    </div>
  );
};

export default HospitalPage;
