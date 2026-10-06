"use client";

import { ta } from "@/Components/Admin/i18n/adminText";
import AdminSectionHub from "../../UI/AdminSectionHub";
import AdminAiSettingsTab from "./AdminAiSettingsTab";
import AdminAiPolicyTab from "./AdminAiPolicyTab";
import AdminAiUsageTab from "./AdminAiUsageTab";

// System settings -> «هوش مصنوعی» (2026-10): one page for the AI concern, its
// parts as tabs (kept in ?ai=, the page's own tab stays in ?tab=): the
// providers and models, the «سیاست هوش مصنوعی» (free / by plan / off and the
// limits of every AI feature), and the usage report.
const AdminAiHub = () => (
  <AdminSectionHub
    bare
    param="ai"
    title={ta("هوش مصنوعی")}
    tabs={[
      { id: "providers", title: ta("اتصال و مدل‌ها"), content: <AdminAiSettingsTab /> },
      { id: "policy", title: ta("سیاست هوش مصنوعی"), content: <AdminAiPolicyTab /> },
      { id: "usage", title: ta("گزارش مصرف"), content: <AdminAiUsageTab /> },
    ]}
  />
);

export default AdminAiHub;
