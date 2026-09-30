"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageBaseClinicLicensesPage from "@/Components/Admin/BaseClinicLicense/AdminManageBaseClinicLicensesPage";
import AdminManageBaseDoctorLicensesPage from "@/Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";
import AdminManageBaseHospitalLicensesPage from "@/Components/Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";
import AdminManageBaseInsuranceLicensesPage from "@/Components/Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";
import AdminManageBaseParaClinicLicensesPage from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";
import AdminManageBasePharmacyLicensesPage from "@/Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

// پلن‌ها و مجوزها: one admin page, its parts as tabs (2026-09 admin audit).
const LicensePlansHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("پلن‌ها و مجوزها")}
      intro={ta("پلن‌های فروش پنل برای هر نوع ارائه‌دهنده. مدت و قیمت هر پلن داخل خود پلن تعریف می‌شود.")}
      tabs={[
        {
          id: "doctor",
          title: ta("پزشک"),
          exclude: !canOpen("admin"),
          content: <AdminManageBaseDoctorLicensesPage />,
        },
        {
          id: "clinic",
          title: ta("کلینیک"),
          exclude: !canOpen("admin"),
          content: <AdminManageBaseClinicLicensesPage />,
        },
        {
          id: "hospital",
          title: ta("بیمارستان"),
          exclude: !canOpen("admin"),
          content: <AdminManageBaseHospitalLicensesPage />,
        },
        {
          id: "paraClinic",
          title: ta("پاراکلینیک"),
          exclude: !canOpen("admin"),
          content: <AdminManageBaseParaClinicLicensesPage />,
        },
        {
          id: "pharmacy",
          title: ta("داروخانه"),
          exclude: !canOpen("admin"),
          content: <AdminManageBasePharmacyLicensesPage />,
        },
        {
          id: "insurance",
          title: ta("بیمه"),
          exclude: !canOpen("admin"),
          content: <AdminManageBaseInsuranceLicensesPage />,
        },
      ]}
    />
  );
};

export default LicensePlansHub;
