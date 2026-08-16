"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManageFinance = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("financialMangement"), target: "/doctorpanel/finance" },
  ]);
  return <p>DoctorManageFinance</p>;
};

export default DoctorManageFinance;
