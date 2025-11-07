import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
import { PublicDoctorProfilePageProps } from "./PublicDoctorProfilePage";

import classes from "./DrIntroduction.module.css";
import Ixon from "../UI/Ixon";
import BarcodeIcon from "../Icons/BarcodeIcon";
import MedalStarIcon from "../Icons/MedalStarIcon";
import DoctorGallery from "./DoctorGallery";
import { socialMediaIcons } from "../DoctorPanel/Profile/DoctorManageSocialMediaTab";
import LinkIcon2 from "../Icons/LinkIcon2";
import DoctorOfficeItem from "./DoctorOfficeItem";
import InfoPair from "./InfoPair";

const DrIntroduction = ({
  doctor,
}: {
  doctor: PublicDoctorProfilePageProps["doctor"];
}) => {
  console.log(doctor);

  const getContent = useLocale();
  return (
    <section className={classes.main}>
      <h2 className={classes.h2}>{getContent("introduction")}</h2>
      <div className={classes.section}>
        <div className={classes.introHeader}>
          <h3 className={classes.h3}>{`${getContent("about")} ${
            doctor.firstName || ""
          } ${doctor.lastName || ""}`}</h3>
          {!!doctor.mcCode && (
            <span className={classes.mc}>
              <Ixon width="1.5rem">
                <BarcodeIcon />
              </Ixon>
              <span>{`${getContent("medicalSystemCode")} ${
                doctor.mcCode.mcCode
              }`}</span>
            </span>
          )}
        </div>
        <p className={classes.about}>{doctor.introduction}</p>
      </div>
      {!!doctor.services.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("services")}</h3>
          <ul className={classes.services}>
            {doctor.services.map((service, i) => (
              <li key={`${service}${i}`} className={classes.service}>
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!doctor.achivements.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("achivements")}</h3>
          <ul className={classes.achivements}>
            {doctor.achivements.map((achivement, i) => (
              <li className={classes.achivement} key={`${achivement}${i}`}>
                <Ixon className={classes.achivementIcon} width="1.25rem">
                  <MedalStarIcon />
                </Ixon>
                <span>{achivement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!doctor.gallery.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("gallery")}</h3>
          <DoctorGallery
            items={doctor.gallery
              .filter((el) => el.image)
              .map((el) => ({ src: el.image || "", alt: el.alt || "" }))}
          />
        </div>
      )}
      {(!!doctor.website || !!doctor.offices.length) && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("contactInfo")}</h3>
          {!!doctor.website && (
            <InfoPair
              icon={<LinkIcon2 />}
              title={getContent("doctorWebsite")}
              value={doctor.website}
            />
          )}
          {!!doctor.offices.length && (
            <ul className={classes.offices}>
              {doctor.offices.map((office) => (
                <DoctorOfficeItem key={office._id} office={office} />
              ))}
            </ul>
          )}
        </div>
      )}
      {!!doctor.socials.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("socialMedias")}</h3>
          <ul className={classes.socials}>
            {doctor.socials.map((social) => (
              <li className={classes.social} key={social._id}>
                <a
                  rel="nofollow"
                  className={classes.socialLink}
                  href={social.target}
                >
                  <span>{social.target}</span>
                  <Ixon width="2rem">{socialMediaIcons[social.media]}</Ixon>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DrIntroduction;
