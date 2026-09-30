import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// Admin-only Tamin sandbox tester for the pharmacy flow (2026-09) - see
// Controllers/adminTaminController.ts's testPharmacyTamin. Shares the
// doctor test page's AdminTaminCred (mirrors how the real pharmacyController
// already borrows "any" DoctorTaminCred) - run the doctor test page's OAuth
// steps first to get a token. Real pharmacies can no longer reach any of
// this (see Controllers/featureGateController.ts /
// Components/PharmacyPanel/PharmacyLicenseGate.tsx's lockedSegments).
const pharmacyTaminActionOptions: Record<string, string> = {
  get getPrescription() {
  return ta("دریافت نسخه فعال (ورودی: patientNationalCode, trackingCode)");
},
  get preCheckPrescription() {
  return ta("پیش‌بررسی نسخه (PreCheckElectronicPresc)");
},
  get submitPrescription() {
  return ta("ثبت نسخه (PostPresc)");
},
  get getSubmittedPrescInfo() {
  return ta("اطلاعات درخواست ثبت‌شده (ورودی: reqid)");
},
  get removePrescription() {
  return ta("حذف نسخه (RemovePresc)");
},
  get referrPresc() {
  return ta("ارجاع نسخه (RefferrRequest)");
},
  get getDrugEquiv() {
  return ta("معادل دارویی (GetDrugEquivalnet)");
},
  get getAdditiveDrugs() {
  return ta("داروهای افزودنی (GetAdditiveDrugs)");
},
};

const AdminPharmacyTaminTestPage = () => (
  <AdminTaminTestConsole
    title={ta("تست تامین - داروخانه")}
    apiPath={`${API}/admin/tamin/pharmacy/test`}
    actionOptions={pharmacyTaminActionOptions}
  />
);

export default AdminPharmacyTaminTestPage;
