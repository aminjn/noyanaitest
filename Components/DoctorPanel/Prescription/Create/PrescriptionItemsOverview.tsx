import {
  act,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import classes from "./PrescriptionItemsOverview.module.css";
import PrescriptionContext, { PrescriptionItem } from "../PrescriptionContext";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import PillIcon from "@/Components/Icons/PillIcon";
import Button from "@/Components/UI/Button";
import useProgress from "@/Components/Hooks/useProgress";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import {
  t2xsDemiBold,
  t3xlDemiBold,
  txsMedium,
} from "@/Components/UI/Typography";
import Ixon from "@/Components/UI/Ixon";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../../DoctorPanelPage";
import {
  IUserIdentity,
  UserIdentityPopulation,
} from "@/Components/Dashboard/DashboardPage";
import {
  ITaminService,
  TaminServicePopulation,
} from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import {
  ITaminDrugUsage,
  TaminDrugUsagePopulation,
} from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import {
  ITaminDrugInstruction,
  TaminDrugInstructionPopulation,
} from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import {
  ITaminDrugAmount,
  TaminDrugAmountPopulation,
} from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { ContentKey } from "@/Components/Enums/contentKeys";
import PrescriptionItemsList from "./PrescriptionItemsList";
import { FetchMethod } from "@/Components/helpers/fetcher";

export type PrescriptionLabItemPopulation = Population<{
  Item: TaminServicePopulation;
}>;

export interface IPrescriptionLabItem<
  T extends PrescriptionLabItemPopulation = PrescriptionLabItemPopulation,
> extends MongoDoc {
  item: T["Item"] extends PrescriptionLabItemPopulation
    ? ITaminService
    : string;
  dateDo?: Date;
  qty: number;
  description?: string;
}

export type PrescriptionItemPopulation = Population<{
  Item: TaminServicePopulation;
  Usage: TaminDrugUsagePopulation;
  Instruction: TaminDrugInstructionPopulation;
  Amount: TaminDrugAmountPopulation;
}>;
export interface IPrescriptionItem<
  T extends PrescriptionItemPopulation = PrescriptionItemPopulation,
> extends MongoDoc {
  item: T["Item"] extends TaminServicePopulation
    ? ITaminService<T["Item"]>
    : string;
  usage: T["Usage"] extends TaminDrugUsagePopulation
    ? ITaminDrugUsage<T["Usage"]>
    : string;
  instruction: T["Instruction"] extends TaminDrugInstructionPopulation
    ? ITaminDrugInstruction<T["Instruction"]>
    : string;
  amount: T["Amount"] extends TaminDrugAmountPopulation
    ? ITaminDrugAmount<T["Amount"]>
    : string;
  qty: number;
  description?: string;
}

export type TaminPrescriptionPopulation = Population<{
  Prescription: PrescriptionPopulation;
}>;
export interface ITaminPrescription<
  T extends TaminPrescriptionPopulation = TaminPrescriptionPopulation,
> extends MongoDoc {
  prescription: T["Prescription"] extends PrescriptionPopulation
    ? IPrescription<T["Prescription"]>
    : string;
  tracking?: string;
  taminId?: string;
  submittedAt: Date;
  labTracking?: string;
  labTaminId?: string;
}

export type PrescriptionPopulation = Population<{
  Author: DoctorProfilePopulation;
  Patient: UserIdentityPopulation;
  Items: PrescriptionItemPopulation;
  TaminStatus: TaminPrescriptionPopulation;
  LabItems: PrescriptionLabItemPopulation;
}>;

export interface IPrescription<
  T extends PrescriptionPopulation = PrescriptionPopulation,
> extends MongoDoc {
  author: T["Author"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Author"]>
    : string;
  patient: T["Patient"] extends UserIdentityPopulation
    ? IUserIdentity<T["Patient"]>
    : string;
  items: T["Items"] extends PrescriptionItemPopulation
    ? IPrescriptionItem<T["Items"]>[]
    : IPrescriptionItem[];
  labItems: T["LabItems"] extends PrescriptionLabItemPopulation
    ? IPrescriptionLabItem<T["LabItems"]>[]
    : IPrescriptionLabItem[];
  createdAt: Date;
  taminStatus?: T["TaminStatus"] extends TaminPrescriptionPopulation
    ? ITaminPrescription<T["TaminStatus"]> | null
    : never;
}

type SubmitPrescriptionPayload = {
  patient: string;
  items: {
    item: string;
    usage: string;
    instruction: string;
    amount: string;
    qty: number;
    description?: string;
  }[];
  labItems: {
    item: string;
    qty: number;
    dateDo?: string;
    description?: string;
  }[];
};

type Action = "Commit" | "Draft" | "Edit" | "EditDraft" | "EditDraftCommit";

const PrescriptionItemsOverview = () => {
  const { items, patient, defaultValue, labItems } =
    useContext(PrescriptionContext);

  // const [isDrafting, setIsDrfating] =
  //   useState<SubmitPrescriptionPayload | null>(null);

  // const [isCommiting, setIsCommiting] =
  //   useState<SubmitPrescriptionPayload | null>(null);

  const [action, setAction] = useState<{
    payload: SubmitPrescriptionPayload;
    action: Action;
  } | null>(null);

  const getContent = useLocale();

  const pushNotification = useNotification();

  const push = useProgress();

  console.log(action);

  const onSubmit = useCallback(
    (_action: Action) => {
      if (!!action) return;
      if (!patient)
        return pushNotification(
          getContent("selectpPatientFirstErrorMessage"),
          "Error",
        );
      if (!items.length && !labItems.length)
        return pushNotification(
          getContent("draftingEmptyPrescriptionErrorMessage"),
          "Warn",
        );
      const payload = {
        patient: patient._id,
        items: items.map((item) => ({
          item: item.item._id,
          amount: item.amount._id,
          instruction: item.instruction._id,
          usage: item.usage._id,
          description: item.description,
          qty: item.qty,
        })),
        labItems: labItems.map((item) => ({
          item: item.item._id,
          qty: item.qty,
          dateDo: item.dateDo?.toString(),
          description: item.description,
        })),
      };
      console.log(payload);
      setAction({ action: _action, payload });
    },
    [action, getContent, items, patient, pushNotification, labItems],
  );

  const actDict = useMemo<
    Record<
      Action,
      {
        path: string;
        method: FetchMethod;
        payload?: (inp: SubmitPrescriptionPayload) => Record<string, unknown>;
      }
    >
  >(
    () => ({
      Commit: { path: `${API}/doctor/presc`, method: "POST" },
      Draft: { path: `${API}/doctor/presc`, method: "PUT" },
      Edit: {
        path: `${API}/doctor/presc/tamin/${defaultValue?._id}`,
        method: "POST",
        payload: (inp) => ({ items: inp.items, labItems: inp.labItems }),
      },
      EditDraft: {
        path: `${API}/doctor/presc/${defaultValue?._id}`,
        method: "POST",
      },
      EditDraftCommit: {
        path: `${API}/doctor/presc/${defaultValue?._id}`,
        method: "PUT",
      },
    }),
    [defaultValue?._id],
  );

  if (!items.length && !labItems.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.actions}>
        {defaultValue ? (
          <Fragment>
            {!!defaultValue.taminStatus ? (
              <Button onClick={() => onSubmit("Edit")} isLoading={!!action}>
                {getContent("editTaminPrescription")}
              </Button>
            ) : (
              <Fragment>
                <Button
                  onClick={() => onSubmit("EditDraft")}
                  isLoading={!!action}
                >
                  {getContent("editDraftPrescription")}
                </Button>
                <Button
                  onClick={() => onSubmit("EditDraftCommit")}
                  isLoading={!!action}
                >
                  {getContent("editDraftCommitPrescription")}
                </Button>
              </Fragment>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <Button onClick={() => push("/doctorpanel/drug")}>
              {getContent("cancel")}
            </Button>
            <Button isLoading={!!action} onClick={() => onSubmit("Draft")}>
              {getContent("draftPrescription")}
            </Button>
            <Button
              onClick={() => onSubmit("Commit")}
              variant="Success"
              isLoading={!!action}
            >
              {getContent("commitPrescription")}
            </Button>
          </Fragment>
        )}
      </div>
      <PrescriptionItemsList items={items} labItems={labItems} />
      {!!action && (
        <Act
          path={actDict[action.action].path}
          method={actDict[action.action].method}
          payload={
            actDict[action.action].payload?.(action.payload) ?? action.payload
          }
          onDone={(status) => {
            setAction(null);
            if (!status) return;
            //TODO: push to prescription readonly page after it got built
            push("/doctorpanel/drug");
          }}
          successMessage={getContent("prescriptionDrafted")}
        />
      )}
    </div>
  );
};

export default PrescriptionItemsOverview;
