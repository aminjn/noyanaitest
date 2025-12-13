import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { IPatientProfile } from "../Patient/PatientFiles";

export type PrescriptionCtx = {
  patient: (IUserIdentity & { phone?: string }) | null;
  setPatient: Dispatch<SetStateAction<IUserIdentity | null>>;
  profile: IPatientProfile | null;
  setProfile: Dispatch<SetStateAction<IPatientProfile | null>>;
};

const PrescriptionContext = createContext<PrescriptionCtx>({
  patient: null,
  setPatient: () => {},
  profile: null,
  setProfile: () => {},
});

export const PrescriptionContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [patient, setPatient] = useState<IUserIdentity | null>(null);
  const [profile, setProfile] = useState<IPatientProfile | null>(null);

  return (
    <PrescriptionContext.Provider
      value={{ patient, setPatient, profile, setProfile }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export default PrescriptionContext;
