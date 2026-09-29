import classes from "./CommonCenterCard.module.css";
import Ixon from "../UI/Ixon";
import { t2xsRegular, tsmDemiBold, txsRegular } from "../UI/Typography";
import MoreMenusButton from "../UI/MoreMenusButton";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import ReportProblemPopup from "./ReportProblemPopup";
import EditIcon from "../Icons/EditIcon";
import ShareIcon from "../Icons/ShareIcon";
import Link from "@/Components/i18n/Link";
import LocationIcon from "../Icons/LocationIcon";
import Button from "../UI/Button";
import { BookingView } from "./BookingPage2";
import HostedImage from "../UI/HostedImage";
import VerifiedImage from "../UI/VerifiedImage";

const NS: ContentNamespace[] = ["common", "booking"];
const CommonCenterCard = ({
  name,
  avatar,
  summary,
  slug,
  nodeName,
  address,
  coords,
  banner,
  view,
}: {
  name: string;
  avatar?: string;
  summary?: string;
  slug: string;
  nodeName: string;
  address?: string;
  coords?: [number, number];
  banner?: string;
  view: BookingView;
}) => {
  const getContent = useScopedLocale(NS);


  const { setPopup } = usePopup();
  const profile = `/${nodeName}/${slug}`;

  // Only real data (2026-09): no placeholder tags, scores or counts, and no
  // button that does nothing - "map" and "profile" go to the center's page.
  const mapLink = !!coords && (
    <Link className={`${classes.inlineLink} ${t2xsRegular}`} href={`${profile}#location`}>
      {getContent("seeOnMap")}
    </Link>
  );

  const introBlock = (
    <div className={classes.intro}>
      <VerifiedImage alt={name} src={avatar} />
      <div className={classes.detailBox}>
        <div className={classes.details}>
          <span className={`${classes.name} ${tsmDemiBold}`}>{name}</span>
          {!!summary && (
            <span className={`${classes.summary} ${txsRegular}`}>
              {summary}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const scoreBlock = (
    <div className={classes.score}>
      <MoreMenusButton
        options={[
          {
            title: getContent("reportProblem"),
            onClick: () => setPopup("reportproblem", <ReportProblemPopup />),
            icon: <EditIcon />,
          },
          {
            title: getContent("share"),
            onClick: () => {
              navigator.share({
                text: `${location.protocol}//${location.host}/${nodeName}/${slug}`,
              });
            },
            icon: <ShareIcon />,
          },
        ]}
      />
    </div>
  );

  const ctaBlock = (
    <div className={classes.action}>
      <Button
        variant="Primary"
        mode="Fill"
        radius="Medium"
        size="M"
        className={classes.cta}
        href={profile}
      >
        {getContent("seeProfile")}
      </Button>
    </div>
  );

  if (view === "Grid") {
    return (
      <div className={classes.gridMain}>
        <div className={classes.gridTop}>
          {introBlock}
          {scoreBlock}
        </div>
        {!!address && (
          <div className={classes.gridMeta}>
            <div className={classes.gridMetaRow}>
              {mapLink}
              <div className={classes.gridAddress}>
                <span className={t2xsRegular}>{address}</span>
                <Ixon width="1rem">
                  <LocationIcon />
                </Ixon>
              </div>
            </div>
          </div>
        )}
        {!!banner && (
          <div className={classes.gridBanner}>
            <HostedImage src={banner} alt={name} style={{ objectFit: "cover" }} fill sizes="11.25rem" />
          </div>
        )}
        {ctaBlock}
      </div>
    );
  }

  return (
    <div className={classes.main}>
      {introBlock}
      {scoreBlock}
      {!!address && (
        <div className={classes.lines}>
          <div className={classes.line}>
            <Ixon width="1rem">
              <LocationIcon />
            </Ixon>
            <span className={`${classes.lineValue} ${t2xsRegular}`}>{address}</span>
            {mapLink}
          </div>
        </div>
      )}
      {!!banner && (
        <div className={classes.side}>
          <div className={classes.banner}>
            <HostedImage src={banner} alt={name} style={{ objectFit: "contain" }} fill sizes="12rem" />
          </div>
        </div>
      )}
      {ctaBlock}
    </div>
  );
};

export default CommonCenterCard;
