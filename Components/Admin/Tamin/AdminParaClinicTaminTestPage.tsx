import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";

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
  getPrescriptions:
    "دریافت نسخه‌ها - RequestList (ورودی: patientNationalCode, trackingCode)",
  precheckPrescription: "پیش‌بررسی نسخه (PreCheckEPresc)",
  submitPrescription:
    "ثبت درخواست - RequestParPresc (ورودی: physio=true برای نسخه فیزیوتراپی)",
  getPrescription: "دریافت درخواست با شناسه (ورودی: requestID)",
  deletePrescription: "حذف درخواست (DeleteParPresc)",
  registerDiagnosis: "ثبت تشخیص (RegisterTheDiagnosis)",
  registerPhysioSession: "ثبت جلسه فیزیوتراپی (RegisterSession_Physio)",
};

const AdminParaClinicTaminTestPage = () => (
  <AdminTaminTestConsole
    title="تست تامین - پاراکلینیک"
    apiPath={`${API}/admin/tamin/paraClinic/test`}
    actionOptions={paraClinicTaminActionOptions}
  />
);

export default AdminParaClinicTaminTestPage;
