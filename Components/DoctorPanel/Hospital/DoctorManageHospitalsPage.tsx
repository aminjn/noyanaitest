"use client";

import useSWR from "swr";
import classes from "./DoctorManageHospitalsPage.module.css";
import { IHospital } from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
import { API } from "@/Components/config";
import DoctorPanelLicenseBalanceHeader from "@/Components/Layout/DoctorPanelLicenseBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import DoctorHospitalsTab from "./DoctorHospitalsTab";
import DoctorJoinHospitalsTab from "./DoctorJoinHospitalsTab";
import DoctorHospitalAdditionsTab from "./DoctorHospitalAdditionsTab";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";

const DoctorManageHospitalsPage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("hospitals"), target: "/doctorpanel/hospital" },
  ]);

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={[
          {
            content: <DoctorHospitalsTab />,
            id: "Hospitals",
            title: getContent("doctorHospitals"),
          },
          {
            content: <DoctorJoinHospitalsTab />,
            id: "Joins",
            title: getContent("doctorJoinHospitals"),
          },
          {
            content: <DoctorHospitalAdditionsTab />,
            id: "AdditionRequests",
            title: getContent("hospitalAdditionRequests"),
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageHospitalsPage;
