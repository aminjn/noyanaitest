"use client";

import classes from "./ClinicPage.module.css";

import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import Link from "next/link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import Image from "next/image";
import { FilePath } from "../config";
import Badge from "../UI/Badge";
import ClinicIntro from "./ClinicIntro";
import Button from "../UI/Button";
import { ContentKey } from "../Enums/contentKeys";
import { useMemo } from "react";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import ClinicNav from "./ClinicNav";
import ClinicSummary from "./ClinicSummary";
import ClinicTags from "./Clinictags";
import ClinicContact from "./ClinicContact";
import ClinicDepartments from "./ClinicDepartments";
import ClinicSpecialities from "./ClinicSpecialities";
import ClinicInsurances from "./ClinicInsurances";
import ClinicCertificates from "./ClinicCertificates";
import ClinicDoctors from "./ClinicDoctors";
import ClinicLocation from "./ClinicLocation";
import CommentSection from "../Comment/CommentSection";
import { txsMedium } from "../UI/Typography";
import ClinicServices from "./ClinicServices";
import MedicalCenterLayout from "./MedicalCenterLayout";

const NS: ContentNamespace[] = ["common", "clinicPage"];

export type ClinicPageNode = IClinic<{
  Category: Record<never, never>;
  Province: Record<never, never>;
  Tags: Record<never, never>;
  DepartmentsPopulated: {
    DoctorsPopulated: {
      DoctorPopulated: { MainSpecialityPopulated: Record<never, never> };
    };
  };
  Insurances: Record<never, never>;
  DoctorsPopulated: {
    DoctorPopulated: { MainSpecialityPopulated: Record<never, never> };
  };
}> & {
  specialities: ISpeciality[];
  owner?: IDoctorProfile;
};

export type ClinicPageProps = {
  data: ClinicPageNode;
};

const ClinicPage = ({ data }: ClinicPageProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <MedicalCenterLayout
      back={{ target: "/clinic", title: getContent("backToClinicsList") }}
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "کلینیک ها", target: "/clinic" },
        {
          title: data.name || data._id,
          target: `/clinic/${data.slug || data._id}`,
        },
      ]}
    >
      <ClinicIntro node={data} />
      <ClinicNav node={data} />
      <ClinicSummary node={data} />
      <ClinicTags node={data} />
      <ClinicContact node={data} />
      <ClinicDepartments node={data} />
      <ClinicSpecialities node={data} />
      <ClinicServices node={data} />
      <ClinicInsurances node={data} />
      <ClinicCertificates node={data} />
      <ClinicDoctors node={data} />
      <ClinicLocation node={data} />
      <div className={classes.comments} id="comments">
        <CommentSection nodeId={data._id} model="Clinic" />
      </div>
    </MedicalCenterLayout>
  );
};

export default ClinicPage;
