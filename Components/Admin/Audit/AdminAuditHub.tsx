"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminAuditLogPage from "./AdminAuditLogPage";
import AdminConsentLog from "./AdminConsentLog";

// «لاگ عملیات» (one page per concern): the admins' own actions, and the
// patients' record-linking consent log (2026-10) as a second tab.
const AdminAuditHub = () => (
  <AdminSectionHub
    title={ta("لاگ عملیات")}
    tabs={[
      { id: "admin", title: ta("عملیات ادمین‌ها"), content: <AdminAuditLogPage /> },
      { id: "consent", title: ta("رضایت اتصال پرونده‌ها"), content: <AdminConsentLog /> },
    ]}
  />
);

export default AdminAuditHub;
