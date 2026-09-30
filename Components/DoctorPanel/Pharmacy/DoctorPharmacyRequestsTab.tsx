import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { findProvince, Province } from "@/Components/Enums/Provinces";
import { City, findCity } from "@/Components/Enums/Cities";
import { AdditionRequestStatus } from "../Clinic/DoctorClinicAdditionsTab";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import SubmitPharmacyAdditionRequestPopup from "./SubmitPharmacyAdditionRequestPopup";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelPharmacy"];

export type PharmacyAdditionPopulation = Population<{
  Doctor: DoctorProfilePopulation;
}>;

export interface IPharmacyAdditionRequest<
  T extends PharmacyAdditionPopulation = PharmacyAdditionPopulation
> extends MongoDoc {
  submittedAt: Date;
  submittedBy: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  name: string;
  address: string;
  province: Province;
  city: City;
  description?: string;
  status: AdditionRequestStatus;
  rejectReason?: string;
}

const DoctorPharmacyRequestsTab = () => {
  const { data, error, mutate } = useSWR<IPharmacyAdditionRequest[]>(
    `${API}/doctor/pharmacyaddition`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("pharmacyAdditionRequests")}
          actions={[
            {
              id: "New",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "NewPharmacyAddition",
                      <SubmitPharmacyAdditionRequestPopup mutate={mutate} />
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
            name="DoctorManagePharmayAdditionRequests"
            data={data}
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              name: {
                name: getContent("pharmacyName"),
                value: (node) => node.name,
                filter: "Text",
              },
              province: {
                name: getContent("province"),
                value: (node) => findProvince(node.province),
                filter: "Multi",
              },
              city: {
                name: getContent("city"),
                value: (node) => findCity(node.city),
                filter: "Multi",
              },
              address: {
                name: getContent("address"),
                value: (node) => node.address,
                filter: "Text",
              },
              description: {
                name: getContent("description"),
                value: (node) => node.description,
                filter: "Text",
              },
              status: {
                name: getContent("status"),
                value: (node) => getContent(node.status),
                filter: "Set",
              },
            }}
          />
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorPharmacyRequestsTab;
