"use client";

import classes from "./SecretaryPanelPage.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "secretaryPanelHome"];

const SecretaryPanelPage = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/secretarypanel" },
  ]);
  return <p>SecretaryPanelPage</p>;
};

export default SecretaryPanelPage;
