"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDrugsPage from "@/Components/Admin/Drug/AdminManageDrugsPage";
import AdminManageDrugtagsPage from "@/Components/Admin/DrugTag/AdminManageDrugTagsPage";

// داروها: one admin page, its parts as tabs (2026-09 admin audit).
const DrugHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("داروها")}
      tabs={[
        {
          id: "drugs",
          title: ta("داروها"),
          exclude: !canOpen("Drug"),
          content: <AdminManageDrugsPage />,
        },
        {
          // DrugTag is the therapeutic class since 2026-10 (the id stays
          // "tags" so old links keep landing here)
          id: "tags",
          title: ta("گروه‌های درمانی"),
          hint: ta("گروه درمانی هر دارو (مثل مسکن‌ها یا آنتی‌بیوتیک‌ها). هر گروه فعال یک صفحه در دارونامه‌ی سایت دارد."),
          exclude: !canOpen("Drug"),
          content: <AdminManageDrugtagsPage />,
        },
      ]}
    />
  );
};

export default DrugHub;
