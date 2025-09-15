import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import AddInsurancePopup from "./AddInsurancePopup";
import Button from "@/Components/UI/Button";
import DeleteInsurancePopup from "./DeleteInsurancePopup";

export type InsurancePopulation = Population<Record<string, never>>;

export interface IInsurance<T extends InsurancePopulation = InsurancePopulation>
  extends MongoDoc {
  name?: string;
  active: boolean;
  order: number;
}

export type DoctorInsurancePopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Insurance: InsurancePopulation;
}>;

export interface IDoctorInsurance<
  T extends DoctorInsurancePopulation = DoctorInsurancePopulation
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
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

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
                      <AddInsurancePopup mutate={mutate} />
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
                          <DeleteInsurancePopup mutate={mutate} node={node} />
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
