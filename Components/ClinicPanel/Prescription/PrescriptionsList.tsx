import useSWR from "swr";
import classes from "./PrescriptionsList.module.css";
import { API } from "@/Components/config";
import { fetcher, FetchMethod } from "@/Components/helpers/fetcher";
import { Fragment, useCallback, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
import { ITaminSpec } from "@/Components/Admin/Tamin/Spec/AdminManageTaminSpecsPage";
import parseMonkeyDate from "@/Components/helpers/parseMonkeyDate";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { currencize } from "@/Components/helpers/currencize";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
import ToggleInput from "@/Components/UI/ToggleInput";
import Input from "@/Components/UI/Input";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";

// {
//     "eprsC_ID": 140028887,
//     "partypecode": "13",
//     "partypedesc": "فيزيوتراپي",
//     "nationalcode": "1234567891",
//     "doC_MDID": "2000200092",
//     "doC_NAME": "تستي تامين اجتماعي",
//     "doC_SPEC": "00118",
//     "prescdate": "14050131",
//     "comments": null,
//     "refeR_REASON": null,
//     "details": [
//         {
//             "paR_TAREF_CODE": "901645-403",
//             "paR_TAREF_NAME": "فيزيوتراپي زانوي  سمت چپ",
//             "paR_TAREF_PRICE": 1316000,
//             "paR_TAREF_2K_PRICE": 2164000,
//             "paR_TYPE_CODE": "13",
//             "paR_TYPE_NAME": "فيزيوتراپي",
//             "requesT_QTY": 20,
//             "remaininG_QTY": 20,
//             "subsidyPrice": 0,
//             "max_QTY": 20,
//             "isError": false,
//             "isWarning": false,
//             "errors": [],
//             "warnings": []
//         }
//     ]
// }

export type TaminParaPrescItem = {
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
  errors: never[];
  warnings: never[];
};

export type TaminParaPresc = {
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
  details: TaminParaPrescItem[];
};

const ClinicPrescriptionDetailsPopup = ({ node }: { node: TaminParaPresc }) => {
  const getContent = useLocale();

  const [details, setDetails] = useState<
    {
      parTarefCode: string;
      requestQty: number;
      selected: boolean;
      is2K: boolean;
    }[]
  >(
    node.details.map((detail) => ({
      selected: false,
      is2K: false,
      requestQty: 0,
      parTarefCode: detail.paR_TAREF_CODE,
    })),
  );

  const [input, setInput] = useState<
    Partial<{ techMDID: string; patientMobile: string; asnad: boolean }>
  >({});

  const pushNotification = useNotification();

  const { closePopup } = usePopup();

  const [isSubmitting, setIsSubmitting] = useState<Record<
    string,
    unknown
  > | null>(null);

  const onSubmit = useCallback(() => {
    if (!!isSubmitting) return;
    const selected = details
      .filter((el) => !!el.selected)
      .map((el) => ({
        is2K: el.is2K,
        requestQty: el.requestQty,
        parTarefCode: el.parTarefCode,
      }));
    if (selected.some((el) => !el.requestQty))
      return pushNotification(getContent("checkInput"), "Warn");
    if (!selected.length)
      return pushNotification(getContent("checkInput"), "Warn");
    setIsSubmitting({
      taminPrescripptionId: node.eprsC_ID,
      parTypeCode: node.partypecode,
      ...input,
      details: selected,
    });
  }, [isSubmitting, details, node, pushNotification, input, getContent]);

  return (
    <PopupCard>
      <div className={classes.details}>
        <Form className={classes.meta} onSubmit={onSubmit}>
          <Input
            title={getContent("techMDID")}
            pattern="[0-9]*"
            inputMode="numeric"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, techMDID: e.target.value }))
            }
          />
          <Input
            title={getContent("patientMobile")}
            pattern="[0-9]*"
            inputMode="numeric"
            onChange={(e) =>
              setInput((prev) => ({ ...prev, patientMobile: e.target.value }))
            }
          />
          <ToggleInput
            title="asnad"
            value={input.asnad}
            onChange={() =>
              setInput((prev) => ({ ...prev, asnad: !prev.asnad }))
            }
          />
          <FormActions>
            <Button type="submit" isLoading={!!isSubmitting}>
              {getContent("submit")}
            </Button>
            <Button onClick={() => closePopup()}>{getContent("cancel")}</Button>
          </FormActions>
          <Act
            path={isSubmitting ? `${API}/clinic/prescription` : null}
            method="PUT"
            payload={isSubmitting || undefined}
            onDone={(status, result) => {
              setIsSubmitting(null);
              if (!status) return;
              console.log(result);
            }}
          />
        </Form>
        <Table
          data={node.details}
          name="ClinicManageTaminPrescriptionDetails"
          renderer={{
            paR_TAREF_NAME: {
              name: getContent("clinicServiceName"),
              value: (node) => node.paR_TAREF_NAME,
              filter: "Text",
            },
            paR_TYPE_NAME: {
              name: getContent("taminParType"),
              value: (node) => node.paR_TYPE_NAME,
              filter: "Text",
            },
            price: {
              name: getContent("price"),
              value: (node) => node.paR_TAREF_PRICE,
              filter: "Number",
              component: (node) => currencize(node.paR_TAREF_PRICE),
            },
            paR_TAREF_2K_PRICE: {
              name: getContent("2kPrice"),
              value: (node) => node.paR_TAREF_2K_PRICE,
              filter: "Number",
              component: (node) => currencize(node.paR_TAREF_2K_PRICE),
            },
            subsidyPrice: {
              name: getContent("subsidyPrice"),
              filter: "Number",
              value: (node) => node.subsidyPrice,
            },
            requesT_QTY: {
              name: getContent("requestedQuantity"),
              value: (node) => node.requesT_QTY,
              filter: "Number",
            },
            max_QTY: {
              name: getContent("maximumQuantity"),
              value: (node) => node.max_QTY,
              filter: "Number",
            },
            remaininG_QTY: {
              name: getContent("remainingQuantity"),
              value: (node) => node.remaininG_QTY,
              filter: "Number",
            },
            selected: {
              name: getContent("selection"),
              value: (node) =>
                booleanToValue[
                  `${!!details.find(
                    (detail) => detail.parTarefCode === node.paR_TAREF_CODE,
                  )?.selected}`
                ],
              component: (node) => (
                <ToggleInput
                  value={
                    details.find(
                      (detail) => detail.parTarefCode === node.paR_TAREF_CODE,
                    )?.selected
                  }
                  onChange={() =>
                    setDetails((prev) => {
                      const clone = [...prev];
                      const index = clone.findIndex(
                        (el) => el.parTarefCode === node.paR_TAREF_CODE,
                      );
                      if (index === -1) return clone;
                      clone[index] = {
                        ...clone[index],
                        selected: !clone[index].selected,
                      };
                      return clone;
                    })
                  }
                />
              ),
              filter: "Set",
            },
            is2K: {
              name: getContent("is2k"),
              value: (node) =>
                booleanToValue[
                  `${!!details.find(
                    (detail) => detail.parTarefCode === node.paR_TAREF_CODE,
                  )?.is2K}`
                ],
              component: (node) => (
                <ToggleInput
                  value={
                    details.find(
                      (detail) => detail.parTarefCode === node.paR_TAREF_CODE,
                    )?.is2K
                  }
                  onChange={() =>
                    setDetails((prev) => {
                      const clone = [...prev];
                      const index = clone.findIndex(
                        (el) => el.parTarefCode === node.paR_TAREF_CODE,
                      );
                      if (index === -1) return clone;
                      clone[index] = {
                        ...clone[index],
                        is2K: !clone[index].is2K,
                      };
                      return clone;
                    })
                  }
                />
              ),
              filter: "Set",
            },
            fillingCount: {
              name: getContent("fillingCount"),
              value: (node) =>
                details.find(
                  (detail) => detail.parTarefCode === node.paR_TAREF_CODE,
                )?.requestQty || 0,
              filter: "Number",
              onEdit: (e) => {
                const val = Number(e.newValue);
                if (
                  isNaN(val) ||
                  String(e.newValue).includes(".") ||
                  String(e.newValue).includes("-") ||
                  String(e.newValue).includes(" ")
                ) {
                  return false;
                }
                setDetails((prev) => {
                  const clone = [...prev];
                  const index = clone.findIndex(
                    (el) => el.parTarefCode === e.data.paR_TAREF_CODE,
                  );
                  if (index === -1) return clone;
                  clone[index] = { ...clone[index], requestQty: val };
                  return clone;
                });
                return false;
              },
              editParams: { min: 0, precision: 0 },
            },
          }}
        />
      </div>
    </PopupCard>
  );
};

const PrescriptionsList = ({
  nationalCode,
  trackingCode,
}: {
  trackingCode: string;
  nationalCode: string;
}) => {
  const { data: specs } = useSWR<ITaminSpec[]>(
    `${API}/clinic/taminSpec`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data, error } = useSWR<TaminParaPresc[]>(
    {
      url: `${API}/clinic/prescription`,
      method: "POST",
      payload: { trackingCode, nationalCode },
    },
    ({
      method,
      payload,
      url,
    }: {
      url: string;
      method: FetchMethod;
      payload: { trackingCode: string; nationalCode: string };
    }) => fetcher({ payload, url, method }).then((res) => res.data),
  );

  const { setPopup } = usePopup();

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          {!!data?.length ? (
            <Table
              data={data}
              name="ClinicManagePrescriptions"
              renderer={{
                eprsC_ID: {
                  name: getContent("taminPrescriptionId"),
                  value: (node) => node.eprsC_ID,
                  filter: "Text",
                },
                partypedesc: {
                  name: getContent("taminParType"),
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
                doC_SPEC: {
                  name: getContent("doctorSpeciality"),
                  value: (node) =>
                    specs
                      ? specs.find((spec) => spec.specCode === node.doC_SPEC)
                          ?.specDesc || node.doC_SPEC
                      : node.doC_SPEC,
                  filter: "Multi",
                },
                prescdate: {
                  name: getContent("prescriptionDate"),
                  value: (node) => parseMonkeyDate(node.prescdate),
                  component: (node) => (
                    <FormatDate
                      value={parseMonkeyDate(node.prescdate)}
                      time={false}
                    />
                  ),
                  filter: "Date",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "ClinicPrescriptionDetails",
                            <ClinicPrescriptionDetailsPopup node={node} />,
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
          ) : (
            <p>oops No Result Found</p>
          )}
        </Fragment>
      )}
    </HandleLoading>
  );
};

export default PrescriptionsList;
