"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManageLicence = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("licenses"), target: "/doctorpanel/license" },
  ]);
  return <p>DoctorManageLicence</p>;
};

export default DoctorManageLicence;
