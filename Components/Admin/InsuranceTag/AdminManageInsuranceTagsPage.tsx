"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type InsuranceTagPopulation = Population<Record<never, never>>;

export interface IInsuranceTag<
  T extends InsuranceTagPopulation = InsuranceTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

export const insuranceTagFormRenderer: FormRenderer<IInsuranceTag> = {
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

const AdminManageInsuranceTagsPage = () => (
  <AdminCatalogList<IInsuranceTag>
    model="insuranceTag"
    title={ta("تگ بیمه")}
    noun={ta("تگ بیمه")}
    fields={insuranceTagFormRenderer}
  />
);

export default AdminManageInsuranceTagsPage;
