"use client";

import BecomeOrgRequestPage from "../BecomeRequest/BecomeOrgRequestPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomePharmacyPage = () => (
  <BecomeOrgRequestPage
    config={{
      kind: "pharmacy",
      requestPath: "becomepharmacy",
      accessModel: "BecomePharmacyRequest",
      orgPath: "pharmacy",
      title: ta("درخواست داروخانه شدن"),
      approveLabel: ta("تأیید و ساخت داروخانه"),
      approveDone: ta("داروخانه ساخته و فعال شد."),
      selectLabel: ta("انتخاب داروخانه"),
    }}
  />
);

export default AdminManageBecomePharmacyPage;
