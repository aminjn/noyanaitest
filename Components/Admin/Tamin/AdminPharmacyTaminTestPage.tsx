import AdminTaminTestConsole from "./AdminTaminTestConsole";
import { API } from "@/Components/config";

// Admin-only Tamin sandbox tester for the pharmacy flow (2026-09) - see
// Controllers/adminTaminController.ts's testPharmacyTamin. Shares the
// doctor test page's AdminTaminCred (mirrors how the real pharmacyController
// already borrows "any" DoctorTaminCred) - run the doctor test page's OAuth
// steps first to get a token. Real pharmacies can no longer reach any of
// this (see Controllers/featureGateController.ts /
// Components/PharmacyPanel/PharmacyLicenseGate.tsx's lockedSegments).
const pharmacyTaminActionOptions: Record<string, string> = {
  getPrescription: "دریافت نسخه فعال (ورودی: patientNationalCode, trackingCode)",
  preCheckPrescription: "پیش‌بررسی نسخه (PreCheckElectronicPresc)",
  submitPrescription: "ثبت نسخه (PostPresc)",
  getSubmittedPrescInfo: "اطلاعات درخواست ثبت‌شده (ورودی: reqid)",
  removePrescription: "حذف نسخه (RemovePresc)",
  referrPresc: "ارجاع نسخه (RefferrRequest)",
  getDrugEquiv: "معادل دارویی (GetDrugEquivalnet)",
  getAdditiveDrugs: "داروهای افزودنی (GetAdditiveDrugs)",
};

const AdminPharmacyTaminTestPage = () => (
  <AdminTaminTestConsole
    title="تست تامین - داروخانه"
    apiPath={`${API}/admin/tamin/pharmacy/test`}
    actionOptions={pharmacyTaminActionOptions}
  />
);

export default AdminPharmacyTaminTestPage;
