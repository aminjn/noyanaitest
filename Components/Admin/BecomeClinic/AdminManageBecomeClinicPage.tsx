"use client";

import BecomeOrgRequestPage from "../BecomeRequest/BecomeOrgRequestPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeClinicPage = () => (
  <BecomeOrgRequestPage
    config={{
      kind: "clinic",
      requestPath: "becomeclinic",
      accessModel: "BecomeClinicRequest",
      orgPath: "clinic",
      title: ta("درخواست تبدیل به کلینیک"),
      approveLabel: ta("تأیید و ساخت کلینیک"),
      approveDone: ta("کلینیک ساخته و فعال شد."),
      selectLabel: ta("انتخاب کلینیک"),
    }}
  />
);

export default AdminManageBecomeClinicPage;
