"use client";

import DashboardIcon from "@/Components/Icons/DashboardIcon";
import TabSystem from "../UI/TabSystem";
import AdminManageOllamaModels from "./AdminManageOllamaModels";
import AdminManageOllamaInstructions from "./AdminManageOllamaInstructions";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageOllamaPage = () => {
  return (
    <TabSystem
      name="AdminManageOllama"
      items={[
        {
          title: ta("مدل ها"),
          id: "Models",
          content: <AdminManageOllamaModels />,
          icon: <DashboardIcon />,
        },
        {
          title: ta("دستورالعمل"),
          id: "Instruction",
          icon: <DashboardIcon />,
          content: <AdminManageOllamaInstructions />,
        },
      ]}
    />
  );
};

export default AdminManageOllamaPage;
