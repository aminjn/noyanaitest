"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManageChats = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("chatWithPatients"), target: "/doctorpanel/chat" },
  ]);
  return <p>DoctorManageChat</p>;
};

export default DoctorManageChats;
