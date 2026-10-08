"use client";

import useSWR from "swr";
import classes from "./DoctorManageClinicsPage.module.css";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import DoctorClinicsTab from "./DoctorClinicsTab";
import DoctorJoinClinicsTab from "./DoctorJoinClinicsTab";
import DoctorClinicAdditionsTab from "./DoctorClinicAdditionsTab";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useDoctorLicenseModules from "@/Components/Hooks/useDoctorLicenseModules";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const DoctorManageClinicsPage = () => {
  const getContent = useScopedLocale(NS);
  const { modules } = useDoctorLicenseModules();
  // fails open while the plan is loading, like DoctorLicenseGate
  const canRequest = !modules || modules.includes("clinics");

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
          // suggesting a missing clinic is the doctor's own request: a
          // plan feature ("clinics"); members and invites are open to all
          ...(canRequest
            ? [
                {
                  content: <DoctorClinicAdditionsTab />,
                  id: "AdditionRequests",
                  title: getContent("clinicAdditionRequests"),
                },
              ]
            : []),
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageClinicsPage;
