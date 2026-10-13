"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import ProviderImportPage from "@/Components/Admin/ProviderImport/ProviderImportPage";

// «ورود گروهی (JSON)» under «ارائه‌دهندگان» (2026-10): one page for every
// provider type a file can hold - doctors, offices, clinics, hospitals,
// labs, pharmacies, insurers - instead of a tab of the doctors' page.
const ProviderImportHub = () => (
  <AdminSectionHub
    title={ta("ورود گروهی (JSON)")}
    tabs={[{ id: "import", title: ta("ورود گروهی (JSON)"), content: <ProviderImportPage /> }]}
  />
);

export default ProviderImportHub;
