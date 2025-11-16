import Image from "next/image";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorBookingCard.module.css";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "../UI/Ixon";
import CupIcon from "../Icons/CupIcon";
import useLocale from "../Hooks/useLocale";
import LocationIcon from "../Icons/LocationIcon";
import { imagePath } from "../helpers/imagepath";

const DoctorBookingCard = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.doctor}>
      <div className={classes.doctorImage}>
        <Image
          src={imagePath(node.avatar)}
          alt={getDoctorProfileLabel(node)}
          fill
          sizes="10rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.doctorContent}>
        <div className={classes.doctorHeader}>
          <span className={classes.doctorName}>
            {getDoctorProfileLabel(node)}
          </span>
          <span className={classes.rate}>
            <Ixon width=".875rem">
              <CupIcon />
            </Ixon>
            <span>{`98% ${getContent("patientsChoiceRate")}`}</span>
          </span>
        </div>
        <div className={classes.speciality}>{node.mainSpeciality?.name}</div>
        <p className={classes.address}>
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
          <span>{node.address}</span>
        </p>
      </div>
    </div>
  );
};

export default DoctorBookingCard;
