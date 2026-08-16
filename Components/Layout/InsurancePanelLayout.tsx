"use client";

import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import InsurancePanelSidebar from "./InsurancePanelSidebar";
import useSWR from "swr";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeInsurancePage from "../InsurancePanel/BecomeInsurancePage";

export type BecomeInsurancePopuplation = Population<{ User: UserPopulation }>;

export interface IBecomeInsuranceRequest<
  T extends BecomeInsurancePopuplation = BecomeInsurancePopuplation,
> extends MongoDoc {
  user?: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  createdAt: Date;
  status: BecomeANodeStatus;
  name: string;
}

const InsurancePanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR<IInsurance | null>(
    `${API}/insurance`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!isLoading}>
      {data ? (
        <PanelLayout sidebar={<InsurancePanelSidebar />}>
          {children}
        </PanelLayout>
      ) : (
        <BecomeInsurancePage />
      )}
    </HandleLoading>
  );
};

export default InsurancePanelLayout;
