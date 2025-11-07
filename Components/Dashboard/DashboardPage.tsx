"use client";

import useSWR from "swr";
import useUser, {
  IUser,
  IUserVital,
  MongoDoc,
  UserPopulation,
} from "../Hooks/useUser";
import classes from "./DashboardPage.module.css";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { Gender } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import UserIdentity from "./UserIdentity";
import UserVitals from "./UserVitals";
import UserMedicalDetails, { IMedicalDetail } from "./UserMedicalDetails";

export type UserIdentityPopulation = Population<{ User: UserPopulation }>;

export interface IUserIdentity<
  T extends UserIdentityPopulation = UserIdentityPopulation
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  nationalId: string;
  givenName: string;
  lastName: string;
  gender: Gender;
  dateOfbirth: Date;
}

const DashboardPage = () => {
  const { user } = useUser();
  const { data: identity } = useSWR<IUserIdentity | null>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );
  const { data: vitals } = useSWR<IUserVital | null>(
    `${API}/user/vital`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { data: medicalDetail, mutate } = useSWR<IMedicalDetail>(
    `${API}/user/medical`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  return (
    <div className={classes.main}>
      <UserIdentity
        identity={identity}
        avatar={user?.avatar}
        username={user?.username}
        self
      />
      <UserVitals vitals={vitals} />
      <div>
        <UserMedicalDetails data={medicalDetail} mutate={mutate} />
      </div>
    </div>
  );
};

export default DashboardPage;
