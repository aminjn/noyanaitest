"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DotorManageArticles = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("articles"), target: "/doctorpanel/article" },
  ]);
  return <p>DotorManageArticles</p>;
};

export default DotorManageArticles;
