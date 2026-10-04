"use client";
import { MongoDoc } from "@/Components/Hooks/useUser";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { DoctorProfilePopulation, IDoctorProfile } from "../../DoctorPanelPage";
import {
  IUserIdentity,
  UserIdentityPopulation,
} from "@/Components/Dashboard/DashboardPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import {
  ITaminService,
  TaminServicePopulation,
} from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import {
  ITaminDrugAmount,
  TaminDrugAmountPopulation,
} from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import {
  ITaminDrugInstruction,
  TaminDrugInstructionPopulation,
} from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import {
  ITaminPrescriptionType,
  TaminPrescriptionTypePopulation,
} from "@/Components/Admin/Tamin/PrescriptionType/AdminManageTaminPrescriptionTypesPage";
import { nanoid } from "nanoid";
import { LoadedPrescription2 } from "../Preview/PreviewPrescription2Page";
import useSWR from "swr";
import { ITaminServiceType } from "@/Components/Admin/Tamin/ServiceType/AdminManageTaminServiceTypesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";

export type Prescription2ItemPopulation = Population<{
  Prescription: Prescription2Population;
  Service: TaminServicePopulation;
  TimesADay: TaminDrugAmountPopulation;
  DrugInstruction: TaminDrugInstructionPopulation;
}>;
export interface IPrescription2Item<
  T extends Prescription2ItemPopulation = Prescription2ItemPopulation,
> extends MongoDoc {
  prescription: T["Prescription"] extends Prescription2Population
    ? IPrescription2<T["Prescription"]>
    : string;
  service: T["Service"] extends TaminServicePopulation
    ? ITaminService<T["Service"]>
    : string;
  qty: number;
  timesADay?: T["TimesADay"] extends TaminDrugAmountPopulation
    ? ITaminDrugAmount<T["TimesADay"]>
    : string;
  dose?: string;
  repeat?: string;
  dateDo?: Date;
  drugInstruction?: T["DrugInstruction"] extends TaminDrugInstructionPopulation
    ? ITaminDrugInstruction<T["DrugInstruction"]>
    : string;
}

export const newPrescription2ItemId = () =>
  `${nanoid()}${new Date().getTime()}`;

export type TaminPrescription2Population = Population<{
  PrescType: TaminPrescriptionTypePopulation;
  Prescription: Prescription2Population;
}>;
export interface ITaminPrescription2<
  T extends TaminPrescription2Population = TaminPrescription2Population,
> extends MongoDoc {
  prescType: T["PrescType"] extends TaminPrescriptionTypePopulation
    ? ITaminPrescriptionType<T["PrescType"]>
    : string;
  prescription: T["Prescription"] extends Prescription2Population
    ? IPrescription2<T["Prescription"]>
    : string;
  tracking: string;
  taminId: string;
  createdAt: Date;
  serviceType: ITaminServiceType;
}

export type Prescription2Population = Population<{
  Author: DoctorProfilePopulation;
  Patient: UserIdentityPopulation;
  Items: Prescription2ItemPopulation;
  TaminPrescription: TaminPrescription2Population;
}>;
export interface IPrescription2<
  T extends Prescription2Population = Prescription2Population,
> extends MongoDoc {
  author: T["Author"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Author"]>
    : string;
  createdAt: Date;
  patient: T["Patient"] extends UserIdentityPopulation
    ? IUserIdentity<T["Patient"]>
    : string;
  items: T["Items"] extends Prescription2ItemPopulation
    ? IPrescription2Item<T["Items"]>[]
    : never;
  taminPrescriptions: T["TaminPrescription"] extends TaminPrescription2Population
    ? ITaminPrescription2<T["TaminPrescription"]>[]
    : never;
}

type PrescriptionView = {
  form: string;
  preview: string;
};

type Working = Partial<
  IPrescription2Item<{
    Service: Record<never, never>;
    TimesADay: Record<never, never>;
    DrugInstruction: Record<never, never>;
  }>
>;

export type PrescCtxItem = Omit<
  IPrescription2Item<{
    Service: Record<never, never>;
    DrugInstruction: Record<never, never>;
    TimesADay: Record<never, never>;
  }>,
  "prescription"
>;

// A line the voice / free-text parser added (2026-10, VoiceRxBox): what was
// said and the safety hints, until the doctor marks it reviewed. The writer
// does not submit while any such line is unreviewed.
export type RxAiWarning = { code: string; params?: string[] };
export type RxAiMark = { spoken: string; warnings: RxAiWarning[] };

const DoctorPrescriptionContext = createContext<{
  aiMarks: Record<string, RxAiMark>;
  setAiMarks: Dispatch<SetStateAction<Record<string, RxAiMark>>>;
  view: PrescriptionView;
  setView: Dispatch<SetStateAction<PrescriptionView>>;
  items: PrescCtxItem[];
  setItems: Dispatch<SetStateAction<PrescCtxItem[]>>;
  patient: IUserIdentity | null;
  setPatient: Dispatch<SetStateAction<IUserIdentity | null>>;
  working: Working;
  setWorking: Dispatch<SetStateAction<Working>>;
  readOnly: boolean;
  setReadOnly: Dispatch<SetStateAction<boolean>>;
  defaultValue?: LoadedPrescription2;
  refresh: () => void;
}>({
  aiMarks: {},
  setAiMarks: () => {},
  items: [],
  patient: null,
  setItems: () => {},
  setPatient: () => {},
  view: { form: "", preview: "" },
  setView: () => {},
  working: {},
  setWorking: () => {},
  readOnly: false,
  setReadOnly: () => {},
  refresh: () => {},
});

export const DoctorPrescriptionContextProvider = ({
  children,
  defaultValue: incomingDefaultValue,
}: {
  children: ReactNode;
  defaultValue?: LoadedPrescription2;
}) => {
  const [defaultValue, setDefaultValue] = useState<
    LoadedPrescription2 | undefined
  >(incomingDefaultValue);

  const [reload, setReload] = useState<boolean>(false);

  useSWR<LoadedPrescription2>(
    //TODO: the call from where defaultValue is coming should be here and this shit should only receive Id but you gotta figure out how to handle loading
    reload && !!defaultValue
      ? `${API}/doctor/presc2/${defaultValue._id}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      onSuccess: (data) => {
        setReload(false);
        setDefaultValue(data);
      },
    },
  );

  const refresh = useCallback(() => setReload(true), []);

  const [readOnly, setReadOnly] = useState<boolean>(!!defaultValue);

  const [view, setView] = useState<PrescriptionView>({
    form: "",
    preview: "",
  });

  const [patient, setPatient] = useState<IUserIdentity | null>(
    defaultValue?.patient || null,
  );

  const [items, setItems] = useState<PrescCtxItem[]>(defaultValue?.items || []);

  const [working, setWorking] = useState<Working>({
    _id: newPrescription2ItemId(),
  });

  const [aiMarks, setAiMarks] = useState<Record<string, RxAiMark>>({});

  return (
    <DoctorPrescriptionContext.Provider
      value={{
        aiMarks,
        setAiMarks,
        items,
        setItems,
        patient,
        setPatient,
        working,
        setWorking,
        view,
        setView,
        readOnly,
        setReadOnly,
        defaultValue,
        refresh,
      }}
    >
      {children}
    </DoctorPrescriptionContext.Provider>
  );
};

export default DoctorPrescriptionContext;
