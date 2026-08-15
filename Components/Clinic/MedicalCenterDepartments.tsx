import { Fragment } from "react";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import CallCallingIcon from "../Icons/CallCallingIcon";
import PeopleIcon from "../Icons/PeopleIcon";
import Ixon from "../UI/Ixon";
import {
  tbaseMedium,
  tsmBold,
  tsmRegular,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import classes from "./MedicalCenterDepartments.module.css";
import Image from "next/image";
import { FilePath } from "../config";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import StarIcon from "../Icons/StarIcon";
import IconTitle from "../UI/IconTitle";
import BuildingIcon from "../Icons/BuildingIcon";

export type MedicalCenterDepartmentItemProps = {
  name?: string;
  summary?: string;
  phone?: string;
  doctors: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
};

const DepartmentItem = ({
  name,
  summary,
  phone,
  doctors,
  doctorsTitle,
}: MedicalCenterDepartmentItemProps & { doctorsTitle: ContentKey }) => {
  const getContent = useLocale();

  return (
    <div className={classes.item}>
      <div className={classes.header}>
        <legend className={`${classes.name} ${tsmBold}`}>{name}</legend>
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
          <span>{phone}</span>
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
            {doctors.map((doctor) => (
              <Fragment key={doctor._id}>
                {!!doctor ? (
                  <div className={classes.doctor}>
                    <div className={classes.image}>
                      <Image
                        fill
                        src={`${FilePath}/${doctor?.avatar}`}
                        alt={getDoctorProfileLabel(doctor)}
                      />
                    </div>
                    <div className={classes.doctorContent}>
                      <span className={`${classes.doctorName} ${tsmBold}`}>
                        {getDoctorProfileLabel(doctor)}
                      </span>
                      {!!doctor?.mainSpeciality && (
                        <span className={`${classes.speciality} ${tsmRegular}`}>
                          {doctor.mainSpeciality.name}
                        </span>
                      )}
                    </div>
                    <div className={`${classes.score} ${tsmRegular}`}>
                      <span>4.9</span>
                      <Ixon width=".675rem">
                        <StarIcon />
                      </Ixon>
                    </div>
                  </div>
                ) : null}
              </Fragment>
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
  const getContent = useLocale();

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
