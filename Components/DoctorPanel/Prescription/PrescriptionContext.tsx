import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { IPatientProfile } from "../Patient/PatientFiles";
import { ITaminService } from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import { ITaminDrugInstruction } from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import { ITaminDrugAmount } from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import { ITaminDrugUsage } from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import { MongoDoc } from "@/Components/Hooks/useUser";

import { nanoid } from "nanoid";
import { IPrescription } from "./Create/PrescriptionItemsOverview";

export type PrescriptionItem = {
  item: ITaminService;
  qty: number;
  instruction: ITaminDrugInstruction;
  amount: ITaminDrugAmount;
  usage: ITaminDrugUsage;
  description?: string;
};

export type LabItem = {
  item: ITaminService;
  dateDo?: Date;
  qty: number;
  description?: string;
};

export type PrescriptionCtx = {
  canMutatePatient: boolean;
  patient: (IUserIdentity & { phone?: string }) | null;
  setPatient: Dispatch<SetStateAction<IUserIdentity | null>>;
  profile: IPatientProfile | null;
  setProfile: Dispatch<SetStateAction<IPatientProfile | null>>;
  items: (PrescriptionItem & MongoDoc)[];
  setItems: Dispatch<SetStateAction<(PrescriptionItem & MongoDoc)[]>>;
  working: Partial<PrescriptionItem> & MongoDoc;
  setWorking: Dispatch<SetStateAction<Partial<PrescriptionItem> & MongoDoc>>;
  defaultValue?: DefaultPrescription;
  setLabItems: Dispatch<SetStateAction<(LabItem & MongoDoc)[]>>;
  labItems: (LabItem & MongoDoc)[];
  workingLab: Partial<LabItem> & MongoDoc;
  setWorkingLab: Dispatch<SetStateAction<Partial<LabItem> & MongoDoc>>;
};

const PrescriptionContext = createContext<PrescriptionCtx>({
  canMutatePatient: true,
  patient: null,
  setPatient: () => {},
  profile: null,
  setProfile: () => {},
  items: [],
  setItems: () => {},
  working: { _id: "" },
  setWorking: () => {},
  labItems: [],
  setLabItems: () => {},
  setWorkingLab: () => {},
  workingLab: { _id: "" },
});

export type DefaultPrescription = IPrescription<{
  Author: { Mc: Record<never, never> };
  Items: {
    Amount: Record<never, never>;
    Instruction: Record<never, never>;
    Usage: Record<never, never>;
    Item: Record<never, never>;
  };
  LabItems: { Item: Record<never, never> };
  Patient: Record<never, never>;
  TaminStatus: Record<never, never>;
}>;

export const generateRandomId = () => `${nanoid()}${new Date().getTime()}`;

export const PrescriptionContextProvider = ({
  children,
  defaultValue,
}: {
  children: ReactNode;
  defaultValue?: DefaultPrescription;
}) => {
  const [patient, setPatient] = useState<IUserIdentity | null>(
    defaultValue?.patient || null,
  );
  //TODO: implement this shit
  const [profile, setProfile] = useState<IPatientProfile | null>(null);
  const [items, setItems] = useState<(PrescriptionItem & MongoDoc)[]>(
    defaultValue?.items || [],
  );
  const [working, setWorking] = useState<Partial<PrescriptionItem> & MongoDoc>({
    _id: generateRandomId(),
  });

  const [labItems, setLabItems] = useState<(LabItem & MongoDoc)[]>(
    defaultValue?.labItems || [],
  );

  const [workingLab, setWorkingLab] = useState<Partial<LabItem> & MongoDoc>({
    _id: generateRandomId(),
  });

  return (
    <PrescriptionContext.Provider
      value={{
        defaultValue,
        canMutatePatient: !defaultValue?.taminStatus,
        patient,
        setPatient,
        profile,
        setProfile,
        items,
        setItems,
        setWorking,
        working,
        labItems,
        setLabItems,
        setWorkingLab,
        workingLab,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export default PrescriptionContext;
