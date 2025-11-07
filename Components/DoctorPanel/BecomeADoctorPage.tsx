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
import { Fragment, useState } from "react";
import Button from "../UI/Button";
import Act from "../UI/Act";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import ConfirmMedicalCodePopup from "./ConfirmMedicalCodePopup";

export type McCodepopulation = Population<{ User: UserPopulation }>;
export interface IMcCode<T extends McCodepopulation = McCodepopulation>
  extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  mcCode: string;
  createdAt: Date;
}

const BecomeADoctorPage = () => {
  const {
    data,
    error,
    isLoading: isMcsLoading,
    mutate,
  } = useSWR<IMcCode[]>(`${API}/doctor/request`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!isMcsLoading} error={error}>
      {!!data && (
        <div className={classes.main}>
          <legend>{getContent("becomeADoctorPageTitle")}</legend>
          {!!data.length ? (
            <div className={classes.list}>
              {data.map((el) => (
                <Button
                  key={el._id}
                  onClick={() =>
                    setPopup(
                      "ConfirmMedicalCode",
                      <ConfirmMedicalCodePopup node={el} />
                    )
                  }
                >
                  {el.mcCode}
                </Button>
              ))}
            </div>
          ) : (
            <p>{getContent("noMcCodeIsLinkedToYourAccount")}</p>
          )}
          <Button isLoading={isLoading} onClick={() => setIsLoading(true)}>
            استعلام
          </Button>
          <Act
            path={isLoading ? `${API}/doctor/request` : null}
            method="POST"
            onDone={(status, result) => {
              setIsLoading(false);
              if (!status) return;
              mutate();
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
  // return (
  // <HandleLoading data={!isLoading} error={error}>
  //   {data ? (
  //     <Fragment>
  //       {data.status === "Pending" ? (
  //         <p>در حال پردازش اطلاعات توسط ادمین</p>
  //       ) : (
  //         <Fragment>
  //           {data.status === "Approved" ? (
  //             <p>
  //               درخواست شما تایید شده است در حال ساخت پروفایل برای شما هستیم
  //             </p>
  //           ) : (
  //             <p>درخواست شما رد شده است</p>
  //           )}
  //         </Fragment>
  //       )}
  //     </Fragment>
  //   ) : (
  //     <SubmitABecomeDoctorRequest mutate={mutate} />
  //   )}
  // </HandleLoading>
  // );
};

export default BecomeADoctorPage;
