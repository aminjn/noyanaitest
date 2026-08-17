"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManageDiscounts = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("discounts"), target: "/doctorpanel/discount" },
  ]);
  return <p>DoctorManageDiscounts</p>;
};

export default DoctorManageDiscounts;
