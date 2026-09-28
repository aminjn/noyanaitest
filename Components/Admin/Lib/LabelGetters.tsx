import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { IUser } from "@/Components/Hooks/useUser";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import { IAccessLevel } from "../AccessLevel/AdminManageAccessLevelsPage";
import { IClinic, IClinicDepartment } from "../Clinic/AdminManageClinicsPage";
import {
  IHospital,
  IHospitalDepartment,
} from "../Hospital/AdminManageHospitalsPage";
import { IDoctorSecretaryAccessLevel } from "../DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
// Every getter tolerates a missing record (a deleted user / doctor behind
// a reference) - a label must never take the page down.
// import { Acl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

export const getUserLabel = (node?: IUser | null): string =>
  node?.phone || node?._id || "—";

export const getDoctorProfileLabel = (node?: IDoctorProfile | null): string =>
  `${node?.firstName || ""} ${node?.lastName || ""}`.trim() || node?._id || "—";

export const getDoctorLabel = (node?: IDoctor | null): string =>
  node?.name || node?._id || "—";

export const getAccessLevelLabel = (node?: IAccessLevel | null): string =>
  node?.name || node?._id || "—";

export const getClinicDepartmentLabel = (node?: IClinicDepartment | null): string =>
  node?.name || node?._id || "—";

export const getClinicLabel = (node?: IClinic | null): string =>
  node?.name || node?._id || "—";

export const getHospitalDepartmentLabel = (node?: IHospitalDepartment | null): string =>
  node?.name || node?._id || "—";

export const getHospitalLabel = (node?: IHospital | null): string =>
  node?.name || node?._id || "—";

//TODO: remove this
export const getDoctorSecretaryAccessLavelLabel = (
  node?: IDoctorSecretaryAccessLevel | null,
): string => node?.name || node?._id || "—";

// export const getAclLabel = (node: Acl<[], unknown>): string =>
//   node.name || node._id;
