"use client";

import AdminManageStaticImagesPage from "./AdminManageStaticImagesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// The home page's hero image. The about and for-doctors slots moved to
// those pages' own admin hubs (2026-09 audit).
const AdminHomeImagePage = () => (
  <AdminManageStaticImagesPage
    only={["homeMain"]}
    title={ta("تصویر اصلی صفحه‌ی خانه")}
  />
);

export default AdminHomeImagePage;
