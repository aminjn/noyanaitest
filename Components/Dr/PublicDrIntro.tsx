import Image from "next/image";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./PublicDrIntro.module.css";
import PublicDrSessions from "./PublicDrSessions";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { imagePath } from "../helpers/imagepath";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import Ixon from "../UI/Ixon";
import CupIcon from "../Icons/CupIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import LocationIcon from "../Icons/LocationIcon";
import StarIcon from "../Icons/StarIcon";
import { ReactNode } from "react";
import ClockIcon from "../Icons/ClockIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";

const Point = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) => {
  return (
    <li className={classes.point}>
      <div className={classes.pointHeader}>
        <Ixon width="1.625rem">{icon}</Ixon>
        <legend>{title}</legend>
      </div>
      <p className={classes.pointDescription}>{description}</p>
    </li>
  );
};

export const PublicDrIntroInner = () => {
  return;
};

const PublicDrIntro = ({
  doctor,
}: {
  doctor: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.details}>
        <div className={classes.identity}>
          <div className={classes.image}>
            <Image
              alt={getDoctorProfileLabel(doctor)}
              src={imagePath(doctor.avatar)}
              fill
              sizes="10rem"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={classes.identityDetails}>
            <div className={classes.identityHeader}>
              <h1 className={classes.name}>{getDoctorProfileLabel(doctor)}</h1>
              {/* TODO: calculate this */}
              <span className={classes.successRate}>
                <Ixon width=".875rem">
                  <CupIcon />
                </Ixon>
                <span>{`98% ${getContent("patientsChoiceRate")}`}</span>
              </span>
            </div>
            <div className={classes.identityMiddle}>
              {doctor.mainSpeciality && (
                <Link
                  href={`/speciality/${
                    doctor.mainSpeciality.slug || doctor.mainSpeciality.name
                  }`}
                  className={classes.speciality}
                >
                  {doctor.mainSpeciality.name}
                </Link>
              )}
              {/* TODO: Calculate this */}
              <span className={classes.succeededSessions}>
                <Ixon width=".875rem">
                  <CheckCircleIcon />
                </Ixon>
                <span>{`233 ${getContent("succeededAppointmentsCount")}`}</span>
              </span>
            </div>
            {doctor.address && (
              <div className={classes.address}>
                <Ixon width="1rem">
                  <LocationIcon />
                </Ixon>
                <p>{doctor.address}</p>
              </div>
            )}
          </div>
        </div>
        {/* TODO: calculate this */}
        <div className={classes.topReview}>
          <div className={classes.score}>
            <span className={classes.scoreValue}>4.93</span>
            <div className={classes.stars}>
              <Ixon width="1.25rem">
                <StarIcon />
              </Ixon>
              <Ixon width="1.25rem">
                <StarIcon />
              </Ixon>
              <Ixon width="1.25rem">
                <StarIcon />
              </Ixon>
              <Ixon width="1.25rem">
                <StarIcon />
              </Ixon>
              <Ixon width="1.25rem">
                <StarIcon />
              </Ixon>
            </div>
            <span className={classes.reviewCount}>{`21 ${getContent(
              "reviewsCount"
            )}`}</span>
          </div>
          <div className={classes.reviewContent}>
            <p className={classes.reviewText}>
              دکتر بسیار دقیق، باحوصله و دلسوز هستند. در تمام مراحل درمان با دقت
              به سوالاتم پاسخ دادند و حس آرامش و اطمینان را منتقل کردند. از
              تجربه مشاوره با ایشان کاملاً رضایت دارم و حتماً توصیه می‌کنم.
            </p>
            <button className={classes.allComments}>
              {getContent("seeAllReviews")}
            </button>
          </div>
        </div>
        <nav className={classes.navs}>
          <button className={`${classes.nav} ${classes.activeNav}`}>
            {getContent("boldPoints")}
          </button>
          <button className={classes.nav}>{getContent("introduction")}</button>
          <button className={classes.nav}>{getContent("socialMedia")}</button>
          <button className={classes.nav}>{getContent("comments")}</button>
          <button className={classes.nav}>{getContent("faq")}</button>
        </nav>
        <ul className={classes.points}>
          {/* TODO:Calculate this */}
          <Point
            icon={<CupIcon />}
            title="۹۸% انتخاب بیمار ها"
            description="۹۸٪ بیماران به این دکتر امتیاز ۴٫۹۳ از ۵ داده‌اند"
          />
          <Point
            icon={<ClockIcon />}
            title="مدت انتظار بسیار کم"
            description="۱۰۰٪ بیماران کمتر از ۳۰ دقیقه منتظر مانده‌اند"
          />
        </ul>
        <div className={classes.notice}>
          <div className={classes.noticeHeader}>
            <Ixon width="1.5rem">
              <ShieldCheckIcon />
            </Ixon>
            <legend>
              این ارائه‌دهنده نیاز به پرداخت هزینه توسط خود بیمار دارد.
            </legend>
          </div>
          <p className={classes.noticeText}>
            ممکن است در زمان مراجعه، مسئول پرداخت کل هزینه‌ی ویزیت خود باشید.
            ممکن است واجد شرایط دریافت بخشی از هزینه از بیمه خود
            باشید.ارائه‌دهنده‌ی دیگری پیدا کنید.
          </p>
          <p className={classes.noticeText}>
            ممکن است لازم باشد هنگام ویزیت، کل هزینه را پرداخت کنید. ممکن است
            بیمه شما بخشی از هزینه را بازپرداخت کند.می‌توانید ارائه‌دهنده‌ی
            دیگری انتخاب کنید.
          </p>
        </div>
      </div>
      <PublicDrSessions doctor={doctor} />
    </div>
  );
};

export default PublicDrIntro;
