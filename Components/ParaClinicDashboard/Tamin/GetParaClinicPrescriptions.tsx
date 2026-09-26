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
import CogIcon from "@/Components/Icons/CogIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { TaminResponse } from "@/Components/PharmacyPanel/Tamin/GetPhamacyPrescription";
import Act from "@/Components/UI/Act";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
import ToggleInput from "@/Components/UI/ToggleInput";
import { useState } from "react";

const NS: ContentNamespace[] = ["common", "paraClinicPanelTamin"];

type ParaPresc = {
  eprsC_ID: number;
  partypecode: string;
  partypedesc: string;
  nationalcode: string;
  doC_MDID: string;
  doC_NAME: string;
  doC_SPEC: string;
  prescdate: string;
  comments: null;
  refeR_REASON: null;
  details: {
    paR_TAREF_CODE: string;
    paR_TAREF_NAME: string;
    paR_TAREF_PRICE: number;
    paR_TAREF_2K_PRICE: number;
    paR_TYPE_CODE: string;
    paR_TYPE_NAME: string;
    requesT_QTY: number;
    remaininG_QTY: number;
    subsidyPrice: number;
    max_QTY: number;
    isError: boolean;
    isWarning: boolean;
    errors: [];
    warnings: [];
  }[];
};

const t = {
  registeR_ID: 232018953,
  eprsC_ID: 140033889,
  doC_MDID: "2000200092",
  doC_FULL_NAME: "تستي-تامين اجتماعي",
  doC_SPEC_CODE: "00118",
  doC_SPEC_DESC:
    "فوق تخصص بيماري هاي خون و سرطان کودکان (هماتولوژي انکولوژي کودکان)",
  paR_CODE: "0000007303",
  patienT_AMOUNT: 897421,
  paR_NAME: "",
  paR_USER: "par",
  partypecode: "04",
  partypedesc: "سونوگرافي",
  prescdate: "14050430",
  regdate: "14050505",
  requesT_PRICE: 2991405,
  iS_PRICE: 2093984,
  tecH_PRICE: 0,
  month: "05",
  montH_DESC: null,
  servicE_TYPE_CODE: "4020",
  servicE_TYPE_DESC: "وب_عادی",
  year: "1405",
  tecH_MDID: "",
  subsidyprice: 0,
  supportamount: null,
  familydocprice: null,
  details: [
    {
      tareF_CODE: "024558-900",
      tareF_NAME: "سونوگرافي شکم",
      qty: 1,
      iteM_PRICE: 2991405,
      requesT_PRICE: 2991405,
      iteM_IS_PRICE: 2093984,
      supporT_AMOUNT: 0,
      patienT_AMOUNT: 897421,
      iS2K: "0",
      tecH_PRICE: 0,
      subsidyprice: 0,
      familydocprice: 0,
    },
  ],
};

type ParraPrescSubResult = {
  registeR_ID: number;
  eprsC_ID: number;
  doC_MDID: string;
  doC_FULL_NAME: string;
  doC_SPEC_CODE: string;
  doC_SPEC_DESC: string;
  paR_CODE: string;
  patienT_AMOUNT: number;
  paR_NAME: string;
  paR_USER: string;
  partypecode: string;
  partypedesc: string;
  prescdate: string;
  regdate: string;
  requesT_PRICE: number;
  iS_PRICE: number;
  tecH_PRICE: number;
  month: string;
  montH_DESC: null;
  servicE_TYPE_CODE: string;
  servicE_TYPE_DESC: string;
  year: string;
  tecH_MDID: string;
  subsidyprice: number;
  supportamount: null;
  familydocprice: null;
  details: {
    tareF_CODE: string;
    tareF_NAME: string;
    qty: number;
    iteM_PRICE: number;
    requesT_PRICE: number;
    iteM_IS_PRICE: number;
    supporT_AMOUNT: number;
    patienT_AMOUNT: number;
    iS2K: string;
    tecH_PRICE: number;
    subsidyprice: number;
    familydocprice: number;
  }[];
};

type ParaPrescInput = {
  paR_TAREF_CODE: string;
  tareF_PRICE: number;
  requesT_QTY: number;
  iS2K: false;
}[];

const ParaClinicPrescSubResult = ({
  data,
  clear,
}: {
  data: ParraPrescSubResult;
  clear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <WithTitle
      title={getContent("prescriptionSubmission")}
      actions={[{ title: getContent("back"), action: () => clear() }]}
    >
      <List>
        <InfoPair
          title={getContent("registerId")}
          value={data.registeR_ID.toString()}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("prescriptionId")}
          value={data.eprsC_ID.toString()}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("doctorMedicalSystemCode")}
          value={data.doC_MDID}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("doctorName")}
          icon={<CogIcon />}
          value={data.doC_FULL_NAME}
        />
        <InfoPair
          title={getContent("doctorSpeciality")}
          value={data.doC_SPEC_DESC}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("paraClinicCode")}
          value={data.paR_CODE}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientPrice")}
          value={currencize(data.patienT_AMOUNT)}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("paraClinicType")}
          value={data.partypedesc}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("prescriptionDate")}
          value={data.prescdate}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("registerDate")}
          value={data.regdate}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("requestPrice")}
          value={currencize(data.requesT_PRICE)}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("isPrice")}
          value={currencize(data.iS_PRICE)}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("techPrice")}
          value={currencize(data.tecH_PRICE)}
          icon={<CogIcon />}
        />
      </List>
      <Table
        data={data.details}
        renderer={{
          tareF_CODE: {
            name: getContent("tarefCode"),
            value: (node) => node.tareF_CODE,
            filter: "Text",
          },
          tareF_NAME: {
            name: getContent("tarefName"),
            value: (node) => node.tareF_NAME,
            filter: "Text",
          },
          qty: {
            name: getContent("quantity"),
            value: (node) => node.qty,
            filter: "Number",
          },
          iteM_PRICE: {
            name: getContent("itemPrice"),
            value: (node) => node.iteM_PRICE,
            component: (node) => currencize(node.iteM_PRICE),
            filter: "Number",
          },
          requesT_PRICE: {
            name: getContent("requestPrice"),
            value: (node) => node.requesT_PRICE,
            component: (node) => currencize(node.requesT_PRICE),
            filter: "Number",
          },
          iteM_IS_PRICE: {
            name: getContent("isPrice"),
            value: (node) => node.iteM_IS_PRICE,
            component: (node) => currencize(node.iteM_IS_PRICE),
            filter: "Number",
          },
          supporT_AMOUNT: {
            name: getContent("supportAmount"),
            value: (node) => node.supporT_AMOUNT,
            component: (node) => currencize(node.supporT_AMOUNT),
            filter: "Number",
          },
          patienT_AMOUNT: {
            name: getContent("patientAmount"),
            value: (node) => node.patienT_AMOUNT,
            filter: "Number",
            component: (node) => currencize(node.patienT_AMOUNT),
          },
          tecH_PRICE: {
            name: getContent("techPrice"),
            value: (node) => node.tecH_PRICE,
            filter: "Number",
            component: (node) => currencize(node.tecH_PRICE),
          },
          subsidyprice: {
            name: getContent("subsidyPrice"),
            value: (node) => node.subsidyprice,
            component: (node) => currencize(node.subsidyprice),
            filter: "Number",
          },
          familydocprice: {
            name: getContent("familyDocPrice"),
            value: (node) => node.familydocprice,
            filter: "Number",
          },
        }}
      />
    </WithTitle>
  );
};

const SinglePresc = ({
  node,
  clear,
  physio,
}: {
  node: ParaPresc;
  clear: () => unknown;
  physio?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  const [input, setInput] = useState<ParaPrescInput>([]);

  const [isSubmitting, setIsSubmitting] = useState<ParaPrescInput | null>(null);
  const [isPreChecking, setIsPreChecking] = useState<ParaPrescInput | null>(
    null,
  );

  const [result, setResult] = useState<ParraPrescSubResult | null>(null);

  const pushNotification = useNotification();

  if (result)
    return (
      <ParaClinicPrescSubResult data={result} clear={() => setResult(null)} />
    );

  return (
    <WithTitle
      title={getContent("prescription")}
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
      ]}
    >
      <Table
        data={node.details}
        renderer={{
          paR_TAREF_NAME: {
            name: getContent("parTarefName"),
            value: (node) => node.paR_TAREF_NAME,
            filter: "Text",
          },
          paR_TAREF_PRICE: {
            name: getContent("parTarefPrice"),
            value: (node) => node.paR_TAREF_PRICE,
            filter: "Number",
            component: (node) =>
              node.paR_TAREF_PRICE ? currencize(node.paR_TAREF_PRICE) : "-",
          },
          paR_TAREF_2K_PRICE: {
            name: getContent("parTarefPrice2k"),
            value: (node) => node.paR_TAREF_2K_PRICE,
            component: (node) =>
              node.paR_TAREF_2K_PRICE
                ? currencize(node.paR_TAREF_2K_PRICE)
                : "-",
            filter: "Number",
          },
          paR_TYPE_NAME: {
            name: getContent("taminParType"),
            value: (node) => node.paR_TYPE_NAME,
            filter: "Text",
          },
          requesT_QTY: {
            name: getContent("requestedQuantity"),
            value: (node) => node.requesT_QTY,
            filter: "Number",
          },
          remaininG_QTY: {
            name: getContent("remainingQuantity"),
            value: (node) => node.remaininG_QTY,
            filter: "Number",
          },
          subsidyPrice: {
            name: getContent("subsidyPrice"),
            value: (node) => node.subsidyPrice,
            component: (node) =>
              node.subsidyPrice ? currencize(node.subsidyPrice) : "0",
            filter: "Number",
          },
          max_QTY: {
            name: getContent("maximumQuantity"),
            value: (node) => node.max_QTY,
            filter: "Number",
          },
          selection: {
            name: getContent("selection"),
            value: (node) =>
              booleanToValue[
                `${input.some((el) => el.paR_TAREF_CODE === node.paR_TAREF_CODE)}`
              ],
            component: (node) => (
              <ToggleInput
                value={input.some(
                  (el) => el.paR_TAREF_CODE === node.paR_TAREF_CODE,
                )}
                onChange={() =>
                  setInput((prev) => {
                    const clone = [...prev];
                    const index = clone.findIndex(
                      (el) => el.paR_TAREF_CODE === node.paR_TAREF_CODE,
                    );
                    if (index < 0) {
                      clone.push({
                        paR_TAREF_CODE: node.paR_TAREF_CODE,
                        iS2K: false,
                        requesT_QTY: 0,
                        tareF_PRICE: 0,
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
          tarefPrice: {
            name: getContent("tarefPrice"),
            value: (node) => {
              const n = input.find(
                (el) => el.paR_TAREF_CODE === node.paR_TAREF_CODE,
              );
              if (n) return n.tareF_PRICE;
              return 0;
            },
            filter: "Number",
            onEdit: (e) => {
              const val = Number(e.newValue);
              if (isNaN(val)) return false;
              setInput((prev) => {
                const clone = [...prev];
                const index = input.findIndex(
                  (el) => el.paR_TAREF_CODE === e.data.paR_TAREF_CODE,
                );
                if (index < 0) {
                  clone.push({
                    paR_TAREF_CODE: e.data.paR_TAREF_CODE,
                    iS2K: false,
                    requesT_QTY: 0,
                    tareF_PRICE: val,
                  });
                } else {
                  clone[index].tareF_PRICE = val;
                }
                return clone;
              });
              return true;
            },
          },
          requestQty: {
            name: getContent("quantity"),
            value: (node) => {
              const n = input.find(
                (el) => el.paR_TAREF_CODE === node.paR_TAREF_CODE,
              );
              if (n) return n.requesT_QTY;
              return 0;
            },
            onEdit: (e) => {
              const val = Number(e.newValue);
              if (isNaN(val)) return false;
              setInput((prev) => {
                const clone = [...prev];
                const index = clone.findIndex(
                  (el) => el.paR_TAREF_CODE === e.data.paR_TAREF_CODE,
                );
                if (index < 0) {
                  clone.push({
                    iS2K: false,
                    paR_TAREF_CODE: e.data.paR_TAREF_CODE,
                    requesT_QTY: val,
                    tareF_PRICE: 0,
                  });
                } else {
                  clone[index].requesT_QTY = val;
                }
                return clone;
              });
              return true;
            },
          },
        }}
      />
      <Act<TaminResponse<unknown>>
        path={isPreChecking ? `${API}/paraClinic/tamin` : null}
        method="PATCH"
        onDone={(status, result) => {
          setIsPreChecking(null);
          if (!status) return;
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
          console.log(result);
        }}
        successMessage={getContent("precheckSuccessMessage")}
        // payload={{
        //   eprsC_ID: node.eprsC_ID,
        //   partypecode: node.partypecode,
        //   details: isPreChecking,
        // }}
        payload={{
          noteHeadID: node.eprsC_ID,
        }}
      />
      <Act<TaminResponse<{ data: ParraPrescSubResult }>>
        path={
          isSubmitting
            ? `${API}/paraClinic/tamin${physio ? `?physio=true` : ""}`
            : null
        }
        method="PUT"
        onDone={(status, result) => {
          setIsSubmitting(null);
          if (!status) return;
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
          setResult(result?.data?.data?.data || null);
          console.log(result);
        }}
        payload={{
          eprsC_ID: node.eprsC_ID,
          partypecode: node.partypecode,
          details: isSubmitting,
        }}
      />
    </WithTitle>
  );
};

const PrescsList = ({
  data,
  clear,
  physio,
}: {
  data: ParaPresc[];
  clear: () => unknown;
  physio?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  const [presc, setPresc] = useState<ParaPresc | null>(null);

  if (presc)
    return (
      <SinglePresc node={presc} clear={() => setPresc(null)} physio={physio} />
    );

  return (
    <WithTitle
      title={getContent("prescriptions")}
      actions={[{ title: getContent("back"), action: () => clear() }]}
    >
      <Table
        data={data}
        renderer={{
          eprsC_ID: {
            name: getContent("prescriptionId"),
            value: (node) => node.eprsC_ID,
            filter: "Text",
          },
          partypedesc: {
            name: getContent("prescriptionParaClinicType"),
            value: (node) => node.partypedesc,
            filter: "Multi",
          },
          nationalcode: {
            name: getContent("patientNationalCode"),
            value: (node) => node.nationalcode,
            filter: "Text",
          },
          doC_MDID: {
            name: getContent("doctorMedicalSystemCode"),
            value: (node) => node.doC_MDID,
            filter: "Text",
          },
          doC_NAME: {
            name: getContent("doctorName"),
            value: (node) => node.doC_NAME,
            filter: "Text",
          },
          prescdate: {
            name: getContent("prescriptionDate"),
            value: (node) => node.prescdate,
            filter: "Text",
          },
          itemCount: {
            name: getContent("itemsCount"),
            value: (node) => node.details.length,
            filter: "Number",
          },
          actions: {
            name: getContent("actions"),
            component: (node) => (
              <TableActions>
                <IconButton onClick={() => setPresc(node)}>
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

const GetParaClinicPrescriptions = ({ physio }: { physio?: boolean }) => {
  const getContent = useScopedLocale(NS);

  const pushNotification = useNotification();

  const [prescs, setPrescs] = useState<ParaPresc[] | null>(null);

  if (prescs)
    return (
      <PrescsList data={prescs} clear={() => setPrescs(null)} physio={physio} />
    );

  return (
    <CreateForm<
      { patientNationalCode?: string; trackingCode?: string },
      TaminResponse<{ list: ParaPresc[] }>
    >
      renderer={{
        patientNationalCode: {
          type: "number",
          title: getContent("patientNationalCode"),
        },
        trackingCode: { type: "number", title: getContent("trackingCode") },
      }}
      hookProps={{
        path: `${API}/paraClinic/tamin`,
        method: "POST",
        successCb: (result) => {
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

export default GetParaClinicPrescriptions;
