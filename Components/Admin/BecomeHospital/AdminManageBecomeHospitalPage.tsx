"use client";

import BecomeOrgRequestPage from "../BecomeRequest/BecomeOrgRequestPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeHospitalPage = () => (
  <BecomeOrgRequestPage
    config={{
      kind: "hospital",
      requestPath: "becomehospital",
      accessModel: "BecomeHospitalRequest",
      orgPath: "hospital",
      title: ta("درخواست تبدیل به بیمارستان"),
      approveLabel: ta("تأیید و ساخت بیمارستان"),
      approveDone: ta("بیمارستان ساخته و فعال شد."),
      selectLabel: ta("انتخاب بیمارستان"),
    }}
  />
);

export default AdminManageBecomeHospitalPage;
