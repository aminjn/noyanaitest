"use client";

import useSWR from "swr";
import classes from "./DoctorManageClinicsPage.module.css";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import DoctorPanelLicenseBalanceHeader from "@/Components/Layout/DoctorPanelLicenseBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import DoctorClinicsTab from "./DoctorClinicsTab";
import DoctorJoinClinicsTab from "./DoctorJoinClinicsTab";
import DoctorClinicAdditionsTab from "./DoctorClinicAdditionsTab";

const DoctorManageClinicsPage = () => {

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <DoctorPanelLicenseBalanceHeader />
      <ClientTabSystem
        items={[
          {
            content: <DoctorClinicsTab />,
            id: "Clinics",
            title: getContent("doctorClinics"),
          },
          {
            content: <DoctorJoinClinicsTab />,
            id: "Joins",
            title: getContent("doctorJoinClinics"),
          },
          {
            content: <DoctorClinicAdditionsTab />,
            id: "AdditionRequests",
            title: getContent("clinicAdditionRequests"),
          },
        ]}
      />
    </div>
  );
};

export default DoctorManageClinicsPage;
