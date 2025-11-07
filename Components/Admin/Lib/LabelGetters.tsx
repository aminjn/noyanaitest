import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IUser } from "@/Components/Hooks/useUser";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import { IAccessLevel } from "../AccessLevel/AdminManageAccessLevelsPage";
import { IClinic, IClinicDepartment } from "../Clinic/AdminManageClinicsPage";
import { IDoctorSecretaryAccessLevel } from "../DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import { Acl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

export const getUserLabel = (node: IUser): string => node.phone || node._id;

export const getDoctorProfileLabel = (node: IDoctorProfile): string =>
  `${node?.firstName || ""} ${node?.lastName || ""}`.trim() || node?._id;

export const getDoctorLabel = (node: IDoctor): string => node.name || node._id;

export const getAccessLevelLabel = (node: IAccessLevel): string =>
  node.name || node._id;

export const getClinicDepartmentLabel = (node: IClinicDepartment): string =>
  node.name || node._id;

export const getClinicLabel = (node: IClinic): string => node.name || node._id;

//TODO: remove this
export const getDoctorSecretaryAccessLavelLabel = (
  node: IDoctorSecretaryAccessLevel
): string => node.name || node._id;

export const getAclLabel = (node: Acl<[], unknown>): string =>
  node.name || node._id;
