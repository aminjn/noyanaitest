import useSWR from "swr";
import { API } from "../config";
import { useEffect } from "react";
import useProgress from "./useProgress";
import { fetcher } from "../helpers/fetcher";

export interface MongoDoc {
  _id: string;
}

export const userRoles = ["user", "admin", "notadmin"] as const;

export type UserRole = (typeof userRoles)[number];

export interface IUser extends MongoDoc {
  phone?: string;
  role: UserRole;
  userName?: string;
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
