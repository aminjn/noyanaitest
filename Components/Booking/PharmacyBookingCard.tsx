import Image from "next/image";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import classes from "./PharmacyBookingCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import { t2xsRegular, tsmDemiBold, txsRegular } from "../UI/Typography";
import ScoreBadge from "./ScoreBadge";
import StarIcon from "../Icons/StarIcon";
import MoreMenusButton from "../UI/MoreMenusButton";
import useLocale from "../Hooks/useLocale";
import useComplexLocale from "../Hooks/useComplexLocale";
import usePopup from "../Hooks/usePopup";
import ReportProblemPopup from "./ReportProblemPopup";
import EditIcon from "../Icons/EditIcon";
import ShareIcon from "../Icons/ShareIcon";
import Bitches from "./Bitches/Bitches";
import LocationIcon from "../Icons/LocationIcon";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
import { BookingView } from "./BookingPage2";
import CommonCenterCard from "./CommonCenterCard";
import HostedImage from "../UI/HostedImage";

const PharmacyBookingCard = ({
  node,
  view,
}: {
  node: IPharmacy;
  view: BookingView;
}) => {
  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  const { setPopup } = usePopup();

  if (view !== "Grid") {
    return (
      <CommonCenterCard
        name={node.name || ""}
        avatar={node.avatar}
        nodeName="pharmacy"
        slug={node.slug || node._id}
        address={node.address}
        banner={node.banner}
        coords={node.location?.coordinates}
        summary={node.summary}
        view={view}
      />
    );
  }

  return (
    <div className={classes.main}>
      <div className={classes.top}>
        <div className={classes.intro}>
          <div className={classes.image}>
            <HostedImage
              alt={node.name || ""}
              src={node.avatar}
              fill
              sizes="3.5rem"
              style={{ objectFit: "cover" }}
            />
            <Ixon className={classes.verify} width="1rem">
              <VerifyIcon />
            </Ixon>
          </div>
          <div className={classes.detailBox}>
            <div className={classes.details}>
              <span className={`${classes.name} ${tsmDemiBold}`}>
                {node.name}
              </span>
              {!!node.summary && (
                <span className={`${classes.summary} ${txsRegular}`}>
                  {node.summary}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={classes.score}>
          <ScoreBadge
            icon={<StarIcon />}
            iconColor="var(--yellow)"
            value="4.5"
          />
          <MoreMenusButton
            options={[
              {
                title: getContent("reportProblem"),
                onClick: () =>
                  setPopup("reportproblem", <ReportProblemPopup />),
                icon: <EditIcon />,
              },
              {
                title: getContent("share"),
                onClick: () => {
                  navigator.share({
                    text: `${location.protocol}//${location.host}/pharmacy/${node.slug || node._id}`,
                  });
                },
                icon: <ShareIcon />,
              },
            ]}
          />
        </div>
      </div>
      <div className={classes.meta}>
        <div className={classes.metaRow}>
          <button className={`${classes.inlineLink} ${t2xsRegular}`}>
            {getContent("seeProducts")}
          </button>
          <div className={classes.doctorsCount}>
            <span className={t2xsRegular}>
              {getCompContent("xProductsRegisteredInPharmacy", ["50"])}
            </span>
            <Bitches />
          </div>
        </div>
        {node.address && (
          <div className={classes.metaRow}>
            {!!node.location?.coordinates && (
              <button className={`${classes.inlineLink} ${t2xsRegular}`}>
                {getContent("seeOnMap")}
              </button>
            )}
            <div className={classes.address}>
              <span className={t2xsRegular}>{node.address}</span>
              <Ixon width="1rem">
                <LocationIcon />
              </Ixon>
            </div>
          </div>
        )}
      </div>
      <div className={classes.tiles}>
        <div className={classes.tileCol}>
          <button className={`${classes.tile} ${classes.tileBlue}`}>
            <span className={t2xsRegular}>{getContent("seeServices")}</span>
            <Ixon width="1rem">
              <PlusIcon />
            </Ixon>
          </button>
          <div className={classes.tileRow}>
            <button className={`${classes.tile} ${classes.tilePurple}`}>
              <span className={t2xsRegular}>{getContent("reservation")}</span>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
            </button>
            <button className={`${classes.tile} ${classes.tilePurple}`}>
              <span className={t2xsRegular}>{getContent("services")}</span>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
            </button>
          </div>
        </div>
        {!!node.banner && (
          <div className={classes.banner}>
            <HostedImage
              src={node.banner}
              alt={node.name || ""}
              style={{ objectFit: "cover" }}
              fill
              sizes="11.25rem"
            />
          </div>
        )}
      </div>
      <div className={classes.action}>
        <Button
          variant="Primary"
          mode="Fill"
          radius="Medium"
          size="M"
          className={classes.cta}
        >
          {getContent("seeProfile")}
        </Button>
      </div>
    </div>
  );
};

export default PharmacyBookingCard;
