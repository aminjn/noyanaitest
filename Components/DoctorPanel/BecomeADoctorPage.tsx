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
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { provinces } from "../Enums/Provinces";
import useForm from "../Hooks/useForm";
import { cities } from "../Enums/Cities";
import SubmitABecomeDoctorRequest from "./SubmitABecomeDoctorRequest";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
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
import { IUserIdentity } from "../Dashboard/DashboardPage";
import Loading from "../Admin/UI/Loading";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "becomeSomething", "doctorPanelBecomeDoctor"];

export type McCodepopulation = Population<{ User: UserPopulation }>;
export interface IMcCode<
  T extends McCodepopulation = McCodepopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  mcCode: string;
  createdAt: Date;
  title?: string;
  city?: string;
  acquiredAt?: string;
}

const becomeDoctorStages = ["inquiry", "confirm", "done"] as const;

type BecomeDoctorStage = (typeof becomeDoctorStages)[number];

const becomeDoctorStageContentKeyDict: Record<BecomeDoctorStage, ContentKey> = {
  confirm: "confirmInfo",
  done: "finalizeRegister",
  inquiry: "inquiryDetails",
};

const InquiryStage = ({
  setStage,
}: {
  setStage: Dispatch<SetStateAction<BecomeDoctorStage>>;
}) => {
  const { data } = useSWR<IUserIdentity | null>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  if (data === undefined) return <Loading />;
  if (!data) return <p>{getContent("yourIdentityDataWasNotFound")}</p>;
  return (
    <div className={classes.form}>
      <Input
        readOnly
        defaultValue={data.nationalId}
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
        <Button
          variant="Primary"
          mode="Fill"
          radius="High"
          size="L"
          isLoading={isLoading}
          onClick={() => setIsLoading(true)}
        >
          {getContent("inquiryAndContinue")}
        </Button>
        <span className={`${classes.notice} ${t2xsRegular}`}>
          {getContent("becomeDoctorInquiryNotice")}
        </span>
      </div>
      <Act
        path={isLoading ? `${API}/doctor/request` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          setStage("confirm");
        }}
      />
    </div>
  );
};

const ConfirmStage = ({ onDone }: { onDone: () => unknown }) => {
  const { data, error } = useSWR<IMcCode[]>(
    `${API}/doctor/request`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const [isLoading, setIsLoading] = useState<IMcCode | null>(null);

  const { data: identity } = useSWR<IUserIdentity | null>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data && !!identity} error={error}>
      {!!data && (
        <div className={classes.confirm}>
          <div className={classes.wrap}>
            <Input
              title={getContent("firstName")}
              readOnly={true}
              defaultValue={identity?.givenName}
            />
            <Input
              title={getContent("lastName")}
              readOnly={true}
              defaultValue={identity?.lastName}
            />
          </div>
          <div className={classes.list}>
            {data.map((code) => (
              <div key={code._id} className={classes.code}>
                <div className={classes.wrap}>
                  <Input
                    title={getContent("mcCode")}
                    defaultValue={code.mcCode}
                    readOnly={true}
                  />
                  <Input
                    title={getContent("mcTitle")}
                    defaultValue={code.title}
                    readOnly={true}
                  />
                </div>
                <div className={classes.wrap}>
                  <Input
                    title={getContent("mcAcquiredAt")}
                    defaultValue={code.acquiredAt}
                    readOnly={true}
                  />
                  <Input
                    title={getContent("mcCity")}
                    defaultValue={code.city}
                    readOnly={true}
                  />
                </div>
                <Button
                  onClick={() => setIsLoading(code)}
                  isLoading={!!isLoading}
                >
                  {getContent("confirmIncomingData")}
                </Button>
              </div>
            ))}
          </div>
          <Act
            path={isLoading ? `${API}/doctor/request/${isLoading._id}` : null}
            method="PUT"
            onDone={(status) => {
              setIsLoading(null);
              if (!status) return;
              onDone();
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
};

const DoneStage = () => {
  const { doctor } = useDoctor();

  if (!doctor) return null;
  return <BecomeDoneView title="becomeDoctorDone" target="/doctorpanel" />;
};

const BecomeADoctorPage = () => {
  const { data } = useSWR<IMcCode[]>(`${API}/doctor/request`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { doctor, isLoading, mutate } = useDoctor();

  const getContent = useScopedLocale(NS);

  const [stage, setStage] = useState<BecomeDoctorStage>("inquiry");

  useEffect(() => {
    if (doctor) return setStage("done");
    if (!!data?.length) return setStage("confirm");
  }, [data?.length, doctor]);

  return (
    <HandleLoading data={!isLoading}>
      <div className={classes.main}>
        <div className={classes.tabs}>
          {becomeDoctorStages.map((s, i) => (
            <div
              className={`${classes.stage} ${tsmRegular} ${becomeDoctorStages.indexOf(stage) >= i ? classes.activeStage : ""}`}
              key={s}
            >
              <span>{i + 1}</span>
              <span>{getContent(becomeDoctorStageContentKeyDict[s])}</span>
            </div>
          ))}
        </div>
        {stage === "inquiry" && <InquiryStage setStage={setStage} />}
        {stage === "confirm" && <ConfirmStage onDone={mutate} />}
        {stage === "done" && <DoneStage />}
      </div>
    </HandleLoading>
  );
};

export default BecomeADoctorPage;
