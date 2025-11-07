import useSWR from "swr";
import { API } from "../config";
import { useEffect } from "react";
import useProgress from "./useProgress";
import { fetcher } from "../helpers/fetcher";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import {
  IUserIdentity,
  UserIdentityPopulation,
} from "../Dashboard/DashboardPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "../DoctorPanel/DoctorPanelPage";
import {
  IMedicalDetail,
  MedicalDetailPopulation,
} from "../Dashboard/UserMedicalDetails";

export interface MongoDoc {
  _id: string;
}

export const userRoles = ["user", "admin", "notadmin"] as const;

export type UserRole = (typeof userRoles)[number];

export type UserVitalPopulation = Population<{
  User: UserPopulation;
  Author: DoctorProfilePopulation;
}>;
export interface IUserVital<T extends UserVitalPopulation = UserVitalPopulation>
  extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  author: T["Author"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Author"]>
    : string;
  createdAt: Date;
  heartRate: number;
  bloodOxygen: number;
  bodyTemp: number;
  bloodPressure: number;
}

export type UserPopulation = Population<{
  Identity: UserIdentityPopulation;
  Vital: UserVitalPopulation;
  Medical: MedicalDetailPopulation;
}>;

export interface IUser<T extends UserPopulation = UserPopulation>
  extends MongoDoc {
  phone: string;
  role: UserRole;
  nationalId?: string;
  username?: string;
  avatar?: string;
  identity?: T["Identity"] extends UserIdentityPopulation
    ? IUserIdentity<T["Identity"]> | null
    : never;
  vital?: T["Vital"] extends UserVitalPopulation
    ? IUserVital<T["Vital"]> | null
    : never;
  medical: T["Medical"] extends MedicalDetailPopulation
    ? IMedicalDetail<T["Medical"]> | null
    : never;
}

const useUser = (require?: boolean | undefined) => {
  const push = useProgress();
  const {
    data: user,
    mutate: refreshUser,
    isLoading,
  } = useSWR<IUser>(`${API}/user`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  useEffect(() => {
    if (require === undefined) return;
    if (require) {
      if (!isLoading && !user) {
        push("/auth");
        return;
      }
      return;
    }
    if (user) push("/");
  }, [isLoading, push, require, user]);

  return { user, refreshUser, isUserLoading: isLoading };
};

export default useUser;
