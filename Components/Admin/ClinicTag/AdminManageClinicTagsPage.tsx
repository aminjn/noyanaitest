"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ClinicTagPopulation = Population<Record<never, never>>;
export interface IClinicTag<
  T extends ClinicTagPopulation = ClinicTagPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
}

const clinicTagFormRenderer: FormRenderer<IClinicTag> = {
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

const AdminManageClinicTagsPage = () => (
  <AdminCatalogList<IClinicTag>
    model="clinicTag"
    title={ta("تگ کلینیک ها")}
    noun={ta("برچسب کلینیک")}
    fields={clinicTagFormRenderer}
  />
);

export default AdminManageClinicTagsPage;
