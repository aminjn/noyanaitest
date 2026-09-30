import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// Admin-only Tamin sandbox tester for the doctor flow (2026-09) - see
// Controllers/adminTaminController.ts's testDoctorTamin. Real doctors can
// no longer reach any of this (see Controllers/featureGateController.ts /
// Components/DoctorPanel/DoctorLicenseGate.tsx's lockedSegments).
const doctorTaminActionOptions: Record<string, string> = {
  get getChallenge() {
  return ta("دریافت challenge (استفاده از دکمه بالا)");
},
  get exchangeCode() {
  return ta("تبادل کد (استفاده از دکمه بالا)");
},
  get getTokenDate() {
  return ta("تاریخ آخرین توکن");
},
  get patientPrivilege() {
  return ta("استعلام استحقاق بیمار - deserve-info (ورودی: nationalCode)");
},
  get sendEpresc() {
  return ta("ثبت نسخه - SendEpresc (ورودی دلخواه جایگزین مقادیر پیش‌فرض می‌شود)");
},
  get reloadPrescription() {
  return ta("دریافت نسخه با کد رهگیری (ورودی: tracking)");
},
};

const AdminDoctorTaminTestPage = () => (
  <AdminTaminTestConsole
    title={ta("تست تامین - پزشک")}
    apiPath={`${API}/admin/tamin/doctor/test`}
    actionOptions={doctorTaminActionOptions}
    oauth
  />
);

export default AdminDoctorTaminTestPage;
