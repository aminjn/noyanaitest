import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import classes from "./HomeRegister.module.css";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import cunt1 from "./cunts/cunt1.jpg";
import cunt2 from "./cunts/cunt2.jpg";
import cunt3 from "./cunts/cunt3.jpg";
import cunt4 from "./cunts/cunt4.jpg";
import cunt5 from "./cunts/cunt5.jpg";
import cunt6 from "./cunts/cunt6.jpg";
import Image from "next/image";
import registerImage from "./register.png";
import {
  t2xsRegular,
  t3xlDemiBold,
  tmdMedium,
  tsmMedium,
  txlRegular,
} from "../UI/Typography";

const cunts = [cunt1, cunt2, cunt3, cunt4, cunt5, cunt6];

const HomeRegister = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <h3 className={`${classes.title} ${t3xlDemiBold}`}>
          {getContent("registerTitle")}
        </h3>
        <p className={`${classes.description} ${txlRegular}`}>
          {getContent("registerDescription")}
        </p>
        <Link href={"/become"} className={classes.action}>
          <span className={tmdMedium}>
            {getContent("registerDoctorsAndClinics")}
          </span>
          <Ixon width="1.5rem">
            <ArrowLeftIcon />
          </Ixon>
        </Link>
        <div className={classes.cuntsBox}>
          <div className={classes.cunts}>
            {cunts.map((cunt, i) => (
              <div className={classes.cunt} key={`Cunt${i}`}>
                <Image
                  src={cunt}
                  alt="our lovely user"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="2.5rem"
                />
              </div>
            ))}
            <span className={`${classes.tenk} ${tsmMedium}`}>+10k</span>
          </div>
          <span className={`${classes.cuntsDescription} ${t2xsRegular}`}>
            {getContent("weHaveTooManyUsers")}
          </span>
        </div>
      </div>
      <div className={classes.imageBox}>
        <div className={classes.image}>
          <Image
            src={registerImage}
            alt="Noyan Registeration"
            fill
            style={{ objectFit: "contain" }}
            sizes="32rem"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeRegister;
