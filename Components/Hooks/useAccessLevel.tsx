import useSWR from "swr";
import useUser from "./useUser";
import { API } from "../config";
import {
  AccessLevelModel,
  AccessOperation,
  IAccessLevel,
} from "../Admin/AccessLevel/AdminManageAccessLevelsPage";
import { useCallback } from "react";
import { fetcher } from "../helpers/fetcher";

const useAccessLevel = () => {
  const { user } = useUser();
  const { data } = useSWR<IAccessLevel>(
    user?.role !== "user" ? `${API}/admin` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const hasAccess = useCallback(
    (model: AccessLevelModel, op: AccessOperation) => !!data?.[model]?.[op],
    [data]
  );

  return hasAccess;
};

export default useAccessLevel;
