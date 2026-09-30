import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// Admin-only Tamin sandbox tester for the clinic (ParaClinic referral) flow
// (2026-09) - see Controllers/adminTaminController.ts's testClinicTamin.
// Has its own credential (AdminClinicTaminCred), same as the real
// ClinicTaminToken vs DoctorTaminCred split. Real clinics can no longer
// reach any of this (see Controllers/featureGateController.ts /
// Components/ClinicPanel/ClinicLicenseGate.tsx's lockedSegments).
const clinicTaminActionOptions: Record<string, string> = {
  get getChallenge() {
  return ta("دریافت challenge (استفاده از دکمه بالا)");
},
  get exchangeCode() {
  return ta("تبادل کد (استفاده از دکمه بالا)");
},
  get getTokenDate() {
  return ta("تاریخ آخرین توکن");
},
  get getPrescriptions() {
  return ta("دریافت نسخه‌ها - RequestList (ورودی: trackingCode)");
},
  get submitPrescription() {
  return ta("ثبت درخواست - RequestParPresc");
},
};

const AdminClinicTaminTestPage = () => (
  <AdminTaminTestConsole
    title={ta("تست تامین - کلینیک")}
    apiPath={`${API}/admin/tamin/clinic/test`}
    actionOptions={clinicTaminActionOptions}
    oauth
  />
);

export default AdminClinicTaminTestPage;
