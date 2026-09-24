import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { PublicDoctorProfilePageProps } from "./PublicDoctorProfilePage";

import classes from "./DrIntroduction.module.css";
import Ixon from "../UI/Ixon";
import BarcodeIcon from "../Icons/BarcodeIcon";
import MedalStarIcon from "../Icons/MedalStarIcon";
import DoctorGallery, { GalleryItems } from "./DoctorGallery";
import {
  SocialMedia,
  socialMediaIcons,
} from "../DoctorPanel/Profile/DoctorManageSocialMediaTab";
import LinkIcon2 from "../Icons/LinkIcon2";
import DoctorOfficeItem, { OfficeItemInner } from "./DoctorOfficeItem";
import InfoPair from "./InfoPair";
import { Fragment } from "react";
import WebsiteIcon from "../Icons/WEbsiteIcon";
import LandLineIcon from "../Icons/LandlineIcon";
import MobileIcon from "../Icons/MobileIcon";

const NS: ContentNamespace[] = ["common", "drProfile"];

export const DrIntroductionInner = ({
  name,
  profile,
  introduction,
  gallery,
  website,
  socials,
  landLine,
  mobile,
  coords,
}: {
  profile?: PublicDoctorProfilePageProps["doctor"];
  name: string;
  introduction?: string;
  gallery?: GalleryItems;
  website?: string;
  socials?: { kind: SocialMedia; target?: string }[];
  landLine?: string;
  mobile?: string;
  coords?: [number, number];
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <section className={classes.main}>
      <h2 className={classes.h2}>{getContent("introduction")}</h2>
      <div className={classes.section}>
        <div className={classes.introHeader}>
          <h3 className={classes.h3}>{`${getContent("about")} ${name}`}</h3>
          {!!profile?.mcCode && (
            <span className={classes.mc}>
              <Ixon width="1.5rem">
                <BarcodeIcon />
              </Ixon>
              <span>{`${getContent("medicalSystemCode")} ${
                profile.mcCode
              }`}</span>
            </span>
          )}
        </div>
        <p className={classes.about}>{introduction}</p>
      </div>
      {!!profile?.services.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("services")}</h3>
          <ul className={classes.services}>
            {profile?.services.map((service, i) => (
              <li key={`${service}${i}`} className={classes.service}>
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!profile?.achivements.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("achivements")}</h3>
          <ul className={classes.achivements}>
            {profile.achivements.map((achivement, i) => (
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
      {!!gallery?.length && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("gallery")}</h3>
          <DoctorGallery items={gallery} />
        </div>
      )}
      {(!!website || !!profile?.offices.length) && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("contactInfo")}</h3>
          <OfficeItemInner
            coords={coords}
            items={[
              {
                icon: <WebsiteIcon />,
                title: getContent("doctorWebsite"),
                value: website,
                target: website,
              },
              {
                icon: <LandLineIcon />,
                title: getContent("landLine"),
                value: landLine,
                target: `tel:${landLine}`,
              },
              {
                icon: <MobileIcon />,
                title: getContent("mobileNumber"),
                value: mobile,
                target: `tel:${mobile}`,
              },
            ]}
          />
          {!!profile?.offices.length && (
            <ul className={classes.offices}>
              {profile.offices.map((office) => (
                <DoctorOfficeItem key={office._id} office={office} />
              ))}
            </ul>
          )}
        </div>
      )}
      {(!!profile?.socials.length || !!socials?.length) && (
        <div className={classes.section}>
          <h3 className={classes.h3}>{getContent("socialMedias")}</h3>
          <ul className={classes.socials}>
            {!!profile &&
              profile.socials.map((social) => (
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
            {!!socials &&
              socials.map((social) => (
                <Fragment key={social.target}>
                  {!!social.target ? (
                    <li className={classes.social}>
                      <a
                        rel="nofollow"
                        className={classes.socialLink}
                        href={social.target}
                      >
                        <span>{social.target}</span>
                        <Ixon width="2rem">
                          {socialMediaIcons[social.kind]}
                        </Ixon>
                      </a>
                    </li>
                  ) : null}
                </Fragment>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
};

const DrIntroduction = ({
  doctor,
}: {
  doctor: PublicDoctorProfilePageProps["doctor"];
}) => {
  return (
    <DrIntroductionInner
      profile={doctor}
      name={`${doctor.firstName || ""} ${doctor.lastName || ""}`}
      gallery={doctor.gallery
        .filter((el) => el.image)
        .map((el) => ({ src: el.image || "", alt: el.alt || "" }))}
      introduction={doctor.introduction}
      website={doctor.website}
    />
  );
};

export default DrIntroduction;
