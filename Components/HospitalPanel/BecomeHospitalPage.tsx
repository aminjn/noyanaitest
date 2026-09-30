import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeHospitalRequest from "./SubmitBecomeHospitalRequest";
import { Fragment } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

export type BecomeHospitalPopulation = Population<{ user: true }>;
export interface IBecomeHospitalRequest<
  T extends BecomeHospitalPopulation = BecomeHospitalPopulation,
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
  certificateFile?: string;
  description?: string;
}

const BecomeHospitalPage = () => {
  const getContent = useScopedLocale();
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeHospitalRequest | null>(
      `${API}/hospital/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );

  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? (
        <Fragment>
          {data.status === "Pending" ? (
            <p>{getContent("requestProcessingByAdmin")}</p>
          ) : (
            <Fragment>
              {data.status === "Approved" ? (
                <p>{getContent("requestApprovedCreatingProfile")}</p>
              ) : (
                <p>{getContent("yourRequestRejected")}</p>
              )}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <SubmitBecomeHospitalRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeHospitalPage;
