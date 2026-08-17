"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManagePatientDocuments = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patientDocuments"), target: "/doctorpanel/document" },
  ]);
  return <p>DoctorManagePatientDocuments</p>;
};

export default DoctorManagePatientDocuments;
