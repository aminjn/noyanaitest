"use client";

import useSWR from "swr";
import classes from "./DoctorManageClinicsPage.module.css";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import DoctorPanelLicenseBalanceHeader from "@/Components/Layout/DoctorPanelLicenseBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import DoctorClinicsTab from "./DoctorClinicsTab";
import DoctorJoinClinicsTab from "./DoctorJoinClinicsTab";
import DoctorClinicAdditionsTab from "./DoctorClinicAdditionsTab";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const DoctorManageClinicsPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("clinics"), target: "/doctorpanel/clinic" },
  ]);

  return (
    <WithBalanceHeader>
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
    </WithBalanceHeader>
  );
};

export default DoctorManageClinicsPage;
