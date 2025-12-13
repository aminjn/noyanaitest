import classes from "./PatientFiles.module.css";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { IUserFile, UserFilePopulation } from "@/Components/Chat/ChatSidebar";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import NewPatientFilePopup from "./NewPatientFilePopup";
import FormatDate from "@/Components/UI/FormatDate";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import {
  GenderSpecificOption,
  IPart,
  PartPopulation,
} from "@/Components/Admin/Disease/AdminManageDiseasesPage";

type SymptomPopulation = Population<{
  Part: PartPopulation;
  SameAs: SymptomPopulation;
}>;
export interface ISymptom<T extends SymptomPopulation = SymptomPopulation>
  extends MongoDoc {
  name?: string;
  genderSpecific?: GenderSpecificOption;
  part: T["Part"] extends PartPopulation ? IPart<T["Part"]>[] : string[];
  summary?: string;
  description?: string;
  expectedPrognosis?: string;
  image?: string;
  naturalProgression?: string;
  pathophysiology?: string;
  sameAs: T["SameAs"] extends SymptomPopulation
    ? ISymptom<T["SameAs"]>[]
    : string[];
  possibleComplication?: string;
  order: number;
  slug?: string;
}

export type PatientProfilePopulation = Population<{
  User: UserPopulation;
  Doctor: DoctorProfilePopulation;
  Records: PatientProfileRecordPopulation;
}>;
export interface IPatientProfile<
  T extends PatientProfilePopulation = PatientProfilePopulation
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  createdAt: Date;
  title: string;
  description?: string;
  diagnosis?: string;
  records: T["Records"] extends PatientProfileRecordPopulation
    ? IPatientProfileRecord<T["Records"]>[]
    : never;
}

export type PatientProfileRecordPopulation = Population<{
  Profile: PatientProfilePopulation;
  File: UserFilePopulation;
  Author: DoctorProfilePopulation;
  Symptoms: SymptomPopulation;
}>;
export interface IPatientProfileRecord<
  T extends PatientProfileRecordPopulation = PatientProfileRecordPopulation
> extends MongoDoc {
  profile: T["Profile"] extends PatientProfilePopulation
    ? IPatientProfile<T["Profile"]>
    : string;
  createdAt: Date;
  title: string;
  description?: string;
  files: T["File"] extends UserFilePopulation ? IUserFile<T["File"]>[] : never;
  author: T["Author"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Author"]>
    : string;
  isPublic: boolean;
  symptoms: T["Symptoms"] extends SymptomPopulation
    ? ISymptom<T["Symptoms"]>[]
    : string[];
}

const PatientFiles = ({
  data,
  mutate,
  patientId,
}: {
  data: IPatientProfile<{ Doctor: Record<never, never> }>[];
  mutate?: () => unknown;
  patientId?: string;
}) => {
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <WithTitle
      title={getContent("patientFiles")}
      className={classes.main}
      actions={
        !!mutate && !!patientId
          ? [
              {
                title: getContent("newPatientFile"),
                action: () => {
                  setPopup(
                    "NewPatientFile",
                    <NewPatientFilePopup
                      mutate={mutate}
                      patientId={patientId}
                    />
                  );
                },
              },
            ]
          : undefined
      }
    >
      <Table
        data={data}
        renderer={{
          createdAt: {
            name: getContent("createdAt"),
            value: (node) => new Date(node.createdAt),
            component: (node) => <FormatDate value={node.createdAt} />,
            filter: "Date",
          },
          doctor: {
            name: getContent("doctor"),
            value: (node) => getDoctorProfileLabel(node.doctor),
            filter: "Multi",
          },
          title: {
            name: getContent("title"),
            value: (node) => node.title,
            filter: "Text",
          },
          diagnosis: {
            name: getContent("diagnosis"),
            value: (node) => node.diagnosis,
            filter: "Text",
          },
          actions: {
            name: getContent("actions"),
            component: (node) => (
              <TableActions>
                <IconLink href={`/doctorpanel/patient/${node._id}/profile`}>
                  <EyeIcon />
                </IconLink>
              </TableActions>
            ),
          },
        }}
        name="DoctorManagePatientProfiles"
      />
    </WithTitle>
  );
};

export default PatientFiles;
