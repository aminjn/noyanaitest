import useSWR from "swr";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment } from "react";
import SubmitBecomePharmacyRequest from "./SubmitBecomePharmacyRequest";

export type BecomePharmacyPopulation = Population<{ user: true }>;

export interface IBecomePharmacyRequest<
  T extends BecomePharmacyPopulation = BecomePharmacyPopulation,
> extends MongoDoc {
  user?: T["user"] extends true ? IUser : string;
  createdAt: Date;
  status: BecomeANodeStatus;
  name: string;
}

const BecomePharmacyPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomePharmacyRequest | null>(
      `${API}/pharmacy/request`,
      (url: string) => fetcher({ url }).then((res) => res.data),
    );

  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? (
        <Fragment>
          {data.status === "Pending" ? (
            <p>در حال پردازش اطلاعات توسط ادمین</p>
          ) : (
            <Fragment>
              {data.status === "Approved" ? (
                <p>
                  درخواست شما تایید شده است در حال ساخت پروفایل برای شما هستیم
                </p>
              ) : (
                <p>درخواست شما رد شده است</p>
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
