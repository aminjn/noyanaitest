import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// Admin-only Tamin sandbox tester for the paraClinic flow (2026-09) - see
// Controllers/adminTaminController.ts's testParaClinicTamin. Shares the
// doctor test page's AdminTaminCred (mirrors how the real
// paraClinicController already borrows "any" DoctorTaminCred) - run the
// doctor test page's OAuth steps first to get a token. Real paraClinics
// can no longer reach any of this (see
// Controllers/featureGateController.ts /
// Components/ParaClinicDashboard/ParaClinicLicenseGate.tsx's
// lockedSegments).
const paraClinicTaminActionOptions: Record<string, string> = {
  get getPrescriptions() {
  return ta("دریافت نسخه‌ها - RequestList (ورودی: patientNationalCode, trackingCode)");
},
  get precheckPrescription() {
  return ta("پیش‌بررسی نسخه (PreCheckEPresc)");
},
  get submitPrescription() {
  return ta("ثبت درخواست - RequestParPresc (ورودی: physio=true برای نسخه فیزیوتراپی)");
},
  get getPrescription() {
  return ta("دریافت درخواست با شناسه (ورودی: requestID)");
},
  get deletePrescription() {
  return ta("حذف درخواست (DeleteParPresc)");
},
  get registerDiagnosis() {
  return ta("ثبت تشخیص (RegisterTheDiagnosis)");
},
  get registerPhysioSession() {
  return ta("ثبت جلسه فیزیوتراپی (RegisterSession_Physio)");
},
};

const AdminParaClinicTaminTestPage = () => (
  <AdminTaminTestConsole
    title={ta("تست تامین - پاراکلینیک")}
    apiPath={`${API}/admin/tamin/paraClinic/test`}
    actionOptions={paraClinicTaminActionOptions}
  />
);

export default AdminParaClinicTaminTestPage;
