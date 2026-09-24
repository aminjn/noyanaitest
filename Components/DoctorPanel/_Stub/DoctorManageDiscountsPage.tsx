"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelStub"];

const DoctorManageDiscounts = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("discounts"), target: "/doctorpanel/discount" },
  ]);
  return <p>DoctorManageDiscounts</p>;
};

export default DoctorManageDiscounts;
