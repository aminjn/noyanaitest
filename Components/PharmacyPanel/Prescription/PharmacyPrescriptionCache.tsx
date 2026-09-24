import { MongoDoc } from "@/Components/Hooks/useUser";
import classes from "./PharmacyPrescriptionCache.module.css";
import {
  IPharmacy,
  PharmacyPopulation,
} from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";

const NS: ContentNamespace[] = ["common", "pharmacyPanelPrescription"];

export type PharmacyTaminPrescriptionPopulation = Population<{
  Pharmacy: PharmacyPopulation;
  Items: PharmacyTaminPrescriptionItemPopulation;
}>;

export interface IPharmacyTaminPrescription<
  T extends PharmacyTaminPrescriptionPopulation =
    PharmacyTaminPrescriptionPopulation,
> extends MongoDoc {
  pharmacy: T["Pharmacy"] extends PharmacyPopulation
    ? IPharmacy<T["Pharmacy"]>
    : string;
  headeprscid: number;
  prescdate: string;
  docid: string;
  docspec: string;
  doctorFullName: string;
  patientfirstname: string;
  patientlastname: string;
  custname: null;
  comments: string;
  refeR_REASON: null;
  electronicflag: string;
  clinicdoc: string;
  presctime: string;
  speccode: string;
  items: T["Items"] extends PharmacyTaminPrescriptionItemPopulation
    ? IPharmacyTaminPrescriptionItem<T["Items"]>[]
    : never;
}

export type PharmacyTaminPrescriptionItemPopulation = Population<{
  Prescription: PharmacyTaminPrescriptionPopulation;
}>;

export interface IPharmacyTaminPrescriptionItem<
  T extends PharmacyTaminPrescriptionItemPopulation =
    PharmacyTaminPrescriptionItemPopulation,
> extends MongoDoc {
  prescription: T["Prescription"] extends PharmacyTaminPrescriptionPopulation
    ? IPharmacyTaminPrescription<T["Prescription"]>
    : string;
  detailId: number;
  drugCode: string;
  drugName: string;
  drugForm: string;
  insuranceStatus: string;
  requiresBarcodeInquiry: string;
  hospitalDrug: string;
  maxAge: string;
  prescribedCount: string;
  remainingCount: string;
  drugInstruction: string;
}

const PharmacyTaminPrescriptionItemsPopup = ({
  items,
}: {
  items: IPharmacyTaminPrescriptionItem[];
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard className={classes.itemsList}>
      <WithTitle title={getContent("prescriptionItems")}>
        <Table
          data={items}
          renderer={{
            detailId: {
              name: getContent("prescriptionDetailId"),
              value: (node) => node.detailId,
              filter: "Text",
            },
            drugCode: {
              name: getContent("drugCode"),
              value: (node) => node.drugCode,
              filter: "Text",
            },
            drugName: {
              name: getContent("drugName"),
              value: (node) => node.drugName,
              filter: "Text",
            },
            drugForm: {
              name: getContent("drugForm"),
              value: (node) => node.drugForm,
              filter: "Text",
            },
            insuranceStatus: {
              name: getContent("prescriptionInsuranceStatus"),
              value: (node) => node.insuranceStatus,
              filter: "Text",
            },
            requiresBarcodeInquiry: {
              name: getContent("prescriptionRequiresBarcodeInquiry"),
              value: (node) => node.requiresBarcodeInquiry,
              filter: "Text",
            },
            hospitalDrug: {
              name: getContent("prescriptionHospitalDrug"),
              value: (node) => node.hospitalDrug,
              filter: "Text",
            },
            maxAge: {
              name: getContent("prescriptionMaxAge"),
              value: (node) => node.maxAge,
              filter: "Text",
            },
            prescribedCount: {
              name: getContent("prescribedCount"),
              value: (node) => Number(node.prescribedCount),
              filter: "Number",
            },
            remainingCount: {
              name: getContent("remainingDrugCount"),
              value: (node) => Number(node.remainingCount),
              filter: "Number",
            },
            drugInstruction: {
              name: getContent("drugInstruction"),
              value: (node) => node.drugInstruction,
              filter: "Text",
            },
          }}
        />
      </WithTitle>
    </PopupCard>
  );
};

const PharmacyPrescriptionCache = () => {
  const { data, error } = useSWR<
    IPharmacyTaminPrescription<{ Items: Record<never, never> }>[]
  >(`${API}/pharmacy/prescription`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("pharmacyPrescriptionsCache")}>
          <Table
            data={data}
            renderer={{
              headeprscid: {
                name: getContent("taminPrescriptionId"),
                value: (node) => node.headeprscid,
                filter: "Text",
              },
              prescdate: {
                name: getContent("prescriptionDate"),
                value: (node) => node.prescdate,
              },
              docid: {
                name: getContent("doctorMedicalSystemCode"),
                value: (node) => node.docid,
                filter: "Text",
              },
              docspec: {
                name: getContent("doctorSpeciality"),
                value: (node) => node.docspec,
                filter: "Text",
              },
              doctorFullName: {
                name: getContent("doctorName"),
                value: (node) => node.doctorFullName,
                filter: "Text",
              },
              patientfirstname: {
                name: getContent("patientFirstName"),
                value: (node) => node.patientfirstname,
                filter: "Text",
              },
              patientlastname: {
                name: getContent("patientLastName"),
                value: (node) => node.patientlastname,
                filter: "Text",
              },
              custname: {
                name: getContent("custName"),
                value: (node) => node.custname || "",
                filter: "Text",
              },
              comments: {
                name: getContent("prescriptionComments"),
                value: (node) => node.comments,
                filter: "Text",
              },
              refeR_REASON: {
                name: getContent("referReason"),
                value: (node) => node.refeR_REASON,
                filter: "Text",
              },
              electronicflag: {
                name: getContent("prescriptionElectronicFlag"),
                value: (node) => node.electronicflag,
                filter: "Text",
              },
              clinicdoc: {
                name: getContent("prescriptionClinicDoc"),
                value: (node) => node.clinicdoc,
                filter: "Text",
              },
              presctime: {
                name: getContent("prescriptionTime"),
                value: (node) => node.presctime,
                filter: "Text",
              },
              speccode: {
                name: getContent("prescriptionSpecCode"),
                value: (node) => node.speccode,
                filter: "Text",
              },
              items: {
                name: getContent("prescriptionItemsCount"),
                value: (node) => node.items.length,
                filter: "Number",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "PharmacyTaminPrescriptionItems",
                          <PharmacyTaminPrescriptionItemsPopup
                            items={node.items}
                          />,
                        )
                      }
                    >
                      <EyeIcon />
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

export default PharmacyPrescriptionCache;
