"use client";

import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Loading from "@/Components/Admin/UI/Loading";
import useDoctor from "@/Components/Hooks/useDoctor";
import useLocale from "@/Components/Hooks/useLocale";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import DoctorManageLocationTab from "./DoctorManageLocationTab";

const DoctorManageProfilePage = () => {
  const { doctor } = useDoctor();

  const getContent = useLocale();

  return (
    <HandleLoading data={!!doctor}>
      <ClientTabSystem
        items={[
          {
            id: "Location",
            content: <DoctorManageLocationTab />,
            title: getContent("location"),
          },
        ]}
      />
    </HandleLoading>
  );
};

export default DoctorManageProfilePage;
