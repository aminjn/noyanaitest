"use client";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import classes from "./PharmacyFillPrescriptionPage.module.css";
import Form from "@/Components/UI/Form";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import { useState } from "react";
import PrescriptionList from "./PrescriptionList";
import useNotification from "@/Components/Hooks/useNotification";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import FindPrescriptionAgent from "./FindPrescriptionAgent";
import PharmacyPrescriptionCache from "./PharmacyPrescriptionCache";
import PharmacyFilledPrescriptions from "./PharmacyFilledPrescriptions";

const PharmacyFillPrescriptionPage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("prescriptions"), target: "/pharmacypanel/prescription" },
  ]);

  return (
    <TabSystem
      items={[
        {
          id: "Finder",
          title: getContent("findPrescription"),
          content: <FindPrescriptionAgent />,
        },
        {
          id: "Cache",
          title: getContent("pharmacyPrescriptionsCache"),
          content: <PharmacyPrescriptionCache />,
        },
        {
          id: "Filled",
          title: getContent("filledPrescriptions"),
          content: <PharmacyFilledPrescriptions />,
        },
      ]}
    />
  );
};

export default PharmacyFillPrescriptionPage;
