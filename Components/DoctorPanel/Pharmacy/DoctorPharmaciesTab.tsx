import { OpeningHours, OpenStatus } from "@/Components/OpeningHours/openingHours";
import { CentreLicenceFields } from "@/Components/helpers/centreLicence";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorPharmacyPopup from "./DeleteDoctorPharmacyPopup";
import Button from "@/Components/UI/Button";
import DoctorAddPharmacyPopup from "./DoctorAddPharmacyPopup";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "@/Components/Admin/Province/AdminManageProvincesPage";
import { City } from "@/Components/Enums/Cities";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelPharmacy"];

export type PharmacyPopulation = Population<{
  User: UserPopulation;
  Province: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
}>;

export interface IPharmacy<
  T extends PharmacyPopulation = PharmacyPopulation,
> extends MongoDoc, CentreLicenceFields {
  user?: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  name?: string;
  order: number;
  active: boolean;
  location?: { type: "Point"; coordinates?: [number, number] };
  province?: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  city?: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  district?: T["District"] extends DistrictPopulation
    ? IDistrict<T["District"]>
    : string;
  avatar?: string;
  summary?: string;
  slug?: string;
  address?: string;
  banner?: string;
  phone?: string;
  businessTime?: string;
  isRoundTheClock?: boolean;
  // structured week and its status now (2026-10, Components/OpeningHours)
  openingHours?: OpeningHours | null;
  openStatus?: OpenStatus | null;
  insurances?: string[];
}

export type DoctorPharmacyPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Pharmacy: PharmacyPopulation;
}>;

export interface IDoctorPharmacy<
  T extends DoctorPharmacyPopulation = DoctorPharmacyPopulation,
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
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

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
                      <DoctorAddPharmacyPopup mutate={mutate} />,
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
                            />,
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
