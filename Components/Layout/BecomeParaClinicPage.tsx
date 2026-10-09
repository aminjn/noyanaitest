import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BecomeRequestStatus from "@/Components/_Common/BecomeStatus/BecomeRequestStatus";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeOrganizationForm, { becomeRequestFormValues } from "../Become/BecomeOrganizationForm";
import { becomeOrgs } from "../Become/becomeOrgs";

export type BecomeParaClinicRequestPopulation = Population<{
  User: UserPopulation;
}>;

export interface IBecomeParaClinicRequest<
  T extends BecomeParaClinicRequestPopulation =
    BecomeParaClinicRequestPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  createdAt: Date;
  updatedAt: Date;
  status: BecomeANodeStatus;
  rejectReason?: string;
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  // the licence's expiry (2026-10); older requests have none
  certificateExpiresAt?: Date;
  certificateFile?: string;
  description?: string;
}

const BecomeParaClinicPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeParaClinicRequest | null>(
      `${API}/paraClinic/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );

  return (
    <HandleLoading data={!isLoading} error={error}>
      <BecomeRequestStatus
        request={data}
        form={
            // the same form as /become/paraClinic (2026-10), prefilled
            // from a declined request
            <BecomeOrganizationForm
              org={becomeOrgs.paraClinic}
              mutate={mutate}
              hideStatus
              rejected={data && data.status !== "Pending" ? becomeRequestFormValues(becomeOrgs.paraClinic, data) : undefined}
            />
        }
      />
    </HandleLoading>
  );
};

export default BecomeParaClinicPage;
