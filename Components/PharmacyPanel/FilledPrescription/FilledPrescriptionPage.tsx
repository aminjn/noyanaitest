"use client";
import useSWR from "swr";
import classes from "./FilledPrescriptionPage.module.css";
import { IPharmacyFilledPrescription } from "../Prescription/PharmacyFilledPrescriptions";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import List from "@/Components/Admin/UI/List";
import DataPair from "@/Components/Admin/UI/DataPair";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import { currencize } from "@/Components/helpers/currencize";
import Table from "@/Components/Admin/UI/Table";

const FilledPrescriptionPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<
    IPharmacyFilledPrescription<{
      Items: Record<never, never>;
      Prescription: Record<never, never>;
    }>
  >(`${API}/pharmacy/filledPrescription/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("filledPrescription")}>
          <List>
            <DataPair
              title={getContent("submittedAt")}
              value={<FormatDate value={data.submittedAt} />}
            />
            <DataPair
              title={getContent("prescription")}
              value={
                <InlineLink
                  href={`/pharmacypanel/cachedPrescription/${data.prescription._id}`}
                >
                  {data.prescription.headeprscid}
                </InlineLink>
              }
            />
            <DataPair title={getContent("requestId")} value={data.requestId} />
            <DataPair
              title={getContent("requestPrice")}
              value={currencize(data.requestPrice)}
            />
            <DataPair title={getContent("regdate")} value={data.regdate} />
            <DataPair
              title={getContent("pharmacyRequestPrice")}
              value={currencize(data.phaRequestPrice)}
            />
            <DataPair
              title={getContent("isNotePatient")}
              value={data.isNotePatient}
            />
            <DataPair
              title={getContent("doctorMedicalSystemCode")}
              value={data.docId}
            />
            <DataPair
              title={getContent("doctorFirstName")}
              value={data.docFName}
            />
            <DataPair
              title={getContent("doctorLastName")}
              value={data.docLName}
            />
            <DataPair title={getContent("userId")} value={data.userId} />
            <DataPair title={getContent("phaId")} value={data.phaId} />
            <DataPair title={getContent("month")} value={data.month} />
            <DataPair title={getContent("year")} value={data.year} />
            <DataPair
              title={getContent("prescriptionDate")}
              value={data.prescDate}
            />
            <DataPair
              title={getContent("patientAmount")}
              value={data.patientAmount}
            />
            <DataPair
              title={getContent("custServiceType")}
              value={data.custServiceType}
            />
            <DataPair
              title={getContent("doctorSpeciality")}
              value={data.docspec}
            />
            <DataPair
              title={getContent("custServiceTypeDesc")}
              value={data.custServiceTypeDesc}
            />
          </List>
          <Table
            data={data.items}
            renderer={{
              drugCode: {
                name: getContent("drugCode"),
                filter: "Text",
                value: (node) => node.drugCode,
              },
              drugName: {
                name: getContent("drugName"),
                filter: "Text",
                value: (node) => node.drugName,
              },
              drugCount: {
                name: getContent("drugCount"),
                value: (node) => node.drugCount,
                filter: "Number",
              },
              itemPrice: {
                name: getContent("itemPrice"),
                value: (node) => node.itemPrice,
                component: (node) => currencize(node.itemPrice),
                filter: "Number",
              },
              franshiz: {
                name: getContent("franshiz"),
                value: (node) => node.franshiz,
                component: (node) => node.franshiz,
                filter: "Number",
              },
              phaItemPrice: {
                name: getContent("pharmacyItemPrice"),
                value: (node) => node.phaItemPrice,
                component: (node) => currencize(node.phaItemPrice),
                filter: "Number",
              },
              timesaday: {
                name: getContent("timesADay"),
                value: (node) => node.timesaday,
                filter: "Text",
              },
              dose: {
                name: getContent("dose"),
                value: (node) => node.dose,
                filter: "Text",
              },
              is_Note_Patient: {
                name: getContent("isNotePatient"),
                value: (node) => node.is_Note_Patient,
                filter: "Number",
              },
              subsidyprice: {
                name: getContent("subsidyPrice"),
                filter: "Number",
                value: (node) => node.subsidyprice,
                component: (node) => currencize(node.subsidyprice),
              },
              patient_Price: {
                name: getContent("patientPrice"),
                value: (node) => node.patient_Price,
                component: (node) => currencize(node.patient_Price),
                filter: "Number",
              },
              support_Specialpatient: {
                name: getContent("supportSpecialPatient"),
                value: (node) => node.support_Specialpatient,
                component: (node) => currencize(node.support_Specialpatient),
                filter: "Number",
              },
              sumPrice: {
                name: getContent("total"),
                value: (node) => node.sumPrice,
                component: (node) => currencize(node.sumPrice),
                filter: "Number",
              },
              sumIsNotePatient: {
                name: getContent("sumIsNotePatient"),
                value: (node) => node.sumIsNotePatient,
                filter: "Number",
                component: (node) => currencize(node.sumIsNotePatient),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default FilledPrescriptionPage;
