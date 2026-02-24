import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeClinicRequest from "./SubmitBecomeClinicRequest";
import { Fragment } from "react";

export type BecomeClinicPopulation = Population<{ user: true }>;
export interface IBecomeClinicRequest<
  T extends BecomeClinicPopulation = BecomeClinicPopulation,
> extends MongoDoc {
  user: T["user"] extends true ? IUser | null : string;
  createdAt: Date;
  status: BecomeANodeStatus;
  name: string;
}

const BecomeClinicPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeClinicRequest | null>(
      `${API}/clinic/request`,
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
        <SubmitBecomeClinicRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeClinicPage;
