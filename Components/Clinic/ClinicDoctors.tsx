import { useMemo, useState } from "react";
import useLocale from "../Hooks/useLocale";
import PeopleIcon from "../Icons/PeopleIcon";
import IconTitle from "../UI/IconTitle";
import classes from "./ClinicDoctors.module.css";
import { ClinicPageNode } from "./ClinicPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import Button from "../UI/Button";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import Image from "next/image";
import { FilePath } from "../config";
import {
  getDoctorLabel,
  getDoctorProfileLabel,
} from "../Admin/Lib/LabelGetters";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import { tsmDemiBold, tsmRegular, txsRegular } from "../UI/Typography";
import FilterCsr from "./FilterCsr";
import MedicalCenterDoctors from "./MedicalCenterDoctors";

const ClinicDoctors = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterDoctors
      nodes={
        node.doctors.map((el) => el.doctor).filter(Boolean) as IDoctorProfile<{
          MainSpecialityPopulated: Record<never, never>;
        }>[]
      }
    />
  );
};

export default ClinicDoctors;
