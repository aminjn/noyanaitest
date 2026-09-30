"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { BadgeColor, badgeColors } from "@/Components/UI/Badge";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { TableRenderer } from "../UI/Table";
import { ta } from "@/Components/Admin/i18n/adminText";

export type DiseaseTagPopulation = Population<Record<never, never>>;

export interface IDiseaseTag<
  T extends DiseaseTagPopulation = DiseaseTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  level: BadgeColor;
}

const diseaseTagFormRenderer: FormRenderer<IDiseaseTag> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
    },
  },
  level: {
    type: "select",
    get title() {
      return ta("سطح");
    },
    options: badgeColors.reduce((acc, el) => ({ ...acc, [el]: el }), {}),
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

const AdminManageDiseaseTagsPage = () => (
  <AdminCatalogList<IDiseaseTag>
    model="diseaseTag"
    title={ta("تگ بیماری ها")}
    noun={ta("برچسب بیماری")}
    fields={diseaseTagFormRenderer}
    columns={
      {
        level: {
          name: ta("سطح"),
          value: (node) => node.level || "—",
          filter: "Set",
        },
      } as TableRenderer<IDiseaseTag>
    }
  />
);

export default AdminManageDiseaseTagsPage;
