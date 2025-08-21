import useSWR from "swr";
import classes from "./useDoctorAcl.module.css";
import {
  DoctorSecretaryAction,
  IDoctorSecretaryAccessLevel,
} from "../Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { useCallback } from "react";

const useDoctorAcl = () => {
  const { data } = useSWR<IDoctorSecretaryAccessLevel | "FULL">(
    `${API}/doctor/acl`,
    (url: string) => fetcher({ url }).then((res) => res.data.access)
  );

  const hasAccess = useCallback(
    (action?: DoctorSecretaryAction): boolean => {
      if (!data) return false;
      if (data === "FULL") return true;
      if (!action) return false;
      return !!data[action];
    },
    [data]
  );

  return hasAccess;
};

export default useDoctorAcl;
