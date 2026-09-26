import useSWR from "swr";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment } from "react";
import SubmitBecomePharmacyRequest from "./SubmitBecomePharmacyRequest";
import useScopedLocale from "../Hooks/useScopedLocale";

export type BecomePharmacyPopulation = Population<{ user: true }>;

export interface IBecomePharmacyRequest<
  T extends BecomePharmacyPopulation = BecomePharmacyPopulation,
> extends MongoDoc {
  user?: T["user"] extends true ? IUser : string;
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

const BecomePharmacyPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomePharmacyRequest | null>(
      `${API}/pharmacy/request`,
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
        <SubmitBecomePharmacyRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomePharmacyPage;
