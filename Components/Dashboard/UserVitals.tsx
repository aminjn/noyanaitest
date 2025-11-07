import classes from "./UserVitals.module.css";
import { IUserVital } from "../Hooks/useUser";
import Image, { StaticImageData } from "next/image";
import BloodOxygen from "./_Assets/BloodOxygen.png";
import BloodPressure from "./_Assets/BloodPressure.png";
import BodyTemp from "./_Assets/BodyTemp.png";
import HeartRate from "./_Assets/HeartRate.png";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";

const VitalCard = ({
  image,
  title,
  value,
  unit,
}: {
  image: StaticImageData;
  title: ContentKey;
  value: number | string | undefined;
  unit: ContentKey;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.card}>
      <div className={classes.image}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="10rem"
          style={{ objectFit: "contain" }}
        />
      </div>
      <span className={classes.title}>{getContent(title)}</span>
      {value === undefined ? (
        <span className={classes.noData}>{getContent("noData")}</span>
      ) : (
        <div className={classes.valueBox}>
          <span className={classes.value}>{value}</span>
          <span className={classes.unit}>{getContent(unit)}</span>
        </div>
      )}
    </div>
  );
};

const UserVitals = ({
  vitals,
  patient,
}: {
  vitals?: IUserVital | null;
  patient?: string;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <span className={classes.mainTitle}>{getContent("vitals")}</span>
        <Link
          className={classes.more}
          href={
            patient
              ? `/doctorpanel/patient/${patient}/vital`
              : `/dashboard/vital`
          }
        >
          {getContent("vitalHistory")}
        </Link>
      </div>
      <div className={classes.main}>
        <VitalCard
          image={HeartRate}
          title="heartRate"
          unit="perMinute"
          value={vitals?.heartRate}
        />
        <VitalCard
          image={BloodOxygen}
          title="bloodOxygen"
          unit="percent"
          value={vitals?.bloodOxygen}
        />
        <VitalCard
          image={BodyTemp}
          title="bodyTemperature"
          unit="celsius"
          value={vitals?.bodyTemp}
        />
        <VitalCard
          image={BloodPressure}
          title="bloodPressure"
          unit="mmHg"
          value={vitals?.bloodPressure}
        />
      </div>
    </div>
  );
};

export default UserVitals;
