"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDoctorProfilesPage from "@/Components/Admin/DoctorProfile/AdminManageDoctorProfilesPage";

// پزشکان: the doctors list. The bulk import of every provider type (doctors,
// centres, pharmacies, labs, insurers) has its own page under «ارائه‌دهندگان»
// (2026-10, owner review: a pharmacies file was not a doctors' matter).
const DoctorProfileHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پزشکان")}
      tabs={[
        {
          id: "doctors",
          title: ta("پزشکان"),
          exclude: !canOpen("DoctorProfile"),
          content: <AdminManageDoctorProfilesPage />,
        },
      ]}
    />
  );
};

export default DoctorProfileHub;
