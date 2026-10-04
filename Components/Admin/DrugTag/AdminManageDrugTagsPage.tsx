"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type DrugTagPopulation = Population<Record<never, never>>;

export interface IDrugTag<
  T extends DrugTagPopulation = DrugTagPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

const drugTagFormRenderer: FormRenderer<IDrugTag> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
    },
  },
  slug: {
    type: "text",
    get title() {
      return ta("اسلاگ");
    },
  },
  isActive: {
    type: "bool",
    get title() {
      return ta("فعال");
    },
  },
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

// the therapeutic classes of drugs (the model is still DrugTag, backend
// Models/Drugtag.ts): /drug/class/<slug> on the public site
const AdminManageDrugtagsPage = () => (
  <AdminCatalogList<IDrugTag>
    model="drugTag"
    title={ta("گروه‌های درمانی")}
    noun={ta("گروه درمانی")}
    fields={drugTagFormRenderer}
  />
);

export default AdminManageDrugtagsPage;
