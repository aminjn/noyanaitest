"use client";

import useSWR from "swr";
import classes from "./DoctorManageHospitalsPage.module.css";
import { IHospital } from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
import { API } from "@/Components/config";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import DoctorHospitalsTab from "./DoctorHospitalsTab";
import DoctorJoinHospitalsTab from "./DoctorJoinHospitalsTab";
import DoctorHospitalAdditionsTab from "./DoctorHospitalAdditionsTab";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

const DoctorManageHospitalsPage = () => {
  const getContent = useScopedLocale(NS);

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
