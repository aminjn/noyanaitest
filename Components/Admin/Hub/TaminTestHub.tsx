"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminDoctorTaminTestPage from "@/Components/Admin/Tamin/AdminDoctorTaminTestPage";
import AdminPharmacyTaminTestPage from "@/Components/Admin/Tamin/AdminPharmacyTaminTestPage";
import AdminClinicTaminTestPage from "@/Components/Admin/Tamin/AdminClinicTaminTestPage";
import AdminParaClinicTaminTestPage from "@/Components/Admin/Tamin/AdminParaClinicTaminTestPage";

// تست تامین (2026-10 audit): four test consoles, one per provider kind,
// were four menu items; one page, a tab per kind.
const TaminTestHub = () => (
  <AdminSectionHub
    title={ta("تست اتصال تامین")}
    tabs={[
      { id: "doctorTest", title: ta("پزشک"), content: <AdminDoctorTaminTestPage /> },
      { id: "pharmacyTest", title: ta("داروخانه"), content: <AdminPharmacyTaminTestPage /> },
      { id: "clinicTest", title: ta("کلینیک"), content: <AdminClinicTaminTestPage /> },
      { id: "paraClinicTest", title: ta("پاراکلینیک"), content: <AdminParaClinicTaminTestPage /> },
    ]}
  />
);

export default TaminTestHub;
