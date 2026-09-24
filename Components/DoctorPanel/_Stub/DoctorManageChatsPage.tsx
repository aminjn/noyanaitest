"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelStub"];

const DoctorManageChats = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("chatWithPatients"), target: "/doctorpanel/chat" },
  ]);
  return <p>DoctorManageChat</p>;
};

export default DoctorManageChats;
