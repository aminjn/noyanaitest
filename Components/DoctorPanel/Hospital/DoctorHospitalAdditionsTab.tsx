import useSWR from "swr";
import classes from "./DoctorHospitalAdditionsTab.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import SubmitHospitalAdditionRequestPopup from "./SubmitHospitalAdditionRequestPopup";
import PlusIcon from "@/Components/Icons/PlusIcon";
import Table from "@/Components/Admin/UI/Table";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { findProvince, Province } from "@/Components/Enums/Provinces";
import { City, findCity } from "@/Components/Enums/Cities";
import { Dictionary } from "./DoctorJoinHospitalsTab";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import FormatDate from "@/Components/UI/FormatDate";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ta } from "@/Components/Admin/i18n/adminText";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

export const additionRequsetStatuses = [
  "Pending",
  "Proccessing",
  "Done",
  "Rejected",
] as const;

export type AdditionRequestStatus = (typeof additionRequsetStatuses)[number];

export const additionRequestStatusDict: Dictionary<AdditionRequestStatus> = {
  get Done() {
  return ta("تمام شده");
},
  get Pending() {
  return ta("منتظر تایید");
},
  get Proccessing() {
  return ta("در دست بررسی");
},
  get Rejected() {
  return ta("رد شده");
},
};

export type HospitalAdditionRequestPopulation = Population<{
  user: DoctorProfilePopulation;
}>;

export interface IHospitalAdditionRequest<
  T extends HospitalAdditionRequestPopulation = HospitalAdditionRequestPopulation
> extends MongoDoc {
  submittedAt: Date;
  status: AdditionRequestStatus;
  rejectReason?: string;
  submittedBy: T["user"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["user"]> | null
    : string;
  hospitalName: string;
  hospitalAddress: string;
  ownerPhone: string;
  ownerName: string;
  province: Province;
  city: City;
  description?: string;
}

const DoctorHospitalAdditionsTab = () => {
  const { data, error, mutate } = useSWR<IHospitalAdditionRequest[]>(
    `${API}/doctor/hospitaladdition`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("hospitalAdditionRequests")}
          actions={[
            {
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "SubmitHospitalAdditionRequest",
                      <SubmitHospitalAdditionRequestPopup mutate={mutate} />
                    )
                  }
                  leadIcon={<PlusIcon />}
                >
                  {getContent("newItem")}
                </Button>
              ),
              id: "New",
            },
          ]}
        >
          <Table
            data={data}
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              hospitalName: {
                name: getContent("hospitalName"),
                value: (node) => node.hospitalName,
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
              hospitalAddress: {
                name: getContent("hospitalAddress"),
                value: (node) => node.hospitalAddress,
                filter: "Text",
              },
              ownerName: {
                name: getContent("ownerName"),
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: getContent("ownerPhone"),
                value: (node) => node.ownerPhone,
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
            name="DoctorManageHospitalAdditionRequests"
          />
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorHospitalAdditionsTab;
