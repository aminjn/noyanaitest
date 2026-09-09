import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BecomeANodeStatus } from "../DoctorPanel/DoctorPanelPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeHospitalRequest from "./SubmitBecomeHospitalRequest";
import { Fragment } from "react";

export type BecomeHospitalPopulation = Population<{ user: true }>;
export interface IBecomeHospitalRequest<
  T extends BecomeHospitalPopulation = BecomeHospitalPopulation,
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

const BecomeHospitalPage = () => {
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
        <SubmitBecomeHospitalRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeHospitalPage;
