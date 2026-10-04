"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  ISpeciality,
  SpecialityPopulation,
} from "../Speciality/AdminManageSpecialitiesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDiseasePopup from "./DeleteDiseasePopup";
import {
  DiseaseCategoryPopuplation,
  IDiseaseCategory,
} from "../DiseaseCategory/AdminManageDiseaseCategoriesPage";
import {
  DiseaseTagPopulation,
  IDiseaseTag,
} from "../DiseaseTag/AdminManageDiseaseTagsPage";
import {
  DrugTagPopulation,
  IDrugTag,
} from "../DrugTag/AdminManageDrugTagsPage";
import {
  ISymptomCategory,
  SymptomCategoryPopulation,
} from "../SymptomCategory/AdminManageSymptomCategoriesPage";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export const genderSpicificOptions = ["male", "female", "none"] as const;

export type GenderSpecificOption = (typeof genderSpicificOptions)[number];

export const genderSpecificOptionsDict: Record<GenderSpecificOption, string> = {
  get female() {
  return ta("فقط زنان");
},
  get male() {
  return ta("فقط مردان");
},
  get none() {
  return ta("همه");
},
};

export type PartPopulation = Population<Record<never, never>>;
export interface IPart<
  T extends PartPopulation = PartPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
}

export type SymptomPopulation = Population<{
  Part: PartPopulation;
  SameAs: SymptomPopulation;
  Diseases: DiseasePopulation;
  Category: SymptomCategoryPopulation;
}>;
export interface ISymptom<
  T extends SymptomPopulation = SymptomPopulation,
> extends MongoDoc {
  name?: string;
  genderSpecific?: GenderSpecificOption;
  part: T["Part"] extends PartPopulation ? IPart<T["Part"]>[] : string[];
  summary?: string;
  description?: string;
  expectedPrognosis?: string;
  image?: string;
  naturalProgression?: string;
  pathophysiology?: string;
  sameAs: T["SameAs"] extends SymptomPopulation
    ? ISymptom<T["SameAs"]>[]
    : string[];
  possibleComplication?: string;
  order: number;
  slug?: string;
  disease: T["Diseases"] extends DiseasePopulation
    ? IDisease<T["Diseases"]>[]
    : never;
  category?: T["Category"] extends SymptomCategoryPopulation
    ? ISymptomCategory<T["Category"]>
    : string;
  aiSummary?: string;
  content?: string;
}

export type DrugPopulation = Population<{
  Tag: DrugTagPopulation;
  SameAs: DrugPopulation;
}>;
export interface IDrug<
  T extends DrugPopulation = DrugPopulation,
> extends MongoDoc {
  name?: string;
  summary?: string;
  description?: string;
  sideEffects?: string;
  activeIngridient?: string;
  adminstrationRoute?: string;
  alcoholWarning?: string;
  alternateName?: string;
  breastfeedingWarning?: string;
  clinicalPharmacology?: string;
  dosageForm?: string;
  drugUnit?: string;
  foodWarning?: string;
  identifier?: string;
  image?: string;
  overdosage?: string;
  pregnancyWarning?: string;
  prescribingInfo?: string;
  prescriptionStatus?: string;
  warning?: string;
  order: number;
  slug?: string;
  brand?: string;
  tag?: T["Tag"] extends DrugTagPopulation ? IDrugTag : string;
  dosage?: string;
  sameAs: T["SameAs"] extends DrugPopulation ? IDrug<T["SameAs"]>[] : string[];
  aiSummary?: string;
  content?: string;
}

export type DiseasePopulation = Population<{
  Symptom: SymptomPopulation;
  Speciality: SpecialityPopulation;
  Drugs: DrugPopulation;
  SameAs: DiseasePopulation;
  Category: DiseaseCategoryPopuplation;
  Tag: DiseaseTagPopulation;
}>;

export interface IDisease<
  T extends DiseasePopulation = DiseasePopulation,
> extends MongoDoc {
  name?: string;
  description?: string;
  summary?: string;
  symptoms: T["Symptom"] extends SymptomPopulation
    ? ISymptom<T["Symptom"]>[]
    : string[];
  specialities: T["Speciality"] extends SpecialityPopulation
    ? ISpeciality<T["Speciality"]>[]
    : string[];
  drugs: T["Drugs"] extends DrugPopulation ? IDrug<T["Drugs"]>[] : string[];
  genderSpecific?: GenderSpecificOption;
  expectedPrognosis?: string;
  image?: string;
  naturalProgression?: string;
  pathophysiology?: string;
  sameAs: T["SameAs"] extends DiseasePopulation
    ? IDisease<T["SameAs"]>[]
    : string[];
  possibleComplication?: string;
  order: number;
  slug?: string;
  tag?: T["Tag"] extends DiseaseTagPopulation ? IDiseaseTag<T["Tag"]> : string;
  category?: T["Category"] extends DiseaseCategoryPopuplation
    ? IDiseaseCategory<T["Category"]>
    : string;
  aiSummary?: string;
  content?: string;
}

const AdminManageDiseasePage = () => {
  const { data, error, mutate } = useSWR<IDisease[]>(
    `${API}/auto/disease`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("بیماری ها")}
          actions={[
            {
              title: ta("جدید"),
              // the full form, saved once (AdminRecordEditor)
              action: () => push(adminPath("/disease/new")),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDiseases"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="disease"
                    mutate={mutate}
                    _id={node._id}
                  />
                ),
              },
              genderSpecific: {
                name: ta("جنسیت"),
                value: (node) =>
                  node.genderSpecific
                    ? genderSpecificOptionsDict[node.genderSpecific]
                    : undefined,
                filter: "Set",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/disease/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDiseasePopup",
                          <DeleteDiseasePopup mutate={mutate} node={node} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDiseasePage;
