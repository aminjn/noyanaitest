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

export const useAccessLevelState = () => {
  const { user } = useUser();
  const { data, isLoading } = useSWR<IAccessLevel>(
    user?.role !== "user" ? `${API}/admin` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const hasAccess = useCallback(
    (model: AccessLevelModel, op: AccessOperation) => !!data?.[model]?.[op],
    [data]
  );

  return { hasAccess, isLoading };
};

const useAccessLevel = () => useAccessLevelState().hasAccess;

export default useAccessLevel;
