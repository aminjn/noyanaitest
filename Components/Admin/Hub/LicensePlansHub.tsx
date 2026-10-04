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
import AdminSubscriptionsTab from "@/Components/Admin/LicensePlans/AdminSubscriptionsTab";
import AdminLicensePromotionsTab from "@/Components/Admin/LicensePlans/AdminLicensePromotionsTab";
import AdminPatientProTab from "@/Components/Admin/LicensePlans/AdminPatientProTab";

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
        {
          // the patients' «پرو» membership (2026-10): prices, benefits,
          // subscribers
          id: "patientPro",
          title: ta("اشتراک پرو کاربران"),
          exclude: !canOpen("admin"),
          content: <AdminPatientProTab />,
        },
        {
          // launch discount and other plan promotions (2026-10)
          id: "promotions",
          title: ta("تخفیف و پیشنهاد ویژه"),
          exclude: !canOpen("admin"),
          content: <AdminLicensePromotionsTab />,
        },
        {
          // every provider's current plan, expiry and owner in one list
          id: "subscriptions",
          title: ta("اشتراک‌ها"),
          exclude: !canOpen("Finance"),
          content: <AdminSubscriptionsTab />,
        },
      ]}
    />
  );
};

export default LicensePlansHub;
