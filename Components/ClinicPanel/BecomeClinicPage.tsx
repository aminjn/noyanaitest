import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeClinicRequest from "./SubmitBecomeClinicRequest";
import { Fragment } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";

export type BecomeClinicPopulation = Population<{ user: true }>;
export interface IBecomeClinicRequest<
  T extends BecomeClinicPopulation = BecomeClinicPopulation,
> extends MongoDoc {
  user: T["user"] extends true ? IUser | null : string;
  createdAt: Date;
  updatedAt: Date;
  status: BecomeANodeStatus;
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: string;
  description?: string;
}

const BecomeClinicPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeClinicRequest | null>(
      `${API}/clinic/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );

  const getContent = useScopedLocale();

  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? (
        <Fragment>
          {data.status === "Pending" ? (
            <p>{getContent("requestBeingProcessedByAdmin")}</p>
          ) : (
            <Fragment>
              {data.status === "Approved" ? (
                <p>{getContent("requestApprovedCreatingProfile")}</p>
              ) : (
                <p>{getContent("yourRequestWasRejected")}</p>
              )}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <SubmitBecomeClinicRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeClinicPage;
