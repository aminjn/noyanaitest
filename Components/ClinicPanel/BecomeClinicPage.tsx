import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BecomeRequestStatus from "@/Components/_Common/BecomeStatus/BecomeRequestStatus";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeClinicRequest from "./SubmitBecomeClinicRequest";

export type BecomeClinicPopulation = Population<{ user: true }>;
export interface IBecomeClinicRequest<
  T extends BecomeClinicPopulation = BecomeClinicPopulation,
> extends MongoDoc {
  user: T["user"] extends true ? IUser | null : string;
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

const BecomeClinicPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeClinicRequest | null>(
      `${API}/clinic/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );


  return (
    <HandleLoading data={!isLoading} error={error}>
      <BecomeRequestStatus
        request={data}
        form={
            <SubmitBecomeClinicRequest mutate={mutate} request={data} />
        }
      />
    </HandleLoading>
  );
};

export default BecomeClinicPage;
