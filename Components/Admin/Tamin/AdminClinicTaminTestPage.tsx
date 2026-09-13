import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";

// Admin-only Tamin sandbox tester for the clinic (ParaClinic referral) flow
// (2026-09) - see Controllers/adminTaminController.ts's testClinicTamin.
// Has its own credential (AdminClinicTaminCred), same as the real
// ClinicTaminToken vs DoctorTaminCred split. Real clinics can no longer
// reach any of this (see Controllers/featureGateController.ts /
// Components/ClinicPanel/ClinicLicenseGate.tsx's lockedSegments).
const clinicTaminActionOptions: Record<string, string> = {
  getChallenge: "دریافت challenge (استفاده از دکمه بالا)",
  exchangeCode: "تبادل کد (استفاده از دکمه بالا)",
  getTokenDate: "تاریخ آخرین توکن",
  getPrescriptions: "دریافت نسخه‌ها - RequestList (ورودی: trackingCode)",
  submitPrescription: "ثبت درخواست - RequestParPresc",
};

const AdminClinicTaminTestPage = () => (
  <AdminTaminTestConsole
    title="تست تامین - کلینیک"
    apiPath={`${API}/admin/tamin/clinic/test`}
    actionOptions={clinicTaminActionOptions}
    oauth
  />
);

export default AdminClinicTaminTestPage;
