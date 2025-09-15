import CreateForm from "@/Components/Admin/UI/CreateForm";
import classes from "./CreateSecretaryRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import {
  IClinic,
  Population,
} from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import PopupCard from "@/Components/UI/PopupCard";
import { getAclLabel } from "@/Components/Admin/Lib/LabelGetters";
import { clinicActions } from "@/Components/Enums/actions/clinicActions";
import { insuranceActions } from "@/Components/Enums/actions/insuranceActions";
import { doctorActions } from "@/Components/Enums/actions/doctorActions";
import { pharmacyActions } from "@/Components/Enums/actions/pharmacyActions";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { ISecretaryRequest } from "./SecretaryRequestsTab";

export type Acl<T extends readonly string[], S> = MongoDoc & {
  name: string;
  owner?: S;
} & Partial<Record<T[number], boolean>>;

export const nodesWithAcl = [
  "doctor",
  "insurance",
  "pharmacy",
  "clinic",
] as const;

export type NodeWithAcl = (typeof nodesWithAcl)[number];

export const secretaryNodePaths = [
  "DoctorProfile",
  "Clinic",
  "Insurance",
  "Pharmacy",
] as const;

export type SecretaryNodePath = (typeof secretaryNodePaths)[number];

export const secretaryAclPaths = [
  "DoctorAcl",
  "InsuranceAcl",
  "ClinicAcl",
  "PharmacyAcl",
] as const;

export type SecretaryAclPath = (typeof secretaryAclPaths)[number];

export const modelNameToAclName: Record<SecretaryNodePath, SecretaryAclPath> = {
  Clinic: "ClinicAcl",
  DoctorProfile: "DoctorAcl",
  Insurance: "InsuranceAcl",
  Pharmacy: "PharmacyAcl",
} as const;

export type ModelNameToModelType = {
  Clinic: IClinic;
  DoctorProfile: IDoctorProfile;
  Insurance: IInsurance;
  Pharmacy: IPharmacy;
};

export type ModelNameToAclModel = {
  Clinic: IClinicAcl;
  DoctorProfile: IDoctorAcl;
  Insurance: IInsuranceAcl;
  Pharmacy: IPharmacyAcl;
};

export type SecretaryPopulation = Population<{
  owner: true;
  Secretary: true;
  Acl: true;
}>;

export interface ISecretary<
  T extends SecretaryNodePath,
  K extends SecretaryPopulation = SecretaryPopulation
> extends MongoDoc {
  owner: K["owner"] extends true ? ModelNameToModelType[T] : string;
  secretary: K["Secretary"] extends true ? IUser : string;
  ownerPath: T;
  acl?: K["Acl"] extends true ? ModelNameToAclModel[T] : string;
  aclPath: (typeof modelNameToAclName)[T];
  displayName?: string;
}

export type InsuranceAction = (typeof insuranceActions)[number];
export type IInsuranceAcl = Acl<typeof insuranceActions, IInsurance>;

export type ClinicAction = (typeof clinicActions)[number];
export type IClinicAcl = Acl<typeof clinicActions, IClinic>;

export type DoctorAction = (typeof doctorActions)[number];
export type IDoctorAcl = Acl<typeof doctorActions, IDoctorProfile>;

export type PharmacyAction = (typeof pharmacyActions)[number];
export type IPharmacyAcl = Acl<typeof pharmacyActions, IPharmacy>;

const CreateSecretaryRequestPopup = ({
  mutate,
  name,
}: {
  mutate: () => unknown;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm<ISecretaryRequest<SecretaryNodePath>>
        className={classes.main}
        onCancel={() => closePopup()}
        renderer={{
          phone: { type: "text", title: getContent("phone") },
          displayName: { type: "text", title: getContent("displayName") },
          acl: {
            type: "nodes",
            path: `${API}/acl/${name}/acl`,
            title: getContent("accessLevel"),
            getOptionLabel: (node) => getAclLabel(node as Acl<[], unknown>),
            getOptionValue: (node) => (node as Acl<[], unknown>)._id,
            dataParser: (res) =>
              (res as Record<"data", Acl<[], unknown>[]>).data,
            clearable: true,
          },
          message: { type: "area", title: getContent("message") },
        }}
        hookProps={{
          path: `${API}/acl/${name}/secretaryrequest`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default CreateSecretaryRequestPopup;
