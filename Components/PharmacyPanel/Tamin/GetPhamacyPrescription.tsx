import classes from "./GetPhamacyPrescription.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import IconButton from "@/Components/Admin/UI/IconButton";
import List from "@/Components/Admin/UI/List";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import { API } from "@/Components/config";
import InfoPair from "@/Components/Dr/InfoPair";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import CogIcon from "@/Components/Icons/CogIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import Act from "@/Components/UI/Act";
import Input from "@/Components/UI/Input";
import PopupCard from "@/Components/UI/PopupCard";
import ToggleInput from "@/Components/UI/ToggleInput";
import { Fragment, useState } from "react";

const NS: ContentNamespace[] = ["common", "pharmacyPanelTamin"];

type Presc = {
  headeprscid: number;
  prescdate: string;
  docid: string;
  docspec: string;
  doctorFullName: string;
  patientfirstname: string;
  patientlastname: string;
  custname: null;
  comments: null;
  refeR_REASON: null;
  electronicflag: string;
  clinicdoc: string;
  presctime: string;
  speccode: string;
  finalDetailsPresc: {
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
  }[];
};

type GetActivePrescResponse = {
  list: Presc[];
};

export type TaminResponse<T> = {
  data: {
    status: number;
    family: string;
    reason: string;
    data: T & {
      problems: {
        error_Code: number;
        complemantary_Msg: string;
        error_Msg: string;
        tarefCode: string;
      }[];
      warnings: [];
      hasError: false;
      status: 200;
      family: "SUCCESSFUL";
      reason: "OK";
      total: 1;
      message?: string;
    };
  };
};

type PrescInput = {
  electronicPrescDetail: number;
  drugCode: string;
  phaDrugPrice: number;
  requestedCount: number;
  barcodesList: null;
  drugIrc: [];
}[];

export type SubmissionResult = {
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
  patientAmount: string;
  custServiceType: string;
  docspec: string;
  custServiceTypeDesc: null;
  finalDetailRegisterPrescs: {
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
  }[];
};

export const SubResult = ({
  data,
  clear,
}: {
  data: SubmissionResult;
  clear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const pushNotification = useNotification();

  return (
    <WithTitle
      title={`${getContent("prescriptionSubmitted")} (${data.requestId})`}
      actions={[
        { title: getContent("back"), action: () => clear() },
        { title: getContent("remove"), action: () => setIsRemoving(true) },
      ]}
    >
      <List>
        <InfoPair
          icon={<CogIcon />}
          value={data.requestId.toString()}
          title={getContent("requestId")}
        />
        <InfoPair
          icon={<CogIcon />}
          title={getContent("requestPrice")}
          value={currencize(data.requestPrice)}
        />
        <InfoPair
          icon={<CogIcon />}
          title={getContent("pharmacyRequestPrice")}
          value={currencize(data.phaRequestPrice)}
        />
        <InfoPair
          icon={<CogIcon />}
          title={getContent("isNotePatient")}
          value={currencize(data.isNotePatient)}
        />
        <InfoPair
          icon={<CogIcon />}
          title={getContent("patientPrice")}
          value={currencize(data.patientAmount)}
        />
      </List>
      <Table
        data={data.finalDetailRegisterPrescs}
        renderer={{
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
          drugCount: {
            name: getContent("drugCount"),
            value: (node) => node.drugCount,
            filter: "Number",
          },
          itemPrice: {
            name: getContent("itemPrice"),
            value: (node) => node.itemPrice,
            filter: "Text",
          },
          franshiz: {
            name: getContent("franchiz"),
            value: (node) => node.franshiz,
            filter: "Number",
          },
          phaItemPrice: {
            name: getContent("pharmacyItemPrice"),
            value: (node) => node.phaItemPrice,
            filter: "Number",
          },
          timesaday: {
            name: getContent("timesADay"),
            filter: "Text",
            value: (node) => node.timesaday,
          },
          dose: {
            name: getContent("dose"),
            filter: "Text",
            value: (node) => node.dose,
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
          },
          patient_Price: {
            name: "patientPrice",
            filter: "Number",
            value: (node) => node.patient_Price,
          },
          support_Specialpatient: {
            name: getContent("supportSpecialPatient"),
            value: (node) => node.support_Specialpatient,
            filter: "Number",
          },
          sumPrice: {
            name: getContent("sumPrice"),
            value: (node) => node.sumPrice,
            filter: "Number",
          },
          sumIsNotePatient: {
            name: getContent("sumIsNotePatient"),
            filter: "Number",
            value: (node) => node.sumIsNotePatient,
          },
        }}
      />
      <Act<TaminResponse<unknown>>
        path={isRemoving ? `${API}/pharmacy/taminn` : null}
        payload={{ requestId: data.requestId }}
        method="PUT"
        onDone={(status, result) => {
          setIsRemoving(false);
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
          clear();
        }}
      />
    </WithTitle>
  );
};

const ReferrerPopup = ({ node }: { node: Presc }) => {
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  const pushNotification = useNotification();

  return (
    <PopupCard>
      <CreateForm<{ reason: string }, TaminResponse<unknown>>
        renderer={{ reason: { type: "text", title: getContent("reason") } }}
        hookProps={{
          method: "PATCH",
          path: `${API}/pharmacy/taminn`,
          successCb: (result) => {
            if (result?.data?.data?.problems?.length)
              pushNotification(
                result.data.data.problems
                  .map((p) => p.complemantary_Msg)
                  .join("،"),
              );
            closePopup();
          },
          decorators: { electronicPrescHead: node.headeprscid },
        }}
      />
    </PopupCard>
  );
};

const SinglePresc = ({
  node,
  clear,
}: {
  node: Presc;
  clear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const [input, setInput] = useState<PrescInput>([]);

  const [isSubmitting, setIsSubmitting] = useState<PrescInput | null>(null);
  const [isPreChecking, setIsPreChecking] = useState<PrescInput | null>(null);

  const pushNotification = useNotification();

  const { setPopup } = usePopup();

  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  if (submissionResult)
    return (
      <SubResult
        data={submissionResult}
        clear={() => setSubmissionResult(null)}
      />
    );

  return (
    <Fragment>
      <WithTitle
        title={getContent("prescriptionItems")}
        actions={[
          { title: getContent("back"), action: () => clear() },
          {
            title: getContent("precheckPresc"),
            action: () => setIsPreChecking(input),
          },
          {
            title: getContent("submitPresc"),
            action: () => setIsSubmitting(input),
          },
          {
            title: getContent("referrPrescription"),
            action: () => setPopup("Referr", <ReferrerPopup node={node} />),
          },
        ]}
      >
        <Table
          data={node.finalDetailsPresc}
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
            drugForm: {
              name: getContent("drugForm"),
              value: (node) => node.drugForm,
              filter: "Text",
            },
            prescribedCount: {
              name: getContent("prescribedCount"),
              value: (node) => node.prescribedCount,
              filter: "Number",
            },
            remainingCount: {
              name: getContent("remainingDrugCount"),
              value: (node) => node.remainingCount,
              filter: "Number",
            },
            drugInstruction: {
              name: getContent("drugInstruction"),
              value: (node) => node.drugInstruction,
              filter: "Text",
            },
            selected: {
              name: getContent("selection"),
              value: (node) =>
                getContent(input.some((el) => el.electronicPrescDetail === node.detailId) ? "yes" : "no"),
              component: (node) => (
                <ToggleInput
                  value={input.some(
                    (el) => el.electronicPrescDetail === node.detailId,
                  )}
                  onChange={() =>
                    setInput((prev) => {
                      const clone = [...prev];
                      const index = clone.findIndex(
                        (el) => el.electronicPrescDetail === node.detailId,
                      );
                      if (index < 0) {
                        clone.push({
                          barcodesList: null,
                          drugCode: node.drugCode,
                          drugIrc: [],
                          electronicPrescDetail: node.detailId,
                          phaDrugPrice: 0,
                          requestedCount: 0,
                        });
                      } else {
                        clone.splice(index, 1);
                      }
                      return clone;
                    })
                  }
                />
              ),
              filter: "Set",
            },
            requestedCount: {
              name: getContent("requestedQuantity"),
              value: (node) => {
                const n = input.find(
                  (el) => el.electronicPrescDetail === node.detailId,
                );
                if (n) return n.requestedCount;
                return 0;
              },
              filter: "Number",
              onEdit: (e) => {
                const val = Number(e.newValue);
                if (isNaN(val)) return false;
                setInput((prev) => {
                  const clone = [...prev];
                  const index = clone.findIndex(
                    (el) => el.electronicPrescDetail === e.data.detailId,
                  );
                  if (index < 0) {
                    clone.push({
                      barcodesList: null,
                      drugCode: e.data.drugCode,
                      drugIrc: [],
                      electronicPrescDetail: e.data.detailId,
                      phaDrugPrice: 0,
                      requestedCount: val,
                    });
                  } else {
                    clone[index] = { ...clone[index], requestedCount: val };
                  }
                  return clone;
                });
                return false;
              },
            },
            price: {
              name: getContent("price"),
              value: (node) => {
                const n = input.find(
                  (el) => el.electronicPrescDetail === node.detailId,
                );
                if (n) return n.phaDrugPrice;
                return 0;
              },
              onEdit: (e) => {
                const val = Number(e.newValue);
                if (isNaN(val)) return false;
                setInput((prev) => {
                  const clone = [...prev];
                  const index = clone.findIndex(
                    (el) => el.electronicPrescDetail === e.data.detailId,
                  );
                  if (index < 0) {
                    clone.push({
                      barcodesList: null,
                      drugCode: e.data.drugCode,
                      drugIrc: [],
                      electronicPrescDetail: e.data.detailId,
                      phaDrugPrice: val,
                      requestedCount: 0,
                    });
                  } else {
                    clone[index] = { ...clone[index], phaDrugPrice: val };
                  }
                  return clone;
                });
                return false;
              },
            },
          }}
        />
      </WithTitle>
      <Act<TaminResponse<Record<never, never>>>
        path={isPreChecking ? `${API}/pharmacy/tamin` : null}
        method="PATCH"
        onDone={(status, result) => {
          setIsPreChecking(null);
          if (!status) return;
          if (result?.data?.data?.problems)
            pushNotification(
              result.data.data.problems
                .map((el) => el.complemantary_Msg)
                .join(","),
            );
        }}
        payload={{
          electronicPrescHead: node.headeprscid,
          drugsList: isPreChecking,
        }}
      />
      <Act<TaminResponse<{ data: SubmissionResult }>>
        path={isSubmitting ? `${API}/pharmacy/tamin` : null}
        method="PUT"
        onDone={(status, result) => {
          setIsSubmitting(null);
          if (!status) return;
          if (result?.data?.data?.data)
            setSubmissionResult(result.data.data.data);
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
        }}
        payload={{
          electronicPrescHead: node.headeprscid,
          drugsList: isSubmitting,
        }}
      />
    </Fragment>
  );
};

const PrescList = ({
  data,
  clear,
}: {
  data: Presc[];
  clear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const [selected, setSelected] = useState<Presc | null>(null);

  if (selected)
    return <SinglePresc node={selected} clear={() => setSelected(null)} />;
  return (
    <WithTitle
      title={getContent("prescriptionsList")}
      actions={[{ title: getContent("back"), action: () => clear() }]}
    >
      <Table
        data={data}
        renderer={{
          headeprscid: {
            name: getContent("headPrescId"),
            value: (node) => node.headeprscid,
            filter: "Text",
          },
          prescdate: {
            name: getContent("prescDate"),
            value: (node) => node.prescdate,
            filter: "Text",
          },
          docid: {
            name: getContent("docId"),
            value: (node) => node.docid,
            filter: "Text",
          },
          docspec: {
            name: getContent("docSpec"),
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
          clinicdoc: {
            name: getContent("clinicDoc"),
            value: (node) => node.clinicdoc,
            filter: "Text",
          },
          presctime: {
            name: getContent("prescTime"),
            filter: "Text",
            value: (node) => node.presctime,
          },
          speccode: {
            name: getContent("specCode"),
            filter: "Text",
            value: (node) => node.speccode,
          },
          itemCount: {
            name: getContent("itemsCount"),
            value: (node) => node.finalDetailsPresc.length,
          },
          actions: {
            name: getContent("actions"),
            component: (node) => (
              <TableActions>
                <IconButton onClick={() => setSelected(node)}>
                  <EyeIcon />
                </IconButton>
              </TableActions>
            ),
          },
        }}
      />
    </WithTitle>
  );
};

const GetPharmacyPrescription = () => {
  const getContent = useScopedLocale(NS);

  const pushNotification = useNotification();

  const [prescs, setPrescs] = useState<Presc[] | null>(null);

  if (prescs) return <PrescList data={prescs} clear={() => setPrescs(null)} />;
  return (
    <CreateForm<
      { patientNationalCode?: string; trackingCode?: string },
      TaminResponse<GetActivePrescResponse>
    >
      renderer={{
        patientNationalCode: {
          type: "number",
          title: getContent("patientNationalCode"),
        },
        trackingCode: { type: "number", title: getContent("trackingCode") },
      }}
      hookProps={{
        path: `${API}/pharmacy/tamin`,
        method: "POST",
        successCb: (result) => {
          // if (!result?.data?.data?.list)
          //   return pushNotification(
          //     result?.data?.data?.message || getContent("unknownErrorOccured"),
          //   );
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
          setPrescs(result.data.data.list);
        },
      }}
    />
  );
};

export default GetPharmacyPrescription;
