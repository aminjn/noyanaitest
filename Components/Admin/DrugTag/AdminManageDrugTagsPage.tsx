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

const AdminManageDrugtagsPage = () => (
  <AdminCatalogList<IDrugTag>
    model="drugTag"
    title={ta("تگ دارو ها")}
    noun={ta("برچسب دارو")}
    fields={drugTagFormRenderer}
  />
);

export default AdminManageDrugtagsPage;
