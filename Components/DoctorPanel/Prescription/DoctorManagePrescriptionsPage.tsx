"use client";
import Button from "@/Components/UI/Button";
import classes from "./DoctorManagePrescriptionsPage.module.css";
import { useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import DoctorTaminTokenManager from "./DoctorTaminTokenManager";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import useProgress from "@/Components/Hooks/useProgress";
const DoctorManagePrescriptionsPage = () => {
  const getContent = useLocale();

  const push = useProgress();

  return (
    <div>
      <DoctorTaminTokenManager />
      <WithTitle
        title={getContent("prescriptionsList")}
        actions={[
          {
            title: getContent("newPrescription"),
            action: () => push("/doctorpanel/prescription"),
          },
        ]}
      ></WithTitle>
    </div>
  );
};

export default DoctorManagePrescriptionsPage;
