import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CallCallingIcon from "../Icons/CallCallingIcon";
import PeopleIcon from "../Icons/PeopleIcon";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import Ixon from "../UI/Ixon";
import { tbaseMedium, tsmBold, txsMedium, txsRegular } from "../UI/Typography";
import classes from "./MedicalCenterDepartments.module.css";
import IconTitle from "../UI/IconTitle";
import Link from "@/Components/i18n/Link";
import BuildingIcon from "../Icons/BuildingIcon";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

export type MedicalCenterDepartmentItemProps = {
  name?: string;
  // the department's own page (a hospital's clinic), when it has one
  href?: string;
  summary?: string;
  phone?: string;
  doctors: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
};

const DepartmentItem = ({
  name,
  href,
  summary,
  phone,
  doctors,
  doctorsTitle,
}: MedicalCenterDepartmentItemProps & { doctorsTitle: ContentKey }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.item}>
      <div className={classes.header}>
        <legend className={`${classes.name} ${tsmBold}`}>
          {href ? <Link href={href}>{name}</Link> : name}
        </legend>
        {!!summary && (
          <span className={`${classes.summary} ${txsRegular}`}>{summary}</span>
        )}
      </div>
      <div className={classes.infos}>
        <div className={classes.info}>
          <span
            className={`${classes.infoTitle} ${txsRegular}`}
          >{`${getContent("doctors")}: `}</span>
          <span className={`${classes.infoValue} ${tbaseMedium}`}>
            {getContent("nPerson", [doctors.length.toString()])}
          </span>
        </div>
      </div>
      {!!phone && (
        <div className={`${classes.phone} ${txsMedium}`}>
          <Ixon width=".75rem">
            <CallCallingIcon />
          </Ixon>
          <a href={`tel:${phone}`}>{phone}</a>
        </div>
      )}
      {!!doctors.length && (
        <div className={classes.doctorsBox}>
          <div className={classes.doctorsHeader}>
            <Ixon width=".75rem">
              <PeopleIcon />
            </Ixon>
            {/* <span>{getContent("doctorsInThisDepartment")}</span> */}
            <span>{getContent(doctorsTitle)}</span>
          </div>
          <div className={classes.doctorsList}>
            {doctors.filter(Boolean).map((doctor) => (
              <DoctorCardAlt
                key={doctor._id}
                variant="row"
                node={doctor as Parameters<typeof DoctorCardAlt>[0]["node"]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MedicalCenterDepartments = ({
  departments,
  title,
}: {
  title: ContentKey;
  departments: MedicalCenterDepartmentItemProps[];
}) => {
  const getContent = useScopedLocale(NS);

  if (!departments.length) return null;
  return (
    <div className={classes.main} id="departments">
      <IconTitle
        icon={<BuildingIcon />}
      >{`${getContent(title)} (${departments.length})`}</IconTitle>
      <div className={classes.list}>
        {departments.map((el, i) => (
          <DepartmentItem
            {...el}
            doctorsTitle={"doctorsInThisDepartment"}
            key={`${el.name} ${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterDepartments;
