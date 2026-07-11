import Image from "next/image";
import classes from "./CommonCenterCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsRegular,
} from "../UI/Typography";
import ScoreBadge from "./ScoreBadge";
import StarIcon from "../Icons/StarIcon";
import MoreMenusButton from "../UI/MoreMenusButton";
import useLocale from "../Hooks/useLocale";
import usePopup from "../Hooks/usePopup";
import ReportProblemPopup from "./ReportProblemPopup";
import EditIcon from "../Icons/EditIcon";
import ShareIcon from "../Icons/ShareIcon";
import Bitches from "./Bitches/Bitches";
import Link from "next/link";
import LocationIcon from "../Icons/LocationIcon";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
const CommonCenterCard = ({
  name,
  avatar,
  summary,
  slug,
  nodeName,
  address,
  coords,
  banner,
}: {
  name: string;
  avatar?: string;
  summary?: string;
  slug: string;
  nodeName: string;
  address?: string;
  coords?: [number, number];
  banner?: string;
}) => {
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <div className={classes.intro}>
        <div className={classes.image}>
          <Image
            alt={name}
            src={`${FilePath}/${avatar}`}
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
            <span className={`${classes.name} ${tsmDemiBold}`}>{name}</span>
            {!!summary && (
              <span className={`${classes.summary} ${txsRegular}`}>
                {summary}
              </span>
            )}
          </div>
          <div className={classes.tags}>
            <div className={t2xsMedium}>Tag1</div>
            <div className={t2xsMedium}>Tag2</div>
            <div className={t2xsMedium}>Tag3</div>
            <div className={t2xsMedium}>Tag4</div>
            <div className={t2xsMedium}>Tag5</div>
            <div className={t2xsMedium}>Tag6</div>
          </div>
        </div>
      </div>
      <div className={classes.score}>
        <ScoreBadge icon={<StarIcon />} iconColor="var(--yellow)" value="4.5" />
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
      <div className={classes.lines}>
        <div className={classes.line}>
          <Bitches />
          <span className={`${classes.lineValue} ${t2xsRegular}`}>
            {getContent("xProductsRegisteredInPharmacy", ["50"])}
          </span>
          <Link
            className={`${classes.inlineLink} ${t2xsRegular}`}
            href={`/${nodeName}/${slug}`}
          >
            {getContent("seeProducts")}
          </Link>
        </div>
        {address && (
          <div className={classes.line}>
            <Ixon width="1rem">
              <LocationIcon />
            </Ixon>
            <span className={`${classes.lineValue} ${t2xsRegular}`}>
              {address}
            </span>
            {!!coords && (
              <button className={`${classes.inlineLink} ${t2xsRegular}`}>
                {getContent("seeOnMap")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className={classes.side}>
        <div className={classes.banner}>
          <Image
            src={`${FilePath}/${banner}`}
            alt={name}
            style={{ objectFit: "contain" }}
            fill
            sizes="12rem"
          />
        </div>
        <div className={classes.buttons}>
          <button className={classes.button}>
            <Ixon width="1rem">
              <PlusIcon />
            </Ixon>
            <span>{getContent("seeServices")}</span>
          </button>
          <div className={classes.buttonRow}>
            <button className={classes.button}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              <span>{getContent("services")}</span>
            </button>
            <button className={classes.button}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              <span>{getContent("reservation")}</span>
            </button>
          </div>
        </div>
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

export default CommonCenterCard;
