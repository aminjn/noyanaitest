import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Table from "@/Components/Admin/UI/Table";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import AddInsurancePopup from "./AddInsurancePopup";
import Button from "@/Components/UI/Button";
import DeleteInsurancePopup from "./DeleteInsurancePopup";
import {
  IInsuranceCategory,
  InsuranceCategoryPopulation,
} from "@/Components/Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";
import {
  IInsuranceTag,
  InsuranceTagPopulation,
} from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagsPage";
import {
  IInsurancePlan,
  InsurancePlanPopulation,
} from "@/Components/Admin/Insurance/AdminManageInsurancePage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

export type InsurancePopulation = Population<{
  Category: InsuranceCategoryPopulation;
  Tags: InsuranceTagPopulation;
  Plans: InsurancePlanPopulation;
  User: UserPopulation;
}>;

export interface IInsurance<
  T extends InsurancePopulation = InsurancePopulation,
> extends MongoDoc {
  name?: string;
  active: boolean;
  order: number;
  category?: T["Category"] extends InsuranceCategoryPopulation
    ? IInsuranceCategory<T["Category"]>
    : string;
  tags: T["Tags"] extends InsuranceTagPopulation
    ? IInsuranceTag<T["Tags"]>[]
    : string[];
  establishment?: string;
  membersCount?: string;
  centersCount?: string;
  doctorsCount?: string;
  image?: string;
  slug?: string;
  phone?: string;
  summary?: string;
  pharmacyCount?: string;
  doctorCount?: string;
  hospitalCount?: string;
  coverages: string[];
  advantages: string[];
  website?: string;
  address?: string;
  location?: { type: "Point"; coordinates?: [number, number] };
  plans: T["Plans"] extends InsurancePlanPopulation
    ? IInsurancePlan<T["Plans"]>[]
    : never;
  averageScore?: number;
  commentCount?: number;
  // Org-account field (2026-09), mirroring IHospital - an insurance's own
  // login/panel (insuranceController/insuranceRouter).
  user?: T["User"] extends UserPopulation ? IUser : string;
}

export type DoctorInsurancePopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Insurance: InsurancePopulation;
}>;

export interface IDoctorInsurance<
  T extends DoctorInsurancePopulation = DoctorInsurancePopulation,
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  insurance: T["Insurance"] extends InsurancePopulation
    ? IInsurance<T["Insurance"]> | null
    : string;
}

const DoctorInsurancesTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorInsurance<{ Insurance: Record<string, never> }>[]
  >(`${API}/doctor/insurance`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("insurances")}
          actions={[
            {
              id: "Add",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "AddInsurance",
                      <AddInsurancePopup mutate={mutate} />,
                    )
                  }
                >
                  {getContent("newItem")}
                </Button>
              ),
            },
          ]}
        >
          <Table
            name="DoctorManageInsurances"
            data={data}
            renderer={{
              name: {
                name: getContent("insuranceName"),
                value: (node) => node.insurance?.name || "",
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteInsurance",
                          <DeleteInsurancePopup mutate={mutate} node={node} />,
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
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorInsurancesTab;
