"use client";

import BecomeOrgRequestPage from "../BecomeRequest/BecomeOrgRequestPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeParaClinicPage = () => (
  <BecomeOrgRequestPage
    config={{
      kind: "paraClinic",
      requestPath: "becomeParaClinic",
      accessModel: "BecomeParaClinicRequest",
      orgPath: "paraClinic",
      title: ta("درخواست تبدیل به پاراکلینیک"),
      approveLabel: ta("تأیید و ساخت مرکز پاراکلینیک"),
      approveDone: ta("مرکز پاراکلینیک ساخته و فعال شد."),
      selectLabel: ta("انتخاب پاراکلینیک"),
    }}
  />
);

export default AdminManageBecomeParaClinicPage;
