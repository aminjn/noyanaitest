import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorPharmacyPopup from "./DeleteDoctorPharmacyPopup";
import Button from "@/Components/UI/Button";
import DoctorAddPharmacyPopup from "./DoctorAddPharmacyPopup";

export type PharmacyPopulation = Population<Record<string, never>>;

export interface IPharmacy<T extends PharmacyPopulation = PharmacyPopulation>
  extends MongoDoc {
  name?: string;
  order: number;
  active: boolean;
}

export type DoctorPharmacyPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Pharmacy: PharmacyPopulation;
}>;

export interface IDoctorPharmacy<
  T extends DoctorPharmacyPopulation = DoctorPharmacyPopulation
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  pharmacy: T["Pharmacy"] extends PharmacyPopulation
    ? IPharmacy<T["Pharmacy"]>
    : string;
}

const DoctorPharmaciesTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorPharmacy<{ Pharmacy: Record<string, never> }>[]
  >(`${API}/doctor/pharmacy`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("pharmacies")}
          actions={[
            {
              id: "New",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "DoctorAddPharmacy",
                      <DoctorAddPharmacyPopup mutate={mutate} />
                    )
                  }
                >
                  {getContent("newItem")}
                </Button>
              ),
            },
          ]}
        >
          {!!data && (
            <Table
              name="DoctorManagePharmacies"
              data={data}
              renderer={{
                pharmacy: {
                  name: getContent("pharmacyName"),
                  value: (node) => node.pharmacy.name,
                  filter: "Text",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "DeleteDoctorPharmacy",
                            <DeleteDoctorPharmacyPopup
                              node={node}
                              mutate={mutate}
                            />
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
          )}
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorPharmaciesTab;
