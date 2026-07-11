import useSWR from "swr";
import classes from "./PharmacyFilledPrescriptions.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import {
  IPharmacy,
  PharmacyPopulation,
} from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { PrescriptionPopulation } from "@/Components/DoctorPanel/Prescription/Create/PrescriptionItemsOverview";
import {
  IPharmacyTaminPrescription,
  PharmacyTaminPrescriptionPopulation,
} from "./PharmacyPrescriptionCache";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";

export type PharmacyFilledPrescriptionPopulation = Population<{
  Pharmacy: PharmacyPopulation;
  Prescription: PrescriptionPopulation;
  Items: PharmacyFilledPrescriptionItemPopulation;
}>;

export interface IPharmacyFilledPrescription<
  T extends PharmacyFilledPrescriptionPopulation =
    PharmacyFilledPrescriptionPopulation,
> extends MongoDoc {
  pharmacy: T["Pharmacy"] extends PharmacyPopulation
    ? IPharmacy<T["Pharmacy"]>
    : string;
  submittedAt: Date;
  prescription: T["Prescription"] extends PharmacyTaminPrescriptionPopulation
    ? IPharmacyTaminPrescription<T["Prescription"]>
    : string;
  requestId: number;
  requestPrice: number;
  regdate: string;
  phaRequestPrice: number;
  isNotePatient: number;
  docId: string;
  docFName: string;
  docLName: string;
  userId: string;
  phaId: string;
  month: string;
  year: string;
  prescDate: string;
  patientAmount: number;
  custServiceType: string;
  docspec: string;
  custServiceTypeDesc: string;
  items: T["Items"] extends PharmacyFilledPrescriptionItemPopulation
    ? IPharmacyFilledPrescriptionItem<T["Items"]>[]
    : never;
}

export type PharmacyFilledPrescriptionItemPopulation = Population<{
  FilledPrescription: PharmacyFilledPrescriptionPopulation;
}>;

export interface IPharmacyFilledPrescriptionItem<
  T extends PharmacyFilledPrescriptionItemPopulation =
    PharmacyFilledPrescriptionItemPopulation,
> extends MongoDoc {
  filledPrescription: T["FilledPrescription"] extends PharmacyFilledPrescriptionPopulation
    ? IPharmacyFilledPrescription<T["FilledPrescription"]>
    : string;
  drugCode: string;
  drugName: string;
  drugCount: number;
  itemPrice: number;
  franshiz: number;
  phaItemPrice: number;
  timesaday: string;
  dose: string;
  is_Note_Patient: number;
  subsidyprice: number;
  patient_Price: number;
  support_Specialpatient: number;
  sumPrice: number;
  sumIsNotePatient: number;
}

const PharmacyFilledPrescriptions = () => {
  const { data, error } = useSWR<
    IPharmacyFilledPrescription<{
      Items: Record<never, never>;
      Prescription: Record<never, never>;
    }>[]
  >(`${API}/pharmacy/filledPrescription`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("filledPrescriptions")}>
          <Table
            data={data}
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              prescriptionId: {
                name: getContent("taminPrescriptionId"),
                value: (node) => node.prescription.headeprscid,
                filter: "Text",
              },
              requestId: {
                name: getContent("requestId"),
                value: (node) => node.requestId,
                filter: "Text",
              },
              requestPrice: {
                name: getContent("requestPrice"),
                value: (node) => node.requestPrice,
                component: (node) => currencize(node.requestPrice),
                filter: "Number",
              },
              regdate: {
                name: getContent("regdate"),
                value: (node) => node.regdate,
                filter: "Text",
              },
              phaRequestPrice: {
                name: getContent("pharmacyRequestPrice"),
                value: (node) => node.phaRequestPrice,
                component: (node) => currencize(node.phaRequestPrice),
                filter: "Number",
              },
              isNotePatient: {
                name: getContent("isNotePatient"),
                filter: "Number",
                value: (node) => node.isNotePatient,
                component: (node) => currencize(node.isNotePatient),
              },
              docId: {
                name: getContent("doctorMedicalSystemCode"),
                filter: "Text",
                value: (node) => node.docId,
              },
              docFName: {
                name: getContent("doctorFirstName"),
                value: (node) => node.docFName,
                filter: "Text",
              },
              docLName: {
                name: getContent("doctorLastName"),
                value: (node) => node.docLName,
                filter: "Text",
              },
              userId: {
                name: getContent("userId"),
                value: (node) => node.userId,
                filter: "Text",
              },
              phaId: {
                name: getContent("phaId"),
                value: (node) => node.phaId,
                filter: "Text",
              },
              month: {
                name: getContent("month"),
                value: (node) => node.month,
                filter: "Multi",
              },
              year: {
                name: getContent("year"),
                value: (node) => node.year,
                filter: "Text",
              },
              prescDate: {
                name: getContent("prescriptionDate"),
                filter: "Text",
                value: (node) => node.prescDate,
              },
              patientAmount: {
                name: getContent("patientAmount"),
                filter: "Number",
                value: (node) => node.patientAmount,
                component: (node) => currencize(node.patientAmount),
              },
              custServiceType: {
                name: getContent("custServiceType"),
                value: (node) => node.custServiceType,
                filter: "Text",
              },
              docspec: {
                name: getContent("doctorSpeciality"),
                value: (node) => node.docspec,
                filter: "Text",
              },
              custServiceTypeDesc: {
                name: getContent("custServiceTypeDesc"),
                filter: "Text",
                value: (node) => node.custServiceTypeDesc,
              },
              itemsCount: {
                name: getContent("itemsCount"),
                value: (node) => node.items.length,
                filter: "Number",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={`/pharmacypanel/filledPrescription/${node._id}`}
                    >
                      <EyeIcon />
                    </IconLink>
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

export default PharmacyFilledPrescriptions;
