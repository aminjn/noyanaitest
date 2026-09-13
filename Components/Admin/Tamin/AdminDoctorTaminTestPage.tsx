import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";

// Admin-only Tamin sandbox tester for the doctor flow (2026-09) - see
// Controllers/adminTaminController.ts's testDoctorTamin. Real doctors can
// no longer reach any of this (see Controllers/featureGateController.ts /
// Components/DoctorPanel/DoctorLicenseGate.tsx's lockedSegments).
const doctorTaminActionOptions: Record<string, string> = {
  getChallenge: "دریافت challenge (استفاده از دکمه بالا)",
  exchangeCode: "تبادل کد (استفاده از دکمه بالا)",
  getTokenDate: "تاریخ آخرین توکن",
  patientPrivilege: "استعلام استحقاق بیمار - deserve-info (ورودی: nationalCode)",
  sendEpresc: "ثبت نسخه - SendEpresc (ورودی دلخواه جایگزین مقادیر پیش‌فرض می‌شود)",
  reloadPrescription: "دریافت نسخه با کد رهگیری (ورودی: tracking)",
};

const AdminDoctorTaminTestPage = () => (
  <AdminTaminTestConsole
    title="تست تامین - پزشک"
    apiPath={`${API}/admin/tamin/doctor/test`}
    actionOptions={doctorTaminActionOptions}
    oauth
  />
);

export default AdminDoctorTaminTestPage;
