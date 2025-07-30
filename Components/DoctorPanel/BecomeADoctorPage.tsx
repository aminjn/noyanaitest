import useSWR from "swr";
import classes from "./BecomeADoctorPage.module.css";
import {
  genders,
  IBecomeDoctorRequest,
  medicalSystemTitles,
} from "./DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import CreateForm from "../Admin/UI/CreateForm";
import useLocale from "../Hooks/useLocale";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { provinces } from "../Enums/Provinces";
import useForm from "../Hooks/useForm";
import { cities } from "../Enums/Cities";
import SubmitABecomeDoctorRequest from "./SubmitABecomeDoctorRequest";
import { Fragment } from "react";

const BecomeADoctorPage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeDoctorRequest | null>(
      `${API}/doctor/request`,
      (url: string) => fetcher({ url }).then((res) => res.data.data)
    );

  const getContent = useLocale();

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
        <SubmitABecomeDoctorRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeADoctorPage;
