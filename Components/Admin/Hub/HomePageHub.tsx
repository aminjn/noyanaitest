"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import AdminHomeOverview from "../HomePage/AdminHomeOverview";
import AdminHomeImagePage from "../StaticImages/AdminHomeImagePage";
import { ta } from "@/Components/Admin/i18n/adminText";

// The public home page in one admin page (2026-09 audit): what each section
// shows and where it's managed, plus the hero image.
const HomePageHub = () => (
  <AdminSectionHub
    title={ta("صفحه‌ی خانه")}
    intro={ta("هر بخش صفحه‌ی خانه چه چیزی نشان می‌دهد و از کجا تغییر می‌کند.")}
    tabs={[
      { id: "sections", title: ta("بخش‌ها"), content: <AdminHomeOverview /> },
      { id: "image", title: ta("تصویر اصلی"), content: <AdminHomeImagePage /> },
    ]}
  />
);

export default HomePageHub;
