"use client";
import SuspendedProviderBanner, { SuspendableProvider } from "./SuspendedProviderBanner";
import ActingAsBanner from "./ActingAsBanner";

import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import InsurancePanelSidebar from "./InsurancePanelSidebar";
import useSWR from "swr";
import useUser, { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeInsurancePage from "../InsurancePanel/BecomeInsurancePage";
import InsuranceLicenseGate from "../InsurancePanel/InsuranceLicenseGate";
import LoginRequired from "../UI/LoginRequired";

export type BecomeInsurancePopuplation = Population<{ User: UserPopulation }>;

export interface IBecomeInsuranceRequest<
  T extends BecomeInsurancePopuplation = BecomeInsurancePopuplation,
> extends MongoDoc {
  user?: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  createdAt: Date;
  updatedAt: Date;
  status: BecomeANodeStatus;
  rejectReason?: string;
  name: string;
  // «شماره‌ی مجوز بیمه مرکزی» (2026-10); older requests have siamCode only
  licenseNumber?: string;
  siamCode?: string;
  nationalId?: string;
  // approved, but the insurer made from it was deleted: it may be sent again
  profileMissing?: boolean;
  certificateDate: Date;
  certificateFile?: string;
  description?: string;
}

const InsurancePanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, isLoading } = useSWR<IInsurance | null>(
    `${API}/insurance`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : data ? (
        <PanelLayout sidebar={<InsurancePanelSidebar />}>
          <ActingAsBanner kind="insurance" ownerName={data?.name} />
          <SuspendedProviderBanner node={data as SuspendableProvider} />
          <InsuranceLicenseGate>{children}</InsuranceLicenseGate>
        </PanelLayout>
      ) : (
        <BecomeInsurancePage />
      )}
    </HandleLoading>
  );
};

export default InsurancePanelLayout;
