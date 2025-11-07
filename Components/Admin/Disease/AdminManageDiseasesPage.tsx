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
import CreateNewDiseasePopup from "./CreateNewDiseasePopup";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import DeleteDiseasePopup from "./DeleteDiseasePopup";

export const genderSpicificOptions = ["male", "female", "none"] as const;

export type GenderSpecificOption = (typeof genderSpicificOptions)[number];

export const genderSpecificOptionsDict: Record<GenderSpecificOption, string> = {
  female: "فقط زنان",
  male: "فقط مردان",
  none: "همه",
};

export type PartPopulation = Population<Record<never, never>>;
export interface IPart<T extends PartPopulation = PartPopulation>
  extends MongoDoc {
  name?: string;
  order: number;
}

export type SymptomPopulation = Population<{
  Part: PartPopulation;
  SameAs: SymptomPopulation;
}>;
export interface ISymptom<T extends SymptomPopulation = SymptomPopulation>
  extends MongoDoc {
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
}

export type DrugPopulation = Population<Record<never, never>>;
export interface IDrug<T extends DrugPopulation = DrugPopulation>
  extends MongoDoc {
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
}

export type DiseasePopulation = Population<{
  Symptom: SymptomPopulation;
  Speciality: SpecialityPopulation;
  Drugs: DrugPopulation;
  SameAs: DiseasePopulation;
}>;

export interface IDisease<T extends DiseasePopulation = DiseasePopulation>
  extends MongoDoc {
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
}

const AdminManageDiseasePage = () => {
  const { data, error, mutate } = useSWR<IDisease[]>(
    `${API}/auto/disease`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="بیماری ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateNewDisease",
                  <CreateNewDiseasePopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDiseases"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/disease/${node._id}`)}>
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteDiseasePopup",
                          <DeleteDiseasePopup mutate={mutate} node={node} />
                        )
                      }
                      variant="Danger"
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
