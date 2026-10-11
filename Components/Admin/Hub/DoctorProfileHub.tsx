"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageDoctorProfilesPage from "@/Components/Admin/DoctorProfile/AdminManageDoctorProfilesPage";
import ProviderImportPage from "@/Components/Admin/ProviderImport/ProviderImportPage";

// پزشکان: the doctors list and, for the super admin, the bulk import of
// doctors, offices and centres from a JSON file (2026-10) - one page with
// tabs, no extra menu item (AdminSectionHub).
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
        {
          id: "import",
          title: ta("ورود گروهی (JSON)"),
          exclude: !canOpen("admin"),
          content: <ProviderImportPage />,
        },
      ]}
    />
  );
};

export default DoctorProfileHub;
