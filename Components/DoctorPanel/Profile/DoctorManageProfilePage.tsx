"use client";

import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useDoctor from "@/Components/Hooks/useDoctor";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import DoctorManageLocationTab from "./DoctorManageLocationTab";
import DoctorManageGalleryTab from "./DoctorManageGalleryTab";
import DoctorManageDetailsTab from "./DoctorManageDetailstab";
import DoctorManageSocialMediaTab from "./DoctorManageSocialMediaTab";
import DoctorManageFaqTab from "./DoctorManageFaqTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useState } from "react";
import ProfileStrength from "./ProfileStrength";
import classes from "./DoctorManageProfilePage.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const DoctorManageProfilePage = () => {
  const { doctor } = useDoctor();

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("profile"), target: "/doctorpanel/profile" },
  ]);

  const tabState = useState<string>("Details");

  return (
    <HandleLoading data={!!doctor}>
      <div className={classes.main}>
        <ProfileStrength onGo={tabState[1]} />
        <ClientTabSystem
          viewState={tabState}
          items={[
            {
              id: "Details",
              title: getContent("details"),
              content: <DoctorManageDetailsTab />,
            },
            {
              id: "Gallery",
              content: <DoctorManageGalleryTab />,
              title: getContent("gallery"),
            },
            {
              id: "Location",
              content: <DoctorManageLocationTab />,
              title: getContent("location"),
            },
            {
              id: "Social",
              content: <DoctorManageSocialMediaTab />,
              title: getContent("socialMedias"),
            },
            {
              id: "Faq",
              content: <DoctorManageFaqTab />,
              title: getContent("faqs"),
            },
          ]}
        />
      </div>
    </HandleLoading>
  );
};

export default DoctorManageProfilePage;
