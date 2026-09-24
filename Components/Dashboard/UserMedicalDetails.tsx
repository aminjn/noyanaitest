import classes from "./UserMedicalDetails.module.css";

import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import IconButton from "../Admin/UI/IconButton";
import EditIcon from "../Icons/EditIcon";
import usePopup from "../Hooks/usePopup";
import MutateUserMedicalPopup from "./MutateUserMedicalPopup";

const NS: ContentNamespace[] = ["common", "dashboardUserMedicalDetails"];

export const bloodTypes = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodType = (typeof bloodTypes)[number];

export type MedicalDetailPopulation = Population<{ User: UserPopulation }>;

export interface IMedicalDetail<
  T extends MedicalDetailPopulation = MedicalDetailPopulation
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  height?: number;
  weight?: number;
  bloodType?: BloodType;
}
const UserMedicalDetails = ({
  data,
  mutate,
}: {
  data: IMedicalDetail | undefined;
  mutate?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <span className={classes.title}>{getContent("medicalDetails")}</span>
        {!!mutate && data && (
          <IconButton
            onClick={() =>
              setPopup(
                "MutateUserMedical",
                <MutateUserMedicalPopup mutate={mutate} node={data} />
              )
            }
          >
            <EditIcon />
          </IconButton>
        )}
      </div>
      <div className={classes.items}>
        <div className={classes.item}>
          <span className={classes.label}>{getContent("bloodType")}</span>
          <span className={classes.value}>
            {data?.bloodType ? data?.bloodType : getContent("noData")}
          </span>
        </div>
        <div className={classes.item}>
          <span className={classes.label}>{getContent("height")}</span>
          <span className={classes.value}>
            {data?.height ? `${data.height} cm` : getContent("noData")}
          </span>
        </div>
        <div className={classes.item}>
          <span className={classes.label}>{getContent("weight")}</span>
          <span className={classes.value}>
            {data?.weight ? `${data.weight} kg` : getContent("noData")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserMedicalDetails;
