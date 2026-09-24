"use client";

import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Loading from "@/Components/Admin/UI/Loading";
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

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const DoctorManageProfilePage = () => {
  const { doctor } = useDoctor();

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("profile"), target: "/doctorpanel/profile" },
  ]);

  return (
    <HandleLoading data={!!doctor}>
      <ClientTabSystem
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
    </HandleLoading>
  );
};

export default DoctorManageProfilePage;
