"use client";
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
import { Fragment, useEffect, useState } from "react";
import Button from "../UI/Button";
import Act from "../UI/Act";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import useUser, { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import ConfirmMedicalCodePopup from "./ConfirmMedicalCodePopup";
import useDoctor from "../Hooks/useDoctor";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentKey } from "../Enums/contentKeys";
import Input from "../UI/Input";
import LogoutPopup from "../Popups/LogoutPopup";
import { t2xsRegular, tsmRegular } from "../UI/Typography";
import BecomeDoneView from "../Become/BecomeDoneView";

export type McCodepopulation = Population<{ User: UserPopulation }>;
export interface IMcCode<
  T extends McCodepopulation = McCodepopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  mcCode: string;
  createdAt: Date;
}

const becomeDoctorStages = ["inquiry", "confirm", "done"] as const;

type BecomeDoctorStage = (typeof becomeDoctorStages)[number];

const becomeDoctorStageContentKeyDict: Record<BecomeDoctorStage, ContentKey> = {
  confirm: "confirmInfo",
  done: "finalizeRegister",
  inquiry: "inquiryDetails",
};

const InquiryStage = () => {
  const { user } = useUser();

  const getContent = useScopedLocale(["becomeSomething"]);

  const { setPopup } = usePopup();

  return (
    <div className={classes.form}>
      <Input
        readOnly
        defaultValue={user?.nationalId}
        title={getContent("nationalId")}
      />
      <div className={classes.actions}>
        <Button
          onClick={() => setPopup("Logout", <LogoutPopup />)}
          variant="Error"
          mode="Outline"
          radius="High"
          size="L"
        >
          {getContent("logout")}
        </Button>
        <Button variant="Primary" mode="Fill" radius="High" size="L">
          {getContent("inquiryAndContinue")}
        </Button>
        <span className={`${classes.notice} ${t2xsRegular}`}>
          {getContent("becomeDoctorInquiryNotice")}
        </span>
      </div>
    </div>
  );
};

const ConfirmStage = () => {
  return null;
};

const DoneStage = () => {
  const { doctor } = useDoctor();

  if (!doctor) return null;
  return <BecomeDoneView title="becomeDoctorDone" target="/doctorpanel" />;
};

const BecomeADoctorPage = () => {
  const {
    data,
    error,
    isLoading: isMcsLoading,
    mutate,
  } = useSWR<IMcCode[]>(`${API}/doctor/request`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { doctor, isLoading } = useDoctor();

  const getContent = useScopedLocale(["becomeSomething"]);

  const [stage, setStage] = useState<BecomeDoctorStage>("inquiry");

  useEffect(() => {
    if (doctor) setStage("done");
  }, [doctor]);

  return (
    <HandleLoading data={!isLoading}>
      <div className={classes.main}>
        <div className={classes.tabs}>
          {becomeDoctorStages.map((s, i) => (
            <div
              className={`${classes.stage} ${tsmRegular} ${becomeDoctorStages.indexOf(s) <= i ? classes.activeStage : ""}`}
              key={s}
            >
              <span>{i + 1}</span>
              <span>{getContent(becomeDoctorStageContentKeyDict[s])}</span>
            </div>
          ))}
        </div>
        {stage === "inquiry" && <InquiryStage />}
        {stage === "confirm" && <ConfirmStage />}
        {stage === "done" && <DoneStage />}
      </div>
    </HandleLoading>
  );
};

export default BecomeADoctorPage;
