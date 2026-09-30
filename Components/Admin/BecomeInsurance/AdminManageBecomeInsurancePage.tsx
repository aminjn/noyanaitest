"use client";

import BecomeOrgRequestPage from "../BecomeRequest/BecomeOrgRequestPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeInsurancePage = () => (
  <BecomeOrgRequestPage
    config={{
      kind: "insurance",
      requestPath: "becomeinsurance",
      accessModel: "BecomeInsuranceRequest",
      orgPath: "insurance",
      title: ta("درخواست بیمه شدن"),
      approveLabel: ta("تأیید و ساخت بیمه"),
      approveDone: ta("بیمه ساخته و فعال شد."),
      selectLabel: ta("انتخاب بیمه"),
    }}
  />
);

export default AdminManageBecomeInsurancePage;
