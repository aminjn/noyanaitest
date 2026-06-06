import Image from "next/image";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardBooking.module.css";
import { FilePath } from "../config";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import MoreMenusButton from "../UI/MoreMenusButton";
import Ixon from "../UI/Ixon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import useLocale from "../Hooks/useLocale";
import Badge from "../UI/Badge";

const DoctorCardBooking = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.identity}>
        <div className={classes.image}>
          <Image
            src={`${FilePath}/${node.avatar}`}
            alt={getDoctorProfileLabel(node)}
            fill
            style={{ objectFit: "cover" }}
            sizes="3.5rem"
          />
        </div>
        <div className={classes.identityDetails}>
          <span className={classes.name}>{getDoctorProfileLabel(node)}</span>
          {!!node.mainSpeciality && (
            <span className={classes.speciality}>
              {node.mainSpeciality?.name}
            </span>
          )}
        </div>
      </div>
      <div className={classes.scores}>
        <div className={classes.star}></div>
        <div className={classes.costumers}></div>
        <MoreMenusButton />
      </div>
      {/* TODO: make this */}
      <div className={classes.tags}>
        <span>tag1</span>
        <span>tag2</span>
        <span>tag3</span>
        <span>tag4</span>
        <span>tag5</span>
      </div>
      <div className={classes.onlines}>
        <div className={classes.inlineHeader}>
          <div className={classes.inlineTitle}>
            <Ixon width="1rem">
              <Calendar02Icon />
            </Ixon>
            <span>{getContent("onlineConsult")}</span>
          </div>
        </div>
        <div className={classes.badges}>
          <Badge>{getContent("videoCall")}</Badge>
        </div>
      </div>
      <div className={classes.inPersons}></div>
      <div className={classes.sessions}></div>
      <div className={classes.actions}></div>
    </div>
  );
};

export default DoctorCardBooking;
