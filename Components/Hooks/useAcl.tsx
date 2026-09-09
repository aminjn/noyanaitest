import useSWR from "swr";
import { useCallback } from "react";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import {
  Acl,
  ClinicAction,
  DoctorAction,
  HospitalAction,
  InsuranceAction,
  NodeWithAcl,
  ParaClinicAction,
  PharmacyAction,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

type NodeActionMap = {
  doctor: DoctorAction;
  clinic: ClinicAction;
  insurance: InsuranceAction;
  pharmacy: PharmacyAction;
  paraClinic: ParaClinicAction;
  hospital: HospitalAction;
};

// Generic replacement for the old doctor-only useDoctorAcl: fetches the
// caller's current access level for a given panel (`${API}/acl/${name}`,
// same endpoint aclController.getMyCurrentAcl responds to with either
// "FULL" for the actual owner or their granted Acl document if they're
// logged in as a secretary) and returns a hasAccess(action?) checker. Used
// by every *Sidebar component to gate which nav items a secretary sees.
const useAcl = <T extends NodeWithAcl>(name: T) => {
  const { data } = useSWR<Acl<string[], unknown> | "FULL">(
    `${API}/acl/${name}`,
    (url: string) => fetcher({ url }).then((res) => res.data.access),
  );

  const hasAccess = useCallback(
    (action?: NodeActionMap[T]): boolean => {
      if (!data) return false;
      if (data === "FULL") return true;
      if (!action) return false;
      return !!data[action as string];
    },
    [data],
  );

  return hasAccess;
};

export default useAcl;
