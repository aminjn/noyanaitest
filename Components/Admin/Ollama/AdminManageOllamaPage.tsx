"use client";

import DashboardIcon from "@/Components/Icons/DashboardIcon";
import TabSystem from "../UI/TabSystem";
import AdminManageOllamaModels from "./AdminManageOllamaModels";
import AdminManageOllamaInstructions from "./AdminManageOllamaInstructions";

const AdminManageOllamaPage = () => {
  return (
    <TabSystem
      name="AdminManageOllama"
      items={[
        {
          title: "مدل ها",
          id: "Models",
          content: <AdminManageOllamaModels />,
          icon: <DashboardIcon />,
        },
        {
          title: "دستورالعمل",
          id: "Instruction",
          icon: <DashboardIcon />,
          content: <AdminManageOllamaInstructions />,
        },
      ]}
    />
  );
};

export default AdminManageOllamaPage;
