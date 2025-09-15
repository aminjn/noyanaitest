import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { AdditionRequestStatus } from "../Clinic/DoctorClinicAdditionsTab";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import NewInsuranceAdditionRequestPopup from "./NewInsuranceAdditionRequestPopup";
import FormatDate from "@/Components/UI/FormatDate";

export type InsuranceAdditionRequestPopulation = Population<{
  Doctor: DoctorProfilePopulation;
}>;

export interface IInsuranceAdditionRequest<
  T extends InsuranceAdditionRequestPopulation = InsuranceAdditionRequestPopulation
> extends MongoDoc {
  submittedAt: Date;
  submittedBy: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  status: AdditionRequestStatus;
  name: string;
  description?: string;
}

const DoctorInsuranceAdditionRequestsTab = () => {
  const { data, error, mutate } = useSWR<IInsuranceAdditionRequest[]>(
    `${API}/doctor/insuranceaddition`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("insuranceAdditionRequests")}
          actions={[
            {
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "NewInsuranceAdditionRequest",
                      <NewInsuranceAdditionRequestPopup mutate={mutate} />
                    )
                  }
                >
                  {getContent("newItem")}
                </Button>
              ),
              id: "NewInsuranceAdditionRequest",
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageInsuranceAdditionRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              name: {
                name: getContent("insuranceName"),
                value: (node) => node.name,
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

export default DoctorInsuranceAdditionRequestsTab;
