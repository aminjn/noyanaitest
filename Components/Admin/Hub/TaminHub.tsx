"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageTaminPrescriptionTypesPage from "@/Components/Admin/Tamin/PrescriptionType/AdminManageTaminPrescriptionTypesPage";
import AdminManageTaminServiceTypesPage from "@/Components/Admin/Tamin/ServiceType/AdminManageTaminServiceTypesPage";
import AdminManageTaminServicesPage from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import AdminManageTaminParTarefsPage from "@/Components/Admin/Tamin/ParTaref/AdminManageTaminParTarefsPage";
import AdminManageTaminDrugUsagesPage from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import AdminManageTaminDrugAmountsPage from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import AdminManageTaminDrugInstructionsPage from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import AdminManageTaminPhPlansPage from "@/Components/Admin/Tamin/PhPlan/AdminManageTaminPhPlansPage";
import AdminManageTaminPhIllnessesPage from "@/Components/Admin/Tamin/PhIllness/AdminManageTaminPhIllnessesPage";
import AdminManageTaminIcidsPage from "@/Components/Admin/Tamin/Icid/AdminManageTaminIcidsPage";
import AdminManageTaminComplaintsPage from "@/Components/Admin/Tamin/TaminComplaint/AdminManageTaminComplaintPage";
import AdminManageTaminSpecsPage from "@/Components/Admin/Tamin/Spec/AdminManageTaminSpecsPage";

// تامین اجتماعی (2026-10 audit): the Tamin e-prescription catalogs were
// twelve menu items; one page, a tab per catalog.
const TaminHub = () => (
  <AdminSectionHub
    title={ta("کاتالوگ‌های تامین اجتماعی")}
    intro={ta("فهرست‌هایی که نسخه‌ی الکترونیک تامین از آن‌ها استفاده می‌کند.")}
    tabs={[
      { id: "prescriptionType", title: ta("انواع نسخه"), content: <AdminManageTaminPrescriptionTypesPage /> },
      { id: "serviceType", title: ta("انواع سرویس"), content: <AdminManageTaminServiceTypesPage /> },
      { id: "service", title: ta("سرویس‌ها"), content: <AdminManageTaminServicesPage /> },
      { id: "parTaref", title: ta("زیرگروه نسخ آزمایش"), content: <AdminManageTaminParTarefsPage /> },
      { id: "drugUsage", title: ta("مقادیر مصرف"), content: <AdminManageTaminDrugUsagesPage /> },
      { id: "drugAmount", title: ta("طریقه مصرف"), content: <AdminManageTaminDrugAmountsPage /> },
      { id: "drugInstruction", title: ta("زمان مصرف"), content: <AdminManageTaminDrugInstructionsPage /> },
      { id: "phPlan", title: ta("طرح درمان"), content: <AdminManageTaminPhPlansPage /> },
      { id: "phIllness", title: ta("انواع بیماری"), content: <AdminManageTaminPhIllnessesPage /> },
      { id: "Icids", title: ta("کدهای ICD"), content: <AdminManageTaminIcidsPage /> },
      { id: "complaint", title: ta("شکایات"), content: <AdminManageTaminComplaintsPage /> },
      { id: "spec", title: ta("تخصص‌های تامین"), content: <AdminManageTaminSpecsPage /> },
    ]}
  />
);

export default TaminHub;
