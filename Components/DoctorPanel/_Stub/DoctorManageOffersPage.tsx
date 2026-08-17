"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManageOffers = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("offers"), target: "/doctorpanel/offer" },
  ]);
  return <p>DoctorManageOffers</p>;
};

export default DoctorManageOffers;
