import { useListSeparator } from "@/Components/i18n/navigation";
import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import Badge from "../UI/Badge";
import classes from "./ParaClinicAbout.module.css";
import { ParaClinicPageProps } from "./ParaClinicPage";
import Ixon from "../UI/Ixon";
import TruckIcon from "../Icons/TruckIcon";
import ClockIcon from "../Icons/ClockIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import LocationIcon from "../Icons/LocationIcon";
import CallingIcon from "../Icons/CallingIcon";
import UserIcon from "../Icons/UserIcon";
import Button from "../UI/Button";
import FlaskIcon from "../Icons/FlaskIcon";
import { tbaseMedium, tsmMedium, tsmRegular } from "../UI/Typography";

import OpeningHoursTable from "../OpeningHours/OpeningHoursTable";
import { exceptionsOf, weekOf } from "../OpeningHours/openingHours";
const NS: ContentNamespace[] = ["common", "paraClinicPage", "openingHours"];

const Feature = ({
  active,
  icon,
  title,
}: {
  title: string;
  icon: ReactNode;
  active: boolean;
}) => {
  if (!active) return null;
  return (
    <div className={classes.feature}>
      <Ixon width="1rem" className={classes.featureIcon}>
        {icon}
      </Ixon>
      <span>{title}</span>
    </div>
  );
};

const Detail = ({ icon, value }: { icon: ReactNode; value?: string }) => {
  if (!value) return null;
  return (
    <div className={classes.detail}>
      <Ixon width="1rem">{icon}</Ixon>
      <span className={`${classes.detailValue} ${tsmRegular}`}>{value}</span>
    </div>
  );
};

const ParaClinicAbout = ({ data }: ParaClinicPageProps) => {
  const getContent = useScopedLocale(NS);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const insurances = (Array.isArray(data.insurances) ? data.insurances : []).filter((el) => !!el?._id);
  const listSep = useListSeparator();
  // a structured week shows as the table (its free text as the note)
  const hasWeek = !!weekOf(data.openingHours) || !!exceptionsOf(data.openingHours).length;

  return (
    <div className={classes.main} id="About">
      <div className={classes.about}>
        <legend className={`${classes.title} ${tbaseMedium}`}>
          {getContent("aboutParaCinicX", [data.name || ""])}
        </legend>
        {!!data.summary && (
          <p className={`${classes.summary} ${tsmRegular}`}>{data.summary}</p>
        )}
        {!!tags.length && (
          <div className={classes.section}>
            <legend className={`${classes.title} ${tsmMedium}`}>
              {getContent("paraClinicSpecialities")}
            </legend>
            <div className={classes.list}>
              {tags.map((tag) => (
                // a tag is a filter: it opens the list narrowed to it
                <Link key={tag._id} href={`/paraClinic?tag=${tag._id}`}>
                  <Badge
                    color="Primarylight"
                    size="L"
                    radius="High"
                    mode="Fill"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className={classes.section}>
          <legend className={`${classes.title} ${tsmMedium}`}>
            {getContent("paraClinicFeatures")}
          </legend>
          <div className={classes.features}>
            <Feature
              icon={<TruckIcon />}
              active={data.onPremises}
              title={getContent("onPremisesSampling")}
            />
            <Feature
              active={data.onlineResponse}
              icon={<ClockIcon />}
              title={getContent("onlineResponding")}
            />
            <Feature
              active={data.basicInsurance}
              icon={<ShieldIcon />}
              title={getContent("basicInsurance")}
            />
          </div>
          {!!insurances.length && (
            <div className={classes.section}>
              <legend className={`${classes.title} ${tsmMedium}`}>
                {getContent("paraClinicInsurances")}
              </legend>
              <div className={classes.list}>
                {insurances.map((inc) => (
                  // an accepted insurer opens its page
                  <Link key={inc._id} href={`/insurance/${inc.slug || inc._id}`}>
                    <Badge color="Black" mode="Fill" size="L" radius="High">
                      {inc.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={classes.contact}>
        <legend className={`${classes.title} ${tbaseMedium}`}>
          {getContent("contactInfo")}
        </legend>
        <Detail
          icon={<LocationIcon />}
          value={[data.province?.name, data.city?.name, data.district?.name]
            .filter(Boolean)
            .join(listSep)}
        />
        <Detail icon={<CallingIcon />} value={data.phone} />
        {hasWeek ? (
          <OpeningHoursTable hours={data.openingHours} status={data.openStatus} note={data.businessTime} />
        ) : (
          <Detail icon={<ClockIcon />} value={data.businessTime} />
        )}
        <Detail
          icon={<UserIcon />}
          value={getContent("nPesrsonSpecialist", [
            String(data.personelCount ?? 0),
          ])}
        />
        <Button
          variant="Error"
          mode="Fill"
          size="M"
          radius="High"
          tailIcon={<FlaskIcon />}
          // the lab's tests, where one is added to the cart
          href="#Tests"
        >
          {getContent("reserveTest")}
        </Button>
      </div>
    </div>
  );
};

export default ParaClinicAbout;
