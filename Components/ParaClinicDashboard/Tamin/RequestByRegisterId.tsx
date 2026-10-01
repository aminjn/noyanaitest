import classes from "./RequestByRegisterId.module.css";
import { ITaminIcid } from "@/Components/Admin/Tamin/Icid/AdminManageTaminIcidsPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import FormActions from "@/Components/Admin/UI/FormActions";
import List from "@/Components/Admin/UI/List";
import Table from "@/Components/Admin/UI/Table";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import { API } from "@/Components/config";
import InfoPair from "@/Components/Dr/InfoPair";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import CogIcon from "@/Components/Icons/CogIcon";
import { TaminResponse } from "@/Components/PharmacyPanel/Tamin/GetPhamacyPrescription";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import PopupCard from "@/Components/UI/PopupCard";
import { useCallback, useState } from "react";

const NS: ContentNamespace[] = ["common", "paraClinicPanelTamin"];

type RequestedPresc = {
  patienT_NATCODE: string;
  patienT_MOBILE: string;
  patienT_NAME: string;
  patienT_LNAME: string;
  patienT_BIRTHDATE: string;
  patienT_GENDER: string;
  doC_FNAME: string;
  doC_LNAME: string;
  medicaL_OFFICE_NAME: string;
  montH_DESC: string;
  patienT_INSURANCETYPE: string;
  patienT_INSURANCENO: string;
  patienT_INSURANCEDATE: string;
  regStatus_Desc: string;
  registeR_ID: number;
  eprsC_ID: number;
  doC_MDID: string;
  doC_FULL_NAME: null;
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
  servicE_TYPE_CODE: string;
  servicE_TYPE_DESC: string;
  year: string;
  tecH_MDID: null;
  subsidyprice: number;
  supportamount: number;
  familydocprice: number;
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

const RegisterDiagnosisPopup = ({ node }: { node: RequestedPresc }) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  return (
    <PopupCard>
      <CreateForm<
        { COMMENT: string; DIAGNOSISCODE: [] },
        TaminResponse<unknown>
      >
        renderer={{
          COMMENT: { type: "text", title: getContent("comment") },
          DIAGNOSISCODE: {
            type: "nodes",
            getOptionLabel: (node) => (node as ITaminIcid).icdName,
            getOptionValue: (node) => (node as ITaminIcid).icdCode,
            path: `${API}/paraClinic/icid`,
            multi: true,
            title: getContent("diagnosis"),
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/paraClinic/taminn`,
          method: "PATCH",
          successCb: (result) => {
            if (result?.data?.data?.problems?.length)
              pushNotification(
                result.data.data.problems
                  .map((p) => p.complemantary_Msg)
                  .join("،"),
              );
          },
          parser: "JSON",
          decorators: { REGISTER_ID: node.registeR_ID },
        }}
      />
    </PopupCard>
  );
};

type RegisterSessionInput = {
  paR_TAREF_CODE: string;
  tareF_PRICE: number;
  requesT_QTY: number;
  iS2K: false;
}[];

const RegisterSessionPopup = ({ data }: { data: RequestedPresc }) => {
  const [isSubmitting, setIsSubmitting] = useState<RegisterSessionInput | null>(
    null,
  );

  const [input, setInput] = useState<RegisterSessionInput>([]);

  const getContent = useScopedLocale(NS);

  const { setPopup, closePopup } = usePopup();

  const pushNotification = useNotification();

  const onSubmit = useCallback(() => {
    if (!!isSubmitting) return;
    if (!input.some((el) => el.requesT_QTY))
      return pushNotification(getContent("checkInput"));
    setIsSubmitting([...input]);
  }, [getContent, input, isSubmitting, pushNotification]);

  return (
    <PopupCard>
      <div className={classes.main}>
        <div className={classes.list}>
          {data.details.map((detail) => (
            <div className={classes.item} key={detail.tareF_CODE}>
              <div className={classes.name}>{detail.tareF_NAME}</div>
              <Input
                title={getContent("price")}
                price
                onChange={(e) =>
                  setInput((prev) => {
                    const clone = [...prev];
                    const index = clone.findIndex(
                      (el) => el.paR_TAREF_CODE === detail.tareF_CODE,
                    );
                    if (index < 0) {
                      clone.push({
                        paR_TAREF_CODE: detail.tareF_CODE,
                        iS2K: false,
                        tareF_PRICE: Number(e.target.value),
                        requesT_QTY: 0,
                      });
                    } else {
                      clone[index].tareF_PRICE = Number(e.target.value);
                    }
                    return clone;
                  })
                }
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                title={getContent("quantity")}
                onChange={(e) =>
                  setInput((prev) => {
                    const clone = [...prev];
                    const index = clone.findIndex(
                      (el) => el.paR_TAREF_CODE === detail.tareF_CODE,
                    );
                    if (index < 0) {
                      clone.push({
                        paR_TAREF_CODE: detail.tareF_CODE,
                        iS2K: false,
                        tareF_PRICE: 0,
                        requesT_QTY: Number(e.target.value),
                      });
                    } else {
                      clone[index].requesT_QTY = Number(e.target.value);
                    }
                    return clone;
                  })
                }
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          ))}
        </div>
        <FormActions>
          <Button isLoading={!!isSubmitting} onClick={onSubmit}>
            {getContent("submit")}
          </Button>
          <Button onClick={() => closePopup()}>{getContent("cancel")}</Button>
        </FormActions>
        <Act<TaminResponse<unknown>>
          path={isSubmitting ? `${API}/paraClinic/tamin/session` : null}
          method="POST"
          payload={{
            userInformation: {
              parID: "0000007303",
            },
            registeR_ID: data.registeR_ID,
            patienT_MOBILE: "0",
            details: isSubmitting,
          }}
          onDone={(status, result) => {
            setIsSubmitting(null);
            if (result?.data?.data?.problems?.length) {
              pushNotification(
                result.data.data.problems
                  .map((p) => p.complemantary_Msg)
                  .join("،"),
              );
            } else {
              pushNotification(getContent("sessionSubmitted"));
              closePopup();
            }
          }}
        />
      </div>
    </PopupCard>
  );
};

const Result = ({
  data,
  clear,
}: {
  data: RequestedPresc;
  clear: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const pushNotification = useNotification();

  const { setPopup } = usePopup();


  return (
    <WithTitle
      title={getContent("prescription")}
      actions={[
        { title: getContent("back"), action: () => clear() },
        { title: getContent("delete"), action: () => setIsDeleting(true) },
        {
          title: getContent("registerDiagnosis"),
          action: () =>
            setPopup("Register", <RegisterDiagnosisPopup node={data} />),
        },
        ...(data.partypecode === "13"
          ? [
              {
                title: getContent("registerSession"),
                action: () =>
                  setPopup(
                    "registerSession",
                    <RegisterSessionPopup data={data} />,
                  ),
              },
            ]
          : []),
      ]}
    >
      <List>
        <InfoPair
          title={getContent("patientNationalCode")}
          value={data.patienT_NATCODE}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientMobile")}
          value={data.patienT_MOBILE}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientFirstName")}
          value={data.patienT_NAME}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientLastName")}
          value={data.patienT_LNAME}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientBirthDate")}
          value={data.patienT_BIRTHDATE}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientGender")}
          icon={<CogIcon />}
          value={data.patienT_GENDER}
        />
        <InfoPair
          title={getContent("medicalOfficeName")}
          value={data.medicaL_OFFICE_NAME}
          icon={<CogIcon />}
        />
        <InfoPair
          title={getContent("patientInsuranceType")}
          icon={<CogIcon />}
          value={data.patienT_INSURANCETYPE}
        />
        <InfoPair
          title={getContent("patinetInsuranceNo")}
          icon={<CogIcon />}
          value={data.patienT_INSURANCENO}
        />
        <InfoPair
          title={getContent("patientInsuranceDate")}
          value={data.patienT_INSURANCEDATE}
          icon={<CogIcon />}
        />
        <InfoPair title={getContent("regStatus")} value={data.regStatus_Desc} />

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
          value={`${data.doC_FNAME} ${data.doC_LNAME}`}
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
        <InfoPair title={getContent("paraClinicName")} value={data.paR_NAME} />
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
      <Act<TaminResponse<unknown>>
        path={isDeleting ? `${API}/paraClinic/taminn` : null}
        method="PUT"
        onDone={(status, result) => {
          setIsDeleting(false);
          if (!status) return;
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
          clear();
        }}
        successMessage={getContent("prescriptionDeleted")}
        payload={{ registeR_ID: data.registeR_ID }}
      />
    </WithTitle>
  );
};

const RequestByRegisterId = () => {
  const getContent = useScopedLocale(NS);

  const [presc, setPresc] = useState<RequestedPresc | null>(null);

  const pushNotification = useNotification();

  if (presc) return <Result data={presc} clear={() => setPresc(null)} />;
  return (
    <WithTitle title={getContent("getPrescription")}>
      <CreateForm<
        { requestID: string },
        TaminResponse<{ data: RequestedPresc }>
      >
        renderer={{
          requestID: { type: "text", title: getContent("registerId") },
        }}
        hookProps={{
          path: `${API}/paraClinic/taminn`,
          method: "POST",
          successCb: (result) => {
            if (result?.data?.data?.problems?.length)
              pushNotification(
                result.data.data.problems
                  .map((p) => p.complemantary_Msg)
                  .join("،"),
              );
            setPresc(result?.data?.data?.data || null);
          },
        }}
      />
    </WithTitle>
  );
};

export default RequestByRegisterId;
