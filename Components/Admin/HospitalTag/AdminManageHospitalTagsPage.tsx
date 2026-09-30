"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type HospitalTagPopulation = Population<Record<never, never>>;

export interface IHospitalTag<
  T extends HospitalTagPopulation = HospitalTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

const hospitalTagFormRenderer: FormRenderer<IHospitalTag> = {
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

const AdminManageHospitalTagsPage = () => (
  <AdminCatalogList<IHospitalTag>
    model="hospitalTag"
    title={ta("تگ بیمارستان")}
    noun={ta("تگ بیمارستان")}
    fields={hospitalTagFormRenderer}
  />
);

export default AdminManageHospitalTagsPage;
