import useLocale from "@/Components/Hooks/useLocale";
import { IncomingTaminPharmacyResponse } from "./PharmacyFillPrescriptionPage";
import classes from "./PrescriptionFiller.module.css";
import PrescriptionFillPatient from "./PrescriptionFillPatient";
import PrescriptionListItem from "./PrescriptionListItem";
import Button from "@/Components/UI/Button";
import Table from "@/Components/Admin/UI/Table";
import { useCallback, useState } from "react";
import { currencize } from "@/Components/helpers/currencize";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import ToggleInput from "@/Components/UI/ToggleInput";
import usePopup from "@/Components/Hooks/usePopup";
import ReplaceDrugPopup from "./ReplaceDrugPopup";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const PrescriptionFiller = ({
  prescription,
  data,
  onBack,
}: {
  prescription: IncomingTaminPharmacyResponse["list"][number];
  data: IncomingTaminPharmacyResponse;
  onBack: () => unknown;
}) => {
  const getContent = useLocale();

  const { setPopup } = usePopup();

  const [input, setInput] = useState<
    {
      electronicPrescDetail: number;
      drugCode: string;
      phaDrugPrice: number;
      requestedCount: number;
      barcodesList: null;
      drugIrc: null;
      selected?: boolean;
    }[]
  >(
    prescription.finalDetailsPresc.map((el) => ({
      electronicPrescDetail: el.detailId,
      drugCode: el.drugCode,
      phaDrugPrice: 0,
      barcodesList: null,
      drugIrc: null,
      selected: false,
      requestedCount: Number(el.remainingCount) || 0,
    })),
  );

  const [isLoading, setIsLoading] = useState<unknown[] | null>(null);

  const pushNotfication = useNotification();

  const onSubmit = useCallback(() => {
    if (!!isLoading) return;
    const final = input.filter((el) => !!el.selected);
    if (!final.length)
      return pushNotfication(
        getContent("fillingEmptyPrescriptionError"),
        "Error",
      );
    for (let i = 0; i < final.length; ++i) {
      if (!final[i].phaDrugPrice || !final[i].requestedCount)
        return pushNotfication(getContent("checkInput"), "Error");
      delete final[i].selected;
    }
    setIsLoading(final);
  }, [isLoading, input, pushNotfication, getContent]);

  return (
    <div className={classes.main}>
      <div className={classes.box}>
        <PrescriptionFillPatient />
        <div className={classes.header}>
          <h1>{getContent("selectedPrescription")}</h1>
          <Button variant="Error" onClick={onBack}>
            {getContent("back")}
          </Button>
        </div>
        <PrescriptionListItem prescription={prescription} />
      </div>
      <Table
        data={prescription.finalDetailsPresc}
        name="PharmacyFillPrescription"
        renderer={{
          drugName: {
            name: getContent("drugName"),
            value: (node) => node.drugName,
            filter: "Text",
          },
          prescribedCount: {
            name: getContent("prescribedCount"),
            value: (node) => Number(node.prescribedCount) || 0,
            filter: "Number",
          },
          remainingCount: {
            name: getContent("remainingDrugCount"),
            value: (node) => Number(node.remainingCount) || 0,
            filter: "Number",
          },
          availableCount: {
            name: getContent("availbaleDrugCount"),
            value: (node) =>
              input.find((el) => el.electronicPrescDetail === node.detailId)
                ?.requestedCount,
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
              const remainig = Number(
                prescription.finalDetailsPresc.find(
                  (el) => el.detailId === e.data.detailId,
                )?.remainingCount || 0,
              );
              if (remainig < val) return false;
              setInput((prev) => {
                const clone = [...prev];
                const index = clone.findIndex(
                  (el) => el.electronicPrescDetail === e.data.detailId,
                );
                if (index === -1) return clone;
                clone[index] = { ...clone[index], requestedCount: val };
                return clone;
              });
              return true;
            },
            editParams: {
              min: 0,
              step: 1,
              showStepperButtons: true,
            },
          },
          unitPrice: {
            name: getContent("unitPrice"),
            value: (node) =>
              input.find((el) => el.electronicPrescDetail === node.detailId)
                ?.phaDrugPrice || 0,
            filter: "Number",
            component: (node) =>
              currencize(
                input.find((el) => el.electronicPrescDetail === node.detailId)
                  ?.phaDrugPrice || 0,
              ),
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
              setInput((prev) => {
                const clone = [...prev];
                const index = clone.findIndex(
                  (el) => el.electronicPrescDetail === e.data.detailId,
                );
                if (index === -1) return clone;
                clone[index] = { ...clone[index], phaDrugPrice: val };
                return clone;
              });
              return false;
            },
            editParams: {
              min: 0,
              precision: 0,
            },
          },
          totalPrice: {
            name: getContent("totalLinearPrice"),
            value: (node) => {
              const element = input.find(
                (el) => el.electronicPrescDetail === node.detailId,
              );
              return (
                (element?.phaDrugPrice || 0) * (element?.requestedCount || 0)
              );
            },
            component: (node) => {
              const element = input.find(
                (el) => el.electronicPrescDetail === node.detailId,
              );
              return currencize(
                (element?.phaDrugPrice || 0) * (element?.requestedCount || 0),
              );
            },
            filter: "Number",
          },
          drugForm: {
            name: getContent("drugForm"),
            value: (node) => node.drugForm,
            filter: "Text",
          },
          drugInstruction: {
            name: getContent("drugInstruction"),
            value: (node) => node.drugInstruction,
            filter: "Text",
          },
          confirm: {
            name: getContent("confirmation"),
            value: (node) =>
              booleanToValue[
                `${!!input.find((el) => el.electronicPrescDetail === node.detailId)?.selected}`
              ],
            component: (node) => (
              <TableActions>
                <ToggleInput
                  title={getContent("confirmed")}
                  onChange={() =>
                    setInput((prev) => {
                      const clone = [...prev];
                      const index = clone.findIndex(
                        (el) => el.electronicPrescDetail === node.detailId,
                      );
                      if (index === -1) return clone;
                      clone[index] = {
                        ...clone[index],
                        selected: !clone[index].selected,
                      };
                      return clone;
                    })
                  }
                  value={
                    !!input.find(
                      (el) => el.electronicPrescDetail === node.detailId,
                    )?.selected
                  }
                />
              </TableActions>
            ),
            filter: "Set",
          },
          actions: {
            name: getContent("actions"),
            component: (node) => (
              <button
                onClick={() => setPopup("ReplaceDrug", <ReplaceDrugPopup />)}
              >
                {getContent("replaceDrug")}
              </button>
            ),
          },
        }}
      />
      <div className={classes.actions}>
        <Button variant="Success" onClick={onSubmit}>
          {getContent("sendToTamin")}
        </Button>
        <Button variant="Error" onClick={onBack}>
          {getContent("cancel")}
        </Button>
      </div>
      <Act
        path={isLoading ? `${API}/pharmacy/prescription` : null}
        method="PUT"
        onDone={(status, result) => {
          console.log(result);
        }}
        payload={{
          userInformation: {
            phaId: "0000000920",
          },
          electronicPrescHead: prescription.headeprscid,
          patientNatCode: "1234567891",
          patientMobileNo: "09120000000",
          drugsList: isLoading,
        }}
      />
    </div>
  );
};

export default PrescriptionFiller;
