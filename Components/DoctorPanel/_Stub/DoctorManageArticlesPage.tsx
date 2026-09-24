"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelStub"];

const DotorManageArticles = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("articles"), target: "/doctorpanel/article" },
  ]);
  return <p>DotorManageArticles</p>;
};

export default DotorManageArticles;
