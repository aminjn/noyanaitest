"use client";

import { IPart } from "../Disease/AdminManageDiseasesPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

const partFormRenderer: FormRenderer<IPart> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
    },
  },
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

// Part has no isActive in the backend, so no status column
const AdminManagePartsPage = () => (
  <AdminCatalogList<IPart>
    model="part"
    title={ta("اعضای بدن")}
    noun={ta("عضو بدن")}
    fields={partFormRenderer}
    showStatus={false}
  />
);

export default AdminManagePartsPage;
