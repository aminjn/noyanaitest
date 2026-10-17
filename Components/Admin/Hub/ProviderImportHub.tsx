"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import ProviderImportPage from "@/Components/Admin/ProviderImport/ProviderImportPage";
import FeedSources from "@/Components/Admin/ProviderImport/FeedSources";

// «ورود گروهی (JSON)» under «ارائه‌دهندگان» (2026-10): one page for every
// provider type a file can hold - doctors, offices, clinics, hospitals,
// labs, pharmacies, insurers - instead of a tab of the doctors' page; and
// «اتصال خودکار (API)», the contracted partners' live feeds (2026-10).
const ProviderImportHub = () => (
  <AdminSectionHub
    title={ta("ورود گروهی (JSON)")}
    tabs={[
      { id: "import", title: ta("ورود گروهی (JSON)"), content: <ProviderImportPage /> },
      { id: "feeds", title: ta("اتصال خودکار (API)"), content: <FeedSources /> },
    ]}
  />
);

export default ProviderImportHub;
