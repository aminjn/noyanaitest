import useSWR from "swr";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BecomeRequestStatus from "@/Components/_Common/BecomeStatus/BecomeRequestStatus";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomePharmacyRequest from "./SubmitBecomePharmacyRequest";

export type BecomePharmacyPopulation = Population<{ user: true }>;

export interface IBecomePharmacyRequest<
  T extends BecomePharmacyPopulation = BecomePharmacyPopulation,
> extends MongoDoc {
  user?: T["user"] extends true ? IUser : string;
  createdAt: Date;
  updatedAt: Date;
  status: BecomeANodeStatus;
  rejectReason?: string;
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: string;
  description?: string;
}

const BecomePharmacyPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomePharmacyRequest | null>(
      `${API}/pharmacy/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );


  return (
    <HandleLoading data={!isLoading} error={error}>
      <BecomeRequestStatus
        request={data}
        form={
            <SubmitBecomePharmacyRequest mutate={mutate} />
        }
      />
    </HandleLoading>
  );
};

export default BecomePharmacyPage;
