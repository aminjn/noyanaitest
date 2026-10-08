"use client";

import { useMemo } from "react";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import MedicalCenterLayout from "../Clinic/MedicalCenterLayout";
import StickyNav, { SectionMap } from "../Clinic/StickyNav";
import WideIntro from "../Clinic/WideIntro";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./HospitalsPage.module.css";
import MedicalCenterSummary from "../Clinic/MedicalCenterSummary";
import MedicalCenterTagList from "../Clinic/MedicalCenterTagList";
import MedicalCenterContactInfo, { hasContactInfo } from "../Clinic/MedicalCenterContactInfo";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import HospitalPageClinics from "./HospitalPageClinics";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import MedicalCenterSpecialities from "../Clinic/MedicalCenterSpecialities";
import MedicalCenterServices from "../Clinic/MedicalCenterServices";
import MedicalCenterInsurances from "../Clinic/MedicalCenterInsurances";
import MedicalCenterCertificates from "../Clinic/MedicalCenterCertificates";
import MedicalCenterDoctors from "../Clinic/MedicalCenterDoctors";
import MedicalCenterDepartments from "../Clinic/MedicalCenterDepartments";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import LocationSection from "../Clinic/LocationSection";
import CommentSection from "../Comment/CommentSection";
import SmallAd from "../UI/ListPage/SmallAd";

const NS: ContentNamespace[] = ["common", "hospitalPage"];

type PageDoctor = IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
// a member row of the hospital (or of one of its clinics): the doctor is
// null when the profile is not public
type PageMember = { _id: string; department?: string | null; doctor?: PageDoctor | null };

export type HospitalPageNode = Omit<
  IHospital<{
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
  }>,
  "doctors" | "departments"
> & {
  // the hospital's own doctors (HospitalDoctor) and departments / wards,
  // each with its doctors (backend publicController.getHospital)
  doctors?: PageMember[];
  departments?: { _id: string; name?: string; summary?: string; phone?: string; doctors?: PageMember[] }[];
  // what the hospital's doctors (its own and its clinics') practise
  specialities?: ISpeciality[];
  // every doctor of the hospital, once
  doctorsCount?: number;
};

export type HospitalPageProps = {
  data: HospitalPageNode;
};

const doctorsOf = (rows: unknown): PageDoctor[] =>
  (Array.isArray(rows) ? (rows as PageMember[]) : [])
    .map((m) => m?.doctor)
    .filter((d): d is PageDoctor => !!d && typeof d === "object");

export const liveHospitalClinics = (list: HospitalPageNode["clinics"]) =>
  (Array.isArray(list) ? list : [])
    .filter((c) => !!c?.clinic)
    .map((c) => ({
      ...c,
      clinic: {
        ...c.clinic,
        doctors: Array.isArray(c.clinic.doctors) ? c.clinic.doctors : [],
      },
    }));

const HospitalPage = ({ data }: HospitalPageProps) => {
  const getContent = useScopedLocale(NS);
  // a linked clinic may have been deleted (populate gives null): skip it
  const clinics = useMemo(
    () => liveHospitalClinics(data.clinics),
    [data.clinics],
  );
  const departments = useMemo(
    () => (Array.isArray(data.departments) ? data.departments : []).filter((d) => !!d?.name),
    [data.departments],
  );
  const specialities = useMemo<ISpeciality[]>(
    () => (Array.isArray(data.specialities) ? data.specialities : []).filter(Boolean),
    [data.specialities],
  );
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const insurances = Array.isArray(data.insurances) ? data.insurances : [];

  // every doctor of the hospital once: its own, then its clinics'
  const doctors = useMemo<PageDoctor[]>(() => {
    const all = [
      ...doctorsOf(data.doctors),
      ...clinics.flatMap((c) => doctorsOf(c.clinic.doctors)),
    ];
    return all.filter((d, i) => all.findIndex((o) => o._id === d._id) === i);
  }, [data.doctors, clinics]);

  // only the sections the page actually has
  const sections = useMemo<SectionMap>(() => {
    const result: SectionMap = [
      { title: "introduction", target: "introduction" },
    ];
    if (tags.length) result.push({ title: "features", target: "features" });
    if (hasContactInfo(data))
      result.push({ title: "contactInfo", target: "contact" });
    if (departments.length)
      result.push({ title: "departments", target: "departments" });
    if (clinics.length) result.push({ title: "clinics", target: "clinics" });
    if (specialities.length)
      result.push({ title: "specialities", target: "specialities" });
    if (data.services?.length)
      result.push({ title: "service", target: "services" });
    if (insurances.length)
      result.push({ title: "insurances", target: "insurances" });
    if (doctors.length) result.push({ title: "doctors", target: "doctors" });
    if (data.location) result.push({ title: "location", target: "location" });
    result.push({ title: "comments", target: "comments" });
    return result;
  }, [tags.length, departments.length, clinics.length, specialities.length, data.services, insurances.length, doctors.length, data.location]);

  return (
    <div className={classes.main}>
      <MedicalCenterLayout
        back={{ target: "/hospital", title: getContent("backToHospitalsList") }}
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("hospitals"), target: "/hospital" },
          {
            title: data.name || data._id,
            target: `/hospital/${data.slug || data._id}`,
          },
        ]}
      >
        <WideIntro
          name={data.name}
          commentCount={data.commentCount}
          score={data.averageScore}
          category={data.category?.name}
          image={data.image}
          province={data.province?.name}
          openStatus={data.openStatus}
        />
        <StickyNav map={sections} />
        <MedicalCenterSummary
          code={data.code}
          doctorCount={data.doctorsCount ?? doctors.length}
          establishment={data.establishment}
          personelCount={data.personelCount}
          summary={data.summary}
          bedCount={data.bedCount}
          // a hospital open around the clock is an emergency department
          emergency={!!data.isRoundTheClock}
        />
        <MedicalCenterTagList tags={tags} basePath="/hospital" />
        <MedicalCenterContactInfo
          address={data.address}
          businessTimes={data.businessTimes}
          openingHours={data.openingHours}
          openStatus={data.openStatus}
          mail={data.mail}
          owner={data.owner ? getDoctorProfileLabel(data.owner) : undefined}
          phone={data.phone}
          website={data.website}
        />
        {/* the hospital's own departments / wards, each with its doctors */}
        <MedicalCenterDepartments
          title="departments"
          departments={departments.map((d) => ({
            name: d.name,
            summary: d.summary,
            phone: d.phone,
            doctors: doctorsOf(d.doctors),
          }))}
        />
        <HospitalPageClinics node={data} />
        <MedicalCenterSpecialities nodes={specialities} />
        <MedicalCenterServices nodes={data.services || []} />
        <MedicalCenterInsurances
          nodes={insurances}
          title="hospitalInsurances"
        />
        <MedicalCenterCertificates nodes={data.certificates || []} />
        <MedicalCenterDoctors nodes={doctors} title="doctors" />
        <LocationSection
          coords={data.location?.coordinates}
          name={data.name}
          address={data.address}
        />
        <div className={classes.comments} id="comments">
          <CommentSection model="Hospital" nodeId={data._id} />
        </div>
      </MedicalCenterLayout>
      <SmallAd
        position="hospital1"
        resourceModel="Hospital"
        resource={data._id}
      />
    </div>
  );
};

export default HospitalPage;
