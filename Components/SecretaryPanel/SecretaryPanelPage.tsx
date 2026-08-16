"use client";

import classes from "./SecretaryPanelPage.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const SecretaryPanelPage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/secretarypanel" },
  ]);
  return <p>SecretaryPanelPage</p>;
};

export default SecretaryPanelPage;
